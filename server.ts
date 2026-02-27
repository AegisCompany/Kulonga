import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db from "./server/db.ts";

// Import Services
import authService from "./server/services/authService.ts";
import academicService from "./server/services/academicService.ts";
import financialService from "./server/services/financialService.ts";
import notificationService from "./server/services/notificationService.ts";
import superAdminService from "./server/services/superAdminService.ts";
import paymentService from "./server/services/paymentService.ts";
import schoolService from "./server/services/schoolService.ts";
import licenseService from "./server/services/licenseService.ts";
import teacherService from "./server/services/teacherService.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Multi-tenancy Middleware (Gateway Logic)
app.use((req, res, next) => {
  const host = req.headers.host || "";
  let subdomain = "";
  
  const xSubdomain = req.headers['x-school-subdomain'];
  if (xSubdomain && typeof xSubdomain === 'string') {
    subdomain = xSubdomain;
  } else {
    const parts = host.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  if (subdomain) {
    const school = db.prepare("SELECT * FROM schools WHERE subdomain = ?").get(subdomain) as any;
    if (school) {
      (req as any).school = school;
    }
  }
  next();
});

// API Gateway Routing
app.use("/api/auth", authService);
app.use("/api/academic", academicService);
app.use("/api/financial", financialService);
app.use("/api/notifications", notificationService);
app.use("/api/superadmin", superAdminService);
app.use("/api/payments", paymentService);
app.use("/api/school", schoolService);
app.use("/api/license", licenseService);
app.use("/api/teachers", teacherService);

// General Routes
app.get("/api/schools", (req, res) => {
  const schools = db.prepare("SELECT * FROM schools").all();
  res.json(schools);
});

app.get("/api/stats", (req, res) => {
  const school = (req as any).school;
  if (!school) return res.status(400).json({ error: "Contexto de escola necessário" });
  
  const studentCount = db.prepare("SELECT count(*) as count FROM students WHERE school_id = ?").get(school.id) as any;
  const teacherCount = db.prepare("SELECT count(*) as count FROM users WHERE school_id = ? AND role = 'teacher'").get(school.id) as any;
  
  res.json({
    students: studentCount.count,
    teachers: teacherCount.count,
    classes: 12,
    averageGrade: 8.4
  });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
