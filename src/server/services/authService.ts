import express from "express";
import db from "../db.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as otplib from "otplib";
const { authenticator } = otplib as any;
import qrcode from "qrcode";
import rateLimit from "express-rate-limit";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "kulonga-secret-key";

// Brute Force Protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for development/testing
  message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." }
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  
  // Server-side validation
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Nome inválido" });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Email inválido" });
  
  // Password complexity: 8+ chars, upper, lower, number, special
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais." });
  }
  
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(400).json({ error: "Email já cadastrado" });

  const confirmationToken = crypto.randomBytes(32).toString("hex");
  
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, school_id, confirmation_token) 
      VALUES (?, ?, ?, 'unassigned', NULL, ?)
    `).run(name, email, hashedPassword, confirmationToken);

    const userId = result.lastInsertRowid;
    db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'unassigned')").run(userId);

    res.json({ 
      message: "Conta criada com sucesso! Aguarde a aprovação do administrador.",
      userId
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar conta" });
  }
});

// Superadmin: Create Admin User and associate with multiple schools
router.post("/admin/create-director", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    if (decoded.role !== 'superadmin') return res.status(403).json({ error: "Acesso negado" });

    const { name, email, password, schoolIds } = req.body; // schoolIds is an array

    if (!name || !email || !password || !schoolIds || !Array.isArray(schoolIds)) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.status(400).json({ error: "Email já cadastrado" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, email_confirmed) 
      VALUES (?, ?, ?, 'admin', 1)
    `).run(name, email, hashedPassword);

    const userId = result.lastInsertRowid;
    db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'admin')").run(userId);

    const insertUserSchool = db.prepare("INSERT INTO user_schools (user_id, school_id) VALUES (?, ?)");
    for (const sId of schoolIds) {
      insertUserSchool.run(userId, sId);
    }

    res.json({ message: "Diretor criado e associado às escolas com sucesso.", userId });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

router.post("/login", loginLimiter, (req, res) => {
  const { email, password, mfaToken } = req.body;
  
  // Search for user globally by email
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  
  if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

  const schoolId = user.school_id;
  
  // Check Lockout
  if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
    return res.status(403).json({ error: "Conta bloqueada temporariamente devido a múltiplas tentativas falhadas." });
  }

  // Temporary Password Expiry Check
  if (user.temp_password_expiry && new Date(user.temp_password_expiry) < new Date()) {
    return res.status(401).json({ error: "Sua senha temporária expirou. Entre em contato com o suporte." });
  }

  // Password Check
  if (!bcrypt.compareSync(password, user.password)) {
    const attempts = (user.failed_login_attempts || 0) + 1;
    let lockoutUntil = null;
    if (attempts >= 5) {
      lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    db.prepare("UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?").run(attempts, lockoutUntil, user.id);
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  // Password Duration Check (90 days)
  const passwordUpdatedAt = new Date(user.password_updated_at);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  if (passwordUpdatedAt < ninetyDaysAgo) {
    return res.status(403).json({ 
      error: "Sua senha expirou (limite de 90 dias). Por favor, redefina sua senha.",
      passwordExpired: true 
    });
  }

  // MFA Check
  if (user.mfa_enabled) {
    if (!mfaToken) {
      return res.json({ mfaRequired: true });
    }
    const isValid = authenticator.check(mfaToken, user.mfa_secret);
    if (!isValid) {
      return res.status(401).json({ error: "Código MFA inválido" });
    }
  }

  // Reset failed attempts on success
  db.prepare("UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = ?").run(user.id);

  // Fetch all roles for the user
  const roles = db.prepare("SELECT role FROM user_roles WHERE user_id = ?").all(user.id).map((r: any) => r.role);

  const token = jwt.sign(
    { id: user.id, roles, role: roles[0], schoolId, jti: crypto.randomUUID() },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({ 
    token, 
    user: { name: user.name, roles, role: roles[0], email: user.email }, 
    schoolId 
  });
});

// Password Reset Request
router.post("/request-reset", (req, res) => {
  const { email } = req.body;
  const user = db.prepare("SELECT id, name FROM users WHERE email = ?").get(email) as any;
  
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    db.prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?").run(token, expiry, user.id);
    
    // Construct the reset link
    const host = req.get('host');
    const protocol = req.protocol;
    const resetLink = `${protocol}://${host}?token=${token}`;
    
    // In a real app, send email here. For now, we log it and simulate success.
    console.log(`
      -----------------------------------------
      EMAIL SIMULATION (Password Reset)
      To: ${email}
      Subject: Recuperação de Senha - Kulonga
      
      Olá ${user.name},
      
      Recebemos um pedido para redefinir sua senha.
      Clique no link abaixo para prosseguir:
      
      ${resetLink}
      
      Este link expira em 1 hora.
      -----------------------------------------
    `);
  }
  
  res.json({ message: "Se o email existir, um link de recuperação será enviado com as instruções." });
});

// Reset Password
router.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  const user = db.prepare("SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?").get(token, new Date().toISOString()) as any;
  
  if (!user) return res.status(400).json({ error: "Token inválido ou expirado" });

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!newPassword || !passwordRegex.test(newPassword)) {
    return res.status(400).json({ error: "A nova senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais." });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL, password_updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(hashedPassword, user.id);
  res.json({ message: "Senha alterada com sucesso." });
});

// MFA Setup
router.post("/mfa/setup", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });
  
  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(decoded.email || "user", "Kulonga", secret);
    
    db.prepare("UPDATE users SET mfa_secret = ? WHERE id = ?").run(secret, decoded.id);
    
    qrcode.toDataURL(otpauth, (err, imageUrl) => {
      if (err) return res.status(500).json({ error: "Erro ao gerar QR Code" });
      res.json({ secret, imageUrl });
    });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// MFA Verify & Enable
router.post("/mfa/enable", (req, res) => {
  const { token } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const user = db.prepare("SELECT mfa_secret FROM users WHERE id = ?").get(decoded.id) as any;
    
    const isValid = authenticator.check(token, user.mfa_secret);
    if (!isValid) return res.status(400).json({ error: "Token inválido" });

    db.prepare("UPDATE users SET mfa_enabled = 1 WHERE id = ?").run(decoded.id);
    res.json({ message: "MFA ativado com sucesso." });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// Simulated OAuth (Google)
router.get("/oauth/google", (req, res) => {
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/oauth/google/callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=GOOGLE_CLIENT_ID&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
  res.json({ url: authUrl });
});

router.post("/oauth/google/login", (req, res) => {
  const { googleId, email, name } = req.body;
  
  let user = db.prepare("SELECT * FROM users WHERE google_id = ? OR email = ?").get(googleId, email) as any;
  
  if (!user) {
    // Auto-register if not exists
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, google_id, email_confirmed) 
      VALUES (?, ?, ?, 'unassigned', ?, 1)
    `).run(name, email, bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10), googleId);
    
    const userId = result.lastInsertRowid;
    db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'unassigned')").run(userId);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  } else if (!user.google_id) {
    // Link google account
    db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(googleId, user.id);
  }

  const roles = db.prepare("SELECT role FROM user_roles WHERE user_id = ?").all(user.id).map((r: any) => r.role);
  const token = jwt.sign(
    { id: user.id, roles, role: roles[0], schoolId: user.school_id, jti: crypto.randomUUID() },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({ token, user: { name: user.name, roles, role: roles[0], email: user.email }, schoolId: user.school_id });
});

// Teachers
router.get("/teachers", authenticate, (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const teachers = db.prepare(`
    SELECT teachers.*, users.name, users.email 
    FROM teachers 
    JOIN users ON teachers.user_id = users.id 
    WHERE teachers.school_id = ?
  `).all(schoolId);
  res.json(teachers);
});

router.patch("/teachers/:id", authenticate, authorize(['admin', 'superadmin', 'hr']), (req, res) => {
  const { id } = req.params;
  const { specialization, phone, bi } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("UPDATE teachers SET specialization = ?, phone = ?, bi = ? WHERE id = ? AND school_id = ?");
  stmt.run(specialization, phone, bi, id, schoolId);
  res.json({ success: true });
});

// Superadmin: List all users
router.get("/admin/users", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    if (decoded.role !== 'superadmin' && !decoded.roles?.includes('superadmin')) return res.status(403).json({ error: "Acesso negado" });

    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.school_id, s.name as school_name, u.temp_password_expiry 
      FROM users u 
      LEFT JOIN schools s ON u.school_id = s.id
    `).all();

    const usersWithRoles = users.map((u: any) => {
      const roles = db.prepare("SELECT role FROM user_roles WHERE user_id = ?").all(u.id).map((r: any) => r.role);
      return { ...u, roles, role: roles[0] };
    });

    res.json(usersWithRoles);
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// Superadmin: Reset password with 1-day expiry
router.post("/admin/reset-password", (req, res) => {
  const { userId, newPassword } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    if (decoded.role !== 'superadmin' && !decoded.roles?.includes('superadmin')) return res.status(403).json({ error: "Acesso negado" });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day
    db.prepare("UPDATE users SET password = ?, temp_password_expiry = ? WHERE id = ?").run(hashedPassword, expiry, userId);
    
    res.json({ message: "Senha redefinida com sucesso. Válida por 24 horas.", expiry });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// Get current user details
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const user = db.prepare("SELECT name, email, mfa_enabled, email_confirmed FROM users WHERE id = ?").get(decoded.id) as any;
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    
    const roles = db.prepare("SELECT role FROM user_roles WHERE user_id = ?").all(decoded.id).map((r: any) => r.role);
    res.json({ ...user, roles, role: roles[0] });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// Change own password
router.post("/change-password", (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const user = db.prepare("SELECT password FROM users WHERE id = ?").get(decoded.id) as any;
    
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: "Senha atual incorreta" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!newPassword || !passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: "A nova senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais." });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ?, temp_password_expiry = NULL, password_updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(hashedPassword, decoded.id);
    res.json({ message: "Senha alterada com sucesso." });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// School Admin: List users in school
router.get("/school/users", (req, res) => {
  const authHeader = req.headers.authorization;
  const schoolSubdomain = req.headers['x-school-subdomain'] as string;
  if (!authHeader || !schoolSubdomain) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const school = db.prepare("SELECT id FROM schools WHERE subdomain = ?").get(schoolSubdomain) as any;
    if (!school) return res.status(404).json({ error: "Escola não encontrada" });

    // Only school admin or superadmin
    const userRoles = decoded.roles || [decoded.role];
    if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.email_confirmed,
             (SELECT id FROM students WHERE user_id = u.id) as student_id,
             (SELECT id FROM teachers WHERE user_id = u.id) as teacher_id
      FROM users u 
      WHERE u.school_id = ? OR u.id IN (SELECT user_id FROM user_schools WHERE school_id = ?)
    `).all(school.id, school.id);

    const usersWithRoles = users.map((u: any) => {
      const roles = db.prepare("SELECT role FROM user_roles WHERE user_id = ?").all(u.id).map((r: any) => r.role);
      return { ...u, roles, role: roles[0] };
    });

    res.json(usersWithRoles);
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// School Admin: List unassigned users
router.get("/unassigned-users", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const userRoles = decoded.roles || [decoded.role];
    if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const users = db.prepare("SELECT id, name, email FROM users WHERE school_id IS NULL OR id IN (SELECT user_id FROM user_roles WHERE role = 'unassigned')").all();
    res.json(users);
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// School Admin: Assign user to school and role
router.post("/school/assign-user", (req, res) => {
  const { userId, role } = req.body;
  const authHeader = req.headers.authorization;
  const schoolSubdomain = req.headers['x-school-subdomain'] as string;
  if (!authHeader || !schoolSubdomain) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const school = db.prepare("SELECT id FROM schools WHERE subdomain = ?").get(schoolSubdomain) as any;
    if (!school) return res.status(404).json({ error: "Escola não encontrada" });

    const userRoles = decoded.roles || [decoded.role];
    if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    db.prepare("UPDATE users SET school_id = ? WHERE id = ?").run(school.id, userId);
    db.prepare("DELETE FROM user_roles WHERE user_id = ?").run(userId);
    
    const roles = Array.isArray(role) ? role : [role];
    const insertRole = db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, ?)");
    for (const r of roles) {
      insertRole.run(userId, r);
    }

    res.json({ message: "Usuário atribuído com sucesso." });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// School Admin: Dissociate user from school
router.post("/school/dissociate-user", (req, res) => {
  const { userId } = req.body;
  const authHeader = req.headers.authorization;
  const schoolSubdomain = req.headers['x-school-subdomain'] as string;
  if (!authHeader || !schoolSubdomain) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const school = db.prepare("SELECT id FROM schools WHERE subdomain = ?").get(schoolSubdomain) as any;
    if (!school) return res.status(404).json({ error: "Escola não encontrada" });

    const userRoles = decoded.roles || [decoded.role];
    if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    db.prepare("UPDATE users SET school_id = NULL WHERE id = ? AND school_id = ?").run(userId, school.id);
    db.prepare("DELETE FROM user_roles WHERE user_id = ?").run(userId);
    db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'unassigned')").run(userId);

    res.json({ message: "Usuário desassociado com sucesso." });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// School Admin: Link user to student/teacher record
router.post("/school/link-record", (req, res) => {
  const { userId, type, recordId } = req.body; // type: 'student' or 'teacher'
  const authHeader = req.headers.authorization;
  const schoolSubdomain = req.headers['x-school-subdomain'] as string;
  if (!authHeader || !schoolSubdomain) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const school = db.prepare("SELECT id FROM schools WHERE subdomain = ?").get(schoolSubdomain) as any;
    if (!school) return res.status(404).json({ error: "Escola não encontrada" });

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    if (type === 'student') {
      db.prepare("UPDATE students SET user_id = ? WHERE id = ? AND school_id = ?").run(userId, recordId, school.id);
    } else if (type === 'teacher') {
      db.prepare("UPDATE teachers SET user_id = ? WHERE id = ? AND school_id = ?").run(userId, recordId, school.id);
    }

    res.json({ message: "Registro vinculado com sucesso." });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// School Admin: Unlink user from student/teacher record
router.post("/school/unlink-record", (req, res) => {
  const { type, recordId } = req.body;
  const authHeader = req.headers.authorization;
  const schoolSubdomain = req.headers['x-school-subdomain'] as string;
  if (!authHeader || !schoolSubdomain) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const school = db.prepare("SELECT id FROM schools WHERE subdomain = ?").get(schoolSubdomain) as any;
    if (!school) return res.status(404).json({ error: "Escola não encontrada" });

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    if (type === 'student') {
      db.prepare("UPDATE students SET user_id = NULL WHERE id = ? AND school_id = ?").run(recordId, school.id);
    } else if (type === 'teacher') {
      db.prepare("UPDATE teachers SET user_id = NULL WHERE id = ? AND school_id = ?").run(recordId, school.id);
    }

    res.json({ message: "Registro desvinculado com sucesso." });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// Superadmin: Assign any user to any school and role
router.post("/admin/assign-user-global", (req, res) => {
  const { userId, schoolId, role } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const userRoles = decoded.roles || [decoded.role];
    if (!userRoles.includes('superadmin')) return res.status(403).json({ error: "Acesso negado" });

    // Check if user exists
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Update user school
    db.prepare("UPDATE users SET school_id = ? WHERE id = ?").run(schoolId, userId);
    
    // Update roles
    db.prepare("DELETE FROM user_roles WHERE user_id = ?").run(userId);
    const roles = Array.isArray(role) ? role : [role];
    const insertRole = db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, ?)");
    for (const r of roles) {
      insertRole.run(userId, r);
    }
    
    // Also ensure entry in user_schools
    const exists = db.prepare("SELECT * FROM user_schools WHERE user_id = ? AND school_id = ?").get(userId, schoolId);
    if (!exists) {
      db.prepare("INSERT INTO user_schools (user_id, school_id) VALUES (?, ?)").run(userId, schoolId);
    }

    res.json({ message: "Usuário atribuído globalmente com sucesso." });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// Superadmin: List all schools
router.get("/admin/schools", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    const userRoles = decoded.roles || [decoded.role];
    if (!userRoles.includes('superadmin')) return res.status(403).json({ error: "Acesso negado" });

    const schools = db.prepare("SELECT id, name, subdomain FROM schools").all();
    res.json(schools);
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

export default router;
