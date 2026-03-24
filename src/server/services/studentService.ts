import express from "express";
import db from "../db.ts";
import { encrypt, decrypt } from "../utils/crypto.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";
import bcrypt from "bcryptjs";

const router = express.Router();

router.use(authenticate);

// List all students for the school
router.get("/", authorize(['admin', 'superadmin', 'teacher', 'pedagogical', 'secretary']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    const students = db.prepare(`
      SELECT users.name, users.email, students.*, classes.name as class_name
      FROM students 
      JOIN users ON students.user_id = users.id 
      LEFT JOIN classes ON students.class_id = classes.id
      WHERE students.school_id = ?
    `).all(schoolId) as any[];

    // Decrypt sensitive info
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific student details
router.get("/:id", authorize(['admin', 'superadmin', 'teacher', 'pedagogical', 'secretary', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  const { id } = req.params;

  // If student, can only see their own data
  if ((req as any).user.role === 'student') {
    const student = db.prepare("SELECT id FROM students WHERE user_id = ?").get((req as any).user.id) as any;
    if (!student || student.id !== parseInt(id)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
  }

  try {
    const student = db.prepare(`
      SELECT users.name, users.email, students.*, classes.name as class_name
      FROM students 
      JOIN users ON students.user_id = users.id 
      LEFT JOIN classes ON students.class_id = classes.id
      WHERE students.id = ? AND students.school_id = ?
    `).get(id, schoolId) as any;

    if (!student) return res.status(404).json({ error: "Estudante não encontrado" });

    // Decrypt sensitive info
    if (student.guardian_phone) {
      try { student.guardian_phone = decrypt(student.guardian_phone); } catch(e) {}
    }
    if (student.guardian_email) {
      try { student.guardian_email = decrypt(student.guardian_email); } catch(e) {}
    }

    res.json(student);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new student
router.post("/", authorize(['admin', 'superadmin', 'secretary']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const { name, email, password, registration_number, class_id, guardian_name, guardian_phone, guardian_email } = req.body;

  // Check license
  const school = db.prepare("SELECT license_limit, license_status FROM schools WHERE id = ?").get(schoolId) as any;
  if (school.license_status !== 'active') {
    return res.status(403).json({ error: "A licença da escola não está ativa." });
  }

  const studentCount = db.prepare("SELECT count(*) as count FROM students WHERE school_id = ?").get(schoolId) as { count: number };
  if (studentCount.count >= school.license_limit) {
    return res.status(403).json({ error: "Limite de alunos atingido para esta licença." });
  }

  try {
    const encryptedPhone = guardian_phone ? encrypt(guardian_phone) : null;
    const encryptedEmail = guardian_email ? encrypt(guardian_email) : null;
    const hashedPassword = bcrypt.hashSync(password || 'kulonga123', 10);

    const transaction = db.transaction(() => {
      const userStmt = db.prepare("INSERT INTO users (name, email, password, role, school_id) VALUES (?, ?, ?, 'student', ?)");
      const userResult = userStmt.run(name, email, hashedPassword, schoolId);
      const userId = userResult.lastInsertRowid;

      db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'student')").run(userId);
      
      const studentStmt = db.prepare(`
        INSERT INTO students (user_id, school_id, registration_number, class_id, guardian_name, guardian_phone, guardian_email) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const studentResult = studentStmt.run(userId, schoolId, registration_number, class_id || null, guardian_name, encryptedPhone, encryptedEmail);
      
      return studentResult.lastInsertRowid;
    });

    const studentId = transaction();
    res.status(201).json({ success: true, id: studentId });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update student
router.put("/:id", authorize(['admin', 'superadmin', 'secretary']), (req, res) => {
  const schoolId = (req as any).school?.id;
  const { id } = req.params;
  const { name, email, registration_number, class_id, guardian_name, guardian_phone, guardian_email } = req.body;

  try {
    const student = db.prepare("SELECT user_id FROM students WHERE id = ? AND school_id = ?").get(id, schoolId) as any;
    if (!student) return res.status(404).json({ error: "Estudante não encontrado" });

    const encryptedPhone = guardian_phone ? encrypt(guardian_phone) : null;
    const encryptedEmail = guardian_email ? encrypt(guardian_email) : null;

    const transaction = db.transaction(() => {
      // Update user info
      db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, student.user_id);
      
      // Update student info
      db.prepare(`
        UPDATE students 
        SET registration_number = ?, class_id = ?, guardian_name = ?, guardian_phone = ?, guardian_email = ?
        WHERE id = ? AND school_id = ?
      `).run(registration_number, class_id || null, guardian_name, encryptedPhone, encryptedEmail, id, schoolId);
    });

    transaction();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete student
router.delete("/:id", authorize(['admin', 'superadmin']), (req, res) => {
  const schoolId = (req as any).school?.id;
  const { id } = req.params;

  try {
    const student = db.prepare("SELECT user_id FROM students WHERE id = ? AND school_id = ?").get(id, schoolId) as any;
    if (!student) return res.status(404).json({ error: "Estudante não encontrado" });

    const transaction = db.transaction(() => {
      // Delete from related tables first if necessary (cascade might be missing in SQLite setup)
      db.prepare("DELETE FROM grades WHERE student_id = ?").run(id);
      db.prepare("DELETE FROM invoices WHERE student_id = ?").run(id);
      db.prepare("DELETE FROM students WHERE id = ?").run(id);
      db.prepare("DELETE FROM user_roles WHERE user_id = ?").run(student.user_id);
      db.prepare("DELETE FROM users WHERE id = ?").run(student.user_id);
    });

    transaction();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Academic History (Grades)
router.get("/:id/history", authorize(['admin', 'superadmin', 'teacher', 'pedagogical', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  const { id } = req.params;

  // If student, can only see their own history
  if ((req as any).user.role === 'student') {
    const student = db.prepare("SELECT id FROM students WHERE user_id = ?").get((req as any).user.id) as any;
    if (!student || student.id !== parseInt(id)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
  }

  try {
    const history = db.prepare(`
      SELECT * FROM grades 
      WHERE student_id = ? AND school_id = ?
      ORDER BY date_recorded DESC
    `).all(id, schoolId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Enrollments (Current and past classes if we had a history table, but for now current)
router.get("/:id/enrollments", authorize(['admin', 'superadmin', 'teacher', 'pedagogical', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  const { id } = req.params;

  try {
    const student = db.prepare(`
      SELECT students.class_id, classes.name as class_name, classes.grade_level
      FROM students
      LEFT JOIN classes ON students.class_id = classes.id
      WHERE students.id = ? AND students.school_id = ?
    `).get(id, schoolId) as any;

    if (!student) return res.status(404).json({ error: "Estudante não encontrado" });

    res.json(student.class_id ? [{
      class_id: student.class_id,
      class_name: student.class_name,
      grade_level: student.grade_level,
      status: 'active'
    }] : []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Enroll student in a class
router.post("/:id/enroll", authorize(['admin', 'superadmin', 'pedagogical', 'secretary']), (req, res) => {
  const schoolId = (req as any).school?.id;
  const { id } = req.params;
  const { class_id } = req.body;

  if (!class_id) return res.status(400).json({ error: "class_id é obrigatório" });

  try {
    const student = db.prepare("SELECT id FROM students WHERE id = ? AND school_id = ?").get(id, schoolId) as any;
    if (!student) return res.status(404).json({ error: "Estudante não encontrado" });

    const classExists = db.prepare("SELECT id FROM classes WHERE id = ? AND school_id = ?").get(class_id, schoolId);
    if (!classExists) return res.status(404).json({ error: "Turma não encontrada" });

    db.prepare("UPDATE students SET class_id = ? WHERE id = ?").run(class_id, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
