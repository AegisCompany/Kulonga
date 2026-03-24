import express from "express";
import db from "../db.ts";
import { encrypt, decrypt } from "../utils/crypto.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();

router.use(authenticate);

// Get current school settings
router.get("/settings", authorize(['admin', 'superadmin', 'pedagogical', 'secretary']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const school = db.prepare("SELECT * FROM schools WHERE id = ?").get(schoolId) as any;
  
  // Decrypt sensitive info if it exists
  if (school.bank_iban) {
    try { school.bank_iban = decrypt(school.bank_iban); } catch(e) {}
  }
  if (school.bank_account_number) {
    try { school.bank_account_number = decrypt(school.bank_account_number); } catch(e) {}
  }

  res.json(school);
});

// Update school banking info (Admin only)
router.patch("/banking", authorize(['admin', 'superadmin']), (req, res) => {
  const schoolId = (req as any).school?.id;
  const { bank_name, bank_iban, bank_account_number } = req.body;
  
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    // Encrypt sensitive info before saving
    const encryptedIban = bank_iban ? encrypt(bank_iban) : null;
    const encryptedAcc = bank_account_number ? encrypt(bank_account_number) : null;

    const stmt = db.prepare(`
      UPDATE schools 
      SET bank_name = ?, bank_iban = ?, bank_account_number = ? 
      WHERE id = ?
    `);
    stmt.run(bank_name, encryptedIban, encryptedAcc, schoolId);
    res.json({ success: true, bank_name, bank_iban, bank_account_number });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
