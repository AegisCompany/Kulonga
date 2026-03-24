import express from "express";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";
import bcrypt from "bcryptjs";

const router = express.Router();

router.use(authenticate);

// Get all teachers for the school
router.get("/", authorize(['admin', 'superadmin', 'pedagogical', 'secretary', 'hr']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const teachers = db.prepare(`
    SELECT users.id as user_id, users.name, users.email, teachers.id as teacher_id, teachers.specialization, teachers.hire_date, teachers.phone, teachers.bi
    FROM users
    JOIN teachers ON users.id = teachers.user_id
    WHERE users.school_id = ? AND users.role = 'teacher'
  `).all(schoolId);
  res.json(teachers);
});

// Create a new teacher
router.post("/", authorize(['admin', 'superadmin', 'hr']), (req, res) => {
  const { name, email, password, specialization, hire_date, phone, bi } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    const hashedPassword = bcrypt.hashSync(password || 'teacher123', 10);
    
    const transaction = db.transaction(() => {
      const userStmt = db.prepare("INSERT INTO users (school_id, name, email, password, role) VALUES (?, ?, ?, ?, 'teacher')");
      const userResult = userStmt.run(schoolId, name, email, hashedPassword);
      const userId = userResult.lastInsertRowid;

      db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'teacher')").run(userId);
      
      const teacherStmt = db.prepare("INSERT INTO teachers (user_id, school_id, specialization, hire_date, phone, bi) VALUES (?, ?, ?, ?, ?, ?)");
      const teacherResult = teacherStmt.run(userId, schoolId, specialization, hire_date, phone, bi);

      return { id: teacherResult.lastInsertRowid, user_id: userId };
    });

    const result = transaction();
    res.json({ ...result, name, email, specialization, hire_date, phone, bi });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update teacher
router.put("/:id", authorize(['admin', 'superadmin', 'hr']), (req, res) => {
  const { id } = req.params;
  const { name, email, specialization, hire_date, phone, bi } = req.body;
  const schoolId = (req as any).school?.id;

  try {
    const teacher = db.prepare("SELECT user_id FROM teachers WHERE id = ? AND school_id = ?").get(id, schoolId) as any;
    if (!teacher) return res.status(404).json({ error: "Professor não encontrado" });

    const transaction = db.transaction(() => {
      db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, teacher.user_id);
      db.prepare("UPDATE teachers SET specialization = ?, hire_date = ?, phone = ?, bi = ? WHERE id = ?").run(specialization, hire_date, phone, bi, id);
    });

    transaction();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get licenses (formerly vacations)
router.get("/vacations", authorize(['admin', 'superadmin', 'hr', 'teacher', 'pedagogical', 'secretary']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const vacations = db.prepare(`
    SELECT licenses.*, users.name as user_name
    FROM licenses
    JOIN users ON licenses.user_id = users.id
    WHERE licenses.school_id = ?
  `).all(schoolId);
  res.json(vacations);
});

// Request license
router.post("/vacations", authorize(['teacher', 'admin', 'superadmin', 'secretary', 'hr', 'pedagogical', 'student']), (req, res) => {
  const { user_id, start_date, end_date, type, requested_by_role } = req.body;
  const schoolId = (req as any).school?.id;
  const requesterId = (req as any).user.id;

  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    const stmt = db.prepare("INSERT INTO licenses (user_id, school_id, start_date, end_date, type, requested_by_role) VALUES (?, ?, ?, ?, ?, ?)");
    const result = stmt.run(user_id || requesterId, schoolId, start_date, end_date, type || 'Licença Médica', requested_by_role || (req as any).user.role);
    
    // Notification logic based on requester role
    const role = requested_by_role || (req as any).user.role;
    const message = `Nova solicitação de licença (${type}) de ${role}`;
    
    if (role === 'student') {
      // Notify Secretary and Director (Admin)
      const admins = db.prepare("SELECT id FROM users WHERE school_id = ? AND role IN ('admin', 'secretary')").all(schoolId) as any[];
      admins.forEach(admin => {
        db.prepare("INSERT INTO notifications (school_id, user_id, message, type) VALUES (?, ?, ?, 'system')")
          .run(schoolId, admin.id, message);
      });
    } else {
      // Notify Pedagogical and HR
      const staff = db.prepare("SELECT id FROM users WHERE school_id = ? AND role IN ('pedagogical', 'hr', 'admin')").all(schoolId) as any[];
      staff.forEach(s => {
        db.prepare("INSERT INTO notifications (school_id, user_id, message, type) VALUES (?, ?, ?, 'system')")
          .run(schoolId, s.id, message);
      });
    }

    res.json({ id: result.lastInsertRowid, user_id, start_date, end_date, type });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Approve/Reject license
router.patch("/vacations/:id/status", authorize(['admin', 'superadmin', 'hr', 'pedagogical']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const schoolId = (req as any).school?.id;
  const approverId = (req as any).user.id;

  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    const license = db.prepare("SELECT * FROM licenses WHERE id = ?").get(id) as any;
    if (!license) return res.status(404).json({ error: "Licença não encontrada" });

    const stmt = db.prepare("UPDATE licenses SET status = ?, approved_by = ? WHERE id = ? AND school_id = ?");
    stmt.run(status, approverId, id, schoolId);

    // Notification logic for approval/rejection
    const message = `Sua solicitação de licença foi ${status.toLowerCase()}`;
    db.prepare("INSERT INTO notifications (school_id, user_id, message, type) VALUES (?, ?, ?, 'system')")
      .run(schoolId, license.user_id, message);

    // If student license approved, notify teacher and secretary
    if (license.requested_by_role === 'student' && status === 'Aprovado') {
      const staff = db.prepare("SELECT id FROM users WHERE school_id = ? AND role IN ('teacher', 'secretary')").all(schoolId) as any[];
      staff.forEach(s => {
        db.prepare("INSERT INTO notifications (school_id, user_id, message, type) VALUES (?, ?, ?, 'system')")
          .run(schoolId, s.id, `Licença do aluno aprovada: ${license.type}`);
      });
    }

    // If teacher license approved, notify secretary and HR
    if (license.requested_by_role === 'teacher' && status === 'Aprovado') {
      const staff = db.prepare("SELECT id FROM users WHERE school_id = ? AND role IN ('secretary', 'hr')").all(schoolId) as any[];
      staff.forEach(s => {
        db.prepare("INSERT INTO notifications (school_id, user_id, message, type) VALUES (?, ?, ?, 'system')")
          .run(schoolId, s.id, `Licença do professor aprovada: ${license.type}`);
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
