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
  Check,
  Shield,
  Key,
  Mail,
  X,
  Award,
  Clock,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  FileText,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Eye,
  EyeOff,
  Database,
  Download,
  Upload,
  School,
  DollarSign,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import * as jspdf from 'jspdf';
import autoTable from 'jspdf-autotable';
const jsPDF = (jspdf as any).jsPDF || (jspdf as any).default || jspdf;
import LandingPage from './components/LandingPage';
import * as XLSX from 'xlsx';

// Dashboards
import SuperAdminDashboard from './components/dashboards/superadmin/SuperAdminDashboard';
import AdminDashboard from './components/dashboards/admin/AdminDashboard';
import TeacherDashboard from './components/dashboards/teacher/TeacherDashboard';
import StudentDashboard from './components/dashboards/student/StudentDashboard';
import ParentDashboard from './components/dashboards/parent/ParentDashboard';
import SecretaryDashboard from './components/dashboards/secretary/SecretaryDashboard';
import HRDashboard from './components/dashboards/hr/HRDashboard';
import PedagogicalDashboard from './components/dashboards/pedagogical/PedagogicalDashboard';

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
  license_type?: string;
  license_status?: string;
  license_expiry?: string;
  classes_enabled?: boolean;
  grades_enabled?: boolean;
  teachers_enabled?: boolean;
  vacations_enabled?: boolean;
  certificates_enabled?: boolean;
  financial_enabled?: boolean;
  migration_enabled?: boolean;
  payments_enabled?: boolean;
}

interface Student {
  name: string;
  email: string;
  registration_number: string;
}

const FinancialDashboard = ({ summary }: { summary: any }) => {
  const data = summary.monthlyRevenue || [
    { month: 'Jan', revenue: 0 },
    { month: 'Fev', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Abr', revenue: 0 },
    { month: 'Mai', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ];

  const pieData = [
    { name: 'Pago', value: summary.paid || 0, color: '#10b981' },
    { name: 'Pendente', value: summary.pending || 0, color: '#f59e0b' },
    { name: 'Em Atraso', value: summary.overdue || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Recebido</p>
              <p className="text-2xl font-black text-slate-900">{summary.paid.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: '75%' }}></div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pendente</p>
              <p className="text-2xl font-black text-slate-900">{summary.pending.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: '45%' }}></div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-50 p-3 rounded-2xl text-red-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Em Atraso</p>
              <p className="text-2xl font-black text-slate-900">{(summary.overdue || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full" style={{ width: '25%' }}></div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Receita Mensal</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => `Kz ${value / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Distribuição de Pagamentos</h3>
          <div className="h-[300px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-xl font-black text-slate-900">{(summary.paid + summary.pending + (summary.overdue || 0)).toLocaleString('pt-AO', { notation: 'compact' })}</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-bold text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Transações Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                <th className="pb-4">Aluno</th>
                <th className="pb-4">Valor</th>
                <th className="pb-4">Método</th>
                <th className="pb-4">Data</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {summary.recentTransactions?.map((t: any, i: number) => (
                <tr key={i} className="group">
                  <td className="py-4 font-bold text-slate-700">{t.student_name}</td>
                  <td className="py-4 text-slate-600">{(t.amount || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">{t.method}</span>
                  </td>
                  <td className="py-4 text-slate-500 text-sm">{new Date(t.paid_at || t.created_at).toLocaleDateString('pt-AO')}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.status === 'completed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!summary.recentTransactions || summary.recentTransactions.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">Nenhuma transação recente encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: { icon: any, label: string, active?: boolean, onClick: () => void, badge?: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${
        active ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'
      }`}>
        {badge}
      </span>
    )}
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
  const [userRole, setUserRole] = useState<'superadmin' | 'admin' | 'teacher' | 'secretary' | 'student' | 'hr' | 'pedagogical' | 'unassigned'>('admin');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({ password: '', confirm: '' });
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ student_id: '', subject: '', score1: '', score2: '', score3: '' });
  const [trainingSubTab, setTrainingSubTab] = useState('catalog');
  const [myTrainings] = useState([
    { id: 1, title: 'Metodologias Ativas no Ensino', provider: 'Kulonga Academy', progress: 65, status: 'Em andamento', deadline: '2026-04-15' },
    { id: 2, title: 'Gestão Escolar 4.0', provider: 'IFP - Instituto de Formação', progress: 30, status: 'Em andamento', deadline: '2026-05-20' },
    { id: 3, title: 'Psicologia Educacional Aplicada', provider: 'Universidade Aberta', progress: 90, status: 'Próximo da conclusão', deadline: '2026-03-30' },
  ]);
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
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [pedagogicalUsers, setPedagogicalUsers] = useState<any[]>([]);
  const [directors, setDirectors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [vacations, setVacations] = useState<any[]>([]);
  const [licenseInfo, setLicenseInfo] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [schoolUsers, setSchoolUsers] = useState<any[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<any[]>([]);
  const [showSchoolUserModal, setShowSchoolUserModal] = useState(false);
  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [directorForm, setDirectorForm] = useState({ name: '', email: '', password: '', schoolIds: [] as number[] });
  const [showLinkRecordModal, setShowLinkRecordModal] = useState(false);
  const [selectedUserForLink, setSelectedUserForLink] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showIssueCertificateModal, setShowIssueCertificateModal] = useState(false);
  const [certificationForm, setCertificationForm] = useState({ name: '', description: '', duration_hours: '', level: '' });
  const [issueCertificateForm, setIssueCertificateForm] = useState({ student_id: '', certification_id: '', issue_date: new Date().toISOString().split('T')[0], expiry_date: '', grade: '', template_type: 'standard' });
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
    license_type: 'institution',
    license_status: 'active',
    license_expiry: '',
    classes_enabled: true,
    grades_enabled: true,
    teachers_enabled: true,
    vacations_enabled: true,
    certificates_enabled: true,
    financial_enabled: true,
    migration_enabled: true,
    payments_enabled: true,
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [classForm, setClassForm] = useState({ name: '', grade_level: '', teacher_id: '', pedagogical_id: '', director_id: '' });
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationType, setNotificationType] = useState<'individual' | 'class'>('individual');
  const [newNotification, setNewNotification] = useState({ user_id: '', message: '', type: 'info', method: 'system' });
  const [selectedClassId, setSelectedClassId] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', email: '', registration_number: '', guardian_name: '', guardian_phone: '', guardian_email: '' });
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', specialization: '', hire_date: '', phone: '', bi: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', class_id: '', teacher_id: '' });
  const [newSchedule, setNewSchedule] = useState({ class_id: '', classroom_id: '', subject_id: '', teacher_id: '', day_of_week: 'Segunda', start_time: '', end_time: '' });
  const [newVacation, setNewVacation] = useState({ user_id: '', start_date: '', end_date: '', type: 'Férias' });
  const [profileData, setProfileData] = useState<any>(null);
  const [mfaSetup, setMfaSetup] = useState<any>(null);
  const [mfaVerifyToken, setMfaVerifyToken] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showCookieAlert, setShowCookieAlert] = useState(!localStorage.getItem('cookieConsent'));
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const user = await res.json();
            setCurrentUser(user);
            setUserRole(user.role);
            setIsLoggedIn(true);
            setShowLanding(false);
          } else {
            localStorage.removeItem('token');
            setShowLanding(true);
          }
        } catch (err) {
          console.error(err);
          setShowLanding(true);
        }
      } else {
        setShowLanding(true);
      }
      setLoading(false);
    };
    checkAuth();
    fetchSchools();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > TIMEOUT_MS) {
        handleLogout();
        showMessage("Sessão expirada por inatividade.", "error");
      }
    }, 60000);

    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [isLoggedIn, lastActivity]);

  useEffect(() => {
    if (userRole === 'superadmin') {
      fetchSuperAdminData();
    }
  }, [userRole]);

  const fetchSuperAdminData = async () => {
    try {
      const [sysRes, usersRes, requestsRes, studentsRes] = await Promise.all([
        fetch('/api/superadmin/system-stats'),
        fetch('/api/superadmin/users'),
        fetch('/api/superadmin/service-requests'),
        fetch('/api/superadmin/students/all')
      ]);
      setSystemStats(await sysRes.json());
      setAllUsers(await usersRes.json());
      setServiceRequests(await requestsRes.json());
      setAllStudents(await studentsRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuperAdminResetPassword = async (userId: number) => {
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
        showMessage("Papel alterado com sucesso!", "success");
        fetchSuperAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStudent = async () => {
    if (licenseInfo?.is_limit_reached) {
      showMessage("Limite de alunos atingido! Expanda sua licença.", 'error');
      return;
    }

    if (!newStudent.name || !newStudent.email || !newStudent.registration_number) {
      showMessage("Todos os campos são obrigatórios", 'error');
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
      const data = await res.json();
      if (res.ok) {
        showMessage("Aluno cadastrado com sucesso!", 'success');
        setShowStudentModal(false);
        setNewStudent({ name: '', email: '', registration_number: '' });
        if (currentSchool) selectSchool(currentSchool);
      } else {
        showMessage(data.error || "Erro ao cadastrar aluno", 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão com o servidor", 'error');
    }
  };

  const handleSaveClass = async () => {
    if (!classForm.name || !classForm.grade_level) {
      showMessage('Nome e Nível são obrigatórios', 'error');
      return;
    }

    try {
      const url = editingClass ? `/api/academic/classes/${editingClass.id}` : '/api/academic/classes';
      const method = editingClass ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool.subdomain
        },
        body: JSON.stringify(classForm)
      });

      if (res.ok) {
        showMessage(editingClass ? 'Turma atualizada' : 'Turma criada', 'success');
        setShowClassModal(false);
        setEditingClass(null);
        setClassForm({ name: '', grade_level: '', teacher_id: '', pedagogical_id: '', director_id: '' });
        selectSchool(currentSchool!);
      } else {
        const error = await res.json();
        showMessage(error.message || 'Erro ao salvar turma', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Erro de conexão', 'error');
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email) {
      showMessage("Nome e email são obrigatórios", 'error');
      return;
    }

    try {
      const url = editingTeacherId ? `/api/teachers/${editingTeacherId}` : '/api/teachers';
      const method = editingTeacherId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify(newTeacher)
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(editingTeacherId ? "Professor atualizado!" : "Professor cadastrado com sucesso!", 'success');
        setShowTeacherModal(false);
        setEditingTeacherId(null);
        setNewTeacher({ name: '', email: '', specialization: '', hire_date: '', phone: '', bi: '' });
        if (currentSchool) selectSchool(currentSchool);
      } else {
        showMessage(data.error || "Erro ao cadastrar professor", 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão com o servidor", 'error');
    }
  };

  const handleAddSubject = async () => {
    const token = localStorage.getItem('token');
    if (!newSubject.name || !newSubject.code) {
      showMessage("Nome e código são obrigatórios", 'error');
      return;
    }

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
        showMessage("Disciplina adicionada com sucesso!", 'success');
        setShowSubjectModal(false);
        setNewSubject({ name: '', code: '' });
        if (currentSchool) selectSchool(currentSchool);
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão", 'error');
    }
  };

  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [saftYear, setSaftYear] = useState(new Date().getFullYear());
  const [saftMonth, setSaftMonth] = useState(new Date().getMonth() + 1);

  const handleExportSAFT = async () => {
    try {
      const res = await fetch(`/api/data/saft?year=${saftYear}&month=${saftMonth}`, {
        headers: { 'x-school-subdomain': currentSchool?.subdomain || '' }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SAFT-AO-${currentSchool?.subdomain}-${saftYear}-${saftMonth}.xml`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showMessage("Arquivo SAFT-AO gerado com sucesso!", "success");
      } else {
        const error = await res.json();
        showMessage(error.message || "Erro ao gerar SAFT", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão", "error");
    }
  };

  const handleExportExcel = async (type: 'students' | 'teachers') => {
    try {
      const res = await fetch(`/api/data/export-excel?type=${type}`, {
        headers: { 'x-school-subdomain': currentSchool?.subdomain || '' }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${currentSchool?.subdomain}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showMessage(`Lista de ${type === 'students' ? 'alunos' : 'professores'} exportada!`, "success");
      } else {
        const error = await res.json();
        showMessage(error.message || "Erro ao exportar Excel", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão", "error");
    }
  };

  const handleExportData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/data/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-school-subdomain': currentSchool?.subdomain || ''
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_school_${currentSchool?.id}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showMessage("Dados exportados com sucesso!", "success");
      } else {
        const err = await res.json();
        showMessage(err.error || "Erro ao exportar dados", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro ao exportar dados", "error");
    }
  };

  const handleImportData = async () => {
    const token = localStorage.getItem('token');
    if (!importFile) {
      showMessage("Selecione um arquivo para importar", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const res = await fetch('/api/data/import', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-school-subdomain': currentSchool?.subdomain || ''
          },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          showMessage("Dados importados com sucesso!", "success");
          setShowDataModal(false);
          setImportFile(null);
          if (currentSchool) selectSchool(currentSchool);
        } else {
          const err = await res.json();
          showMessage(err.error || "Erro ao importar dados", "error");
        }
      } catch (err) {
        console.error(err);
        showMessage("Erro ao importar dados: Arquivo inválido", "error");
      }
    };
    reader.readAsText(importFile);
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
        showMessage("Horário adicionado com sucesso!", "success");
        setShowScheduleModal(false);
        setNewSchedule({ class_id: '', classroom_id: '', subject_id: '', teacher_id: '', day_of_week: 'Segunda', start_time: '', end_time: '' });
        if (currentSchool) selectSchool(currentSchool);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVacation = async () => {
    if (!newVacation.user_id || !newVacation.start_date || !newVacation.end_date) {
      showMessage("Preencha todos os campos obrigatórios", 'error');
      return;
    }

    try {
      const res = await fetch('/api/teachers/vacations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify({
          ...newVacation,
          requested_by_role: userRole
        })
      });
      if (res.ok) {
        showMessage("Pedido de licença enviado com sucesso!", "success");
        setShowVacationModal(false);
        setNewVacation({ user_id: '', start_date: '', end_date: '', type: 'Férias' });
        if (currentSchool) selectSchool(currentSchool);
      } else {
        const error = await res.json();
        showMessage(error.message || "Erro ao enviar pedido", 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão", 'error');
    }
  };

  const handleUpdateLicenseStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/teachers/vacations/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showMessage(`Licença ${status === 'Aprovado' ? 'aprovada' : 'rejeitada'}!`, "success");
        if (currentSchool) selectSchool(currentSchool);
      } else {
        const error = await res.json();
        showMessage(error.message || "Erro ao atualizar status", 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão", 'error');
    }
  };

  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.subdomain) {
      showMessage("Nome e subdomínio são obrigatórios", 'error');
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
      const data = await res.json();
      
      if (res.ok) {
        showMessage(editingSchoolId ? "Escola atualizada!" : "Escola adicionada com sucesso!", 'success');
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
          license_type: 'institution',
          license_status: 'active',
          license_expiry: '',
          classes_enabled: true,
          grades_enabled: true,
          teachers_enabled: true,
          vacations_enabled: true,
          certificates_enabled: true,
          financial_enabled: true,
          migration_enabled: true,
          payments_enabled: true,
          adminName: '',
          adminEmail: '',
          adminPassword: ''
        });
        fetchSchools();
        fetchSuperAdminData();
      } else {
        showMessage(data.error || "Erro ao salvar escola", 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão com o servidor", 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'user_management') {
      fetchSchoolUsers();
      fetchUnassignedUsers();
    }
    if (activeTab === 'training' || activeTab === 'certificates') {
      fetchCertifications();
      fetchCertificates();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setProfileData(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchoolUsers = async () => {
    try {
      const res = await fetch('/api/auth/school/users', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-school-subdomain': currentSchool?.subdomain || ''
        }
      });
      if (res.ok) setSchoolUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnassignedUsers = async () => {
    try {
      const res = await fetch('/api/auth/unassigned-users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setUnassignedUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignUser = async (userId: number, role: string) => {
    try {
      const res = await fetch('/api/auth/school/assign-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        showMessage("Usuário atribuído!", "success");
        fetchSchoolUsers();
        fetchUnassignedUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDissociateUser = async (userId: number) => {
    if (!confirm("Tem certeza que deseja desassociar este usuário da escola?")) return;
    try {
      const res = await fetch('/api/auth/school/dissociate-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        showMessage("Usuário desassociado!", "success");
        fetchSchoolUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkRecord = async (userId: number, type: 'student' | 'teacher', recordId: number) => {
    try {
      const res = await fetch('/api/auth/school/link-record', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify({ userId, type, recordId })
      });
      if (res.ok) {
        showMessage("Registro vinculado!", "success");
        setShowLinkRecordModal(false);
        fetchSchoolUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCertifications = async () => {
    try {
      const headers: any = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      if (currentSchool) headers['x-school-subdomain'] = currentSchool.subdomain;
      
      const res = await fetch('/api/certification/certifications', { headers });
      if (res.ok) setCertifications(await res.json());
    } catch (err) {
      console.error("Error fetching certifications:", err);
    }
  };

  const fetchCertificates = async () => {
    try {
      const headers: any = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      if (currentSchool) headers['x-school-subdomain'] = currentSchool.subdomain;

      const res = await fetch('/api/certification/certificates', { headers });
      if (res.ok) setCertificates(await res.json());
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  const handleCreateCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      const res = await fetch('/api/certification/certifications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-school-subdomain': currentSchool.subdomain
        },
        body: JSON.stringify(certificationForm)
      });
      if (res.ok) {
        setShowCertificationModal(false);
        setCertificationForm({ name: '', description: '', duration_hours: '', level: '' });
        fetchCertifications();
        showMessage("Certificação criada!", "success");
      }
    } catch (err) {
      console.error("Error creating certification:", err);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers: any = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      if (currentSchool) headers['x-school-subdomain'] = currentSchool.subdomain;

      const res = await fetch('/api/certification/certificates/issue', {
        method: 'POST',
        headers,
        body: JSON.stringify(issueCertificateForm)
      });
      if (res.ok) {
        setShowIssueCertificateModal(false);
        setIssueCertificateForm({ student_id: '', certification_id: '', issue_date: new Date().toISOString().split('T')[0], expiry_date: '', grade: '', template_type: 'standard' });
        fetchCertificates();
        showMessage("Certificado emitido!", "success");
      }
    } catch (err) {
      console.error("Error issuing certificate:", err);
    }
  };

  const generateCertificatePDF = (cert: any) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const isPremium = cert.template_type === 'premium';

    // Background
    if (isPremium) {
      doc.setFillColor(26, 32, 44); // Dark blue
      doc.rect(0, 0, 297, 210, 'F');
      doc.setDrawColor(249, 115, 22); // Orange border
      doc.setLineWidth(5);
      doc.rect(10, 10, 277, 190);
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setDrawColor(30, 58, 138); // Blue border
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);
      doc.setTextColor(30, 58, 138);
    }

    // Header
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 50, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento certifica que', 148.5, 70, { align: 'center' });

    // Student Name
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    if (isPremium) doc.setTextColor(249, 115, 22);
    doc.text(cert.student_name.toUpperCase(), 148.5, 90, { align: 'center' });

    // Body
    if (isPremium) doc.setTextColor(255, 255, 255);
    else doc.setTextColor(30, 58, 138);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`concluiu com sucesso a certificação em`, 148.5, 110, { align: 'center' });

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(cert.certification_name, 148.5, 125, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.text(`Emitido em ${new Date(cert.issue_date).toLocaleDateString()} com a nota final de ${cert.grade}`, 148.5, 145, { align: 'center' });

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Número do Certificado: ${cert.certificate_number}`, 148.5, 170, { align: 'center' });
    doc.text(`Instituição: ${currentSchool?.name}`, 148.5, 175, { align: 'center' });

    if (isPremium) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text('CERTIFICAÇÃO PREMIUM KULONGA - PESO EDUCACIONAL RECONHECIDO', 148.5, 195, { align: 'center' });
    }

    doc.save(`Certificado_${cert.certificate_number}.pdf`);
  };

  useEffect(() => {
    if (activeTab === 'training') {
      fetchCertifications();
      fetchCertificates();
    }
    if (activeTab === 'user_management') {
      fetchSchoolUsers();
      if (userRole === 'superadmin') {
        fetchAllSchools();
        fetchAllUsers();
      }
    }
  }, [activeTab, currentSchool]);

  const handleUnlinkRecord = async (type: 'student' | 'teacher', recordId: number) => {
    if (!confirm("Tem certeza que deseja desvincular este registro?")) return;
    try {
      const res = await fetch('/api/auth/school/unlink-record', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify({ type, recordId })
      });
      if (res.ok) {
        alert("Registro desvinculado!");
        fetchSchoolUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [showGlobalAssignModal, setShowGlobalAssignModal] = useState(false);
  const [globalAssignForm, setGlobalAssignForm] = useState({ userId: '', schoolId: '', role: 'admin' });

  const fetchAllSchools = async () => {
    try {
      const res = await fetch('/api/auth/admin/schools', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setAllSchools(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/auth/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setAllUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleGlobalAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/admin/assign-user-global', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(globalAssignForm)
      });
      if (res.ok) {
        alert('Utilizador atribuído com sucesso!');
        setShowGlobalAssignModal(false);
        fetchSchoolUsers();
        fetchAllUsers();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/auth/school/assign-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) {
        fetchSchoolUsers();
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (directorForm.name.length < 2) return alert("Nome inválido");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(directorForm.email)) return alert("Email inválido");
    if (directorForm.password.length < 6) return alert("Senha muito curta");
    if (directorForm.schoolIds.length === 0) return alert("Selecione pelo menos uma escola");

    try {
      const res = await fetch('/api/auth/admin/create-director', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(directorForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowDirectorModal(false);
        setDirectorForm({ name: '', email: '', password: '', schoolIds: [] });
        fetchSchoolUsers();
      } else {
        alert(data.error || "Erro ao criar diretor");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMfaSetup = async () => {
    try {
      const res = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setMfaSetup(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleMfaEnable = async () => {
    try {
      const res = await fetch('/api/auth/mfa/enable', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ token: mfaVerifyToken })
      });
      if (res.ok) {
        alert("MFA ativado com sucesso!");
        setMfaSetup(null);
        setMfaVerifyToken('');
        fetchProfile();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao ativar MFA");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert("As senhas não coincidem");
      return;
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new })
      });
      if (res.ok) {
        alert("Senha alterada com sucesso!");
        setPasswordForm({ current: '', new: '', confirm: '' });
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao alterar senha");
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
      const [studentsRes, statsRes, financialRes, invoicesRes, notificationsRes, classesRes, classroomsRes, schedulesRes, gradesRes, paymentsRes, licenseRes, teachersRes, subjectsRes, vacationsRes, pedagogicalRes, directorsRes] = await Promise.all([
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
        fetch('/api/teachers/vacations', { headers }),
        fetch('/api/users/role/pedagogical', { headers }),
        fetch('/api/users/role/director', { headers })
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
      const pedagogicalData = await pedagogicalRes.json();
      const directorsData = await directorsRes.json();
      
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
      setPedagogicalUsers(Array.isArray(pedagogicalData) ? pedagogicalData : []);
      setDirectors(Array.isArray(directorsData) ? directorsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setVacations(Array.isArray(vacationsData) ? vacationsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
    }
  }, []);

  const getSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Check query param first (useful for testing in AI Studio)
    const urlParams = new URLSearchParams(window.location.search);
    const schoolParam = urlParams.get('school');
    if (schoolParam) return schoolParam;

    // In production, subdomain is the first part if there are at least 3 parts (e.g., school.kulonga.com)
    if (parts.length > 2) return parts[0];
    
    return '';
  };

  const generateReceiptPDF = (payment: any) => {
    const doc = new jsPDF();
    const school = currentSchool || { name: 'Kulonga Platform', address: 'Angola' };
    
    // Header
    doc.setFontSize(20);
    doc.text('RECIBO DE PAGAMENTO', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(school.name, 20, 35);
    doc.text(school.address || '', 20, 40);
    doc.text(`Data: ${new Date(payment.paid_at || payment.created_at).toLocaleDateString()}`, 150, 35);
    doc.text(`Recibo Nº: ${payment?.id?.toString()?.padStart(6, '0') || '000000'}`, 150, 40);
    
    // Content
    doc.line(20, 45, 190, 45);
    
    doc.text('DADOS DO ALUNO', 20, 55);
    doc.setFontSize(12);
    doc.text(`Nome: ${payment.student_name || 'N/A'}`, 20, 65);
    doc.text(`ID Fatura: ${payment.invoice_id}`, 20, 72);
    
    doc.setFontSize(10);
    doc.text('DETALHES DO PAGAMENTO', 20, 85);
    
    autoTable(doc, {
      startY: 90,
      head: [['Descrição', 'Método', 'Valor']],
      body: [
        ['Pagamento de Propina/Taxa', payment.method, `${payment.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.text('Assinatura da Secretaria', 50, finalY + 20);
    doc.line(20, finalY + 15, 80, finalY + 15);
    
    doc.text('Assinatura do Encarregado', 140, finalY + 20);
    doc.line(120, finalY + 15, 180, finalY + 15);
    
    doc.setFontSize(8);
    doc.text('Este documento serve como comprovativo oficial de pagamento.', 105, 280, { align: 'center' });
    
    doc.save(`recibo_${payment.id}.pdf`);
  };

  const handleSaveGrade = async () => {
    if (!gradeForm.student_id || !gradeForm.subject) {
      alert("Por favor, selecione o aluno e a disciplina.");
      return;
    }

    const url = editingGrade ? `/api/academic/grades/${editingGrade.id}` : '/api/academic/grades';
    const method = editingGrade ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-school-subdomain': currentSchool?.subdomain || ''
        },
        body: JSON.stringify(gradeForm)
      });

      if (response.ok) {
        setShowGradeModal(false);
        setEditingGrade(null);
        setGradeForm({ student_id: '', subject: '', score1: '', score2: '', score3: '' });
        // Refresh grades
        selectSchool(currentSchool!);
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao salvar nota.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão.");
    }
  };

  const handleLogin = async (e?: React.FormEvent, devUser?: any) => {
    if (e) e.preventDefault();
    setLoginError('');
    
    const credentials = devUser || { ...loginForm, mfaToken };
    
    if (!credentials.email || !credentials.password) {
      setLoginError('Email e senha são obrigatórios');
      showMessage('Email e senha são obrigatórios', 'error');
      return;
    }

    try {
      console.log("Attempting login for:", credentials.email);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Resposta do servidor não é JSON");
      }

      if (res.status === 403 && data.passwordExpired) {
        setLoginError(data.error);
        showMessage(data.error, "error");
        setShowResetPassword(true);
        return;
      }

      if (res.ok) {
        if (data.mfaRequired) {
          setMfaRequired(true);
          showMessage("Autenticação de dois fatores necessária", "success");
          return;
        }
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        setIsLoggedIn(true);
        setShowLanding(false);
        setMfaRequired(false);
        setMfaToken('');
        if (data.schoolId) {
          const school = schools.find(s => s.id === data.schoolId);
          if (school) selectSchool(school);
        }
        showMessage("Bem-vindo ao Kulonga!", "success");
      } else {
        setLoginError(data.error || "Credenciais inválidas");
        showMessage(data.error || "Credenciais inválidas", "error");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setLoginError('Erro ao conectar com o servidor. Verifique sua conexão.');
      showMessage('Erro ao conectar com o servidor. Verifique sua conexão.', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // In a real app, this would open the Google OAuth URL
      // For this environment, we simulate the popup and the postMessage
      const popup = window.open('', 'google_login', 'width=500,height=600');
      if (popup) {
        popup.document.write(`
          <html>
            <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
              <h2>Simulando Login Google...</h2>
              <button onclick="login()" style="padding:10px 20px;background:#4285F4;color:white;border:none;border-radius:5px;cursor:pointer;">Confirmar Login como Benilson</button>
              <script>
                function login() {
                  window.opener.postMessage({ 
                    type: 'OAUTH_AUTH_SUCCESS', 
                    provider: 'google',
                    user: {
                      googleId: 'google_123',
                      email: 'benilsonsalvador16@gmail.com',
                      name: 'Benilson Salvador'
                    }
                  }, '*');
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
      }
      
      const messageListener = async (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.provider === 'google') {
          const { googleId, email, name } = event.data.user;
          
          try {
            const res = await fetch('/api/auth/oauth/google/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ googleId, email, name })
            });
            const data = await res.json();
            
            if (res.ok) {
              localStorage.setItem('token', data.token);
              setCurrentUser(data.user);
              setUserRole(data.user.role);
              setIsLoggedIn(true);
              setShowLanding(false);
              if (data.schoolId) {
                const school = schools.find(s => s.id === data.schoolId);
                if (school) selectSchool(school);
              }
              showMessage("Bem-vindo via Google!", "success");
            } else {
              showMessage(data.error || "Erro no login com Google", "error");
            }
          } catch (err) {
            console.error(err);
            showMessage("Erro de conexão com o servidor", "error");
          }
          
          window.removeEventListener('message', messageListener);
        }
      };
      window.addEventListener('message', messageListener);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || "Link de recuperação enviado!", "success");
        setShowForgotPassword(false);
      } else {
        showMessage(data.error || "Erro ao solicitar recuperação", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLanding(true);
    setCurrentUser(null);
    showMessage("Sessão encerrada com segurança.", "success");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (registerForm.name.length < 2) return showMessage("Nome muito curto", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) return showMessage("Email inválido", "error");
    
    // Password complexity: 8+ chars, upper, lower, number, special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(registerForm.password)) {
      return showMessage("A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.", "error");
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message, "success");
        setShowRegister(false);
      } else {
        showMessage(data.error || "Erro ao criar conta", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão com o servidor", "error");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordForm.password !== resetPasswordForm.confirm) {
      showMessage("As senhas não coincidem", "error");
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: resetPasswordForm.password })
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("Senha alterada com sucesso! Você já pode fazer login.", "success");
        setResetToken(null);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        showMessage(data.error || "Erro ao redefinir senha", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro de conexão", "error");
    }
  };

  let content;

  if (loading) {
    content = (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  } else if (!isLoggedIn) {
    if (showLanding) {
      content = (
        <LandingPage 
          onLoginClick={() => setShowLanding(false)} 
          onShowTerms={() => setShowTerms(true)}
          onShowPrivacy={() => setShowPrivacy(true)}
          showMessage={showMessage}
        />
      );
    } else if (resetToken) {
      content = (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Key className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">Nova Senha</h1>
            </div>
            <p className="text-slate-500 text-center mb-6 text-sm">Crie uma nova senha para sua conta.</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={resetPasswordForm.password}
                  onChange={e => setResetPasswordForm({...resetPasswordForm, password: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Confirmar Senha</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={resetPasswordForm.confirm}
                  onChange={e => setResetPasswordForm({...resetPasswordForm, confirm: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Alterar Senha
              </button>
            </form>
          </motion.div>
        </div>
      );
    } else if (showResetPassword) {
      content = (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Key className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">Recuperar Senha</h1>
            </div>
            <p className="text-slate-500 text-center mb-6 text-sm">Insira seu email para receber as instruções de recuperação.</p>
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Enviar Link
              </button>
              <button 
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="w-full text-slate-500 font-bold py-2 text-sm"
              >
                Voltar ao Login
              </button>
            </form>
          </motion.div>
        </div>
      );
    } else if (showRegister) {
      content = (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Plus className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">Criar Conta</h1>
            </div>
            <p className="text-slate-500 text-center mb-6 text-sm">Junte-se à plataforma Kulonga hoje.</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.name}
                    onChange={e => setRegisterForm({...registerForm, name: e.target.value})}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                      value={registerForm.password}
                      onChange={e => setRegisterForm({...registerForm, password: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos.
                  </p>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Criar Conta
                </button>
              <button 
                type="button"
                onClick={() => setShowRegister(false)}
                className="w-full text-slate-500 font-bold py-2 text-sm"
              >
                Já tem uma conta? Entre aqui
              </button>
            </form>
          </motion.div>
        </div>
      );
    } else {
      content = (
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

            {!mfaRequired ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 animate-pulse">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={loginForm.email}
                    onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-slate-700">Senha</label>
                    <button 
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                      value={loginForm.password}
                      onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Entrar no Sistema
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-bold">Ou continue com</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  Google
                </button>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Não tem uma conta? <button type="button" onClick={() => setShowRegister(true)} className="text-indigo-600 font-bold hover:underline">Crie uma agora</button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-6">
                  <Shield className="mx-auto text-indigo-600 mb-2" size={48} />
                  <h2 className="text-xl font-bold">Autenticação de Dois Fatores</h2>
                  <p className="text-slate-500 text-sm">Insira o código gerado pelo seu aplicativo de autenticação.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Código MFA</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl tracking-widest"
                    value={mfaToken}
                    onChange={e => setMfaToken(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Verificar Código
                </button>
                <button 
                  type="button"
                  onClick={() => setMfaRequired(false)}
                  className="w-full text-slate-500 font-bold py-2 text-sm"
                >
                  Voltar ao Login
                </button>
              </form>
            )}
          </motion.div>

          <AnimatePresence>
            {showForgotPassword && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Recuperar Senha</h2>
                    <button onClick={() => setShowForgotPassword(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={24} />
                    </button>
                  </div>
                  <p className="text-slate-500 mb-6 text-sm">Insira seu email para receber um link de recuperação.</p>
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      Enviar Link
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
  } else {
    content = (
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter">kulonga</span>
        </div>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 text-slate-600">
          {showMobileMenu ? <X size={24} /> : <LayoutDashboard size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${showMobileMenu ? 'fixed inset-0 z-40 bg-white p-6' : 'hidden'} md:flex md:w-64 md:bg-white md:border-r md:border-slate-200 md:p-6 md:flex-col md:sticky md:top-0 md:h-screen overflow-y-auto`}>
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
              icon={School} 
              label="Escolas" 
              active={activeTab === 'schools'} 
              onClick={() => setActiveTab('schools')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'superadmin') && (
            <SidebarItem 
              icon={Settings} 
              label="Configurações" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
          )}

          {userRole === 'superadmin' && (
            <SidebarItem 
              icon={Settings} 
              label="Painel Central" 
              active={activeTab === 'superadmin'} 
              onClick={() => setActiveTab('superadmin')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'secretary' || userRole === 'superadmin') && (
            <SidebarItem 
              icon={Users} 
              label="Alunos" 
              active={activeTab === 'students'} 
              onClick={() => setActiveTab('students')} 
            />
          )}

          {(userRole !== 'parent' || userRole === 'superadmin') && (
            <SidebarItem 
              icon={BookOpen} 
              label="Acadêmico" 
              active={activeTab === 'academic'} 
              onClick={() => setActiveTab('academic')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'teacher' || userRole === 'superadmin' || userRole === 'student' || userRole === 'pedagogical') && (currentSchool?.grades_enabled ?? true) && (
            <SidebarItem 
              icon={GraduationCap} 
              label="Notas" 
              active={activeTab === 'grades'} 
              onClick={() => setActiveTab('grades')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'teacher' || userRole === 'superadmin') && (currentSchool?.classes_enabled ?? true) && (
            <SidebarItem 
              icon={SchoolIcon} 
              label="Gestão de Turmas" 
              active={activeTab === 'classes'} 
              onClick={() => setActiveTab('classes')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'secretary' || userRole === 'parent' || userRole === 'student' || userRole === 'superadmin') && (currentSchool?.financial_enabled ?? true) && (
            <SidebarItem 
              icon={BarChart3} 
              label="Financeiro" 
              active={activeTab === 'financial'} 
              onClick={() => setActiveTab('financial')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'superadmin') && (
            <SidebarItem 
              icon={Settings} 
              label="Configurações da Escola" 
              active={activeTab === 'school_settings'} 
              onClick={() => setActiveTab('school_settings')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'secretary' || userRole === 'hr' || userRole === 'pedagogical' || userRole === 'superadmin') && (
            <>
              {(userRole === 'admin' || userRole === 'hr' || userRole === 'superadmin') && (currentSchool?.teachers_enabled ?? true) && (
                <SidebarItem 
                  icon={Users} 
                  label="Professores" 
                  active={activeTab === 'teachers'} 
                  onClick={() => setActiveTab('teachers')} 
                />
              )}
              {(userRole === 'admin' || userRole === 'pedagogical' || userRole === 'superadmin') && (
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
              {(userRole === 'admin' || userRole === 'hr' || userRole === 'superadmin') && (currentSchool?.vacations_enabled ?? true) && (
                <SidebarItem 
                  icon={Sun} 
                  label="Licenças" 
                  active={activeTab === 'vacations'} 
                  onClick={() => setActiveTab('vacations')} 
                />
              )}
            </>
          )}

          {(userRole === 'admin' || userRole === 'secretary' || userRole === 'pedagogical' || userRole === 'superadmin') && (
            <SidebarItem 
              icon={BarChart3} 
              label="Resumo Académico" 
              active={activeTab === 'academic_summary'} 
              onClick={() => setActiveTab('academic_summary')} 
            />
          )}

          {(userRole === 'parent' || userRole === 'student') && (currentSchool?.payments_enabled ?? true) && (
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

          <SidebarItem 
            icon={Award} 
            label="Academy" 
            onClick={() => window.open('/academy.html', '_blank')} 
            badge="Novo"
          />

          {(userRole === 'admin' || userRole === 'secretary' || userRole === 'superadmin') && (currentSchool?.certificates_enabled ?? true) && (
            <SidebarItem 
              icon={Award} 
              label="Certificados" 
              active={activeTab === 'certificates'} 
              onClick={() => setActiveTab('certificates')} 
              badge="Final"
            />
          )}

          {(userRole === 'admin' || userRole === 'superadmin') && (currentSchool?.migration_enabled ?? true) && (
            <SidebarItem 
              icon={FileText} 
              label="Migração e Export" 
              active={activeTab === 'migration'} 
              onClick={() => setActiveTab('migration')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'superadmin') && (
            <SidebarItem 
              icon={Users} 
              label="Gestão de Utilizadores" 
              active={activeTab === 'user_management'} 
              onClick={() => setActiveTab('user_management')} 
            />
          )}

          {userRole === 'superadmin' && (
            <>
              <SidebarItem 
                icon={Award} 
                label="Academy" 
                onClick={() => window.open('/academy.html', '_blank')} 
                badge="Global"
              />
              <SidebarItem 
                icon={SchoolIcon} 
                label="Centros de Formação" 
                active={activeTab === 'superadmin'} 
                onClick={() => setActiveTab('superadmin')} 
              />
            </>
          )}

          {userRole === 'superadmin' && (
            <SidebarItem 
              icon={Mail} 
              label="Pedidos de Serviço" 
              active={activeTab === 'service_requests'} 
              onClick={() => setActiveTab('service_requests')} 
            />
          )}

          {(userRole === 'admin' || userRole === 'secretary') && (
            <SidebarItem 
              icon={Shield} 
              label="Migração e SAF-T" 
              active={activeTab === 'migration'} 
              onClick={() => setActiveTab('migration')} 
            />
          )}

          <SidebarItem 
            icon={Settings} 
            label="Minha Conta" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          {(userRole === 'superadmin' || userRole === 'admin') && (
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
          )}
          <SidebarItem icon={Settings} label="Configurações" onClick={() => setActiveTab('profile')} />
          <SidebarItem icon={LogOut} label="Sair" onClick={handleLogout} />
          
          <div className="flex justify-center gap-3 mt-4 mb-2">
            <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Facebook size={16} /></a>
            <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Instagram size={16} /></a>
            <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Linkedin size={16} /></a>
            <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><MessageCircle size={16} /></a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 justify-between items-center sticky top-0 z-30">
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
            {currentSchool?.license_type === 'offline' && (
              <button 
                onClick={() => {
                  alert("Sincronizando dados com o servidor central...");
                  // Mock sync logic
                }}
                className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-bold hover:bg-amber-100 transition-all border border-amber-200"
              >
                <RefreshCw size={14} /> Sincronizar Agora
              </button>
            )}
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

        <div className="p-4 md:p-8 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'migration' && (userRole === 'admin' || userRole === 'secretary') && (
              <motion.div
                key="migration"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-2xl">Migração e Conformidade Fiscal</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* SAF-T Section */}
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                        <Shield size={32} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Exportar SAF-T (AO)</h4>
                        <p className="text-slate-500 text-sm">Ficheiro de auditoria tributária para a AGT.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ano</label>
                          <select id="saft-year" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mês</label>
                          <select id="saft-month" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                              <option key={i} value={i + 1}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const year = (document.getElementById('saft-year') as HTMLSelectElement).value;
                          const month = (document.getElementById('saft-month') as HTMLSelectElement).value;
                          window.open(`/api/saft/export?year=${year}&month=${month}`, '_blank');
                        }}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                      >
                        Gerar Ficheiro XML <BarChart3 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Excel Migration Section */}
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-2xl text-green-600">
                        <LayoutDashboard size={32} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Migração via Excel</h4>
                        <p className="text-slate-500 text-sm">Importar e exportar dados de alunos e professores.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col gap-3">
                        <h5 className="font-bold text-sm text-slate-700">Exportar Dados</h5>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.open('/api/migration/export/students', '_blank')}
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                          >
                            Alunos (.xlsx)
                          </button>
                          <button 
                            onClick={() => window.open('/api/migration/export/teachers', '_blank')}
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                          >
                            Professores (.xlsx)
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h5 className="font-bold text-sm text-slate-700">Importar Alunos</h5>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept=".xlsx, .xls"
                            id="import-excel"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              const reader = new FileReader();
                              reader.onload = async (evt) => {
                                try {
                                  const bstr = evt.target?.result;
                                  // @ts-ignore
                                  const wb = XLSX.read(bstr, { type: 'binary' });
                                  const wsname = wb.SheetNames[0];
                                  const ws = wb.Sheets[wsname];
                                  // @ts-ignore
                                  const data = XLSX.utils.sheet_to_json(ws);
                                  
                                  const res = await fetch('/api/migration/import/students', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ data })
                                  });
                                  
                                  if (res.ok) {
                                    alert('Alunos importados com sucesso!');
                                    if (currentSchool) selectSchool(currentSchool);
                                  } else {
                                    alert('Erro ao importar alunos.');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Erro ao processar ficheiro Excel.');
                                }
                              };
                              reader.readAsBinaryString(file);
                            }}
                          />
                          <label 
                            htmlFor="import-excel"
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            Selecionar Ficheiro Excel <Plus size={18} />
                          </label>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center italic">O ficheiro deve conter colunas: name, email, guardian_name, etc.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'service_requests' && userRole === 'superadmin' && (
              <motion.div
                key="service_requests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-2xl">Pedidos de Serviço</h3>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">Instituição</th>
                        <th className="px-6 py-4">Contacto</th>
                        <th className="px-6 py-4">Licença</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {serviceRequests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold">{req.name}</td>
                          <td className="px-6 py-4">{req.institution_name}</td>
                          <td className="px-6 py-4">
                            <div className="text-xs">
                              <p className="font-bold">{req.email}</p>
                              <p className="text-slate-500">{req.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                              {req.license_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                              req.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                              req.status === 'scheduled' ? 'bg-indigo-50 text-indigo-600' :
                              'bg-green-50 text-green-600'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => alert(`Agendar reunião com ${req.email}`)}
                              className="text-indigo-600 font-bold text-xs hover:underline"
                            >
                              Agendar Reunião
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-2xl">Minha Conta</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Profile Info */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                        {profileData?.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{profileData?.name}</h4>
                        <p className="text-slate-500">{profileData?.email}</p>
                        <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full mt-2 inline-block">
                          {profileData?.role}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm">Status do Email</p>
                          <p className="text-xs text-slate-500">Confirmação de identidade</p>
                        </div>
                        {profileData?.email_confirmed ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <Check size={14} /> Confirmado
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold text-xs">Pendente</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm">Autenticação de Dois Fatores (MFA)</p>
                          <p className="text-xs text-slate-500">Segurança adicional para sua conta</p>
                        </div>
                        {profileData?.mfa_enabled ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <Shield size={14} /> Ativado
                          </span>
                        ) : (
                          <button 
                            onClick={handleMfaSetup}
                            className="text-indigo-600 font-bold text-xs hover:underline"
                          >
                            Configurar MFA
                          </button>
                        )}
                      </div>
                    </div>

                    {mfaSetup && (
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-sm">Configurar Autenticador</h5>
                          <button onClick={() => setMfaSetup(null)} className="text-slate-400">
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">Escaneie o QR Code abaixo com o Google Authenticator ou similar.</p>
                        <div className="flex justify-center">
                          <img src={mfaSetup.imageUrl} alt="MFA QR Code" className="w-48 h-48 border-4 border-white rounded-xl shadow-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Código de Verificação</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="000000"
                              value={mfaVerifyToken}
                              onChange={e => setMfaVerifyToken(e.target.value)}
                              maxLength={6}
                            />
                            <button 
                              onClick={handleMfaEnable}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700"
                            >
                              Ativar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Change Password */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h4 className="text-xl font-bold">Alterar Senha</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Senha Atual</label>
                        <input 
                          type="password" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                          value={passwordForm.current}
                          onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Nova Senha</label>
                        <input 
                          type="password" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                          value={passwordForm.new}
                          onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Confirmar Nova Senha</label>
                        <input 
                          type="password" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                          value={passwordForm.confirm}
                          onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        />
                      </div>
                      <button 
                        onClick={handleChangePassword}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
                      >
                        Atualizar Senha
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'training' && (
              <motion.div
                key="training"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-2xl">{currentSchool?.license_type === 'training' ? 'Gestão de Certificações' : 'Formação e Certificação'}</h3>
                  {(userRole === 'admin' || userRole === 'superadmin') && currentSchool?.license_type === 'training' && (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setShowCertificationModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2"
                      >
                        <Plus size={20} /> Nova Certificação
                      </button>
                      <button 
                        onClick={() => setShowIssueCertificateModal(true)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2"
                      >
                        <Award size={20} /> Emitir Certificado
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 border-b border-slate-200">
                  <button 
                    onClick={() => setTrainingSubTab('catalog')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${trainingSubTab === 'catalog' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {currentSchool?.license_type === 'training' ? 'Certificações Disponíveis' : 'Catálogo de Cursos'}
                    {trainingSubTab === 'catalog' && <motion.div layoutId="trainingTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                  </button>
                  <button 
                    onClick={() => setTrainingSubTab('my_trainings')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${trainingSubTab === 'my_trainings' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {currentSchool?.license_type === 'training' ? 'Certificados Emitidos' : 'Minhas Formações'}
                    {trainingSubTab === 'my_trainings' && <motion.div layoutId="trainingTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                  </button>
                </div>

                {trainingSubTab === 'catalog' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentSchool?.license_type === 'training' ? (
                      certifications.map((cert, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                            <Award size={24} />
                          </div>
                          <h4 className="font-bold text-lg mb-2">{cert.name}</h4>
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{cert.description}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Clock size={14} /> {cert.duration_hours}h</span>
                            <span className="flex items-center gap-1"><Shield size={14} /> {cert.level}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      [
                        { title: 'Inovação Pedagógica', duration: '40h', level: 'Intermediário', price: 'Grátis' },
                        { title: 'Liderança para Diretores', duration: '60h', level: 'Avançado', price: 'Pago' },
                        { title: 'Tecnologias na Sala de Aula', duration: '30h', level: 'Básico', price: 'Grátis' },
                      ].map((course, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                          </div>
                          <h4 className="font-bold text-lg mb-2">{course.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                            <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                            <span className="flex items-center gap-1"><Award size={14} /> {course.level}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-indigo-600">{course.price}</span>
                            <button className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all">
                              Inscrever-se
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100">
                        <h4 className="font-bold">{currentSchool?.license_type === 'training' ? 'Histórico de Emissões' : 'Formações em Andamento'}</h4>
                        <p className="text-xs text-slate-500">{currentSchool?.license_type === 'training' ? 'Lista de todos os certificados emitidos pelo centro.' : 'Acompanhe seu progresso e prazos de certificação.'}</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {currentSchool?.license_type === 'training' ? (
                          certificates.map(cert => (
                            <div key={cert.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                              <div className="flex-1">
                                <h5 className="font-bold text-slate-900 mb-1">{cert.student_name}</h5>
                                <p className="text-xs text-slate-500 mb-1">{cert.certification_name}</p>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
                                  <span>#{cert.certificate_number}</span>
                                  <span>Emitido em: {new Date(cert.issue_date).toLocaleDateString()}</span>
                                  <span className={`px-2 py-0.5 rounded-full ${cert.template_type === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {cert.template_type}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  cert.status === 'valid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {cert.status}
                                </span>
                                <button 
                                  onClick={() => generateCertificatePDF(cert)}
                                  className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 text-xs font-bold"
                                >
                                  <Plus size={16} /> PDF
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          myTrainings.map(training => (
                            <div key={training.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                              <div className="flex-1">
                                <h5 className="font-bold text-slate-900 mb-1">{training.title}</h5>
                                <p className="text-xs text-slate-500 mb-4">{training.provider}</p>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${training.progress}%` }}
                                    className="h-full bg-indigo-600"
                                  />
                                </div>
                                <div className="flex justify-between mt-2">
                                  <span className="text-[10px] font-bold text-indigo-600">{training.progress}% concluído</span>
                                  <span className="text-[10px] font-bold text-slate-400">Prazo: {training.deadline}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  training.status === 'Próximo da conclusão' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {training.status}
                                </span>
                                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
                                  <Play size={16} fill="currentColor" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modals for Certification */}
                {showCertificationModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold">Nova Certificação</h4>
                        <button onClick={() => setShowCertificationModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                        </button>
                      </div>
                      <form onSubmit={handleCreateCertification} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Certificação</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={certificationForm.name}
                            onChange={e => setCertificationForm({...certificationForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            value={certificationForm.description}
                            onChange={e => setCertificationForm({...certificationForm, description: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Carga Horária (h)</label>
                            <input 
                              type="number" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={certificationForm.duration_hours}
                              onChange={e => setCertificationForm({...certificationForm, duration_hours: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nível</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={certificationForm.level}
                              onChange={e => setCertificationForm({...certificationForm, level: e.target.value})}
                              required
                            >
                              <option value="">Selecione...</option>
                              <option value="Básico">Básico</option>
                              <option value="Intermediário">Intermediário</option>
                              <option value="Avançado">Avançado</option>
                              <option value="Especialista">Especialista</option>
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
                          Criar Certificação
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}

                {showIssueCertificateModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold">Emitir Certificado</h4>
                        <button onClick={() => setShowIssueCertificateModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                        </button>
                      </div>
                      <form onSubmit={handleIssueCertificate} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Aluno</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={issueCertificateForm.student_id}
                            onChange={e => setIssueCertificateForm({...issueCertificateForm, student_id: e.target.value})}
                            required
                          >
                            <option value="">Selecione o Aluno...</option>
                            {(userRole === 'superadmin' ? allStudents : students).map(s => (
                              <option key={s.id} value={s.id}>{s.name} {userRole === 'superadmin' ? `(${s.school_name})` : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Certificação</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={issueCertificateForm.certification_id}
                            onChange={e => setIssueCertificateForm({...issueCertificateForm, certification_id: e.target.value})}
                            required
                          >
                            <option value="">Selecione a Certificação...</option>
                            {certifications.filter(c => {
                              if (userRole !== 'superadmin' || !issueCertificateForm.student_id) return true;
                              const selectedStudent = allStudents.find(s => s.id?.toString() === issueCertificateForm.student_id?.toString());
                              return selectedStudent ? c.school_id === selectedStudent.school_id : true;
                            }).map(c => (
                              <option key={c.id} value={c.id}>{c.name} {userRole === 'superadmin' ? `(${c.school_name || 'Geral'})` : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Data de Emissão</label>
                            <input 
                              type="date" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={issueCertificateForm.issue_date}
                              onChange={e => setIssueCertificateForm({...issueCertificateForm, issue_date: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nota Final</label>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={issueCertificateForm.grade}
                              onChange={e => setIssueCertificateForm({...issueCertificateForm, grade: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Modelo de Certificado</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={issueCertificateForm.template_type}
                            onChange={e => setIssueCertificateForm({...issueCertificateForm, template_type: e.target.value})}
                            required
                          >
                            <option value="standard">Padrão (Standard)</option>
                            <option value="premium">Premium (Reconhecimento Especial)</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg">
                          Emitir Agora
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'user_management' && (userRole === 'admin' || userRole === 'superadmin') && (
              <motion.div
                key="user_management"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-2xl">Gestão de Utilizadores</h3>
                  <div className="flex gap-4">
                    {userRole === 'superadmin' && (
                      <button 
                        onClick={() => setShowGlobalAssignModal(true)}
                        className="bg-brand-green text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2"
                      >
                        <Shield size={20} /> Atribuição Global
                      </button>
                    )}
                    <button 
                      onClick={() => setShowSchoolUserModal(true)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <Plus size={20} /> Atribuir Novo Utilizador
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Vínculo</th>
                        <th className="px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schoolUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{user.name}</td>
                          <td className="px-6 py-4 text-slate-500">{user.email}</td>
                          <td className="px-6 py-4">
                            <select 
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                              className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border-none outline-none cursor-pointer"
                            >
                              <option value="admin">Admin</option>
                              <option value="teacher">Professor</option>
                              <option value="secretary">Secretário</option>
                              <option value="hr">RH</option>
                              <option value="pedagogical">Pedagógico</option>
                              <option value="student">Aluno</option>
                              <option value="parent">Encarregado</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {user.student_id ? (
                              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                                <GraduationCap size={14} /> Aluno #{user.student_id}
                                <button onClick={() => handleUnlinkRecord('student', user.student_id)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                              </div>
                            ) : user.teacher_id ? (
                              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                                <Users size={14} /> Professor #{user.teacher_id}
                                <button onClick={() => handleUnlinkRecord('teacher', user.teacher_id)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => { setSelectedUserForLink(user); setShowLinkRecordModal(true); }}
                                className="text-slate-400 text-xs hover:text-indigo-600 underline"
                              >
                                Vincular Registro
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleDissociateUser(user.id)}
                              className="text-red-600 font-bold text-xs hover:underline"
                            >
                              Desassociar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal: Global Assign (Superadmin only) */}
                {showGlobalAssignModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold">Atribuição Global de Utilizador</h4>
                        <button onClick={() => setShowGlobalAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                        </button>
                      </div>
                      <form onSubmit={handleGlobalAssign} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Utilizador</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={globalAssignForm.userId}
                            onChange={e => setGlobalAssignForm({...globalAssignForm, userId: e.target.value})}
                            required
                          >
                            <option value="">Selecione o Utilizador...</option>
                            {allUsers.map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Escola / Centro</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={globalAssignForm.schoolId}
                            onChange={e => setGlobalAssignForm({...globalAssignForm, schoolId: e.target.value})}
                            required
                          >
                            <option value="">Selecione a Instituição...</option>
                            {allSchools.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.subdomain})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={globalAssignForm.role}
                            onChange={e => setGlobalAssignForm({...globalAssignForm, role: e.target.value})}
                            required
                          >
                            <option value="admin">Admin</option>
                            <option value="teacher">Professor</option>
                            <option value="secretary">Secretário</option>
                            <option value="hr">RH</option>
                            <option value="pedagogical">Pedagógico</option>
                            <option value="student">Aluno</option>
                            <option value="parent">Encarregado</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg">
                          Vincular Globalmente
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
                {showDirectorModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold">Criar Novo Diretor</h4>
                        <button onClick={() => setShowDirectorModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                        </button>
                      </div>
                      
                      <form onSubmit={handleCreateDirector} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Nome</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={directorForm.name}
                            onChange={e => setDirectorForm({...directorForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                          <input 
                            type="email" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={directorForm.email}
                            onChange={e => setDirectorForm({...directorForm, email: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
                          <input 
                            type="password" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={directorForm.password}
                            onChange={e => setDirectorForm({...directorForm, password: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Atribuir Escolas</label>
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                            {schools.map(school => (
                              <label key={school.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={directorForm.schoolIds.includes(school.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setDirectorForm({...directorForm, schoolIds: [...directorForm.schoolIds, school.id]});
                                    } else {
                                      setDirectorForm({...directorForm, schoolIds: directorForm.schoolIds.filter(id => id !== school.id)});
                                    }
                                  }}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                {school.name}
                              </label>
                            ))}
                          </div>
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                        >
                          Criar Diretor
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
                {showSchoolUserModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold">Atribuir Utilizador à Escola</h4>
                        <button onClick={() => setShowSchoolUserModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                        </button>
                      </div>
                      
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {unassignedUsers.length === 0 ? (
                          <p className="text-center text-slate-500 py-8">Nenhum utilizador pendente encontrado.</p>
                        ) : (
                          unassignedUsers.map(user => (
                            <div key={user.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-sm">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                              <div className="flex gap-2">
                                <select 
                                  className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1"
                                  onChange={(e) => handleAssignUser(user.id, e.target.value)}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Atribuir Role...</option>
                                  <option value="student">Aluno</option>
                                  <option value="teacher">Professor</option>
                                  <option value="secretary">Secretária</option>
                                  <option value="hr">RH</option>
                                  <option value="pedagogical">Pedagógico</option>
                                  <option value="parent">Encarregado</option>
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Modal: Link Record */}
                {showLinkRecordModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold">Vincular Registro a {selectedUserForLink?.name}</h4>
                        <button onClick={() => setShowLinkRecordModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Registro</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleLinkRecord(selectedUserForLink.id, 'student', prompt("ID do Aluno:") as any)}
                              className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 font-bold hover:bg-blue-100 transition-all flex flex-col items-center gap-2"
                            >
                              <GraduationCap size={24} />
                              Vincular Aluno
                            </button>
                            <button 
                              onClick={() => handleLinkRecord(selectedUserForLink.id, 'teacher', prompt("ID do Professor:") as any)}
                              className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 font-bold hover:bg-indigo-100 transition-all flex flex-col items-center gap-2"
                            >
                              <Users size={24} />
                              Vincular Professor
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 text-center italic">Nota: Insira o ID numérico do registro correspondente no sistema.</p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'academic_summary' && (userRole === 'admin' || userRole === 'secretary' || userRole === 'pedagogical' || userRole === 'superadmin') && (
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

            {activeTab === 'certificates' && (
              <motion.div
                key="certificates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Certificados Finais</h2>
                    <p className="text-slate-500 text-sm">Emissão de certificados de conclusão de curso.</p>
                  </div>
                  {(userRole === 'admin' || userRole === 'secretary' || userRole === 'superadmin') && (
                    <button 
                      onClick={() => setShowIssueCertificateModal(true)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                    >
                      <Award size={20} /> Emitir Novo Certificado
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg">Histórico de Emissões</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Aluno</th>
                          <th className="px-6 py-4">Certificação</th>
                          <th className="px-6 py-4">Data Emissão</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {certificates.length > 0 ? certificates.map((cert, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{cert.student_name}</div>
                              {userRole === 'superadmin' && <div className="text-[10px] text-slate-400">{cert.school_name}</div>}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{cert.certification_name}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{new Date(cert.issue_date).toLocaleDateString('pt-AO')}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Válido</span>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => generateCertificatePDF(cert)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1"
                              >
                                <RefreshCw size={14} /> Download
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Nenhum certificado emitido ainda.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'migration' && (
              <motion.div
                key="migration"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center max-w-2xl mx-auto">
                  <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                    <FileText size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Migração e Exportação SAF-T</h2>
                  <p className="text-slate-500 mb-8">Exporte os dados fiscais da sua instituição no formato SAF-T AO para conformidade com a AGT.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button className="p-4 border border-slate-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group">
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600">Exportar SAF-T</h4>
                      <p className="text-xs text-slate-500">Gerar arquivo XML padrão AGT.</p>
                    </button>
                    <button className="p-4 border border-slate-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group">
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600">Importar Dados</h4>
                      <p className="text-xs text-slate-500">Migrar alunos de arquivo Excel.</p>
                    </button>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-left">
                    <div className="flex gap-3">
                      <AlertCircle className="text-amber-600 shrink-0" size={20} />
                      <p className="text-xs text-amber-800">
                        Certifique-se de que todos os dados bancários e fiscais da escola estão configurados corretamente antes de gerar o SAF-T.
                      </p>
                    </div>
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
                {/* Dev Role Switcher in Dashboard */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 bg-brand-green/5 border border-brand-green/10 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-green/10 p-2 rounded-lg text-brand-green shrink-0">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-green">Modo de Teste de Roles</p>
                        <p className="text-xs text-slate-600">Troque rapidamente o papel do usuário para testar permissões.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      {['admin', 'teacher', 'secretary', 'hr', 'pedagogical', 'student', 'parent'].map(role => (
                        <button 
                          key={role}
                          onClick={() => setUserRole(role as any)}
                          className={`flex-1 md:flex-none px-3 py-2 md:py-1 text-[10px] font-bold rounded-lg transition-all border text-center ${
                            userRole === role 
                              ? 'bg-brand-green text-white border-brand-green shadow-sm' 
                              : 'bg-white text-brand-green border-brand-green/20 hover:bg-brand-green/5'
                          }`}
                        >
                          {role.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(userRole === 'admin' || userRole === 'teacher' || userRole === 'student' || userRole === 'superadmin') && (
                    <button 
                      onClick={() => {
                        alert("Iniciando sincronização com Google Classroom...");
                        // Mock Google Classroom Sync
                      }}
                      className="bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm group"
                    >
                      <img src="https://www.gstatic.com/classroom/logo_square_48.png" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" alt="Google Classroom" />
                      <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">Integração Google</p>
                        <p className="text-sm">Sincronizar com Classroom</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Role-Based Dashboard Components */}
                {userRole === 'superadmin' && (
                  <SuperAdminDashboard 
                    systemStats={systemStats} 
                    schools={schools} 
                    onAction={(action) => {
                      if (action === 'issue_certificate') {
                        setShowIssueCertificateModal(true);
                        setActiveTab('certificates');
                      } else if (action === 'view_certificates') {
                        setActiveTab('certificates');
                      } else if (action === 'manage_schools') {
                        setActiveTab('superadmin');
                      } else if (action === 'school_settings') {
                        setActiveTab('school_settings');
                      }
                    }}
                  />
                )}
                {userRole === 'admin' && <AdminDashboard stats={stats} financialSummary={financialSummary} licenseType={currentSchool?.license_type} />}
                {userRole === 'unassigned' && (
                  <div className="bg-white p-12 rounded-[32px] border border-slate-100 shadow-xl text-center max-w-2xl mx-auto mt-12">
                    <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600">
                      <Clock size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Aguardando Aprovação</h2>
                    <p className="text-slate-500 text-lg leading-relaxed mb-8">
                      Sua conta foi criada com sucesso! Por motivos de segurança, um administrador precisa revisar e aprovar seu acesso antes que você possa utilizar todas as funcionalidades do sistema.
                    </p>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block">
                      <p className="text-sm font-bold text-slate-700">Status: <span className="text-amber-600 uppercase tracking-widest ml-2">Pendente</span></p>
                    </div>
                  </div>
                )}
                {userRole === 'teacher' && <TeacherDashboard />}
                {userRole === 'student' && <StudentDashboard />}
                {userRole === 'parent' && <ParentDashboard />}
                {userRole === 'secretary' && <SecretaryDashboard />}
                {userRole === 'hr' && <HRDashboard stats={stats} />}
                {userRole === 'pedagogical' && <PedagogicalDashboard stats={stats} subjectsCount={subjects.length} />}
              </motion.div>
            )}

            {activeTab === 'financial' && (
              <motion.div
                key="financial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <FinancialDashboard summary={financialSummary} />

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-xl text-slate-900 tracking-tight">Faturas Recentes</h3>
                    <button className="text-indigo-600 font-bold text-sm hover:underline">Ver Todas</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <th className="px-8 py-5">Aluno</th>
                          <th className="px-8 py-5">Valor</th>
                          <th className="px-8 py-5">Vencimento</th>
                          <th className="px-8 py-5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoices.length > 0 ? invoices.map((invoice, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 font-bold text-slate-900">{invoice.student_name}</td>
                            <td className="px-8 py-5 text-sm font-medium">{invoice.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">{invoice.due_date}</td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic">
                              Nenhuma fatura encontrada.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-xl text-slate-900 tracking-tight">Pagamentos Recebidos</h3>
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={20} /></button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Filter size={20} /></button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <th className="px-8 py-5">Método</th>
                          <th className="px-8 py-5">Valor</th>
                          <th className="px-8 py-5">Data</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.length > 0 ? payments.map((pay, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 font-bold text-slate-900">{pay.method}</td>
                            <td className="px-8 py-5 text-sm font-medium text-emerald-600">{pay.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">{new Date(pay.created_at).toLocaleString('pt-AO')}</td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                pay.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {pay.status === 'completed' ? 'Confirmado' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <button 
                                onClick={() => generateReceiptPDF(pay)}
                                className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                              >
                                <FileText size={16} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic">
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
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Histórico de Notificações</h3>
                    {(userRole === 'admin' || userRole === 'superadmin' || userRole === 'secretary') && (
                      <button 
                        onClick={() => setShowNotificationModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Nova Notificação
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Destinatário</th>
                          <th className="px-6 py-4">Mensagem</th>
                          <th className="px-6 py-4">Método</th>
                          <th className="px-6 py-4">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {notifications.length > 0 ? notifications.map((notif, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{notif.user_name || 'Turma Inteira'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{notif.message}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">{notif.method || 'Sistema'}</span>
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
                </div>

                {showNotificationModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                      <h3 className="text-2xl font-bold mb-6">Enviar Notificação</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Tipo de Envio</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                            value={notificationType}
                            onChange={e => setNotificationType(e.target.value as 'individual' | 'class')}
                          >
                            <option value="individual">Individual</option>
                            <option value="class">Por Turma</option>
                          </select>
                        </div>

                        {notificationType === 'individual' ? (
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Destinatário</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                              value={newNotification.user_id}
                              onChange={e => setNewNotification({...newNotification, user_id: e.target.value})}
                            >
                              <option value="">Selecionar Aluno/Professor</option>
                              <optgroup label="Alunos">
                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </optgroup>
                              <optgroup label="Professores">
                                {teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.name}</option>)}
                              </optgroup>
                            </select>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Turma</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                              value={selectedClassId}
                              onChange={e => setSelectedClassId(e.target.value)}
                            >
                              <option value="">Selecionar Turma</option>
                              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Método</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                            value={newNotification.method}
                            onChange={e => setNewNotification({...newNotification, method: e.target.value})}
                          >
                            <option value="system">Apenas Sistema</option>
                            <option value="email">Apenas E-mail</option>
                            <option value="both">Ambos</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Mensagem</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[100px]"
                            value={newNotification.message}
                            onChange={e => setNewNotification({...newNotification, message: e.target.value})}
                            placeholder="Escreva a mensagem aqui..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button onClick={() => setShowNotificationModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button 
                          onClick={async () => {
                            if (!newNotification.message) {
                              showMessage("A mensagem é obrigatória", "error");
                              return;
                            }
                            const endpoint = notificationType === 'individual' ? '/api/notifications/send' : '/api/notifications/send-class';
                            const body = notificationType === 'individual' 
                              ? newNotification 
                              : { class_id: selectedClassId, message: newNotification.message, method: newNotification.method };

                            try {
                              const res = await fetch(endpoint, {
                                method: 'POST',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  'x-school-subdomain': currentSchool?.subdomain || ''
                                },
                                body: JSON.stringify(body)
                              });
                              if (res.ok) {
                                showMessage("Notificação enviada!", "success");
                                setShowNotificationModal(false);
                                setNewNotification({ user_id: '', message: '', type: 'info', method: 'system' });
                                if (currentSchool) selectSchool(currentSchool);
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }} 
                          className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                        >
                          Enviar
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'academic' && (userRole === 'admin' || userRole === 'secretary' || userRole === 'pedagogical' || userRole === 'superadmin') && (
              <motion.div
                key="academic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-2xl font-bold mb-6">Serviço Académico</h3>
                  <p className="text-slate-500 mb-8">Gestão centralizada de currículos, turmas e desempenho escolar.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="font-bold mb-2">Estrutura Curricular</h4>
                      <p className="text-sm text-slate-500 mb-4">Gerencie as disciplinas e planos de estudo da instituição.</p>
                      <button onClick={() => setActiveTab('subjects')} className="text-indigo-600 font-bold text-sm hover:underline">Ir para Disciplinas</button>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="font-bold mb-2">Turmas e Horários</h4>
                      <p className="text-sm text-slate-500 mb-4">Organize a distribuição de alunos e professores por salas.</p>
                      <button onClick={() => setActiveTab('classes')} className="text-indigo-600 font-bold text-sm hover:underline">Ir para Turmas</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'classes' && (userRole === 'admin' || userRole === 'teacher' || userRole === 'superadmin') && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Gestão Académica</h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setEditingClass(null);
                        setClassForm({ name: '', grade_level: '', teacher_id: '', pedagogical_id: '', director_id: '' });
                        setShowClassModal(true);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Nova Turma
                    </button>
                  </div>
                </div>

                {showClassModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                      <h3 className="text-2xl font-bold mb-6">{editingClass ? 'Editar Turma' : 'Criar Turma'}</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Nome da Turma</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={classForm.name}
                            onChange={e => setClassForm({...classForm, name: e.target.value})}
                            placeholder="Ex: 10ª A"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Nível / Classe</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={classForm.grade_level}
                            onChange={e => setClassForm({...classForm, grade_level: e.target.value})}
                            placeholder="Ex: 10ª Classe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Professor Titular</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={classForm.teacher_id}
                            onChange={e => setClassForm({...classForm, teacher_id: e.target.value})}
                          >
                            <option value="">Nenhum</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Coordenador Pedagógico</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={classForm.pedagogical_id}
                            onChange={e => setClassForm({...classForm, pedagogical_id: e.target.value})}
                          >
                            <option value="">Nenhum</option>
                            {pedagogicalUsers.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Director de Turma</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={classForm.director_id}
                            onChange={e => setClassForm({...classForm, director_id: e.target.value})}
                          >
                            <option value="">Nenhum</option>
                            {directors.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button onClick={() => setShowClassModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button onClick={handleSaveClass} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700">Salvar</button>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Classes List */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg">Turmas</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {classes.map((cls, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold">{cls.name}</p>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">{cls.grade_level}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                              <div className="text-[10px] text-slate-400">
                                <p className="font-bold uppercase">Professor</p>
                                <p className="text-slate-600 truncate">{teachers.find(t => t.id === cls.teacher_id)?.name || 'N/A'}</p>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                <p className="font-bold uppercase">Pedagógico</p>
                                <p className="text-slate-600 truncate">{pedagogicalUsers.find(u => u.id === cls.pedagogical_id)?.name || 'N/A'}</p>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                <p className="font-bold uppercase">Director</p>
                                <p className="text-slate-600 truncate">{directors.find(u => u.id === cls.director_id)?.name || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setEditingClass(cls);
                              setClassForm({
                                name: cls.name,
                                grade_level: cls.grade_level,
                                teacher_id: cls.teacher_id || '',
                                pedagogical_id: cls.pedagogical_id || '',
                                director_id: cls.director_id || ''
                              });
                              setShowClassModal(true);
                            }}
                            className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Settings size={18} />
                          </button>
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
                          <th className="px-6 py-4">Professor</th>
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
                            <td className="px-6 py-4 text-sm">{sch.teacher_name || 'N/A'}</td>
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
                      <button 
                        onClick={() => {
                          setEditingGrade(null);
                          setGradeForm({ student_id: '', subject: '', score1: '', score2: '', score3: '' });
                          setShowGradeModal(true);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap"
                      >
                        Lançar Notas
                      </button>
                    )}
                  </div>
                </div>

                {showGradeModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                      <h3 className="text-2xl font-bold mb-6">{editingGrade ? 'Editar Notas' : 'Lançar Notas'}</h3>
                      <div className="space-y-4">
                        {!editingGrade && (
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Aluno</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={gradeForm.student_id}
                              onChange={e => setGradeForm({...gradeForm, student_id: e.target.value})}
                            >
                              <option value="">Selecionar Aluno</option>
                              {students.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Disciplina</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={gradeForm.subject}
                            onChange={e => setGradeForm({...gradeForm, subject: e.target.value})}
                          >
                            <option value="">Selecionar Disciplina</option>
                            {subjects.map((s: any) => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">1º Trim</label>
                            <input 
                              type="number" 
                              step="0.1"
                              min="0"
                              max="20"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={gradeForm.score1}
                              onChange={e => setGradeForm({...gradeForm, score1: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">2º Trim</label>
                            <input 
                              type="number" 
                              step="0.1"
                              min="0"
                              max="20"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={gradeForm.score2}
                              onChange={e => setGradeForm({...gradeForm, score2: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">3º Trim</label>
                            <input 
                              type="number" 
                              step="0.1"
                              min="0"
                              max="20"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={gradeForm.score3}
                              onChange={e => setGradeForm({...gradeForm, score3: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Média Final Prevista</p>
                          <p className="text-2xl font-black text-indigo-700">
                            {((parseFloat(gradeForm.score1) || 0) + (parseFloat(gradeForm.score2) || 0) + (parseFloat(gradeForm.score3) || 0) / 3).toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button 
                          onClick={() => setShowGradeModal(false)}
                          className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleSaveGrade}
                          className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                        >
                          Salvar
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Aluno</th>
                        <th className="px-6 py-4">Disciplina</th>
                        <th className="px-6 py-4">1º Trim</th>
                        <th className="px-6 py-4">2º Trim</th>
                        <th className="px-6 py-4">3º Trim</th>
                        <th className="px-6 py-4">Média Final</th>
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
                          <td className="px-6 py-4 text-sm text-slate-500">{grade.score1?.toFixed(1) || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{grade.score2?.toFixed(1) || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{grade.score3?.toFixed(1) || '-'}</td>
                          <td className="px-6 py-4 font-bold text-indigo-600">{grade.score?.toFixed(1) || '-'}</td>
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
                                <button 
                                  onClick={() => {
                                    setEditingGrade(grade);
                                    setGradeForm({
                                      student_id: grade.student_id?.toString() || '',
                                      subject: grade.subject,
                                      score1: grade.score1?.toString() || '',
                                      score2: grade.score2?.toString() || '',
                                      score3: grade.score3?.toString() || ''
                                    });
                                    setShowGradeModal(true);
                                  }}
                                  className="text-indigo-600 hover:underline text-xs font-bold"
                                >
                                  Editar
                                </button>
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
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        fetch('/api/auth/admin/users', {
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        }).then(res => res.json()).then(data => setAdminUsers(data));
                        setShowUserManagement(true);
                      }}
                      className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg"
                    >
                      Gerir Utilizadores
                    </button>
                    <button 
                      onClick={() => setShowSchoolModal(true)}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      + Nova Escola
                    </button>
                  </div>
                </div>

                {showUserManagement && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg">Gestão de Utilizadores (Suporte)</h3>
                      <button onClick={() => setShowUserManagement(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Escola</th>
                            <th className="px-6 py-4">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {adminUsers.map((u: any) => (
                            <tr key={u.id}>
                              <td className="px-6 py-4 font-medium">{u.name}</td>
                              <td className="px-6 py-4 text-sm">{u.email}</td>
                              <td className="px-6 py-4 text-sm uppercase font-bold text-slate-400">{u.role}</td>
                              <td className="px-6 py-4 text-sm">{u.school_name || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <button 
                                  onClick={async () => {
                                    const newPass = prompt("Insira a nova senha temporária (válida por 24h):");
                                    if (newPass) {
                                      const res = await fetch('/api/auth/admin/reset-password', {
                                        method: 'POST',
                                        headers: { 
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        },
                                        body: JSON.stringify({ userId: u.id, newPassword: newPass })
                                      });
                                      const data = await res.json();
                                      alert(data.message);
                                    }
                                  }}
                                  className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1"
                                >
                                  <Key size={12} /> Reset Temporário
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

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
                          <label className="text-sm font-bold text-slate-700">Tipo de Licença</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSchool.license_type}
                            onChange={e => setNewSchool({...newSchool, license_type: e.target.value})}
                          >
                            <option value="student">Por Aluno</option>
                            <option value="institution">Institucional</option>
                            <option value="hybrid">Híbrida</option>
                            <option value="modular">Modular</option>
                            <option value="freemium">Freemium</option>
                            <option value="premium">Premium</option>
                            <option value="offline">Offline (Pay-per-Sync)</option>
                            <option value="training">Centro de Formação</option>
                          </select>
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

                        <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                          <h4 className="font-bold text-slate-900 mb-4">Recursos de Gestão</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newSchool.classes_enabled}
                              onChange={e => setNewSchool({...newSchool, classes_enabled: e.target.checked})}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Gestão de Turmas</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newSchool.grades_enabled}
                              onChange={e => setNewSchool({...newSchool, grades_enabled: e.target.checked})}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Notas</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newSchool.teachers_enabled}
                              onChange={e => setNewSchool({...newSchool, teachers_enabled: e.target.checked})}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Professores</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newSchool.vacations_enabled}
                              onChange={e => setNewSchool({...newSchool, vacations_enabled: e.target.checked})}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Férias</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newSchool.certificates_enabled}
                              onChange={e => setNewSchool({...newSchool, certificates_enabled: e.target.checked})}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Certificados</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newSchool.financial_enabled}
                              onChange={e => setNewSchool({...newSchool, financial_enabled: e.target.checked})}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Financeiro</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newSchool.migration_enabled}
                              onChange={e => setNewSchool({...newSchool, migration_enabled: e.target.checked})}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Migração e Export</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newSchool.payments_enabled}
                              onChange={e => setNewSchool({...newSchool, payments_enabled: e.target.checked})}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Pagamentos</span>
                          </label>
                        </div>

                        {!editingSchoolId && (
                          <>
                            <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                              <h4 className="font-bold text-slate-900 mb-4">Administrador Inicial (Opcional)</h4>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Nome do Admin</label>
                              <input 
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newSchool.adminName}
                                onChange={e => setNewSchool({...newSchool, adminName: e.target.value})}
                                placeholder="Nome completo"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Email do Admin</label>
                              <input 
                                type="email" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newSchool.adminEmail}
                                onChange={e => setNewSchool({...newSchool, adminEmail: e.target.value})}
                                placeholder="email@exemplo.com"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-bold text-slate-700">Senha do Admin</label>
                              <input 
                                type="password" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newSchool.adminPassword}
                                onChange={e => setNewSchool({...newSchool, adminPassword: e.target.value})}
                                placeholder="Senha segura"
                              />
                            </div>
                          </>
                        )}
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
                                    license_type: school.license_type || 'institution',
                                    license_status: school.license_status || 'active',
                                    license_expiry: school.license_expiry || '',
                                    classes_enabled: school.classes_enabled ?? true,
                                    grades_enabled: school.grades_enabled ?? true,
                                    teachers_enabled: school.teachers_enabled ?? true,
                                    vacations_enabled: school.vacations_enabled ?? true,
                                    certificates_enabled: school.certificates_enabled ?? true,
                                    financial_enabled: school.financial_enabled ?? true,
                                    migration_enabled: school.migration_enabled ?? true,
                                    payments_enabled: school.payments_enabled ?? true
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
                                onClick={() => handleSuperAdminResetPassword(user.id)}
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

            {activeTab === 'settings' && (userRole === 'admin' || userRole === 'superadmin') && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Configurações e Gestão de Dados</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Database size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Backup e Exportação</h4>
                        <p className="text-sm text-slate-500">Exporte todos os dados da escola para um arquivo JSON.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleExportData}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Exportar Dados (JSON)
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Upload size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Importação de Dados</h4>
                        <p className="text-sm text-slate-500">Importe dados de um arquivo JSON de backup.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowDataModal(true)}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={18} />
                      Importar Dados (JSON)
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Download size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Exportação SAFT-AO</h4>
                        <p className="text-sm text-slate-500">Gere o arquivo SAFT para submissão à AGT.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none"
                        value={saftYear}
                        onChange={e => setSaftYear(parseInt(e.target.value))}
                      >
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select 
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none"
                        value={saftMonth}
                        onChange={e => setSaftMonth(parseInt(e.target.value))}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <button 
                      onClick={handleExportSAFT}
                      className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Gerar SAFT-AO
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Database size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Gestão Excel</h4>
                        <p className="text-sm text-slate-500">Importe ou exporte listas de alunos e professores.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={() => handleExportExcel('students')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Exportar Alunos (Excel)
                      </button>
                      <button 
                        onClick={() => handleExportExcel('teachers')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Exportar Professores (Excel)
                      </button>
                    </div>
                  </div>
                </div>

                {showDataModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                      <h3 className="text-2xl font-bold mb-6 text-red-600">Atenção!</h3>
                      <p className="text-slate-600 mb-6">
                        A importação de dados substituirá todas as informações atuais da escola (alunos, professores, turmas, etc.) pelas informações contidas no arquivo. Esta ação não pode ser desfeita.
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Arquivo JSON</label>
                          <input 
                            type="file" 
                            accept=".json"
                            onChange={e => setImportFile(e.target.files?.[0] || null)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button onClick={() => setShowDataModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button onClick={handleImportData} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700">Confirmar Importação</button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
            {activeTab === 'payments' && (
              <motion.div
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

            {activeTab === 'teachers' && (userRole === 'admin' || userRole === 'secretary' || userRole === 'hr' || userRole === 'superadmin') && (
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
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Telefone</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={newTeacher.phone}
                              onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})}
                              placeholder="9xx xxx xxx"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">BI</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={newTeacher.bi}
                              onChange={e => setNewTeacher({...newTeacher, bi: e.target.value})}
                              placeholder="00xxxxxxLAxxx"
                            />
                          </div>
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
                        <th className="px-6 py-4 text-center">Telefone / BI</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers.map((t, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{t.name}</td>
                          <td className="px-6 py-4 text-sm">{t.specialization}</td>
                          <td className="px-6 py-4 text-sm text-center">
                            <div className="flex flex-col">
                              <span className="font-bold">{t.phone || 'N/A'}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{t.bi || 'BI não registado'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{t.email}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => {
                                setEditingTeacherId(t.teacher_id);
                                setNewTeacher({
                                  name: t.name,
                                  email: t.email,
                                  specialization: t.specialization || '',
                                  hire_date: t.hire_date || '',
                                  phone: t.phone || '',
                                  bi: t.bi || ''
                                });
                                setShowTeacherModal(true);
                              }}
                              className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors text-sm font-bold"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'subjects' && (userRole === 'admin' || userRole === 'secretary' || userRole === 'pedagogical' || userRole === 'superadmin') && (
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
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Turma</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSubject.class_id}
                            onChange={e => setNewSubject({...newSubject, class_id: e.target.value})}
                          >
                            <option value="">Selecionar Turma</option>
                            {classes.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Professor</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSubject.teacher_id}
                            onChange={e => setNewSubject({...newSubject, teacher_id: e.target.value})}
                          >
                            <option value="">Selecionar Professor</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
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
                      <div className="mt-4 pt-4 border-t border-slate-50 space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Turma: <span className="text-slate-600">{classes.find(c => c.id === s.class_id)?.name || 'N/A'}</span></p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Professor: <span className="text-slate-600">{teachers.find(t => t.id === s.teacher_id)?.name || 'N/A'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'schedules' && (userRole === 'admin' || userRole === 'secretary' || userRole === 'hr' || userRole === 'pedagogical' || userRole === 'superadmin') && (
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
                        <th className="px-6 py-4">Professor</th>
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
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">{s.teacher_name || 'N/A'}</td>
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

            {activeTab === 'vacations' && (userRole === 'admin' || userRole === 'secretary' || userRole === 'hr' || userRole === 'superadmin' || userRole === 'teacher' || userRole === 'pedagogical') && (
              <motion.div
                key="vacations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Gestão de Licenças e Ausências</h3>
                  {(userRole !== 'superadmin' && userRole !== 'admin') && (
                    <button 
                      onClick={() => {
                        setNewVacation({ ...newVacation, user_id: currentUser?.id?.toString() || '' });
                        setShowVacationModal(true);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Solicitar Licença
                    </button>
                  )}
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
                        {(userRole === 'admin' || userRole === 'superadmin' || userRole === 'secretary' || userRole === 'hr') && (
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Colaborador / Aluno</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={newVacation.user_id}
                              onChange={e => setNewVacation({...newVacation, user_id: e.target.value})}
                            >
                              <option value="">Selecionar Pessoa</option>
                              <optgroup label="Professores">
                                {teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.name}</option>)}
                              </optgroup>
                              <optgroup label="Alunos">
                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </optgroup>
                            </select>
                          </div>
                        )}
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
                          <label className="text-sm font-bold text-slate-700">Tipo de Licença</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newVacation.type}
                            onChange={e => setNewVacation({...newVacation, type: e.target.value})}
                          >
                            <option value="Férias">Férias</option>
                            <option value="Licença Médica">Licença Médica</option>
                            <option value="Maternidade/Paternidade">Maternidade/Paternidade</option>
                            <option value="Luto">Luto</option>
                            <option value="Casamento">Casamento</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button onClick={() => setShowVacationModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button onClick={handleAddVacation} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700">Enviar Solicitação</button>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Solicitante</th>
                        <th className="px-6 py-4">Cargo</th>
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
                          <td className="px-6 py-4 text-xs font-bold uppercase text-slate-400">{v.requested_by_role || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm">{new Date(v.start_date).toLocaleDateString()} - {new Date(v.end_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">{v.type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                              v.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' :
                              v.status === 'Rejeitado' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {v.status === 'Pendente' && (userRole === 'admin' || userRole === 'superadmin' || (userRole === 'pedagogical' && v.requested_by_role !== 'student')) && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleUpdateLicenseStatus(v.id, 'Aprovado')}
                                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                  title="Aprovar"
                                >
                                  <Check size={16} />
                                </button>
                                <button 
                                  onClick={() => handleUpdateLicenseStatus(v.id, 'Rejeitado')}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Rejeitar"
                                >
                                  <X size={16} />
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

            {activeTab === 'students' && (userRole === 'admin' || userRole === 'secretary' || userRole === 'superadmin') && (
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

  return (
    <>
      {content}
      
      {/* Feedback Messages */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="font-bold">{feedback.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Alert */}
      <AnimatePresence>
        {showCookieAlert && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-slate-100 p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Privacidade e Cookies</p>
                <p className="text-sm text-slate-500">Utilizamos cookies para melhorar sua experiência e garantir a segurança do sistema Kulonga.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowPrivacy(true)}
                className="text-sm font-bold text-slate-500 hover:text-indigo-600"
              >
                Política de Privacidade
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('cookieConsent', 'true');
                  setShowCookieAlert(false);
                }}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Aceitar Todos
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms and Privacy Modals */}
      <AnimatePresence>
        {(showTerms || showPrivacy) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-900">
                  {showTerms ? 'Termos de Uso' : 'Política de Privacidade'}
                </h3>
                <button 
                  onClick={() => { setShowTerms(false); setShowPrivacy(false); }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto text-slate-600 space-y-6">
                {showTerms ? (
                  <>
                    <p className="font-bold text-slate-900">1. Aceitação dos Termos</p>
                    <p>Ao acessar o Kulonga, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis.</p>
                    <p className="font-bold text-slate-900">2. Uso de Licença</p>
                    <p>É concedida permissão para baixar temporariamente uma cópia dos materiais no site Kulonga apenas para visualização transitória pessoal e não comercial.</p>
                    <p className="font-bold text-slate-900">3. Isenção de Responsabilidade</p>
                    <p>Os materiais no site do Kulonga são fornecidos 'como estão'. O Kulonga não oferece garantias, expressas ou implícitas.</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-900">1. Coleta de Dados</p>
                    <p>Coletamos informações necessárias para a gestão escolar, incluindo dados de alunos, professores e responsáveis, sempre em conformidade com a Lei de Proteção de Dados de Angola.</p>
                    <p className="font-bold text-slate-900">2. Segurança</p>
                    <p>Implementamos medidas rigorosas de segurança, incluindo criptografia, MFA e políticas de senha complexas para proteger seus dados contra acesso não autorizado.</p>
                    <p className="font-bold text-slate-900">3. Seus Direitos</p>
                    <p>Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações da sua conta ou suporte.</p>
                  </>
                )}
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => { setShowTerms(false); setShowPrivacy(false); }}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
