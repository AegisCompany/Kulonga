import express from "express";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();

router.use(authenticate);

router.post("/send", authorize(['admin', 'superadmin', 'pedagogical', 'secretary']), (req, res) => {
  const { userId, message, type, method } = req.body; // method: 'email', 'system', 'both'
  const schoolId = (req as any).school?.id;
  
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO notifications (school_id, user_id, message, type, method) VALUES (?, ?, ?, ?, ?)");
  stmt.run(schoolId, userId, message, type || 'system', method || 'system');

  // In a real app, trigger email/sms here if method is 'email' or 'both'
  if (method === 'email' || method === 'both') {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as any;
    if (user?.email) {
      console.log(`[EMAIL] To: ${user.email}, Message: ${message}`);
    }
  }

  res.json({ success: true, message: "Notificação enviada" });
});

router.post("/send-class", authorize(['admin', 'superadmin', 'pedagogical', 'secretary']), (req, res) => {
  const { classId, message, type, method } = req.body;
  const schoolId = (req as any).school?.id;
  
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const students = db.prepare(`
    SELECT users.id, users.email 
    FROM students 
    JOIN users ON students.user_id = users.id 
    WHERE students.class_id = ? AND students.school_id = ?
  `).all(classId, schoolId);

  const stmt = db.prepare("INSERT INTO notifications (school_id, user_id, message, type, method) VALUES (?, ?, ?, ?, ?)");
  
  for (const student of students as any[]) {
    stmt.run(schoolId, student.id, message, type || 'system', method || 'system');
    if (method === 'email' || method === 'both') {
      console.log(`[EMAIL] To: ${student.email}, Message: ${message}`);
    }
  }

  res.json({ success: true, message: `Notificação enviada para ${students.length} alunos.` });
});

router.get("/history", authorize(['admin', 'superadmin', 'pedagogical', 'teacher', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const history = db.prepare(`
    SELECT notifications.*, users.name as user_name 
    FROM notifications 
    JOIN users ON notifications.user_id = users.id
    WHERE notifications.school_id = ?
    ORDER BY sent_at DESC
  `).all(schoolId);
  res.json(history);
});

export default router;
