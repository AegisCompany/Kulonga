import express from "express";
import db from "../db.ts";

const router = express.Router();

// Get current school settings
router.get("/settings", (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const school = db.prepare("SELECT * FROM schools WHERE id = ?").get(schoolId);
  res.json(school);
});

// Update school banking info (Admin only)
router.patch("/banking", (req, res) => {
  const schoolId = (req as any).school?.id;
  const { bank_name, bank_iban, bank_account_number } = req.body;
  
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    const stmt = db.prepare(`
      UPDATE schools 
      SET bank_name = ?, bank_iban = ?, bank_account_number = ? 
      WHERE id = ?
    `);
    stmt.run(bank_name, bank_iban, bank_account_number, schoolId);
    res.json({ success: true, bank_name, bank_iban, bank_account_number });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
