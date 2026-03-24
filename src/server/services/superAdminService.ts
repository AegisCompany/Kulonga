import express from "express";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";
import bcrypt from "bcryptjs";

const router = express.Router();

// Apply authentication and superadmin authorization to all routes in this service
router.use(authenticate);
router.use(authorize(['superadmin']));

// Add a new school
router.post("/schools", (req, res) => {
  const { 
    name, subdomain, logo_url, address, phone, email, primary_color, 
    bank_name, bank_iban, bank_account_number, 
    license_limit, license_type, license_expiry,
    classes_enabled, grades_enabled, teachers_enabled, vacations_enabled, 
    certificates_enabled, financial_enabled, migration_enabled, payments_enabled,
    adminName, adminEmail, adminPassword
  } = req.body;

  if (!name || !subdomain) {
    return res.status(400).json({ error: "Nome e subdomínio são obrigatórios" });
  }

  try {
    const result = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO schools (
          name, subdomain, logo_url, address, phone, email, primary_color, 
          bank_name, bank_iban, bank_account_number, 
          license_limit, license_type, license_expiry,
          classes_enabled, grades_enabled, teachers_enabled, vacations_enabled, 
          certificates_enabled, financial_enabled, migration_enabled, payments_enabled
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const schoolResult = stmt.run(
        name, subdomain, logo_url, address, phone, email, primary_color || '#4f46e5', 
        bank_name, bank_iban, bank_account_number, 
        license_limit || 50, license_type || 'institution', license_expiry,
        classes_enabled !== undefined ? (classes_enabled ? 1 : 0) : 1,
        grades_enabled !== undefined ? (grades_enabled ? 1 : 0) : 1,
        teachers_enabled !== undefined ? (teachers_enabled ? 1 : 0) : 1,
        vacations_enabled !== undefined ? (vacations_enabled ? 1 : 0) : 1,
        certificates_enabled !== undefined ? (certificates_enabled ? 1 : 0) : 1,
        financial_enabled !== undefined ? (financial_enabled ? 1 : 0) : 1,
        migration_enabled !== undefined ? (migration_enabled ? 1 : 0) : 1,
        payments_enabled !== undefined ? (payments_enabled ? 1 : 0) : 1
      );
      
      const schoolId = schoolResult.lastInsertRowid;

      // If admin details provided, create the admin user
      if (adminName && adminEmail && adminPassword) {
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);
        const userStmt = db.prepare(`
          INSERT INTO users (name, email, password, role, school_id, email_confirmed) 
          VALUES (?, ?, ?, 'admin', ?, 1)
        `);
        const userResult = userStmt.run(adminName, adminEmail, hashedPassword, schoolId);
        const userId = userResult.lastInsertRowid;
        db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'admin')").run(userId);
      }

      return schoolId;
    })();

    res.json({ id: result, name, subdomain });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update a school (Super Admin only)
router.patch("/schools/:id", (req, res) => {
  const { id } = req.params;
  const { 
    name, logo_url, address, phone, email, primary_color, 
    bank_name, bank_iban, bank_account_number, 
    license_limit, license_type, license_status, license_expiry,
    classes_enabled, grades_enabled, teachers_enabled, vacations_enabled, 
    certificates_enabled, financial_enabled, migration_enabled, payments_enabled
  } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE schools 
      SET name = ?, logo_url = ?, address = ?, phone = ?, email = ?, primary_color = ?, 
          bank_name = ?, bank_iban = ?, bank_account_number = ?, 
          license_limit = ?, license_type = ?, license_status = ?, license_expiry = ?,
          classes_enabled = ?, grades_enabled = ?, teachers_enabled = ?, 
          vacations_enabled = ?, certificates_enabled = ?, financial_enabled = ?, 
          migration_enabled = ?, payments_enabled = ?
      WHERE id = ?
    `);
    stmt.run(
      name, logo_url, address, phone, email, primary_color, 
      bank_name, bank_iban, bank_account_number, 
      license_limit, license_type, license_status, license_expiry,
      classes_enabled !== undefined ? (classes_enabled ? 1 : 0) : 1,
      grades_enabled !== undefined ? (grades_enabled ? 1 : 0) : 1,
      teachers_enabled !== undefined ? (teachers_enabled ? 1 : 0) : 1,
      vacations_enabled !== undefined ? (vacations_enabled ? 1 : 0) : 1,
      certificates_enabled !== undefined ? (certificates_enabled ? 1 : 0) : 1,
      financial_enabled !== undefined ? (financial_enabled ? 1 : 0) : 1,
      migration_enabled !== undefined ? (migration_enabled ? 1 : 0) : 1,
      payments_enabled !== undefined ? (payments_enabled ? 1 : 0) : 1,
      id
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// List all users across all schools
router.get("/users", (req, res) => {
  const users = db.prepare(`
    SELECT id, name, email, school_id, temp_password_expiry 
    FROM users 
  `).all();
  
  const usersWithRoles = users.map((u: any) => {
    const roles = db.prepare("SELECT role FROM user_roles WHERE user_id = ?").all(u.id).map((r: any) => r.role);
    const school = u.school_id ? db.prepare("SELECT name FROM schools WHERE id = ?").get(u.school_id) as any : null;
    return { ...u, roles, role: roles[0], school_name: school?.name };
  });
  
  res.json(usersWithRoles);
});

// Change user role
router.patch("/users/:id/role", (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // Can be a string or array of strings
  try {
    db.transaction(() => {
      db.prepare("DELETE FROM user_roles WHERE user_id = ?").run(id);
      const roles = Array.isArray(role) ? role : [role];
      const insertRole = db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, ?)");
      for (const r of roles) {
        insertRole.run(id, r);
      }
      // Update the legacy role column for backward compatibility
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(roles[0], id);
    })();
    res.json({ success: true, id, role });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reset user password
router.patch("/users/:id/reset-password", (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const stmt = db.prepare("UPDATE users SET password = ? WHERE id = ?");
    stmt.run(hashedPassword, id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all students across all schools
router.get("/students/all", (req, res) => {
  const students = db.prepare(`
    SELECT students.*, schools.name as school_name 
    FROM students 
    LEFT JOIN schools ON students.school_id = schools.id
  `).all();
  res.json(students);
});

// System adjustments (Mock endpoint)
router.get("/system-stats", (req, res) => {
  const schools = db.prepare("SELECT count(*) as count FROM schools").get() as any;
  const users = db.prepare("SELECT count(*) as count FROM users").get() as any;
  const students = db.prepare("SELECT count(*) as count FROM students").get() as any;
  
  res.json({
    totalSchools: schools.count,
    totalUsers: users.count,
    totalStudents: students.count,
    dbSize: "2.4 MB",
    uptime: "15 days, 4 hours"
  });
});

// API Key Management
router.get("/api-keys", (req, res) => {
  const keys = db.prepare(`
    SELECT api_keys.*, schools.name as school_name 
    FROM api_keys 
    JOIN schools ON api_keys.school_id = schools.id
  `).all();
  res.json(keys);
});

router.post("/api-keys", (req, res) => {
  const { school_id, name } = req.body;
  if (!school_id || !name) {
    return res.status(400).json({ error: "school_id e name são obrigatórios" });
  }

  const apiKey = "KUL-" + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
  
  try {
    const stmt = db.prepare("INSERT INTO api_keys (school_id, api_key, name) VALUES (?, ?, ?)");
    const result = stmt.run(school_id, apiKey, name);
    res.json({ id: result.lastInsertRowid, api_key: apiKey, name, school_id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/api-keys/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM api_keys WHERE id = ?").run(id);
  res.json({ success: true });
});

export default router;
