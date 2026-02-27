import express from "express";
import db from "../db.ts";

const router = express.Router();

router.post("/send", (req, res) => {
  const { userId, message, type } = req.body;
  const schoolId = (req as any).school?.id;
  
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const stmt = db.prepare("INSERT INTO notifications (school_id, user_id, message, type) VALUES (?, ?, ?, ?)");
  stmt.run(schoolId, userId, message, type);

  res.json({ success: true, message: "Notificação enviada" });
});

router.get("/history", (req, res) => {
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
