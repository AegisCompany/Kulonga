import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("school.db");

// Initialize Database with all service tables
db.exec(`
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    primary_color TEXT DEFAULT '#4f46e5',
    bank_name TEXT,
    bank_iban TEXT,
    bank_account_number TEXT,
    license_limit INTEGER DEFAULT 50,
    license_status TEXT CHECK(license_status IN ('active', 'expired', 'suspended')) DEFAULT 'active',
    license_type TEXT CHECK(license_type IN ('student', 'institution', 'hybrid', 'modular', 'freemium', 'premium', 'offline', 'training')) DEFAULT 'institution',
    license_expiry DATE,
    classes_enabled INTEGER DEFAULT 1,
    grades_enabled INTEGER DEFAULT 1,
    teachers_enabled INTEGER DEFAULT 1,
    vacations_enabled INTEGER DEFAULT 1,
    certificates_enabled INTEGER DEFAULT 1,
    financial_enabled INTEGER DEFAULT 1,
    migration_enabled INTEGER DEFAULT 1,
    payments_enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('superadmin', 'admin', 'teacher', 'student', 'parent', 'secretary', 'hr', 'pedagogical', 'unassigned')) NOT NULL,
    email_confirmed INTEGER DEFAULT 0,
    confirmation_token TEXT,
    reset_token TEXT,
    reset_token_expiry DATETIME,
    mfa_secret TEXT,
    mfa_enabled INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_until DATETIME,
    temp_password_expiry DATETIME,
    google_id TEXT,
    password_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    school_id INTEGER,
    registration_number TEXT UNIQUE,
    class_id INTEGER,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_email TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    name TEXT NOT NULL,
    grade_level TEXT,
    teacher_id INTEGER, -- Class Director
    pedagogical_id INTEGER,
    director_id INTEGER,
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(teacher_id) REFERENCES users(id),
    FOREIGN KEY(pedagogical_id) REFERENCES users(id),
    FOREIGN KEY(director_id) REFERENCES users(id)
  );

  -- Class Management Service Tables
  CREATE TABLE IF NOT EXISTS classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    name TEXT NOT NULL,
    capacity INTEGER,
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    class_id INTEGER,
    classroom_id INTEGER,
    subject TEXT NOT NULL,
    day_of_week TEXT CHECK(day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado')) NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(class_id) REFERENCES classes(id),
    FOREIGN KEY(classroom_id) REFERENCES classrooms(id)
  );

  -- Grade Management Service Tables
  CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    student_id INTEGER,
    subject TEXT NOT NULL,
    score1 DECIMAL(4,2) DEFAULT 0,
    score2 DECIMAL(4,2) DEFAULT 0,
    score3 DECIMAL(4,2) DEFAULT 0,
    score DECIMAL(4,2) DEFAULT 0, -- Final Average
    term TEXT, -- kept for backward compatibility
    is_finalized INTEGER DEFAULT 0,
    date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  -- Financial Service Tables
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    student_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT CHECK(status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    invoice_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT CHECK(method IN ('KWIK', 'EXPRESS', 'IBAN', 'REFERENCE')) NOT NULL,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    reference_code TEXT,
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(invoice_id) REFERENCES invoices(id)
  );

  -- Notification Service Tables
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    user_id INTEGER,
    message TEXT NOT NULL,
    type TEXT CHECK(type IN ('email', 'sms', 'system')) NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    classe_id INTEGER,
    name TEXT NOT NULL,
    code TEXT,
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(classe_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    school_id INTEGER,
    specialization TEXT,
    hire_date DATE,
    phone TEXT,
    bi TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    school_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type TEXT CHECK(type IN ('Férias', 'Licença Médica', 'Maternidade', 'Outro')) DEFAULT 'Licença Médica',
    status TEXT CHECK(status IN ('Pendente', 'Aprovado', 'Rejeitado')) DEFAULT 'Pendente',
    requested_by_role TEXT,
    approved_by INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(approved_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_schools (
    user_id INTEGER,
    school_id INTEGER,
    PRIMARY KEY (user_id, school_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER,
    role TEXT CHECK(role IN ('superadmin', 'admin', 'teacher', 'student', 'parent', 'secretary', 'hr', 'pedagogical', 'unassigned')) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_type TEXT CHECK(license_type IN ('student', 'institution', 'hybrid', 'modular', 'freemium', 'premium', 'offline', 'training')) NOT NULL,
    message TEXT,
    status TEXT CHECK(status IN ('pending', 'scheduled', 'completed', 'rejected')) DEFAULT 'pending',
    meeting_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(4,2) DEFAULT 14.00, -- Default Angolan IVA
    tax_code TEXT DEFAULT 'IVA',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    invoice_id INTEGER,
    product_id INTEGER,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    tax_rate DECIMAL(4,2),
    total_amount DECIMAL(10,2),
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(invoice_id) REFERENCES invoices(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS saft_exports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    year INTEGER,
    month INTEGER,
    file_name TEXT,
    exported_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(exported_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    duration_hours INTEGER,
    level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    student_id INTEGER,
    certification_id INTEGER,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    certificate_number TEXT UNIQUE NOT NULL,
    status TEXT CHECK(status IN ('valid', 'revoked', 'expired')) DEFAULT 'valid',
    grade DECIMAL(4,2),
    template_type TEXT DEFAULT 'standard',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id),
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(certification_id) REFERENCES certifications(id)
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    api_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    url TEXT NOT NULL,
    event_type TEXT NOT NULL, -- e.g., 'student.created', 'grade.published', 'payment.received'
    secret TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );
`);

// Migrations for schools table
try { db.exec("ALTER TABLE classes ADD COLUMN teacher_id INTEGER;"); } catch(e) {}
try { db.exec("ALTER TABLE classes ADD COLUMN pedagogical_id INTEGER;"); } catch(e) {}
try { db.exec("ALTER TABLE classes ADD COLUMN director_id INTEGER;"); } catch(e) {}
try { db.exec("ALTER TABLE subjects ADD COLUMN classe_id INTEGER;"); } catch(e) {}
try { db.exec("ALTER TABLE teachers ADD COLUMN phone TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE teachers ADD COLUMN bi TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE notifications ADD COLUMN method TEXT DEFAULT 'system';"); } catch(e) {}

// Rename vacations to licenses if it exists
try {
  db.exec("ALTER TABLE vacations RENAME TO licenses;");
} catch(e) {}
try { db.exec("ALTER TABLE licenses ADD COLUMN requested_by_role TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE licenses ADD COLUMN approved_by INTEGER;"); } catch(e) {}
try { db.exec("ALTER TABLE invoices ADD COLUMN invoice_date DATE;"); } catch(e) {}
try { db.exec("ALTER TABLE invoices ADD COLUMN hash TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE invoices ADD COLUMN total_tax DECIMAL(10,2) DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE invoices ADD COLUMN net_total DECIMAL(10,2) DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN logo_url TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN address TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN phone TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN email TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN primary_color TEXT DEFAULT '#4f46e5';"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN bank_name TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN bank_iban TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN bank_account_number TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN license_type TEXT DEFAULT 'institution';"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN license_limit INTEGER DEFAULT 50;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN license_status TEXT DEFAULT 'active';"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN license_expiry DATE;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN classes_enabled INTEGER DEFAULT 1;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN grades_enabled INTEGER DEFAULT 1;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN teachers_enabled INTEGER DEFAULT 1;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN vacations_enabled INTEGER DEFAULT 1;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN certificates_enabled INTEGER DEFAULT 1;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN financial_enabled INTEGER DEFAULT 1;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN migration_enabled INTEGER DEFAULT 1;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN payments_enabled INTEGER DEFAULT 1;"); } catch(e) {}

try { db.exec("ALTER TABLE schedules ADD COLUMN teacher_id INTEGER;"); } catch(e) {}
try { db.exec("ALTER TABLE schedules ADD COLUMN subject_id INTEGER;"); } catch(e) {}

try { db.exec("ALTER TABLE students ADD COLUMN guardian_name TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE students ADD COLUMN guardian_phone TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE students ADD COLUMN guardian_email TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE grades ADD COLUMN score1 DECIMAL(4,2) DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE grades ADD COLUMN score2 DECIMAL(4,2) DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE grades ADD COLUMN score3 DECIMAL(4,2) DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE grades ADD COLUMN score DECIMAL(4,2) DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE grades ADD COLUMN is_finalized INTEGER DEFAULT 0;"); } catch(e) {}

try { db.exec("ALTER TABLE invoice_items ADD COLUMN school_id INTEGER;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN email_confirmed INTEGER DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN confirmation_token TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN mfa_secret TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN mfa_enabled INTEGER DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN lockout_until DATETIME;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN google_id TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN password_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN temp_password_expiry DATETIME;"); } catch(e) {}

// Migration for multiple roles
try {
  db.exec(`
    INSERT OR IGNORE INTO user_roles (user_id, role)
    SELECT id, role FROM users WHERE role IS NOT NULL;
  `);
} catch (e) {
  console.error("Migration to user_roles failed:", e);
}

// Seed initial data if empty
const schoolCount = db.prepare("SELECT count(*) as count FROM schools").get() as { count: number };
if (schoolCount.count === 0) {
  const insertSchool = db.prepare("INSERT INTO schools (name, subdomain, logo_url, address, phone, email, primary_color) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertSchool.run("Escola Primária Central", "central", "https://picsum.photos/seed/school1/200/200", "Rua Principal, Luanda", "+244 923 000 001", "contato@central.edu", "#4f46e5");
  insertSchool.run("Colégio Avançado", "avancado", "https://picsum.photos/seed/school2/200/200", "Av. Independência, Talatona", "+244 923 000 002", "info@avancado.edu", "#10b981");
  
  const hashedPass1 = bcrypt.hashSync("1234567890", 10);
  const hashedPass2 = bcrypt.hashSync("0987654321", 10);
  const defaultPassword = bcrypt.hashSync("password", 10);

  const insertUser = db.prepare("INSERT INTO users (school_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
  insertUser.run(null, "Benilson Salvador", "ownerb@kulonga.ao", hashedPass1, "superadmin");
  insertUser.run(null, "Fernando Madruga", "ownerf@kulonga.ao", hashedPass2, "superadmin");
  insertUser.run(1, "Admin Central", "admin@central.edu", defaultPassword, "admin");
  insertUser.run(2, "Diretor Avançado", "diretor@avancado.edu", defaultPassword, "admin");
  insertUser.run(1, "Professor João", "joao@central.edu", defaultPassword, "teacher");
  insertUser.run(1, "Secretária Maria", "secretaria@central.edu", defaultPassword, "secretary");
  insertUser.run(1, "RH Carlos", "rh@central.edu", defaultPassword, "hr");
  insertUser.run(1, "Pedagógico Ana", "pedagogico@central.edu", defaultPassword, "pedagogical");
  
  const insertStudentUser = db.prepare("INSERT INTO users (school_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
  insertStudentUser.run(1, "Aluno Exemplo", "aluno@central.edu", defaultPassword, "student");
  
  const studentId = db.prepare("SELECT id FROM users WHERE email = 'aluno@central.edu'").get() as any;
  const insertStudentRef = db.prepare("INSERT INTO students (user_id, school_id, registration_number, guardian_name, guardian_phone, guardian_email) VALUES (?, ?, ?, ?, ?, ?)");
  insertStudentRef.run(studentId.id, 1, "MAT-2024-001", "Pai do Aluno", "+244 900 000 000", "pai@email.com");

  // Seed Class Management
  const insertClass = db.prepare("INSERT INTO classes (school_id, name, grade_level) VALUES (?, ?, ?)");
  insertClass.run(1, "Turma A - 10º Ano", "10º");
  insertClass.run(1, "Turma B - 11º Ano", "11º");

  const insertClassroom = db.prepare("INSERT INTO classrooms (school_id, name, capacity) VALUES (?, ?, ?)");
  insertClassroom.run(1, "Sala 101", 30);
  insertClassroom.run(1, "Laboratório de Informática", 20);

  const insertSchedule = db.prepare("INSERT INTO schedules (school_id, class_id, classroom_id, subject, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertSchedule.run(1, 1, 1, "Matemática", "Segunda", "08:00", "09:30");
  insertSchedule.run(1, 1, 2, "Informática", "Terça", "10:00", "11:30");

  // Seed Grades
  const insertGrade = db.prepare("INSERT INTO grades (school_id, student_id, subject, score, term) VALUES (?, ?, ?, ?, ?)");
  insertGrade.run(1, 1, "Matemática", 16.5, "1º Trimestre");
  insertGrade.run(1, 1, "Física", 14.0, "1º Trimestre");
  insertGrade.run(1, 1, "Português", 15.5, "1º Trimestre");

  // Seed Financial
  const insertInvoice = db.prepare("INSERT INTO invoices (school_id, student_id, amount, due_date, status) VALUES (?, ?, ?, ?, ?)");
  insertInvoice.run(1, 1, 500.00, "2024-03-10", "pending");
  insertInvoice.run(1, 1, 500.00, "2024-02-10", "paid");

  // Seed Products
  const insertProduct = db.prepare("INSERT INTO products (school_id, name, description, unit_price, tax_rate) VALUES (?, ?, ?, ?, ?)");
  insertProduct.run(1, "Propina Mensal", "Mensalidade escolar", 500.00, 14.00);
  insertProduct.run(1, "Uniforme", "Uniforme escolar completo", 150.00, 14.00);
  insertProduct.run(1, "Livro de Matemática", "Livro didático", 80.00, 0.00); // Isento

  // Update existing invoices with SAF-T info
  db.prepare("UPDATE invoices SET invoice_no = 'FT 2024/1', invoice_date = '2024-02-10', net_total = 438.60, total_tax = 61.40 WHERE id = 2").run();
  db.prepare("INSERT INTO invoice_items (school_id, invoice_id, product_id, description, quantity, unit_price, tax_rate, total_amount) VALUES (1, 2, 1, 'Propina Mensal', 1, 438.60, 14.00, 500.00)").run();
}

export default db;
