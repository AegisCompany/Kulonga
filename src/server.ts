import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { rateLimit } from "express-rate-limit";
import db from "./server/db.ts";
import { authenticate, authorize } from "./server/utils/authMiddleware.ts";

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
import studentService from "./server/services/studentService.ts";
import saftService from "./server/services/saftService.ts";
import dataService from "./server/services/dataService.ts";
import migrationService from "./server/services/migrationService.ts";
import certificationService from "./server/services/certificationService.ts";
import externalService from "./server/services/externalService.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// --- API Gateway Configurations ---

// 1. Trust Proxy (Important for Rate Limiting behind proxies)
app.set('trust proxy', 1);

// 2. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Gateway] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 4. Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Increased limit for dashboard usage
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: "Muitas requisições. Por favor, tente novamente mais tarde." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100, // Increased for development/testing
  message: { error: "Muitas tentativas de login. Por favor, tente novamente em 15 minutos." }
});

// Apply general rate limiting to all API routes
app.use("/api", generalLimiter);

// 5. Multi-tenancy Middleware (Gateway Logic)
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

// --- API Gateway Routing ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString(), gateway: "Kulonga API Gateway" });
});

// Auth Service (with stricter rate limiting)
app.use("/api/auth", authLimiter, authService);

// Core Services
app.use("/api/academic", academicService);
app.use("/api/students", studentService);
app.use("/api/teachers", teacherService);
app.use("/api/financial", financialService);
app.use("/api/payments", paymentService);
app.use("/api/notifications", notificationService);
app.use("/api/school", schoolService);
app.use("/api/license", licenseService);
app.use("/api/saft", saftService);
app.use("/api/data", dataService);
app.use("/api/migration", migrationService);
app.use("/api/certification", certificationService);
app.use("/api/external", externalService);
app.use("/api/superadmin", superAdminService);

// Service Requests API
app.post("/api/service-requests", (req, res) => {
  const { name, institution_name, email, phone, license_type, message } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO service_requests (name, institution_name, email, phone, license_type, message) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(name, institution_name, email, phone, license_type, message);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/superadmin/service-requests", authenticate, authorize(['superadmin']), (req, res) => {
  const requests = db.prepare("SELECT * FROM service_requests ORDER BY created_at DESC").all();
  res.json(requests);
});

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

// --- Gateway Error Handling ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Gateway Error]", err);
  const status = err.status || 500;
  res.status(status).json({
    error: "Erro interno no Gateway",
    message: process.env.NODE_ENV === 'production' ? "Ocorreu um erro inesperado." : err.message
  });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, ".."),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Kulonga Platform Gateway started on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Server] Database: school.db`);
  });
}

console.log("[Server] Starting Kulonga Platform Gateway...");
startServer().catch(err => {
  console.error("[Server] Critical failure during startup:", err);
  process.exit(1);
});
