import express from "express";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();

router.use(authenticate);

router.get("/invoices", authorize(['admin', 'superadmin', 'secretary', 'student']), (req, res) => {
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

router.get("/summary", authorize(['admin', 'superadmin', 'secretary']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const totalPending = db.prepare("SELECT SUM(amount) as total FROM invoices WHERE school_id = ? AND status = 'pending'").get(schoolId) as any;
  const totalPaid = db.prepare("SELECT SUM(amount) as total FROM invoices WHERE school_id = ? AND status = 'paid'").get(schoolId) as any;
  const totalOverdue = db.prepare("SELECT SUM(amount) as total FROM invoices WHERE school_id = ? AND status = 'overdue'").get(schoolId) as any;

  // Monthly revenue for the current year
  const monthlyRevenue = db.prepare(`
    SELECT 
      strftime('%m', paid_at) as month, 
      SUM(amount) as total 
    FROM payments 
    WHERE school_id = ? AND status = 'completed' AND strftime('%Y', paid_at) = strftime('%Y', 'now')
    GROUP BY month
  `).all(schoolId);

  // Recent transactions
  const recentTransactions = db.prepare(`
    SELECT payments.*, users.name as student_name
    FROM payments
    JOIN invoices ON payments.invoice_id = invoices.id
    JOIN students ON invoices.student_id = students.id
    JOIN users ON students.user_id = users.id
    WHERE payments.school_id = ?
    ORDER BY payments.created_at DESC
    LIMIT 5
  `).all(schoolId);

  res.json({
    pending: totalPending.total || 0,
    paid: totalPaid.total || 0,
    overdue: totalOverdue.total || 0,
    monthlyRevenue,
    recentTransactions
  });
});

export default router;
