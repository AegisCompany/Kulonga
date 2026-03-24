import express from "express";
import db from "../db.ts";
import { decrypt } from "../utils/crypto.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();

router.use(authenticate);

/**
 * PCI DSS Compliance Note:
 * This service does not store or process full credit card numbers.
 * All payments are handled via bank transfers (IBAN), mobile payments (KWIK),
 * or reference codes (EXPRESS/REFERENCE), ensuring compliance with 
 * international PCI DSS standards and Angolan financial regulations.
 */

// Get payments for a school/student
router.get("/", authorize(['admin', 'superadmin', 'secretary', 'student']), (req, res) => {
  const schoolId = (req as any).school?.id;
  const { studentId } = req.query;
  
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  let query = "SELECT * FROM payments WHERE school_id = ?";
  const params: any[] = [schoolId];

  if (studentId) {
    query += " AND invoice_id IN (SELECT id FROM invoices WHERE student_id = ?)";
    params.push(studentId);
  }

  const payments = db.prepare(query).all(...params);
  res.json(payments);
});

// Create a payment request
router.post("/request", authorize(['student', 'admin', 'superadmin']), (req, res) => {
  const { invoiceId, method, amount } = req.body;
  const schoolId = (req as any).school?.id;

  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  // Validate if a payment for this invoice is already pending or completed
  const existingPayment = db.prepare("SELECT id FROM payments WHERE invoice_id = ? AND status IN ('pending', 'completed')").get(invoiceId);
  if (existingPayment) {
    return res.status(400).json({ error: "Já existe um pagamento em processamento ou concluído para esta fatura." });
  }

  // Generate a mock reference code based on method
  let referenceCode = "";
  if (method === 'REFERENCE') {
    referenceCode = "REF-" + Math.floor(100000000 + Math.random() * 900000000).toString();
  } else if (method === 'IBAN') {
    const school = db.prepare("SELECT bank_iban FROM schools WHERE id = ?").get(schoolId) as any;
    let iban = school?.bank_iban || "AO06.0001.0000.0000.0000.0000.0";
    if (school?.bank_iban) {
      try { iban = decrypt(school.bank_iban); } catch(e) {}
    }
    referenceCode = iban;
  } else if (method === 'KWIK') {
    const school = db.prepare("SELECT phone FROM schools WHERE id = ?").get(schoolId) as any;
    referenceCode = school?.phone || "+244000000000";
  } else {
    referenceCode = "EXP-" + Math.random().toString(36).substring(7).toUpperCase();
  }

  const stmt = db.prepare(`
    INSERT INTO payments (school_id, invoice_id, amount, method, reference_code, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);
  const result = stmt.run(schoolId, invoiceId, amount, method, referenceCode);

  res.json({
    id: result.lastInsertRowid,
    invoiceId,
    amount,
    method,
    referenceCode,
    status: 'pending'
  });
});

// Secretary Approve Payment
router.post("/approve/:id", authorize(['admin', 'superadmin', 'secretary']), (req, res) => {
  const { id } = req.params;
  const schoolId = (req as any).school?.id;

  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    const payment = db.prepare("SELECT * FROM payments WHERE id = ? AND school_id = ?").get(id, schoolId) as any;
    if (!payment) return res.status(404).json({ error: "Pagamento não encontrado" });

    db.transaction(() => {
      db.prepare("UPDATE payments SET status = 'completed', paid_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      db.prepare("UPDATE invoices SET status = 'paid' WHERE id = ?").run(payment.invoice_id);
    })();

    res.json({ success: true, message: "Pagamento aprovado com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Secretary Reject Payment
router.post("/reject/:id", authorize(['admin', 'superadmin', 'secretary']), (req, res) => {
  const { id } = req.params;
  const schoolId = (req as any).school?.id;

  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    db.prepare("UPDATE payments SET status = 'failed' WHERE id = ? AND school_id = ?").run(id, schoolId);
    res.json({ success: true, message: "Pagamento rejeitado" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
