import express from "express";
import db from "../db.ts";

const router = express.Router();

// Get all teachers for the school
router.get("/", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const teachers = db.prepare(`
    SELECT users.id as user_id, users.name, users.email, teachers.id as teacher_id, teachers.specialization, teachers.hire_date
    FROM users
    JOIN teachers ON users.id = teachers.user_id
    WHERE users.school_id = ? AND users.role = 'teacher'
  `).all(schoolId);
  res.json(teachers);
});

// Create a new teacher
router.post("/", (req, res) => {
  const { name, email, password, specialization, hire_date } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    const userStmt = db.prepare("INSERT INTO users (school_id, name, email, password, role) VALUES (?, ?, ?, ?, 'teacher')");
    const userResult = userStmt.run(schoolId, name, email, password || 'teacher123');
    
    const teacherStmt = db.prepare("INSERT INTO teachers (user_id, school_id, specialization, hire_date) VALUES (?, ?, ?, ?)");
    const teacherResult = teacherStmt.run(userResult.lastInsertRowid, schoolId, specialization, hire_date);

    res.json({ id: teacherResult.lastInsertRowid, user_id: userResult.lastInsertRowid, name, email, specialization, hire_date });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get vacations
router.get("/vacations", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const vacations = db.prepare(`
    SELECT vacations.*, users.name as user_name
    FROM vacations
    JOIN users ON vacations.user_id = users.id
    WHERE vacations.school_id = ?
  `).all(schoolId);
  res.json(vacations);
});

// Request vacation
router.post("/vacations", (req, res) => {
  const { user_id, start_date, end_date, type } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO vacations (user_id, school_id, start_date, end_date, type) VALUES (?, ?, ?, ?, ?)");
  const result = stmt.run(user_id, schoolId, start_date, end_date, type || 'Férias');
  res.json({ id: result.lastInsertRowid, user_id, start_date, end_date, type });
});

// Approve/Reject vacation
router.patch("/vacations/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("UPDATE vacations SET status = ? WHERE id = ? AND school_id = ?");
  stmt.run(status, id, schoolId);
  res.json({ success: true });
});

export default router;
