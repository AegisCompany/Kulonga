import express from "express";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();

router.use(authenticate);

// Certifications
router.get("/certifications", (req: any, res) => {
  let query = `
    SELECT c.*, s.name as school_name 
    FROM certifications c
    LEFT JOIN schools s ON c.school_id = s.id
  `;
  let params: any[] = [];
  
  const userRoles = req.user.roles || [req.user.role];
  if (!userRoles.includes('superadmin')) {
    const schoolId = (req as any).school?.id;
    if (!schoolId) return res.status(400).json({ error: "Contexto de escola necessário" });
    query += " WHERE c.school_id = ?";
    params.push(schoolId);
  }
  
  const certifications = db.prepare(query).all(...params);
  res.json(certifications);
});

router.post("/certifications", authorize(['admin', 'superadmin', 'pedagogical']), (req: any, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Contexto de escola necessário" });

  const { name, description, duration_hours, level } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO certifications (school_id, name, description, duration_hours, level) 
      VALUES (?, ?, ?, ?, ?)
    `).run(schoolId, name, description, duration_hours, level);
    res.json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Certificates
router.get("/certificates", (req: any, res) => {
  let query = `
    SELECT c.*, s.name as student_name, cert.name as certification_name, sch.name as school_name
    FROM certificates c
    JOIN students st ON c.student_id = st.id
    JOIN users s ON st.user_id = s.id
    JOIN certifications cert ON c.certification_id = cert.id
    JOIN schools sch ON c.school_id = sch.id
  `;
  
  let params: any[] = [];
  const userRoles = req.user.roles || [req.user.role];
  if (!userRoles.includes('superadmin')) {
    const schoolId = (req as any).school?.id;
    if (!schoolId) return res.status(400).json({ error: "Contexto de escola necessário" });
    query += " WHERE c.school_id = ?";
    params.push(schoolId);
  }
  
  const certificates = db.prepare(query).all(...params);
  res.json(certificates);
});

router.post("/certificates/issue", authorize(['admin', 'superadmin', 'secretary']), (req: any, res) => {
  const { student_id, certification_id, issue_date, expiry_date, grade, template_type, school_id } = req.body;
  
  // Determine school context
  let targetSchoolId = school_id;
  const userRoles = req.user.roles || [req.user.role];
  if (!userRoles.includes('superadmin')) {
    const schoolId = (req as any).school?.id;
    if (!schoolId) return res.status(400).json({ error: "Contexto de escola necessário" });
    targetSchoolId = schoolId;
    
    // Verify student belongs to this school
    const student = db.prepare("SELECT id FROM students WHERE id = ? AND school_id = ?").get(student_id, targetSchoolId);
    if (!student) return res.status(400).json({ error: "Aluno não pertence a esta escola" });
  } else {
    // Superadmin must provide school_id or we use the student's school
    if (!targetSchoolId) {
      const student = db.prepare("SELECT school_id FROM students WHERE id = ?").get(student_id) as any;
      if (!student) return res.status(400).json({ error: "Aluno não encontrado" });
      targetSchoolId = student.school_id;
    }
  }

  const certificate_number = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    const result = db.prepare(`
      INSERT INTO certificates (school_id, student_id, certification_id, issue_date, expiry_date, certificate_number, grade, template_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(targetSchoolId, student_id, certification_id, issue_date, expiry_date, certificate_number, grade, template_type || 'standard');
    res.json({ id: result.lastInsertRowid, certificate_number });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
