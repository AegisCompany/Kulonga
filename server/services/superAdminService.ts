import express from "express";
import db from "../db.ts";

const router = express.Router();

// Middleware to check if user is superadmin
// In a real app, we would verify the JWT token here.
// For this demo, we'll assume the gateway or the request has been validated.
const checkSuperAdmin = (req: any, res: any, next: any) => {
  // Mocking superadmin check for demo purposes
  // In production, this would check req.user.role === 'superadmin'
  next();
};

// Add a new school
router.post("/schools", checkSuperAdmin, (req, res) => {
  const { name, subdomain, logo_url, address, phone, email, primary_color, bank_name, bank_iban, bank_account_number, license_limit, license_expiry } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO schools (name, subdomain, logo_url, address, phone, email, primary_color, bank_name, bank_iban, bank_account_number, license_limit, license_expiry) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, subdomain, logo_url, address, phone, email, primary_color || '#4f46e5', bank_name, bank_iban, bank_account_number, license_limit || 50, license_expiry);
    res.json({ id: result.lastInsertRowid, name, subdomain, logo_url, address, phone, email, primary_color, bank_name, bank_iban, bank_account_number, license_limit, license_expiry });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update a school (Super Admin only)
router.patch("/schools/:id", checkSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { name, logo_url, address, phone, email, primary_color, bank_name, bank_iban, bank_account_number, license_limit, license_status, license_expiry } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE schools 
      SET name = ?, logo_url = ?, address = ?, phone = ?, email = ?, primary_color = ?, bank_name = ?, bank_iban = ?, bank_account_number = ?, license_limit = ?, license_status = ?, license_expiry = ?
      WHERE id = ?
    `);
    stmt.run(name, logo_url, address, phone, email, primary_color, bank_name, bank_iban, bank_account_number, license_limit, license_status, license_expiry, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// List all users across all schools
router.get("/users", checkSuperAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT users.*, schools.name as school_name 
    FROM users 
    LEFT JOIN schools ON users.school_id = schools.id
  `).all();
  res.json(users);
});

// Change user role
router.patch("/users/:id/role", checkSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const stmt = db.prepare("UPDATE users SET role = ? WHERE id = ?");
    stmt.run(role, id);
    res.json({ success: true, id, role });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reset user password
router.patch("/users/:id/reset-password", checkSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    const stmt = db.prepare("UPDATE users SET password = ? WHERE id = ?");
    stmt.run(newPassword, id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// System adjustments (Mock endpoint)
router.get("/system-stats", checkSuperAdmin, (req, res) => {
  const schools = db.prepare("SELECT count(*) as count FROM schools").get() as any;
  const users = db.prepare("SELECT count(*) as count FROM users").get() as any;
  const students = db.prepare("SELECT count(*) as count FROM students").get() as any;
  
  res.json({
    totalSchools: schools.count,
    totalUsers: users.count,
    totalStudents: students.count,
    dbSize: "2.4 MB",
    uptime: "15 days, 4 hours"
  });
});

export default router;
