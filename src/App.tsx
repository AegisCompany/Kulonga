import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronRight,
  School as SchoolIcon,
  GraduationCap,
  Calendar,
  BarChart3,
  Sun,
  Plus,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface School {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
  primary_color?: string;
  address?: string;
  phone?: string;
  email?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_account_number?: string;
  license_limit?: number;
  license_status?: string;
  license_expiry?: string;
}

interface Student {
  name: string;
  email: string;
  registration_number: string;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export default function App() {
  const [userRole, setUserRole] = useState<'superadmin' | 'admin' | 'teacher' | 'secretary' | 'student' | 'hr' | 'pedagogical'>('admin');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', subdomain: 'central' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, averageGrade: 0 });
  const [financialSummary, setFinancialSummary] = useState({ paid: 0, pending: 0 });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [vacations, setVacations] = useState<any[]>([]);
  const [licenseInfo, setLicenseInfo] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<number | null>(null);
  const [newSchool, setNewSchool] = useState({
    name: '',
    subdomain: '',
    logo_url: '',
    address: '',
    phone: '',
    email: '',
    primary_color: '#4f46e5',
    bank_name: '',
    bank_iban: '',
    bank_account_number: '',
    license_limit: 50,
    license_status: 'active',
    license_expiry: ''
  });
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', registration_number: '', guardian_name: '', guardian_phone: '', guardian_email: '' });
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', specialization: '', hire_date: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [newSchedule, setNewSchedule] = useState({ class_id: '', classroom_id: '', subject_id: '', teacher_id: '', day_of_week: 'Segunda', start_time: '', end_time: '' });
  const [newVacation, setNewVacation] = useState({ user_id: '', start_date: '', end_date: '', type: 'Férias' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (userRole === 'superadmin') {
      fetchSuperAdminData();
    }
  }, [userRole]);

  const fetchSuperAdminData = async () => {
    try {
      const [sysRes, usersRes] = await Promise.all([
        fetch('/api/superadmin/system-stats'),
        fetch('/api/superadmin/users')
      ]);
      setSystemStats(await sysRes.json());
      setAllUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt("Digite a nova senha:");
    if (!newPassword) return;
    
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) alert("Senha resetada com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeUserRole = async (userId: number) => {
    const newRole = prompt("Digite o novo papel (superadmin, admin, teacher, student, secretary):");
    if (!newRole) return;
    
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        alert("Papel alterado com sucesso!");
        fetchSuperAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStudent = async () => {
    if (licenseInfo?.is_limit_reached) {
      alert("Limite de alunos atingido! Expanda sua licença.");
      return;
    }
    
    try {
      const res = await fetch('/api/academic/students', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        alert("Aluno cadastrado com sucesso!");
        setShowStudentModal(false);
        setNewStudent({ name: '', email: '', registration_number: '' });
        if (currentSchool) selectSchool(currentSchool);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao cadastrar aluno");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTeacher = async () => {
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify(newTeacher)
      });
      if (res.ok) {
        alert("Professor cadastrado com sucesso!");
        setShowTeacherModal(false);
        setNewTeacher({ name: '', email: '', specialization: '', hire_date: '' });
        if (currentSchool) selectSchool(currentSchool);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubject = async () => {
    try {
      const res = await fetch('/api/academic/subjects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify(newSubject)
      });
      if (res.ok) {
        alert("Disciplina adicionada com sucesso!");
        setShowSubjectModal(false);
        setNewSubject({ name: '', code: '' });
        if (currentSchool) selectSchool(currentSchool);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSchedule = async () => {
    try {
      const res = await fetch('/api/academic/schedules', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify(newSchedule)
      });
      if (res.ok) {
        alert("Horário adicionado com sucesso!");
        setShowScheduleModal(false);
        setNewSchedule({ class_id: '', classroom_id: '', subject_id: '', teacher_id: '', day_of_week: 'Segunda', start_time: '', end_time: '' });
        if (currentSchool) selectSchool(currentSchool);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVacation = async () => {
    try {
      const res = await fetch('/api/teachers/vacations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify(newVacation)
      });
      if (res.ok) {
        alert("Pedido de férias enviado!");
        setShowVacationModal(false);
        setNewVacation({ user_id: '', start_date: '', end_date: '', type: 'Férias' });
        if (currentSchool) selectSchool(currentSchool);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.subdomain) {
      alert("Nome e subdomínio são obrigatórios");
      return;
    }

    try {
      const url = editingSchoolId 
        ? `/api/superadmin/schools/${editingSchoolId}` 
        : '/api/superadmin/schools';
      const method = editingSchoolId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchool)
      });
      if (res.ok) {
        alert(editingSchoolId ? "Escola atualizada!" : "Escola adicionada!");
        setShowSchoolModal(false);
        setEditingSchoolId(null);
        setNewSchool({
          name: '',
          subdomain: '',
          logo_url: '',
          address: '',
          phone: '',
          email: '',
          primary_color: '#4f46e5',
          bank_name: '',
          bank_iban: '',
          bank_account_number: '',
          license_limit: 50,
          license_status: 'active',
          license_expiry: ''
        });
        fetchSchools();
        fetchSuperAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/schools');
      const data = await res.json();
      setSchools(data);
      if (data.length > 0) {
        selectSchool(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectSchool = async (school: School) => {
    setCurrentSchool(school);
    try {
      const headers = { 'x-school-subdomain': school.subdomain };
      const [studentsRes, statsRes, financialRes, invoicesRes, notificationsRes, classesRes, classroomsRes, schedulesRes, gradesRes, paymentsRes, licenseRes, teachersRes, subjectsRes, vacationsRes] = await Promise.all([
        fetch('/api/academic/students', { headers }),
        fetch('/api/stats', { headers }),
        fetch('/api/financial/summary', { headers }),
        fetch('/api/financial/invoices', { headers }),
        fetch('/api/notifications/history', { headers }),
        fetch('/api/academic/classes', { headers }),
        fetch('/api/academic/classrooms', { headers }),
        fetch('/api/academic/schedules', { headers }),
        fetch('/api/academic/grades', { headers }),
        fetch('/api/payments', { headers }),
        fetch('/api/license/status', { headers }),
        fetch('/api/teachers', { headers }),
        fetch('/api/academic/subjects', { headers }),
        fetch('/api/teachers/vacations', { headers })
      ]);
      
      const studentsData = await studentsRes.json();
      const statsData = await statsRes.json();
      const financialData = await financialRes.json();
      const invoicesData = await invoicesRes.json();
      const notificationsData = await notificationsRes.json();
      const classesData = await classesRes.json();
      const classroomsData = await classroomsRes.json();
      const schedulesData = await schedulesRes.json();
      const gradesData = await gradesRes.json();
      const paymentsData = await paymentsRes.json();
      const licenseData = await licenseRes.json();
      const teachersData = await teachersRes.json();
      const subjectsData = await subjectsRes.json();
      const vacationsData = await vacationsRes.json();
      
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setStats(statsData);
      setFinancialSummary(financialData);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      setGrades(Array.isArray(gradesData) ? gradesData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setLicenseInfo(licenseData);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setVacations(Array.isArray(vacationsData) ? vacationsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e?: React.FormEvent, devUser?: any) => {
    if (e) e.preventDefault();
    const credentials = devUser || loginForm;
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        setIsLoggedIn(true);
        if (data.schoolId) {
          const school = schools.find(s => s.id === data.schoolId);
          if (school) selectSchool(school);
        }
      } else {
        alert("Credenciais inválidas");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    const devUsers = [
      { role: 'superadmin', email: 'owner@kulonga.com', password: 'superpassword', subdomain: 'admin' },
      { role: 'admin', email: 'admin@central.edu', password: 'password', subdomain: 'central' },
      { role: 'teacher', email: 'joao@central.edu', password: 'password', subdomain: 'central' },
      { role: 'secretary', email: 'secretaria@central.edu', password: 'password', subdomain: 'central' },
      { role: 'hr', email: 'rh@central.edu', password: 'password', subdomain: 'central' },
      { role: 'pedagogical', email: 'pedagogico@central.edu', password: 'password', subdomain: 'central' },
      { role: 'student', email: 'aluno@central.edu', password: 'password', subdomain: 'central' },
    ];

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">kulonga</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Subdomínio da Escola</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={loginForm.subdomain}
                onChange={e => setLoginForm({...loginForm, subdomain: e.target.value})}
                placeholder="Ex: central (ou 'admin' para superadmin)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
              <input 
                type="password" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Modo de Desenvolvimento</p>
            <div className="grid grid-cols-2 gap-2">
              {devUsers.map(u => (
                <button 
                  key={u.role}
                  onClick={() => handleLogin(undefined, u)}
                  className="text-[10px] font-bold py-2 px-3 bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
                >
                  {u.role.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">kulonga</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          
          {userRole === 'superadmin' && (
            <SidebarItem 
              icon={Settings} 
              label="Painel Central" 
              active={activeTab === 'superadmin'} 
              onClick={() => setActiveTab('superadmin')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'secretary') && (
            <SidebarItem 
              icon={Users} 
              label="Alunos" 
              active={activeTab === 'students'} 
              onClick={() => setActiveTab('students')} 
            />
          )}

          {(userRole !== 'parent') && (
            <SidebarItem 
              icon={BookOpen} 
              label="Acadêmico" 
              active={activeTab === 'academic'} 
              onClick={() => setActiveTab('academic')} 
            />
          )}

          <SidebarItem 
            icon={GraduationCap} 
            label="Notas" 
            active={activeTab === 'grades'} 
            onClick={() => setActiveTab('grades')} 
          />

          {(userRole === 'admin' || userRole === 'teacher') && (
            <SidebarItem 
              icon={SchoolIcon} 
              label="Gestão de Turmas" 
              active={activeTab === 'classes'} 
              onClick={() => setActiveTab('classes')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'secretary' || userRole === 'parent' || userRole === 'student') && (
            <SidebarItem 
              icon={BarChart3} 
              label="Financeiro" 
              active={activeTab === 'financial'} 
              onClick={() => setActiveTab('financial')} 
            />
          )}

          {userRole === 'admin' && (
            <SidebarItem 
              icon={Settings} 
              label="Configurações da Escola" 
              active={activeTab === 'school_settings'} 
              onClick={() => setActiveTab('school_settings')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'secretary' || userRole === 'hr' || userRole === 'pedagogical') && (
            <>
              {(userRole === 'admin' || userRole === 'hr') && (
                <SidebarItem 
                  icon={Users} 
                  label="Professores" 
                  active={activeTab === 'teachers'} 
                  onClick={() => setActiveTab('teachers')} 
                />
              )}
              {(userRole === 'admin' || userRole === 'pedagogical') && (
                <SidebarItem 
                  icon={BookOpen} 
                  label="Disciplinas" 
                  active={activeTab === 'subjects'} 
                  onClick={() => setActiveTab('subjects')} 
                />
              )}
              <SidebarItem 
                icon={Calendar} 
                label="Horários" 
                active={activeTab === 'schedules'} 
                onClick={() => setActiveTab('schedules')} 
              />
              {(userRole === 'admin' || userRole === 'hr') && (
                <SidebarItem 
                  icon={Sun} 
                  label="Férias" 
                  active={activeTab === 'vacations'} 
                  onClick={() => setActiveTab('vacations')} 
                />
              )}
            </>
          )}

          {(userRole === 'admin' || userRole === 'secretary' || userRole === 'pedagogical') && (
            <SidebarItem 
              icon={BarChart3} 
              label="Resumo Académico" 
              active={activeTab === 'academic_summary'} 
              onClick={() => setActiveTab('academic_summary')} 
            />
          )}

          {(userRole === 'parent' || userRole === 'student') && (
            <SidebarItem 
              icon={Calendar} 
              label="Pagamentos" 
              active={activeTab === 'payments'} 
              onClick={() => setActiveTab('payments')} 
            />
          )}

          <SidebarItem 
            icon={Bell} 
            label="Notificações" 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="mb-4 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Trocar Escola</p>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={currentSchool?.id || ''}
              onChange={(e) => {
                const school = schools.find(s => s.id === parseInt(e.target.value));
                if (school) selectSchool(school);
              }}
            >
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <SidebarItem icon={Settings} label="Configurações" onClick={() => {}} />
          <SidebarItem icon={LogOut} label="Sair" onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-bottom border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              {currentSchool?.logo_url ? (
                <img src={currentSchool.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <SchoolIcon size={20} />
                </div>
              )}
              <div>
                <h2 className="text-sm font-medium text-slate-500">Bem-vindo ao</h2>
                <p className="text-lg font-bold">{currentSchool?.name || 'Selecione uma escola'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold">
                  {userRole === 'admin' ? 'Ana Silva' : 
                   userRole === 'teacher' ? 'Prof. João' : 
                   userRole === 'secretary' ? 'Carla Santos' :
                   userRole === 'student' ? 'Ricardo M.' : 'Sr. Manuel'}
                </p>
                <select 
                  className="text-[10px] text-slate-500 bg-transparent border-none p-0 outline-none cursor-pointer hover:text-indigo-600"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                >
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Diretor(a)</option>
                  <option value="teacher">Professor(a)</option>
                  <option value="secretary">Secretaria</option>
                  <option value="student">Aluno</option>
                  <option value="parent">Encarregado</option>
                </select>
              </div>
              <img 
                src={`https://picsum.photos/seed/${userRole}/40/40`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'academic_summary' && (
              <motion.div
                key="academic_summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm font-bold mb-2">Total de Alunos</p>
                    <h4 className="text-3xl font-black">{students.length}</h4>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm font-bold mb-2">Turmas Ativas</p>
                    <h4 className="text-3xl font-black">{classes.length}</h4>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm font-bold mb-2">Disciplinas</p>
                    <h4 className="text-3xl font-black">{subjects.length}</h4>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm font-bold mb-2">Média Geral</p>
                    <h4 className="text-3xl font-black">
                      {grades.length > 0 
                        ? (grades.reduce((acc, g) => acc + g.score, 0) / grades.length).toFixed(1) 
                        : '0.0'}
                    </h4>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <h3 className="text-xl font-bold mb-6">Distribuição de Notas por Disciplina</h3>
                  <div className="h-64 flex items-end gap-4">
                    {subjects.map((s, i) => {
                      const subjectGrades = grades.filter(g => g.subject === s.name);
                      const avg = subjectGrades.length > 0 
                        ? subjectGrades.reduce((acc, g) => acc + g.score, 0) / subjectGrades.length 
                        : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-indigo-500 rounded-t-xl transition-all duration-500" 
                            style={{ height: `${(avg / 20) * 100}%` }}
                          ></div>
                          <span className="text-[10px] font-bold text-slate-500 rotate-45 mt-4 whitespace-nowrap">{s.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Role-Based Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {userRole === 'superadmin' && systemStats && (
                    <>
                      <StatCard label="Total Escolas" value={systemStats.totalSchools.toString()} icon={SchoolIcon} color="bg-indigo-500" />
                      <StatCard label="Total Usuários" value={systemStats.totalUsers.toString()} icon={Users} color="bg-blue-500" />
                      <StatCard label="Total Alunos" value={systemStats.totalStudents.toString()} icon={GraduationCap} color="bg-emerald-500" />
                      <StatCard label="Uptime Sistema" value={systemStats.uptime} icon={Settings} color="bg-amber-500" />
                    </>
                  )}
                  {userRole === 'admin' && (
                    <>
                      <StatCard label="Total de Alunos" value={stats.students.toString()} icon={Users} color="bg-blue-500" />
                      <StatCard label="Professores" value={stats.teachers.toString()} icon={GraduationCap} color="bg-indigo-500" />
                      <StatCard label="Receita Mensal" value={financialSummary.paid.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} icon={BarChart3} color="bg-emerald-500" />
                      <StatCard label="Inadimplência" value={financialSummary.pending.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} icon={Calendar} color="bg-red-500" />
                    </>
                  )}
                  {userRole === 'teacher' && (
                    <>
                      <StatCard label="Minhas Turmas" value="4" icon={SchoolIcon} color="bg-blue-500" />
                      <StatCard label="Meus Alunos" value="124" icon={Users} color="bg-indigo-500" />
                      <StatCard label="Aulas Hoje" value="3" icon={Calendar} color="bg-amber-500" />
                      <StatCard label="Média das Turmas" value="14.2" icon={GraduationCap} color="bg-emerald-500" />
                    </>
                  )}
                  {userRole === 'secretary' && (
                    <>
                      <StatCard label="Novas Matrículas" value="12" icon={Users} color="bg-blue-500" />
                      <StatCard label="Faturas Pendentes" value="45" icon={BarChart3} color="bg-red-500" />
                      <StatCard label="Docs Pendentes" value="8" icon={BookOpen} color="bg-amber-500" />
                      <StatCard label="Notificações" value="15" icon={Bell} color="bg-indigo-500" />
                    </>
                  )}
                  {userRole === 'student' && (
                    <>
                      <StatCard label="Minha Média" value="15.8" icon={GraduationCap} color="bg-emerald-500" />
                      <StatCard label="Frequência" value="94%" icon={Calendar} color="bg-blue-500" />
                      <StatCard label="Tarefas" value="3" icon={BookOpen} color="bg-amber-500" />
                      <StatCard label="Próxima Prova" value="2 dias" icon={Bell} color="bg-red-500" />
                    </>
                  )}
                  {userRole === 'parent' && (
                    <>
                      <StatCard label="Média do Educando" value="15.8" icon={GraduationCap} color="bg-emerald-500" />
                      <StatCard label="Frequência" value="94%" icon={Calendar} color="bg-blue-500" />
                      <StatCard label="Propina de Março" value="Pendente" icon={BarChart3} color="bg-red-500" />
                      <StatCard label="Mensagens" value="2" icon={Bell} color="bg-indigo-500" />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">
                        {userRole === 'superadmin' ? 'Crescimento da Rede (Escolas)' :
                         userRole === 'teacher' ? 'Frequência das Minhas Turmas' : 
                         userRole === 'student' ? 'Minha Frequência Mensal' :
                         userRole === 'parent' ? 'Desempenho do Educando' : 'Frequência Geral'}
                      </h3>
                      <select className="text-sm border-none bg-slate-50 rounded-lg px-2 py-1 outline-none">
                        <option>Últimos 7 dias</option>
                        <option>Últimos 30 dias</option>
                      </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                      {[65, 85, 75, 90, 80, 95, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="w-full bg-indigo-100 rounded-t-lg relative group"
                          >
                            <div className="absolute inset-0 bg-indigo-600 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                          <span className="text-xs text-slate-400 font-medium">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">
                      {userRole === 'superadmin' ? 'Escolas Recentes' :
                       userRole === 'teacher' || userRole === 'student' ? 'Horário de Hoje' : 'Avisos e Eventos'}
                    </h3>
                    <div className="space-y-4">
                      {userRole === 'superadmin' ? (
                        schools.slice(0, 3).map((school, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <SchoolIcon size={20} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{school.name}</h4>
                              <p className="text-xs text-slate-500">{school.subdomain}.kulonga.com</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300" />
                          </div>
                        ))
                      ) : userRole === 'teacher' || userRole === 'student' ? (
                        [
                          { title: userRole === 'student' ? 'Matemática' : 'Matemática - 10º A', time: '08:00', date: 'Sala 101', color: 'bg-blue-500' },
                          { title: userRole === 'student' ? 'Física' : 'Física - 11º B', time: '10:30', date: 'Lab 1', color: 'bg-indigo-500' },
                          { title: userRole === 'student' ? 'Química' : 'Matemática - 12º C', time: '14:00', date: 'Sala 202', color: 'bg-emerald-500' },
                        ].map((event, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className={`w-2 h-10 rounded-full ${event.color}`}></div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                              <p className="text-xs text-slate-500">{event.time} • {event.date}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300" />
                          </div>
                        ))
                      ) : (
                        [
                          { title: 'Reunião de Pais', time: '09:00', date: 'Amanhã', color: 'bg-blue-500' },
                          { title: 'Prova de Matemática', time: '14:30', date: '28 Fev', color: 'bg-red-500' },
                          { title: 'Feira de Ciências', time: '08:00', date: '05 Mar', color: 'bg-emerald-500' },
                        ].map((event, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className={`w-2 h-10 rounded-full ${event.color}`}></div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                              <p className="text-xs text-slate-500">{event.time} • {event.date}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300" />
                          </div>
                        ))
                      )}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                      {userRole === 'superadmin' ? 'Gerenciar Todas as Escolas' :
                       userRole === 'teacher' || userRole === 'student' ? 'Ver Horário Completo' : 'Ver Calendário Completo'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'financial' && (
              <motion.div
                key="financial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Total Recebido</h3>
                    <p className="text-2xl font-bold text-emerald-600">{financialSummary.paid.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Pendente</h3>
                    <p className="text-2xl font-bold text-red-600">{financialSummary.pending.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg">Faturas Recentes</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Aluno</th>
                          <th className="px-6 py-4">Valor</th>
                          <th className="px-6 py-4">Vencimento</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoices.length > 0 ? invoices.map((invoice, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{invoice.student_name}</td>
                            <td className="px-6 py-4 text-sm">{invoice.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{invoice.due_date}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                              Nenhuma fatura encontrada.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payments History for Admin/Secretary */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg">Pagamentos Recebidos (Transações)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Método</th>
                          <th className="px-6 py-4">Valor</th>
                          <th className="px-6 py-4">Data</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.length > 0 ? payments.map((pay, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{pay.method}</td>
                            <td className="px-6 py-4 text-sm">{pay.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{new Date(pay.created_at).toLocaleString('pt-AO')}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                pay.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {pay.status === 'completed' ? 'Confirmado' : 'Pendente'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                              Nenhum pagamento registado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Histórico de Notificações</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                    Nova Notificação
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Destinatário</th>
                        <th className="px-6 py-4">Mensagem</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notifications.length > 0 ? notifications.map((notif, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{notif.user_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{notif.message}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">{notif.type}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(notif.sent_at).toLocaleDateString('pt-AO')}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center">
                            <Bell className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-500">Nenhuma notificação enviada recentemente.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'classes' && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Classes List */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg">Turmas</h3>
                      <button className="text-indigo-600 text-sm font-bold hover:underline">Ver Todas</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {classes.map((cls, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="font-bold">{cls.name}</p>
                            <p className="text-xs text-slate-500">Nível: {cls.grade_level}</p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Classrooms List */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg">Salas de Aula</h3>
                      <button className="text-indigo-600 text-sm font-bold hover:underline">Ver Todas</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {classrooms.map((room, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="font-bold">{room.name}</p>
                            <p className="text-xs text-slate-500">Capacidade: {room.capacity} alunos</p>
                          </div>
                          <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Livre</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Schedules List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg">Horários das Aulas</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Dia</th>
                          <th className="px-6 py-4">Horário</th>
                          <th className="px-6 py-4">Disciplina</th>
                          <th className="px-6 py-4">Turma</th>
                          <th className="px-6 py-4">Sala</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {schedules.map((sch, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{sch.day_of_week}</td>
                            <td className="px-6 py-4 text-sm">{sch.start_time} - {sch.end_time}</td>
                            <td className="px-6 py-4 font-bold text-indigo-600">{sch.subject}</td>
                            <td className="px-6 py-4 text-sm">{sch.class_name}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{sch.classroom_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'grades' && (
              <motion.div
                key="grades"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="font-bold text-lg">Gestão de Notas</h3>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Filtrar por aluno ou disciplina..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {(userRole === 'admin' || userRole === 'teacher' || userRole === 'pedagogical') && (
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap">
                        Lançar Notas
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Aluno</th>
                        <th className="px-6 py-4">Disciplina</th>
                        <th className="px-6 py-4">Trimestre</th>
                        <th className="px-6 py-4">Nota</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {grades.filter(g => 
                        g.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        g.subject.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((grade, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{grade.student_name}</td>
                          <td className="px-6 py-4 text-sm">{grade.subject}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{grade.term}</td>
                          <td className="px-6 py-4 font-bold">{grade.score.toFixed(1)}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                                grade.score >= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {grade.score >= 10 ? 'Aprovado' : 'Reprovado'}
                              </span>
                              {grade.is_finalized ? (
                                <span className="text-[9px] text-indigo-600 font-bold flex items-center gap-1">
                                  <Check size={10} /> Finalizada
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 font-bold italic">Rascunho</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {(!grade.is_finalized || userRole === 'admin' || userRole === 'pedagogical') && (
                                <button className="text-indigo-600 hover:underline text-xs font-bold">Editar</button>
                              )}
                              {(userRole === 'admin' || userRole === 'pedagogical') && !grade.is_finalized && (
                                <button 
                                  onClick={async () => {
                                    if (confirm("Deseja finalizar esta nota? Após finalizar, professores e secretários não poderão alterá-la.")) {
                                      await fetch(`/api/academic/grades/${grade.id}/finalize`, { 
                                        method: 'PATCH',
                                        headers: { 'x-school-subdomain': currentSchool?.subdomain || '' }
                                      });
                                      selectSchool(currentSchool!);
                                    }
                                  }}
                                  className="text-emerald-600 hover:underline text-xs font-bold"
                                >
                                  Finalizar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'superadmin' && (
              <motion.div
                key="superadmin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-2xl">Painel de Controle Central</h3>
                  <button 
                    onClick={() => setShowSchoolModal(true)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    + Nova Escola
                  </button>
                </div>

                {showSchoolModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                      <h3 className="text-2xl font-bold mb-6">{editingSchoolId ? 'Editar Escola' : 'Cadastrar Nova Escola'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Nome da Escola</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.name}
                            onChange={e => setNewSchool({...newSchool, name: e.target.value})}
                            placeholder="Ex: Escola Internacional"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Subdomínio</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.subdomain}
                            onChange={e => setNewSchool({...newSchool, subdomain: e.target.value})}
                            placeholder="Ex: escola-inter"
                            disabled={!!editingSchoolId}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">URL do Logotipo</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.logo_url}
                            onChange={e => setNewSchool({...newSchool, logo_url: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Cor Principal</label>
                          <input 
                            type="color" 
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.primary_color}
                            onChange={e => setNewSchool({...newSchool, primary_color: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Endereço</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.address}
                            onChange={e => setNewSchool({...newSchool, address: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Telefone</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.phone}
                            onChange={e => setNewSchool({...newSchool, phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-slate-700">Email de Contato</label>
                          <input 
                            type="email" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.email}
                            onChange={e => setNewSchool({...newSchool, email: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                          <h4 className="font-bold text-slate-900 mb-4">Dados Bancários</h4>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Nome do Banco</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.bank_name}
                            onChange={e => setNewSchool({...newSchool, bank_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Nº da Conta</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.bank_account_number}
                            onChange={e => setNewSchool({...newSchool, bank_account_number: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-slate-700">IBAN</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.bank_iban}
                            onChange={e => setNewSchool({...newSchool, bank_iban: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                          <h4 className="font-bold text-slate-900 mb-4">Gestão de Licença</h4>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Limite de Alunos</label>
                          <input 
                            type="number" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.license_limit}
                            onChange={e => setNewSchool({...newSchool, license_limit: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Estado da Licença</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.license_status}
                            onChange={e => setNewSchool({...newSchool, license_status: e.target.value})}
                          >
                            <option value="active">Ativa</option>
                            <option value="expired">Expirada</option>
                            <option value="suspended">Suspensa</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-slate-700">Data de Expiração</label>
                          <input 
                            type="date" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.license_expiry}
                            onChange={e => setNewSchool({...newSchool, license_expiry: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button 
                          onClick={() => {
                            setShowSchoolModal(false);
                            setEditingSchoolId(null);
                          }}
                          className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleAddSchool}
                          className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                        >
                          {editingSchoolId ? 'Salvar Alterações' : 'Salvar Escola'}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Escolas Registadas</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Escola</th>
                          <th className="px-6 py-4">Subdomínio</th>
                          <th className="px-6 py-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {schools.map((school, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={school.logo_url || 'https://picsum.photos/50'} className="w-8 h-8 rounded-lg object-cover" />
                                <span className="font-medium">{school.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">{school.subdomain}</td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => {
                                  setEditingSchoolId(school.id);
                                  setNewSchool({
                                    name: school.name,
                                    subdomain: school.subdomain,
                                    logo_url: school.logo_url || '',
                                    address: school.address || '',
                                    phone: school.phone || '',
                                    email: school.email || '',
                                    primary_color: school.primary_color || '#4f46e5',
                                    bank_name: school.bank_name || '',
                                    bank_iban: school.bank_iban || '',
                                    bank_account_number: school.bank_account_number || '',
                                    license_limit: school.license_limit || 50,
                                    license_status: school.license_status || 'active',
                                    license_expiry: school.license_expiry || ''
                                  });
                                  setShowSchoolModal(true);
                                }}
                                className="text-indigo-600 hover:underline text-sm font-bold"
                              >
                                Editar / Suporte
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg">Gestão Global de Usuários</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Nome</th>
                          <th className="px-6 py-4">Escola</th>
                          <th className="px-6 py-4">Papel</th>
                          <th className="px-6 py-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allUsers.map((user, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </td>
                            <td className="px-6 py-4 text-sm">{user.school_name || 'Sistema Central'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 space-x-3">
                              <button 
                                onClick={() => handleChangeUserRole(user.id)}
                                className="text-indigo-600 hover:underline text-sm font-bold"
                              >
                                Mudar Role
                              </button>
                              <button 
                                onClick={() => handleResetPassword(user.id)}
                                className="text-red-600 hover:underline text-sm font-bold"
                              >
                                Reset Senha
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-2xl">Pagamentos e Propinas</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pending Invoices */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="font-bold text-lg">Faturas Pendentes</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {invoices.filter(inv => inv.status === 'pending').map((inv, i) => (
                        <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-bold text-slate-900">Mensalidade - Março</p>
                              <p className="text-xs text-slate-500">Vence em: {new Date(inv.due_date).toLocaleDateString('pt-AO')}</p>
                            </div>
                            <p className="font-bold text-indigo-600">{inv.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={async () => {
                                const res = await fetch('/api/payments/request', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'x-school-subdomain': currentSchool?.subdomain || '' },
                                  body: JSON.stringify({ invoiceId: inv.id, method: 'REFERENCE', amount: inv.amount })
                                });
                                if (!res.ok) {
                                  const err = await res.json();
                                  alert(err.error);
                                  return;
                                }
                                const data = await res.json();
                                alert(`Referência Única Gerada: ${data.referenceCode}\nUse este código no Multicaixa para pagamento.`);
                                selectSchool(currentSchool!);
                              }}
                              className="py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              Referência
                            </button>
                            <button 
                              onClick={async () => {
                                const res = await fetch('/api/payments/request', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'x-school-subdomain': currentSchool?.subdomain || '' },
                                  body: JSON.stringify({ invoiceId: inv.id, method: 'EXPRESS', amount: inv.amount })
                                });
                                const data = await res.json();
                                alert(`Solicitação Express enviada!\nConfirme no seu aplicativo Multicaixa Express.`);
                                selectSchool(currentSchool!);
                              }}
                              className="py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              MCX Express
                            </button>
                            <button 
                              onClick={async () => {
                                const res = await fetch('/api/payments/request', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'x-school-subdomain': currentSchool?.subdomain || '' },
                                  body: JSON.stringify({ invoiceId: inv.id, method: 'KWIK', amount: inv.amount })
                                });
                                const data = await res.json();
                                alert(`Chave KWIK: ${data.referenceCode}\nEfectue a transferência via KWIK.`);
                                selectSchool(currentSchool!);
                              }}
                              className="py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              KWIK
                            </button>
                            <button 
                              onClick={async () => {
                                const res = await fetch('/api/payments/request', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'x-school-subdomain': currentSchool?.subdomain || '' },
                                  body: JSON.stringify({ invoiceId: inv.id, method: 'IBAN', amount: inv.amount })
                                });
                                const data = await res.json();
                                alert(`IBAN para Depósito: ${data.referenceCode}\nEnvie o comprovativo para a secretaria.`);
                                selectSchool(currentSchool!);
                              }}
                              className="py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              IBAN / Depósito
                            </button>
                          </div>
                        </div>
                      ))}
                      {invoices.filter(inv => inv.status === 'pending').length === 0 && (
                        <p className="text-center text-slate-500 py-8">Não há faturas pendentes.</p>
                      )}
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="font-bold text-lg">Histórico de Transações</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {payments.map((pay, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${pay.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                              <BarChart3 size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{pay.method}</p>
                              <p className="text-[10px] text-slate-500">{new Date(pay.created_at).toLocaleString('pt-AO')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{pay.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                            <span className={`text-[10px] font-bold uppercase ${
                              pay.status === 'completed' ? 'text-emerald-600' : 
                              pay.status === 'failed' ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {pay.status === 'completed' ? 'Confirmado' : 
                               pay.status === 'failed' ? 'Rejeitado' : 'Pendente'}
                            </span>
                            {pay.status === 'pending' && (userRole === 'admin' || userRole === 'secretary') && (
                              <div className="flex gap-2 mt-2 justify-end">
                                <button 
                                  onClick={async () => {
                                    await fetch(`/api/payments/approve/${pay.id}`, { 
                                      method: 'POST',
                                      headers: { 'x-school-subdomain': currentSchool?.subdomain || '' }
                                    });
                                    selectSchool(currentSchool!);
                                  }}
                                  className="text-[10px] bg-emerald-500 text-white px-2 py-1 rounded font-bold hover:bg-emerald-600"
                                >
                                  Aprovar
                                </button>
                                <button 
                                  onClick={async () => {
                                    await fetch(`/api/payments/reject/${pay.id}`, { 
                                      method: 'POST',
                                      headers: { 'x-school-subdomain': currentSchool?.subdomain || '' }
                                    });
                                    selectSchool(currentSchool!);
                                  }}
                                  className="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-bold hover:bg-red-600"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {payments.length === 0 && (
                        <p className="text-center text-slate-500 py-8">Nenhum pagamento registado.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'school_settings' && userRole === 'admin' && (
              <motion.div
                key="school_settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
              >
                <h3 className="text-2xl font-bold mb-8">Configurações Bancárias da Instituição</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nome do Banco</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={currentSchool?.bank_name || ''}
                      onChange={e => setCurrentSchool(prev => prev ? {...prev, bank_name: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Número da Conta</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={currentSchool?.bank_account_number || ''}
                      onChange={e => setCurrentSchool(prev => prev ? {...prev, bank_account_number: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">IBAN</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={currentSchool?.bank_iban || ''}
                      onChange={e => setCurrentSchool(prev => prev ? {...prev, bank_iban: e.target.value} : null)}
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/school/banking', {
                          method: 'PATCH',
                          headers: { 
                            'Content-Type': 'application/json',
                            'x-school-subdomain': currentSchool?.subdomain || ''
                          },
                          body: JSON.stringify({
                            bank_name: currentSchool?.bank_name,
                            bank_iban: currentSchool?.bank_iban,
                            bank_account_number: currentSchool?.bank_account_number
                          })
                        });
                        if (res.ok) alert("Dados bancários atualizados com sucesso!");
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'teachers' && (userRole === 'admin' || userRole === 'secretary') && (
              <motion.div
                key="teachers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Gestão de Professores</h3>
                  <button 
                    onClick={() => setShowTeacherModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Novo Professor
                  </button>
                </div>

                {showTeacherModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                      <h3 className="text-2xl font-bold mb-6">Cadastrar Professor</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newTeacher.name}
                            onChange={e => setNewTeacher({...newTeacher, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Email</label>
                          <input 
                            type="email" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newTeacher.email}
                            onChange={e => setNewTeacher({...newTeacher, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Especialização</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newTeacher.specialization}
                            onChange={e => setNewTeacher({...newTeacher, specialization: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Data de Contratação</label>
                          <input 
                            type="date" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newTeacher.hire_date}
                            onChange={e => setNewTeacher({...newTeacher, hire_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button onClick={() => setShowTeacherModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button onClick={handleAddTeacher} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700">Salvar</button>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">Especialização</th>
                        <th className="px-6 py-4">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers.map((t, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{t.name}</td>
                          <td className="px-6 py-4 text-sm">{t.specialization}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{t.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'subjects' && (userRole === 'admin' || userRole === 'secretary') && (
              <motion.div
                key="subjects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Disciplinas</h3>
                  <button 
                    onClick={() => setShowSubjectModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Nova Disciplina
                  </button>
                </div>

                {showSubjectModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                      <h3 className="text-2xl font-bold mb-6">Adicionar Disciplina</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Nome da Disciplina</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSubject.name}
                            onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Código</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSubject.code}
                            onChange={e => setNewSubject({...newSubject, code: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button onClick={() => setShowSubjectModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button onClick={handleAddSubject} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700">Salvar</button>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subjects.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <BookOpen size={20} />
                      </div>
                      <h4 className="font-bold text-lg">{s.name}</h4>
                      <p className="text-sm text-slate-500">Código: {s.code}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'schedules' && (userRole === 'admin' || userRole === 'secretary') && (
              <motion.div
                key="schedules"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Horários Escolares</h3>
                  <button 
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Novo Horário
                  </button>
                </div>

                {showScheduleModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                      <h3 className="text-2xl font-bold mb-6">Configurar Horário</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Turma</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchedule.class_id}
                            onChange={e => setNewSchedule({...newSchedule, class_id: e.target.value})}
                          >
                            <option value="">Selecionar Turma</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Professor</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchedule.teacher_id}
                            onChange={e => setNewSchedule({...newSchedule, teacher_id: e.target.value})}
                          >
                            <option value="">Selecionar Professor</option>
                            {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Disciplina</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchedule.subject_id}
                            onChange={e => setNewSchedule({...newSchedule, subject_id: e.target.value})}
                          >
                            <option value="">Selecionar Disciplina</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Dia</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={newSchedule.day_of_week}
                              onChange={e => setNewSchedule({...newSchedule, day_of_week: e.target.value})}
                            >
                              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Sala</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={newSchedule.classroom_id}
                              onChange={e => setNewSchedule({...newSchedule, classroom_id: e.target.value})}
                            >
                              <option value="">Selecionar Sala</option>
                              {classrooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Início</label>
                            <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" value={newSchedule.start_time} onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Fim</label>
                            <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" value={newSchedule.end_time} onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button onClick={handleAddSchedule} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700">Salvar</button>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Turma</th>
                        <th className="px-6 py-4">Disciplina</th>
                        <th className="px-6 py-4">Dia</th>
                        <th className="px-6 py-4">Horário</th>
                        <th className="px-6 py-4">Sala</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schedules.map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{s.class_name}</td>
                          <td className="px-6 py-4 text-sm">{s.subject}</td>
                          <td className="px-6 py-4 text-sm">{s.day_of_week}</td>
                          <td className="px-6 py-4 text-sm">{s.start_time} - {s.end_time}</td>
                          <td className="px-6 py-4 text-sm">{s.classroom_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'vacations' && (userRole === 'admin' || userRole === 'secretary') && (
              <motion.div
                key="vacations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Gestão de Férias e Licenças</h3>
                  <button 
                    onClick={() => setShowVacationModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Solicitar Férias
                  </button>
                </div>

                {showVacationModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                      <h3 className="text-2xl font-bold mb-6">Solicitar Ausência</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Colaborador</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newVacation.user_id}
                            onChange={e => setNewVacation({...newVacation, user_id: e.target.value})}
                          >
                            <option value="">Selecionar Colaborador</option>
                            {teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Início</label>
                            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" value={newVacation.start_date} onChange={e => setNewVacation({...newVacation, start_date: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Fim</label>
                            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" value={newVacation.end_date} onChange={e => setNewVacation({...newVacation, end_date: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Tipo</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newVacation.type}
                            onChange={e => setNewVacation({...newVacation, type: e.target.value})}
                          >
                            <option value="Férias">Férias</option>
                            <option value="Licença Médica">Licença Médica</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button onClick={() => setShowVacationModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button onClick={handleAddVacation} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700">Enviar</button>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Colaborador</th>
                        <th className="px-6 py-4">Período</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vacations.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{v.user_name}</td>
                          <td className="px-6 py-4 text-sm">{new Date(v.start_date).toLocaleDateString()} - {new Date(v.end_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">{v.type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              v.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' : 
                              v.status === 'Rejeitado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {v.status === 'Pendente' && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={async () => {
                                    await fetch(`/api/teachers/vacations/${v.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json', 'x-school-subdomain': currentSchool?.subdomain || '' },
                                      body: JSON.stringify({ status: 'Aprovado' })
                                    });
                                    if (currentSchool) selectSchool(currentSchool);
                                  }}
                                  className="text-emerald-600 hover:underline text-xs font-bold"
                                >
                                  Aprovar
                                </button>
                                <button 
                                  onClick={async () => {
                                    await fetch(`/api/teachers/vacations/${v.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json', 'x-school-subdomain': currentSchool?.subdomain || '' },
                                      body: JSON.stringify({ status: 'Rejeitado' })
                                    });
                                    if (currentSchool) selectSchool(currentSchool);
                                  }}
                                  className="text-red-600 hover:underline text-xs font-bold"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'license' && (userRole === 'admin' || userRole === 'secretary') && (
              <motion.div
                key="license"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl space-y-8"
              >
                <h3 className="text-2xl font-bold">Estado da Licença Kulonga</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Alunos Utilizados</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold">{licenseInfo?.current_students || 0}</p>
                      <p className="text-slate-400 mb-1">/ {licenseInfo?.license_limit || 50}</p>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${licenseInfo?.is_limit_reached ? 'bg-red-500' : 'bg-indigo-600'}`}
                        style={{ width: `${Math.min(100, ((licenseInfo?.current_students || 0) / (licenseInfo?.license_limit || 50)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Estado da Licença</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 ${
                      licenseInfo?.license_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {licenseInfo?.license_status === 'active' ? 'Ativa' : 
                       licenseInfo?.license_status === 'expired' ? 'Expirada' : 'Suspensa'}
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Expira em</p>
                    <p className="text-xl font-bold mt-2">
                      {licenseInfo?.license_expiry ? new Date(licenseInfo.license_expiry).toLocaleDateString('pt-AO') : 'Vitalícia'}
                    </p>
                  </div>
                </div>

                {licenseInfo?.is_limit_reached && (
                  <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-800">
                    <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                      <Bell size={24} />
                    </div>
                    <div>
                      <p className="font-bold">Limite de Alunos Atingido!</p>
                      <p className="text-sm">Não será possível cadastrar novos alunos até que a licença seja expandida. Entre em contacto com o suporte Kulonga.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'students' && (
              <motion.div
                key="students"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-lg">Lista de Alunos</h3>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Pesquisar aluno..."
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      {(userRole === 'admin' || userRole === 'secretary') && (
                        <button 
                          onClick={() => setShowStudentModal(true)}
                          disabled={licenseInfo?.is_limit_reached}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
                            licenseInfo?.is_limit_reached 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          <Users size={18} />
                          {licenseInfo?.is_limit_reached ? 'Limite Atingido' : 'Novo Aluno'}
                        </button>
                      )}
                    </div>
                  </div>

                  {showStudentModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                      >
                        <h3 className="text-2xl font-bold mb-6">Cadastrar Novo Aluno</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={newStudent.name}
                              onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email</label>
                            <input 
                              type="email" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={newStudent.email}
                              onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Nº de Matrícula</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={newStudent.registration_number}
                              onChange={e => setNewStudent({...newStudent, registration_number: e.target.value})}
                            />
                          </div>
                          <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-indigo-600 mb-4">Informações do Encarregado</h4>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Nome do Encarregado</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                  value={newStudent.guardian_name}
                                  onChange={e => setNewStudent({...newStudent, guardian_name: e.target.value})}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700">Telefone</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newStudent.guardian_phone}
                                    onChange={e => setNewStudent({...newStudent, guardian_phone: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700">Email</label>
                                  <input 
                                    type="email" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newStudent.guardian_email}
                                    onChange={e => setNewStudent({...newStudent, guardian_email: e.target.value})}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                          <button 
                            onClick={() => setShowStudentModal(false)}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleAddStudent}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                          >
                            Cadastrar
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">Matrícula</th>
                        <th className="px-6 py-4">Encarregado</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? 
                        students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-[10px] text-slate-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-mono">{student.registration_number || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm">
                            {(userRole === 'admin' || userRole === 'teacher') && (
                              <div>
                                <p className="font-bold text-slate-700">{student.guardian_name || 'N/A'}</p>
                                <p className="text-[10px] text-slate-500">{student.guardian_phone || 'N/A'}</p>
                              </div>
                            )}
                            {userRole !== 'admin' && userRole !== 'teacher' && (
                              <span className="text-slate-400 italic text-xs">Acesso Restrito</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">Ativo</span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-indigo-600 hover:underline text-sm font-bold">Editar</button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                            Nenhum aluno cadastrado nesta escola.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
