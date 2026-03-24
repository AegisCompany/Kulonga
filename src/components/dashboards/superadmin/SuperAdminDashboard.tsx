import React from 'react';
import { motion } from 'motion/react';
import { School as SchoolIcon, Users, GraduationCap, Settings, Shield, ChevronRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: any;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className={`${color} p-4 rounded-2xl text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-bold">{label}</p>
        <h4 className="text-2xl font-black">{value}</h4>
      </div>
    </div>
  </div>
);

interface SuperAdminDashboardProps {
  systemStats: any;
  schools: any[];
  onAction?: (action: string) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ systemStats, schools, onAction }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Escolas" value={systemStats?.totalSchools?.toString() || '0'} icon={SchoolIcon} color="bg-brand-blue" />
        <StatCard label="Total Usuários" value={systemStats?.totalUsers?.toString() || '0'} icon={Users} color="bg-brand-green" />
        <StatCard label="Total Alunos" value={systemStats?.totalStudents?.toString() || '0'} icon={GraduationCap} color="bg-brand-orange" />
        <StatCard label="Uptime Sistema" value={systemStats?.uptime || '99.9%'} icon={Settings} color="bg-slate-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-brand-orange/10 p-3 rounded-xl text-brand-orange">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-lg text-brand-green">Gestão de Certificados</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">Emita e gerencie certificados para qualquer aluno da rede Kulonga.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => onAction?.('issue_certificate')}
              className="flex-1 py-2 text-sm font-bold bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              Emitir Certificado
            </button>
            <button 
              onClick={() => onAction?.('view_certificates')}
              className="flex-1 py-2 text-sm font-bold border border-brand-orange text-brand-orange rounded-xl hover:bg-brand-orange/5 transition-colors"
            >
              Ver Histórico
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-brand-blue/10 p-3 rounded-xl text-brand-blue">
              <SchoolIcon size={24} />
            </div>
            <h3 className="font-bold text-lg text-brand-green">Centros de Formação</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">Gerencie instituições focadas em formação profissional e certificações.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => onAction?.('manage_schools')}
              className="flex-1 py-2 text-sm font-bold bg-brand-blue text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Listar Centros
            </button>
            <button 
              onClick={() => onAction?.('school_settings')}
              className="flex-1 py-2 text-sm font-bold border border-brand-blue text-brand-blue rounded-xl hover:bg-brand-blue/5 transition-colors"
            >
              Configurações
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-brand-green">Crescimento da Rede (Escolas)</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[65, 85, 75, 90, 80, 95, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-slate-100 rounded-t-lg relative group"
                >
                  <div className="absolute inset-0 bg-brand-blue rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
                <span className="text-xs text-slate-400 font-medium">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6 text-brand-green">Escolas Recentes</h3>
          <div className="space-y-4">
            {schools.slice(0, 5).map((school, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <SchoolIcon size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold group-hover:text-brand-blue transition-colors">{school.name}</h4>
                  <p className="text-xs text-slate-500">{school.subdomain}.kulonga.com</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-colors">
            Gerenciar Todas as Escolas
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
