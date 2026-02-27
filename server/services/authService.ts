import express from "express";
import db from "../db.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "kulonga-secret-key";

router.post("/login", (req, res) => {
  const { email, password, subdomain } = req.body;
  
  let user: any;
  let schoolId: number | null = null;

  if (subdomain === 'admin') {
    // Superadmin login
    user = db.prepare("SELECT * FROM users WHERE email = ? AND role = 'superadmin'").get(email);
  } else {
    const school = db.prepare("SELECT id FROM schools WHERE subdomain = ?").get(subdomain) as any;
    if (!school) return res.status(404).json({ error: "Escola não encontrada" });
    schoolId = school.id;
    user = db.prepare("SELECT * FROM users WHERE email = ? AND school_id = ?").get(email, schoolId);
  }
  
  if (user && user.password === password) {
    const token = jwt.sign(
      { id: user.id, role: user.role, schoolId },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ token, user: { name: user.name, role: user.role, email: user.email }, schoolId });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

export default router;
