import Database from "better-sqlite3";

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
    license_expiry DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('superadmin', 'admin', 'teacher', 'student', 'secretary', 'hr', 'pedagogical')) NOT NULL,
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
    FOREIGN KEY(school_id) REFERENCES schools(id)
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
    score DECIMAL(4,2) NOT NULL,
    term TEXT NOT NULL, -- e.g., '1º Trimestre'
    is_finalized INTEGER DEFAULT 0, -- 0 for draft, 1 for finalized
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
    name TEXT NOT NULL,
    code TEXT,
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    school_id INTEGER,
    specialization TEXT,
    hire_date DATE,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );

  CREATE TABLE IF NOT EXISTS vacations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    school_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type TEXT CHECK(type IN ('Férias', 'Licença Médica', 'Outro')) DEFAULT 'Férias',
    status TEXT CHECK(status IN ('Pendente', 'Aprovado', 'Rejeitado')) DEFAULT 'Pendente',
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(school_id) REFERENCES schools(id)
  );
`);

// Migrations for schools table
try { db.exec("ALTER TABLE schools ADD COLUMN logo_url TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN address TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN phone TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN email TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN primary_color TEXT DEFAULT '#4f46e5';"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN bank_name TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN bank_iban TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN bank_account_number TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN license_limit INTEGER DEFAULT 50;"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN license_status TEXT DEFAULT 'active';"); } catch(e) {}
try { db.exec("ALTER TABLE schools ADD COLUMN license_expiry DATE;"); } catch(e) {}

try { db.exec("ALTER TABLE schedules ADD COLUMN teacher_id INTEGER;"); } catch(e) {}
try { db.exec("ALTER TABLE schedules ADD COLUMN subject_id INTEGER;"); } catch(e) {}

try { db.exec("ALTER TABLE students ADD COLUMN guardian_name TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE students ADD COLUMN guardian_phone TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE students ADD COLUMN guardian_email TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE grades ADD COLUMN is_finalized INTEGER DEFAULT 0;"); } catch(e) {}

// Seed initial data if empty
const schoolCount = db.prepare("SELECT count(*) as count FROM schools").get() as { count: number };
if (schoolCount.count === 0) {
  const insertSchool = db.prepare("INSERT INTO schools (name, subdomain, logo_url, address, phone, email, primary_color) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertSchool.run("Escola Primária Central", "central", "https://picsum.photos/seed/school1/200/200", "Rua Principal, Luanda", "+244 923 000 001", "contato@central.edu", "#4f46e5");
  insertSchool.run("Colégio Avançado", "avancado", "https://picsum.photos/seed/school2/200/200", "Av. Independência, Talatona", "+244 923 000 002", "info@avancado.edu", "#10b981");
  
  const insertUser = db.prepare("INSERT INTO users (school_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
  insertUser.run(null, "Kulonga Owner", "owner@kulonga.com", "superpassword", "superadmin");
  insertUser.run(1, "Admin Central", "admin@central.edu", "password", "admin");
  insertUser.run(2, "Diretor Avançado", "diretor@avancado.edu", "password", "admin");
  insertUser.run(1, "Professor João", "joao@central.edu", "password", "teacher");
  insertUser.run(1, "Secretária Maria", "secretaria@central.edu", "password", "secretary");
  insertUser.run(1, "RH Carlos", "rh@central.edu", "password", "hr");
  insertUser.run(1, "Pedagógico Ana", "pedagogico@central.edu", "password", "pedagogical");
  
  const insertStudentUser = db.prepare("INSERT INTO users (school_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
  insertStudentUser.run(1, "Aluno Exemplo", "aluno@central.edu", "password", "student");
  
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
}

export default db;
