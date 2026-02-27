import express from "express";
import db from "../db.ts";

const router = express.Router();

// Students
router.get("/students", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const students = db.prepare(`
    SELECT users.name, users.email, students.registration_number 
    FROM students 
    JOIN users ON students.user_id = users.id 
    WHERE students.school_id = ?
  `).all(schoolId);
  res.json(students);
});

router.post("/students", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const { name, email, password, registration_number, guardian_name, guardian_phone, guardian_email } = req.body;

  const school = db.prepare("SELECT license_limit, license_status FROM schools WHERE id = ?").get(schoolId) as any;
  if (school.license_status !== 'active') {
    return res.status(403).json({ error: "A licença da escola não está ativa." });
  }

  const studentCount = db.prepare("SELECT count(*) as count FROM students WHERE school_id = ?").get(schoolId) as { count: number };
  if (studentCount.count >= school.license_limit) {
    return res.status(403).json({ error: "Limite de alunos atingido para esta licença." });
  }

  try {
    const userStmt = db.prepare("INSERT INTO users (name, email, password, role, school_id) VALUES (?, ?, ?, 'student', ?)");
    const userResult = userStmt.run(name, email, password || 'kulonga123', schoolId);
    
    const studentStmt = db.prepare("INSERT INTO students (user_id, school_id, registration_number, guardian_name, guardian_phone, guardian_email) VALUES (?, ?, ?, ?, ?, ?)");
    studentStmt.run(userResult.lastInsertRowid, schoolId, registration_number, guardian_name, guardian_phone, guardian_email);

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Subjects
router.get("/subjects", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const subjects = db.prepare("SELECT * FROM subjects WHERE school_id = ?").all(schoolId);
  res.json(subjects);
});

router.post("/subjects", (req, res) => {
  const { name, code } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO subjects (school_id, name, code) VALUES (?, ?, ?)");
  const result = stmt.run(schoolId, name, code);
  res.json({ id: result.lastInsertRowid, name, code });
});

// Grades
router.get("/grades", (req, res) => {
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

router.post("/grades", (req, res) => {
  const { student_id, subject, score, term } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO grades (school_id, student_id, subject, score, term) VALUES (?, ?, ?, ?, ?)");
  const result = stmt.run(schoolId, student_id, subject, score, term);
  res.json({ id: result.lastInsertRowid, student_id, subject, score, term });
});

router.patch("/grades/:id/finalize", (req, res) => {
  const { id } = req.params;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("UPDATE grades SET is_finalized = 1 WHERE id = ? AND school_id = ?");
  stmt.run(id, schoolId);
  res.json({ success: true });
});

router.patch("/grades/:id", (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  // Check if finalized
  const grade = db.prepare("SELECT is_finalized FROM grades WHERE id = ?").get(id) as any;
  if (grade?.is_finalized) {
    return res.status(403).json({ error: "Nota finalizada não pode ser alterada." });
  }

  const stmt = db.prepare("UPDATE grades SET score = ? WHERE id = ? AND school_id = ?");
  stmt.run(score, id, schoolId);
  res.json({ success: true });
});


// Classes
router.get("/classes", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });
  
  const classes = db.prepare("SELECT * FROM classes WHERE school_id = ?").all(schoolId);
  res.json(classes);
});

router.post("/classes", (req, res) => {
  const { name, grade_level } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO classes (school_id, name, grade_level) VALUES (?, ?, ?)");
  const result = stmt.run(schoolId, name, grade_level);
  res.json({ id: result.lastInsertRowid, name, grade_level });
});

// Classrooms
router.get("/classrooms", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });
  
  const classrooms = db.prepare("SELECT * FROM classrooms WHERE school_id = ?").all(schoolId);
  res.json(classrooms);
});

router.post("/classrooms", (req, res) => {
  const { name, capacity } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO classrooms (school_id, name, capacity) VALUES (?, ?, ?)");
  const result = stmt.run(schoolId, name, capacity);
  res.json({ id: result.lastInsertRowid, name, capacity });
});

// Schedules
router.get("/schedules", (req, res) => {
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

router.post("/schedules", (req, res) => {
  const { class_id, classroom_id, subject, day_of_week, start_time, end_time } = req.body;
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO schedules (school_id, class_id, classroom_id, subject, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const result = stmt.run(schoolId, class_id, classroom_id, subject, day_of_week, start_time, end_time);
  res.json({ id: result.lastInsertRowid, class_id, classroom_id, subject, day_of_week, start_time, end_time });
});

export default router;
