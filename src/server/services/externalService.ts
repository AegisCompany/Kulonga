import express from "express";
import db from "../db.ts";
import { decrypt } from "../utils/crypto.ts";

const router = express.Router();

// Middleware to validate API Key
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: "API Key ausente. Use o cabeçalho X-API-KEY." });
  }

  const keyRecord = db.prepare("SELECT * FROM api_keys WHERE api_key = ? AND is_active = 1").get(apiKey) as any;
  
  if (!keyRecord) {
    return res.status(401).json({ error: "API Key inválida ou inativa." });
  }

  // Update last used at
  db.prepare("UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?").run(keyRecord.id);

  // Set school context
  const school = db.prepare("SELECT * FROM schools WHERE id = ?").get(keyRecord.school_id) as any;
  (req as any).school = school;
  (req as any).apiKeyName = keyRecord.name;

  next();
};

router.use(validateApiKey);

// 1. Academic Endpoints
router.get("/students", (req, res) => {
  const schoolId = (req as any).school?.id;
  const students = db.prepare(`
    SELECT users.name, users.email, students.registration_number, students.guardian_name, students.guardian_phone, students.guardian_email
    FROM students 
    JOIN users ON students.user_id = users.id 
    WHERE students.school_id = ?
  `).all(schoolId) as any[];

  const decryptedStudents = students.map(s => {
    if (s.guardian_phone) {
      try { s.guardian_phone = decrypt(s.guardian_phone); } catch(e) {}
    }
    if (s.guardian_email) {
      try { s.guardian_email = decrypt(s.guardian_email); } catch(e) {}
    }
    return s;
  });

  res.json(decryptedStudents);
});

router.get("/grades", (req, res) => {
  const schoolId = (req as any).school?.id;
  const grades = db.prepare(`
    SELECT grades.*, users.name as student_name, students.registration_number
    FROM grades 
    JOIN students ON grades.student_id = students.id
    JOIN users ON students.user_id = users.id
    WHERE grades.school_id = ?
  `).all(schoolId);
  res.json(grades);
});

// 2. Teacher Endpoints
router.get("/teachers", (req, res) => {
  const schoolId = (req as any).school?.id;
  const teachers = db.prepare(`
    SELECT users.name, users.email, teachers.specialization, teachers.hire_date
    FROM users
    JOIN teachers ON users.id = teachers.user_id
    WHERE users.school_id = ? AND users.role = 'teacher'
  `).all(schoolId);
  res.json(teachers);
});

// 3. Financial Endpoints
router.get("/invoices", (req, res) => {
  const schoolId = (req as any).school?.id;
  const invoices = db.prepare(`
    SELECT invoices.*, users.name as student_name, students.registration_number
    FROM invoices 
    JOIN students ON invoices.student_id = students.id
    JOIN users ON students.user_id = users.id
    WHERE invoices.school_id = ?
  `).all(schoolId);
  res.json(invoices);
});

router.post("/payments", (req, res) => {
  const { invoice_id, amount, method } = req.body;
  const schoolId = (req as any).school?.id;
  
  if (!invoice_id || !amount || !method) {
    return res.status(400).json({ error: "invoice_id, amount e method são obrigatórios" });
  }

  try {
    const stmt = db.prepare("INSERT INTO payments (invoice_id, amount, method, status, school_id) VALUES (?, ?, ?, 'completed', ?)");
    const result = stmt.run(invoice_id, amount, method, schoolId);
    res.json({ success: true, transaction_id: result.lastInsertRowid, status: "completed" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Webhooks Management
router.get("/webhooks", (req, res) => {
  const schoolId = (req as any).school?.id;
  const webhooks = db.prepare("SELECT * FROM webhooks WHERE school_id = ?").all(schoolId);
  res.json(webhooks);
});

router.post("/webhooks", (req, res) => {
  const { url, event_type } = req.body;
  const schoolId = (req as any).school?.id;

  if (!url || !event_type) {
    return res.status(400).json({ error: "url e event_type são obrigatórios" });
  }

  const secret = "whsec_" + Math.random().toString(36).substring(2, 15);
  try {
    const stmt = db.prepare("INSERT INTO webhooks (school_id, url, event_type, secret) VALUES (?, ?, ?, ?)");
    const result = stmt.run(schoolId, url, event_type, secret);
    res.json({ id: result.lastInsertRowid, url, event_type, secret });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/webhooks/:id", (req, res) => {
  const schoolId = (req as any).school?.id;
  db.prepare("DELETE FROM webhooks WHERE id = ? AND school_id = ?").run(req.params.id, schoolId);
  res.json({ success: true });
});

// 5. Notification Endpoint
router.post("/notifications/send", (req, res) => {
  const { user_id, message, type } = req.body;
  const schoolId = (req as any).school?.id;

  if (!user_id || !message || !type) {
    return res.status(400).json({ error: "Dados incompletos (user_id, message, type são obrigatórios)" });
  }

  try {
    const stmt = db.prepare("INSERT INTO notifications (school_id, user_id, message, type) VALUES (?, ?, ?, ?)");
    stmt.run(schoolId, user_id, message, type);
    res.json({ success: true, message: "Notificação enviada com sucesso via " + (req as any).apiKeyName });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Certification Verification
router.get("/verify-certificate/:code", (req, res) => {
  const { code } = req.params;
  const schoolId = (req as any).school?.id;

  const certificate = db.prepare(`
    SELECT c.*, u.name as student_name, cert.name as certification_name
    FROM certificates c
    JOIN students s ON c.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN certifications cert ON c.certification_id = cert.id
    WHERE c.certificate_number = ? AND c.school_id = ?
  `).get(code, schoolId) as any;

  if (!certificate) {
    return res.status(404).json({ error: "Certificado não encontrado ou inválido para esta instituição." });
  }

  res.json({
    valid: true,
    student: certificate.student_name,
    certification: certificate.certification_name,
    issue_date: certificate.issue_date,
    status: 'valid'
  });
});

export default router;
