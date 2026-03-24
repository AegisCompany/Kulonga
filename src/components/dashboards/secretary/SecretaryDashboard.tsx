import React from 'react';
import { motion } from 'motion/react';
import { Users, BarChart3, BookOpen, Bell, ChevronRight } from 'lucide-react';

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

const SecretaryDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Novas Matrículas" value="12" icon={Users} color="bg-brand-blue" />
        <StatCard label="Faturas Pendentes" value="45" icon={BarChart3} color="bg-red-500" />
        <StatCard label="Docs Pendentes" value="8" icon={BookOpen} color="bg-brand-orange" />
        <StatCard label="Notificações" value="15" icon={Bell} color="bg-brand-green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6 text-brand-green">Frequência Geral</h3>
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
          <h3 className="font-bold text-lg mb-6 text-brand-green">Avisos e Eventos</h3>
          <div className="space-y-4">
            {[
              { title: 'Reunião de Pais', time: '09:00', date: 'Amanhã', color: 'bg-brand-blue' },
              { title: 'Prova de Matemática', time: '14:30', date: '28 Fev', color: 'bg-red-500' },
              { title: 'Feira de Ciências', time: '08:00', date: '05 Mar', color: 'bg-brand-orange' },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className={`w-2 h-10 rounded-full ${event.color}`}></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold group-hover:text-brand-green transition-colors">{event.title}</h4>
                  <p className="text-xs text-slate-500">{event.time} • {event.date}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-brand-green hover:bg-brand-green/5 rounded-xl transition-colors">
            Ver Calendário Completo
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
