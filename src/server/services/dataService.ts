import express from "express";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();

router.use(authenticate);

// Export all school data as JSON
router.get("/export", authorize(['admin', 'superadmin']), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  try {
    const data: any = {};
    const tables = [
      'students', 'teachers', 'classes', 'subjects', 'schedules', 
      'classrooms', 'invoices', 'invoice_items', 'payments', 
      'notifications', 'licenses'
    ];

    tables.forEach(table => {
      data[table] = db.prepare(`SELECT * FROM ${table} WHERE school_id = ?`).all(schoolId);
    });

    res.header('Content-Type', 'application/json');
    res.attachment(`export_school_${schoolId}_${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao exportar dados: " + err.message });
  }
});

// Import school data from JSON
router.post("/import", authorize(['admin', 'superadmin']), express.json({ limit: '50mb' }), (req, res) => {
  const schoolId = (req as any).school?.id;
  if (!schoolId) return res.status(400).json({ error: "Escola não identificada" });

  const data = req.body;
  if (!data || typeof data !== 'object') return res.status(400).json({ error: "Dados inválidos" });

  const transaction = db.transaction(() => {
    for (const [table, rows] of Object.entries(data)) {
      if (!Array.isArray(rows)) continue;

      // Delete existing data for this school in this table
      db.prepare(`DELETE FROM ${table} WHERE school_id = ?`).run(schoolId);

      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]).filter(col => col !== 'id');
      const placeholders = columns.map(() => '?').join(', ');
      const insertStmt = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}, school_id) VALUES (${placeholders}, ?)`);

      rows.forEach((row: any) => {
        const values = columns.map(col => row[col]);
        insertStmt.run(...values, schoolId);
      });
    }
  });

  try {
    transaction();
    res.json({ message: "Dados importados com sucesso" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao importar dados: " + err.message });
  }
});

export default router;
