import express from "express";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();

router.use(authenticate);

// Get license status for the current school
router.get("/status", authorize(['admin', 'superadmin']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const school = db.prepare("SELECT name, license_limit, license_status, license_expiry FROM schools WHERE id = ?").get(schoolId) as any;
  
  const studentCount = db.prepare("SELECT count(*) as count FROM students WHERE school_id = ?").get(schoolId) as { count: number };

  res.json({
    ...school,
    current_students: studentCount.count,
    is_limit_reached: studentCount.count >= school.license_limit
  });
});

export default router;
