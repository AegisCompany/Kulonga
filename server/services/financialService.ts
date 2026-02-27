import express from "express";
import db from "../db.ts";

const router = express.Router();

router.get("/invoices", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const invoices = db.prepare(`
    SELECT invoices.*, users.name as student_name 
    FROM invoices 
    JOIN students ON invoices.student_id = students.id
    JOIN users ON students.user_id = users.id
    WHERE invoices.school_id = ?
  `).all(schoolId);
  res.json(invoices);
});

router.get("/summary", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const totalPending = db.prepare("SELECT SUM(amount) as total FROM invoices WHERE school_id = ? AND status = 'pending'").get(schoolId) as any;
  const totalPaid = db.prepare("SELECT SUM(amount) as total FROM invoices WHERE school_id = ? AND status = 'paid'").get(schoolId) as any;

  res.json({
    pending: totalPending.total || 0,
    paid: totalPaid.total || 0
  });
});

export default router;
