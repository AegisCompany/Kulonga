import express from "express";
import * as XLSX from "xlsx";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";
import bcrypt from "bcryptjs";

const router = express.Router();

router.use(authenticate);

// Export Students to Excel
router.get("/export/students", authorize(['admin', 'superadmin', 'secretary']), (req, res) => {
  const school = (req as any).school;
  if (!school) return res.status(400).json({ error: "Contexto de escola necessário" });

  try {
    const students = db.prepare(`
      SELECT s.id, u.name, u.email, s.registration_number, s.guardian_name, s.guardian_phone, s.guardian_email, c.name as class_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.school_id = ?
    `).all(school.id) as any[];

    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alunos");

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`Alunos_${school.subdomain}.xlsx`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao exportar alunos: " + err.message });
  }
});

// Import Students from Excel
router.post("/import/students", authorize(['admin', 'superadmin', 'secretary']), (req, res) => {
  const school = (req as any).school;
  if (!school) return res.status(400).json({ error: "Contexto de escola necessário" });

  const { data } = req.body; // Expecting array of objects from client-side parsing or multipart
  if (!data || !Array.isArray(data)) return res.status(400).json({ error: "Dados inválidos" });

  try {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const insertUser = db.prepare("INSERT INTO users (school_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
    const insertRole = db.prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'student')");
    const insertStudent = db.prepare("INSERT INTO students (user_id, school_id, registration_number, guardian_name, guardian_phone, guardian_email) VALUES (?, ?, ?, ?, ?, ?)");

    const transaction = db.transaction((studentsToImport) => {
      for (const s of studentsToImport) {
        const userId = insertUser.run(school.id, s.name, s.email, hashedPassword, 'student').lastInsertRowid;
        insertRole.run(userId);
        insertStudent.run(userId, school.id, s.registration_number || `MAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`, s.guardian_name, s.guardian_phone, s.guardian_email);
      }
    });

    transaction(data);
    res.json({ success: true, imported: data.length });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao importar alunos: " + err.message });
  }
});

// Export Teachers to Excel
router.get("/export/teachers", authorize(['admin', 'superadmin', 'hr']), (req, res) => {
  const school = (req as any).school;
  if (!school) return res.status(400).json({ error: "Contexto de escola necessário" });

  try {
    const teachers = db.prepare(`
      SELECT t.id, u.name, u.email, t.specialization, t.hire_date
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.school_id = ?
    `).all(school.id) as any[];

    const worksheet = XLSX.utils.json_to_sheet(teachers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Professores");

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`Professores_${school.subdomain}.xlsx`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao exportar professores: " + err.message });
  }
});

export default router;
