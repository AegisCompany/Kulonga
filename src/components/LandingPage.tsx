import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Shield, 
  Globe, 
  Users, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  LayoutGrid, 
  Layers, 
  UserPlus, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Handshake,
  CloudOff,
  RefreshCw,
  Award,
  Lock,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Bot
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onShowTerms?: () => void;
  onShowPrivacy?: () => void;
  showMessage: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onShowTerms, onShowPrivacy, showMessage }) => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [requestForm, setRequestForm] = useState({
    name: '',
    institution_name: '',
    email: '',
    phone: '',
    license_type: 'student',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [show360Menu, setShow360Menu] = useState(false);

  const links360 = [
    { name: 'Documentação', url: '/docs.html' },
    { name: 'Suporte Técnico', url: '/support.html' },
    { name: 'Academy', url: '/academy.html' },
    { name: 'Ambiente Demo', url: '/demo.html' },
    { name: 'Relatórios', url: '/report.html' },
    { name: 'Comunidade', url: '/community.html' },
    { name: 'Eventos', url: '/events.html' },
    { name: 'Parceiros', url: '/partners.html' },
    { name: 'Segurança', url: '/secure.html' },
  ];

  const slides = [
    {
      title: "DE ANGOLA, PARA ANGOLA",
      subtitle: "FEITO POR ANGOLANOS",
      description: "A plataforma de gestão escolar definitiva, desenvolvida com a realidade das nossas instituições em mente.",
      image: "https://picsum.photos/seed/angola1/1200/600"
    },
    {
      title: "Soberania de Dados",
      subtitle: "HOSPEDADO EM ANGOLA",
      description: "Seus dados privados nunca saem do país. Segurança e conformidade com as leis locais.",
      image: "https://picsum.photos/seed/angola2/1200/600"
    },
    {
      title: "Educação do Futuro",
      subtitle: "TECNOLOGIA DE PONTA",
      description: "Transforme a gestão da sua escola com ferramentas modernas e intuitivas.",
      image: "https://picsum.photos/seed/angola3/1200/600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm)
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setRequestForm({
          name: '',
          institution_name: '',
          email: '',
          phone: '',
          license_type: 'student',
          message: ''
        });
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const schools = [
    { name: "Escola Central", logo: "https://picsum.photos/seed/logo1/100/100" },
    { name: "Colégio Avançado", logo: "https://picsum.photos/seed/logo2/100/100" },
    { name: "Instituto Moderno", logo: "https://picsum.photos/seed/logo3/100/100" },
    { name: "Academia Elite", logo: "https://picsum.photos/seed/logo4/100/100" },
    { name: "Escola do Futuro", logo: "https://picsum.photos/seed/logo5/100/100" },
    { name: "Colégio Esperança", logo: "https://picsum.photos/seed/logo6/100/100" },
  ];

  const partners = [
    { name: "Ministério da Educação", logo: "https://picsum.photos/seed/partner1/100/100" },
    { name: "Unitel", logo: "https://picsum.photos/seed/partner2/100/100" },
    { name: "BFA", logo: "https://picsum.photos/seed/partner3/100/100" },
    { name: "Angola Telecom", logo: "https://picsum.photos/seed/partner4/100/100" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#11392e] p-2 rounded-lg">
                <GraduationCap className="text-white" size={28} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-[#11392e]">kulonga</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['inicio', 'sobre', 'licencas', 'contactos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                    activeTab === tab ? 'text-[#f97316]' : 'text-slate-600 hover:text-[#1e3a8a]'
                  }`}
                >
                  {tab}
                </button>
              ))}

              {/* 360K Dropdown */}
              <div className="relative group">
                <button 
                  onMouseEnter={() => setShow360Menu(true)}
                  className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-[#1e3a8a] transition-colors py-8"
                >
                  360K <ChevronDown size={14} />
                </button>
                
                <div 
                  onMouseLeave={() => setShow360Menu(false)}
                  className={`absolute top-full left-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 transition-all duration-300 transform ${
                    show360Menu ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
                  }`}
                >
                  <div className="grid gap-2">
                    {links360.map((link) => (
                      <a 
                        key={link.url} 
                        href={link.url}
                        className="text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={onLoginClick}
                className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#11392e] transition-all shadow-lg shadow-blue-100"
              >
                Entrar no Sistema
              </button>
            </div>

            <button 
              className="md:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <LayoutGrid size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-4">
                {['inicio', 'sobre', 'licencas', 'contactos'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-sm font-bold uppercase tracking-wider text-left py-2 ${
                      activeTab === tab ? 'text-[#f97316]' : 'text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}

                <div className="border-t border-slate-100 pt-4 mt-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ecossistema 360K</p>
                  <div className="grid grid-cols-2 gap-2">
                    {links360.map((link) => (
                      <a 
                        key={link.url} 
                        href={link.url}
                        className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-[#1e3a8a] text-white px-6 py-3 rounded-xl font-bold text-sm text-center"
                >
                  Entrar no Sistema
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero / Carousel */}
      {activeTab === 'inicio' && (
        <section className="relative h-[600px] overflow-hidden bg-[#11392e]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#11392e] via-[#11392e]/80 to-transparent z-10" />
              <img 
                src={slides[currentSlide].image} 
                alt="Banner" 
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
                <motion.span 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-[#f97316] font-black text-lg md:text-2xl mb-2"
                >
                  {slides[currentSlide].title}
                </motion.span>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight"
                >
                  {slides[currentSlide].subtitle}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-300 text-lg md:text-xl max-w-2xl mb-10"
                >
                  {slides[currentSlide].description}
                </motion.p>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-4"
                >
                  <button 
                    onClick={() => setActiveTab('licencas')}
                    className="bg-[#f97316] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all flex items-center gap-2"
                  >
                    Solicitar Demonstração <ArrowRight size={20} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === i ? 'bg-[#f97316] w-8' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* About Section */}
      {(activeTab === 'inicio' || activeTab === 'sobre') && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-[#11392e] mb-4">Por que escolher o Kulonga?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto mb-8">Tecnologia angolana desenhada para elevar o padrão da educação nacional.</p>
              
              <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 max-w-4xl mx-auto text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                  <h4 className="text-[#f97316] font-black uppercase tracking-widest text-sm mb-4">Resumo Executivo</h4>
                  <p className="text-slate-700 text-lg leading-relaxed font-medium">
                    O Kulonga é a primeira plataforma de gestão escolar 360º desenvolvida em Angola, focada na <span className="text-[#11392e] font-bold">soberania de dados</span> e <span className="text-[#11392e] font-bold">conformidade fiscal (SAF-T AO)</span>. 
                    Oferecemos uma solução completa que integra gestão acadêmica, financeira e administrativa, permitindo que as instituições foquem no que realmente importa: a educação de excelência.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-[#1e3a8a] mb-6 group-hover:bg-[#1e3a8a] group-hover:text-white transition-all">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Dados em Angola</h3>
                <p className="text-slate-600 leading-relaxed">Hospedagem 100% nacional. Seus dados privados nunca saem do país, garantindo total soberania e segurança.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center text-[#11392e] mb-6 group-hover:bg-[#11392e] group-hover:text-white transition-all">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Performance Impactante</h3>
                <p className="text-slate-600 leading-relaxed">Sistema otimizado para as condições de conectividade locais, garantindo fluidez mesmo em situações de baixo sinal.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center text-[#f97316] mb-6 group-hover:bg-[#f97316] group-hover:text-white transition-all">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Suporte Local</h3>
                <p className="text-slate-600 leading-relaxed">Equipe técnica em Luanda pronta para atender sua instituição presencialmente ou via canais digitais.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group md:col-span-3 lg:col-span-1">
                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Segurança de Elite</h3>
                <p className="text-slate-600 leading-relaxed">Proteção avançada com MFA, políticas de senha rigorosas e sessões seguras. Seus dados protegidos por padrões internacionais.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Schools Carousel */}
      <section className="py-16 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 mb-10">
          <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-400">Instituições que confiam no Kulonga</h3>
        </div>
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {[...schools, ...schools].map((school, i) => (
            <div key={i} className="flex flex-col items-center gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <img src={school.logo} alt={school.name} className="w-20 h-20 rounded-2xl shadow-sm blur-[1px] hover:blur-0 transition-all" referrerPolicy="no-referrer" />
              <span className="text-xs font-bold text-slate-500">{school.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Licenses / Pricing */}
      {(activeTab === 'inicio' || activeTab === 'licencas') && (
        <section className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">Modelos de Licenciamento</h2>
              <p className="text-slate-400">Escolha o plano que melhor se adapta à sua realidade.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Per Student */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all">
                <div className="text-[#f97316] mb-6"><UserPlus size={40} /></div>
                <h3 className="text-2xl font-bold mb-2">Por Aluno</h3>
                <p className="text-slate-400 mb-6">Ideal para escolas em crescimento. Pague apenas pelo que usa.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Gestão Acadêmica Completa</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Portal do Aluno e Encarregado</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> App Mobile</li>
                </ul>
                <button onClick={() => setActiveTab('contactos')} className="w-full py-3 rounded-xl border border-white/20 font-bold hover:bg-white hover:text-slate-900 transition-all">Solicitar Cotação</button>
              </div>

              {/* Institution */}
              <div className="bg-[#1e3a8a] p-8 rounded-3xl shadow-2xl scale-105 border border-blue-400/30">
                <div className="text-orange-400 mb-6"><Building2 size={40} /></div>
                <h3 className="text-2xl font-bold mb-2">Institucional</h3>
                <p className="text-blue-100 mb-6">Licença única para toda a instituição, sem limite de alunos.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-orange-400" /> Módulo Financeiro Avançado</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-orange-400" /> Gestão de RH e Professores</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-orange-400" /> Relatórios de Gestão</li>
                </ul>
                <button onClick={() => setActiveTab('contactos')} className="w-full py-3 rounded-xl bg-[#f97316] text-white font-bold hover:bg-orange-600 transition-all">Plano Recomendado</button>
              </div>

              {/* Training Center */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all">
                <div className="text-purple-400 mb-6"><Award size={40} /></div>
                <h3 className="text-2xl font-bold mb-2">Centro de Formação</h3>
                <p className="text-slate-400 mb-6">Focado em cursos de curta duração e certificações rápidas.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Gestão de Cursos e Turmas</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Emissão de Certificados Digitais</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Controle de Pagamentos por Curso</li>
                </ul>
                <button onClick={() => setActiveTab('contactos')} className="w-full py-3 rounded-xl border border-white/20 font-bold hover:bg-white hover:text-slate-900 transition-all">Solicitar</button>
              </div>

              {/* Modular / Hybrid */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all">
                <div className="text-green-400 mb-6"><Layers size={40} /></div>
                <h3 className="text-2xl font-bold mb-2">Híbrida / Modular</h3>
                <p className="text-slate-400 mb-6">Personalize sua experiência ativando apenas os módulos necessários.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Escolha seus Módulos</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Integração com Sistemas Legados</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> API para Desenvolvedores</li>
                </ul>
                <button onClick={() => setActiveTab('contactos')} className="w-full py-3 rounded-xl border border-white/20 font-bold hover:bg-white hover:text-slate-900 transition-all">Personalizar</button>
              </div>

              {/* Offline / Pay-per-Sync */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all">
                <div className="text-yellow-400 mb-6"><CloudOff size={40} /></div>
                <h3 className="text-2xl font-bold mb-2">Licença Offline</h3>
                <p className="text-slate-400 mb-6">Ideal para escolas com recursos limitados ou baixa conectividade.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Funcionamento 100% Offline</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Sincronização Sob Demanda</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-green-500" /> Pague por Sincronização</li>
                </ul>
                <button onClick={() => setActiveTab('contactos')} className="w-full py-3 rounded-xl border border-white/20 font-bold hover:bg-white hover:text-slate-900 transition-all">Solicitar</button>
              </div>
            </div>

            <div className="mt-16 bg-[#11392e] p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h4 className="text-2xl font-bold mb-2">Freemium + Premium</h4>
                <p className="text-slate-300">Comece grátis com funcionalidades básicas e evolua conforme sua necessidade.</p>
              </div>
              <button onClick={() => setActiveTab('contactos')} className="bg-white text-[#11392e] px-8 py-4 rounded-full font-bold hover:bg-slate-100 transition-all">Saber Mais</button>
            </div>
          </div>
        </section>
      )}

      {/* Feedback Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#11392e] mb-4">O que dizem nossos parceiros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-10 rounded-[40px] relative">
              <div className="absolute -top-6 left-10 bg-[#f97316] p-4 rounded-2xl text-white shadow-lg">
                <MessageSquare size={32} />
              </div>
              <p className="text-lg italic text-slate-700 mb-8 leading-relaxed">
                "O Kulonga revolucionou a forma como gerimos as propinas. A transparência e o controle financeiro que ganhamos não tem preço."
              </p>
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/person1/60/60" alt="User" className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
                <div>
                  <h5 className="font-bold">Dr. António Manuel</h5>
                  <p className="text-xs text-slate-500">Diretor Geral - Colégio Esperança</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-[40px] relative">
              <div className="absolute -top-6 left-10 bg-[#1e3a8a] p-4 rounded-2xl text-white shadow-lg">
                <MessageSquare size={32} />
              </div>
              <p className="text-lg italic text-slate-700 mb-8 leading-relaxed">
                "A facilidade de acesso às notas pelos encarregados reduziu drasticamente o fluxo de pessoas na secretaria. Excelente ferramenta!"
              </p>
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/person2/60/60" alt="User" className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
                <div>
                  <h5 className="font-bold">Eng. Maria Teresa</h5>
                  <p className="text-xs text-slate-500">Coordenadora Pedagógica - Instituto Moderno</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-[#1e3a8a] mb-4">
                <Handshake size={24} />
                <span className="font-bold uppercase tracking-widest text-sm">Parceiros Estratégicos</span>
              </div>
              <h3 className="text-3xl font-black text-[#11392e] mb-4">Ecossistema Kulonga</h3>
              <p className="text-slate-600">Trabalhamos em conjunto com as maiores empresas e instituições de Angola para entregar o melhor serviço.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {partners.map((partner, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                  <img src={partner.logo} alt={partner.name} className="h-12 object-contain" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creators Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#11392e] mb-4">Criadores do Projecto</h2>
            <p className="text-slate-600">Uma equipa dedicada à transformação digital da educação em Angola.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: "Benilson Salvador", role: "CEO & Lead Architect", img: "https://picsum.photos/seed/ben/300/300" },
              { name: "Equipa Técnica", role: "Desenvolvimento & Infraestrutura", img: "https://picsum.photos/seed/tech/300/300" },
              { name: "Equipa de Suporte", role: "Atendimento & Implementação", img: "https://picsum.photos/seed/support/300/300" },
            ].map((member, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-[#f97316] rounded-[40px] rotate-6 group-hover:rotate-0 transition-all" />
                  <img src={member.img} alt={member.name} className="relative w-64 h-64 object-cover rounded-[40px] shadow-xl" referrerPolicy="no-referrer" />
                </div>
                <h4 className="text-xl font-bold text-[#11392e]">{member.name}</h4>
                <p className="text-slate-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Request Section */}
      {(activeTab === 'inicio' || activeTab === 'contactos') && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-4xl font-black text-[#11392e] mb-8">Vamos conversar?</h2>
                <p className="text-slate-600 mb-12 text-lg">
                  Solicite uma demonstração personalizada para sua instituição. Nosso superadmin entrará em contacto para agendar uma reunião.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-[#1e3a8a]">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">E-mail</p>
                      <p className="font-bold">comercial@kulonga.ao</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-[#f97316]">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Linha de Apoio</p>
                      <p className="font-bold">+244 923 000 000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-[#11392e]">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Escritório</p>
                      <p className="font-bold">Talatona, Luanda - Angola</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-100">
                {submitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#11392e] mb-2">Pedido Enviado!</h3>
                    <p className="text-slate-600">Obrigado pelo seu interesse. Nosso superadmin entrará em contacto em breve para agendar a reunião.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleRequestSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Seu Nome</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                          value={requestForm.name}
                          onChange={e => setRequestForm({...requestForm, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Instituição</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                          value={requestForm.institution_name}
                          onChange={e => setRequestForm({...requestForm, institution_name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">E-mail</label>
                        <input 
                          type="email" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                          value={requestForm.email}
                          onChange={e => setRequestForm({...requestForm, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Telefone</label>
                        <input 
                          type="tel" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                          value={requestForm.phone}
                          onChange={e => setRequestForm({...requestForm, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Tipo de Licença</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                        value={requestForm.license_type}
                        onChange={e => setRequestForm({...requestForm, license_type: e.target.value})}
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
                      <label className="text-sm font-bold text-slate-700">Mensagem (Opcional)</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1e3a8a] h-32"
                        value={requestForm.message}
                        onChange={e => setRequestForm({...requestForm, message: e.target.value})}
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#11392e] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl disabled:opacity-50"
                    >
                      {isSubmitting ? 'Enviando...' : 'Solicitar Demonstração'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#11392e] text-white py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-lg">
                  <GraduationCap className="text-[#11392e]" size={20} />
                </div>
                <span className="text-xl font-black tracking-tighter">kulonga</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transformando a educação em Angola através de tecnologia inovadora e gestão eficiente. Uma parceria estratégica com a Aegis.
              </p>
              <div className="flex gap-4">
                <a href="#" className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors"><Facebook size={18} className="text-slate-300" /></a>
                <a href="#" className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors"><Instagram size={18} className="text-slate-300" /></a>
                <a href="#" className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors"><Linkedin size={18} className="text-slate-300" /></a>
                <a href="#" className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors"><MessageCircle size={18} className="text-slate-300" /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white">Plataforma</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="/docs.html" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="/support.html" className="hover:text-white transition-colors">Suporte Técnico</a></li>
                <li><a href="/academy.html" className="hover:text-white transition-colors">Academy</a></li>
                <li><a href="/demo.html" className="hover:text-white transition-colors">Ambiente Demo</a></li>
                <li><a href="/report.html" className="hover:text-white transition-colors">Relatórios</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white">Comunidade</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="/community.html" className="hover:text-white transition-colors">Fórum & Comunidade</a></li>
                <li><a href="/events.html" className="hover:text-white transition-colors">Eventos & Webinars</a></li>
                <li><a href="/partners.html" className="hover:text-white transition-colors">Parceiros</a></li>
                <li><a href="/secure.html" className="hover:text-white transition-colors">Segurança & Trust</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><button onClick={onShowTerms} className="hover:text-white transition-colors">Termos de Uso</button></li>
                <li><button onClick={onShowPrivacy} className="hover:text-white transition-colors">Política de Privacidade</button></li>
                <li><button onClick={onShowPrivacy} className="hover:text-white transition-colors">Cookies</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-500 text-xs">© 2026 Kulonga Platform. Todos os direitos reservados. Feito com ❤️ em Angola.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 border border-white/10 px-3 py-1 rounded-full">
                <Shield size={12} /> Lei 22/11 (Angola)
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 border border-white/10 px-3 py-1 rounded-full">
                <Shield size={12} /> GDPR Compliant
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 border border-white/10 px-3 py-1 rounded-full">
                <Shield size={12} /> PCI DSS Ready
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Compliance Modal */}
      <div id="privacy-policy" className="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6">Privacidade e Proteção de Dados</h2>
          <div className="space-y-4 text-slate-400 text-sm text-left">
            <p>O Kulonga está comprometido com a segurança e privacidade dos seus dados, seguindo rigorosamente a <strong>Lei 22/11 de Proteção de Dados Pessoais de Angola</strong> e o <strong>GDPR</strong>.</p>
            <h3 className="text-white font-bold mt-6">1. Coleta de Dados</h3>
            <p>Coletamos apenas as informações necessárias para a gestão acadêmica e administrativa das instituições de ensino.</p>
            <h3 className="text-white font-bold mt-6">2. Segurança (ISO/IEC 27001)</h3>
            <p>Implementamos controles de segurança baseados na norma ISO/IEC 27001, incluindo criptografia de ponta a ponta para dados sensíveis.</p>
            <h3 className="text-white font-bold mt-6">3. Dados Financeiros (PCI DSS)</h3>
            <p>Não armazenamos dados completos de cartões de crédito. Todas as transações financeiras seguem os padrões PCI DSS.</p>
          </div>
          <button 
            onClick={() => document.getElementById('privacy-policy')?.classList.add('hidden')}
            className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Entendi e Aceito
          </button>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4">
        <a 
          href="https://wa.me/244923000000" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group relative"
          title="Conversar no WhatsApp"
        >
          <MessageCircle size={28} />
          <span className="absolute right-full mr-4 bg-white text-slate-900 px-3 py-1 rounded-lg text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            WhatsApp
          </span>
        </a>
        <button 
          onClick={() => showMessage("Assistente Virtual Kulonga em breve!", "info")}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group relative"
          title="Assistente Virtual"
        >
          <Bot size={28} />
          <span className="absolute right-full mr-4 bg-white text-slate-900 px-3 py-1 rounded-lg text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Assistente Virtual
          </span>
        </button>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
