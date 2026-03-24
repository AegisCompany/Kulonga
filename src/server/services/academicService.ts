import express from "express";
import db from "../db.ts";
import { encrypt, decrypt } from "../utils/crypto.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";
import bcrypt from "bcryptjs";

const router = express.Router();

router.use(authenticate);

// Subjects
router.get("/subjects", authorize(['admin', 'superadmin', 'teacher', 'pedagogical', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const subjects = db.prepare("SELECT * FROM subjects WHERE school_id = ?").all(schoolId);
  res.json(subjects);
});

router.post("/subjects", authorize(['admin', 'superadmin', 'pedagogical']), (req, res) => {
  const { name, code, classe_id } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO subjects (school_id, name, code, classe_id) VALUES (?, ?, ?, ?)");
  const result = stmt.run(schoolId, name, code, classe_id);
  res.json({ id: result.lastInsertRowid, name, code, classe_id });
});

// Grades
router.get("/grades", authorize(['admin', 'superadmin', 'teacher', 'pedagogical', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const grades = db.prepare(`
    SELECT grades.*, users.name as student_name 
    FROM grades 
    JOIN students ON grades.student_id = students.id
    JOIN users ON students.user_id = users.id
    WHERE grades.school_id = ?
  `).all(schoolId);
  res.json(grades);
});

router.post("/grades", authorize(['admin', 'superadmin', 'teacher']), (req, res) => {
  const { student_id, subject, score1, score2, score3 } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const s1 = parseFloat(score1) || 0;
  const s2 = parseFloat(score2) || 0;
  const s3 = parseFloat(score3) || 0;
  const finalScore = (s1 + s2 + s3) / 3;

  const stmt = db.prepare("INSERT INTO grades (school_id, student_id, subject, score1, score2, score3, score) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const result = stmt.run(schoolId, student_id, subject, s1, s2, s3, finalScore);
  res.json({ id: result.lastInsertRowid, student_id, subject, score1: s1, score2: s2, score3: s3, score: finalScore });
});

router.patch("/grades/:id/finalize", authorize(['admin', 'superadmin', 'pedagogical']), (req, res) => {
  const { id } = req.params;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("UPDATE grades SET is_finalized = 1 WHERE id = ? AND school_id = ?");
  stmt.run(id, schoolId);
  res.json({ success: true });
});

router.patch("/grades/:id", authorize(['admin', 'superadmin', 'teacher']), (req, res) => {
  const { id } = req.params;
  const { score1, score2, score3 } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  // Check if finalized
  const grade = db.prepare("SELECT is_finalized FROM grades WHERE id = ?").get(id) as any;
  if (grade?.is_finalized) {
    return res.status(403).json({ error: "Nota finalizada não pode ser alterada." });
  }

  const s1 = parseFloat(score1) || 0;
  const s2 = parseFloat(score2) || 0;
  const s3 = parseFloat(score3) || 0;
  const finalScore = (s1 + s2 + s3) / 3;

  const stmt = db.prepare("UPDATE grades SET score1 = ?, score2 = ?, score3 = ?, score = ? WHERE id = ? AND school_id = ?");
  stmt.run(s1, s2, s3, finalScore, id, schoolId);
  res.json({ success: true });
});


// Classes
router.get("/classes", authorize(['admin', 'superadmin', 'teacher', 'pedagogical', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });
  
  const classes = db.prepare("SELECT * FROM classes WHERE school_id = ?").all(schoolId);
  res.json(classes);
});

router.post("/classes", authorize(['admin', 'superadmin', 'pedagogical']), (req, res) => {
  const { name, grade_level, teacher_id, pedagogical_id, director_id } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO classes (school_id, name, grade_level, teacher_id, pedagogical_id, director_id) VALUES (?, ?, ?, ?, ?, ?)");
  const result = stmt.run(schoolId, name, grade_level, teacher_id, pedagogical_id, director_id);
  res.json({ id: result.lastInsertRowid, name, grade_level, teacher_id, pedagogical_id, director_id });
});

router.patch("/classes/:id", authorize(['admin', 'superadmin', 'pedagogical']), (req, res) => {
  const { id } = req.params;
  const { teacher_id, pedagogical_id, director_id } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("UPDATE classes SET teacher_id = ?, pedagogical_id = ?, director_id = ? WHERE id = ? AND school_id = ?");
  stmt.run(teacher_id, pedagogical_id, director_id, id, schoolId);
  res.json({ success: true });
});

// Classrooms
router.get("/classrooms", authorize(['admin', 'superadmin', 'pedagogical', 'secretary']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });
  
  const classrooms = db.prepare("SELECT * FROM classrooms WHERE school_id = ?").all(schoolId);
  res.json(classrooms);
});

router.post("/classrooms", authorize(['admin', 'superadmin', 'pedagogical']), (req, res) => {
  const { name, capacity } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO classrooms (school_id, name, capacity) VALUES (?, ?, ?)");
  const result = stmt.run(schoolId, name, capacity);
  res.json({ id: result.lastInsertRowid, name, capacity });
});

// Schedules
router.get("/schedules", authorize(['admin', 'superadmin', 'teacher', 'pedagogical', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });
  
  const schedules = db.prepare(`
    SELECT 
      schedules.*, 
      classes.name as class_name, 
      classrooms.name as classroom_name 
    FROM schedules 
    LEFT JOIN classes ON schedules.class_id = classes.id 
    LEFT JOIN classrooms ON schedules.classroom_id = classrooms.id 
    WHERE schedules.school_id = ?
  `).all(schoolId);
  res.json(schedules);
});

router.post("/schedules", authorize(['admin', 'superadmin', 'pedagogical']), (req, res) => {
  const { class_id, classroom_id, subject, day_of_week, start_time, end_time, teacher_id, subject_id } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO schedules (school_id, class_id, classroom_id, subject, day_of_week, start_time, end_time, teacher_id, subject_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const result = stmt.run(schoolId, class_id, classroom_id, subject, day_of_week, start_time, end_time, teacher_id, subject_id);
  res.json({ id: result.lastInsertRowid, class_id, classroom_id, subject, day_of_week, start_time, end_time, teacher_id, subject_id });
});

export default router;
