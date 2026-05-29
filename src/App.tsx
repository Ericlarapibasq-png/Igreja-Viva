import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import ChurchLogo from "./components/ChurchLogo";
import DashboardKPIs from "./components/DashboardKPIs";
import PainelGestao from "./components/PainelGestao";
import MemberManager from "./components/MemberManager";
import VisitorTracker from "./components/VisitorTracker";
import FinanceModule from "./components/FinanceModule";
import MinistriesScales from "./components/MinistriesScales";
import CommunicationRadio from "./components/CommunicationRadio";
import VivaIAChat from "./components/VivaIAChat";
import TrainingGroups from "./components/TrainingGroups";
import DonationsModule from "./components/DonationsModule";
import ChurchBillboard from "./components/ChurchBillboard";
import MinistriesArea from "./components/MinistriesArea";
import StoreAffiliates from "./components/StoreAffiliates";

import {
  getInitialState,
  saveMembersList,
  saveVisitorsList,
  saveFinancialTransactions,
  saveEventsSchedule,
  saveVolunteerScales,
  savePgmsList,
  saveCoursesList,
} from "./data";

import { Member, Visitor, FinancialTransaction, EventSchedule, VolunteerScale, PgmCell, TrainingCourse, User, UserLevel } from "./types";
import { LayoutDashboard, Users, UserCheck, DollarSign, CalendarCheck, GraduationCap, Radio, Bot, LogOut, RadioTower, Eye, EyeOff, Pencil, Check, X, Heart, Megaphone, Award, Home, Menu, ShoppingBag } from "lucide-react";

export default function App() {
  // Application Screen state: "splash" | "login" | "app"
  const [screen, setScreen] = useState<"splash" | "login" | "app">(() => {
    const saved = localStorage.getItem("viva-saved-active-user");
    return saved ? "app" : "splash";
  });

  // Core Data Lists State synced from localStorage
  const [members, setMembers] = useState<Member[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [events, setEvents] = useState<EventSchedule[]>([]);
  const [scales, setScales] = useState<VolunteerScale[]>([]);
  const [pgms, setPgms] = useState<PgmCell[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);

  // Selected Tab navigation ("dashboard" | "membros" | "visitantes" | "financeiro" | "escalas" | "discipulado" | "devocional" | "viva-ia")
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Church size mode: "small" (até 20) | "medium" (20-100) | "large" (100+)
  const [churchMode, setChurchMode] = useState<"small" | "medium" | "large">(() => {
    const saved = localStorage.getItem("viva-church-mode");
    return (saved as "small" | "medium" | "large") || "medium";
  });

  const handleSetChurchMode = (mode: "small" | "medium" | "large") => {
    setChurchMode(mode);
    localStorage.setItem("viva-church-mode", mode);
  };

  // State to hide/mask sensitive financial values (privacy/visitor mode)
  const [hideFinancialValues, setHideFinancialValues] = useState<boolean>(() => {
    return localStorage.getItem("viva-hide-financial") === "true";
  });

  const handleToggleHideFinancial = () => {
    setHideFinancialValues((prev) => {
      const newVal = !prev;
      localStorage.setItem("viva-hide-financial", String(newVal));
      return newVal;
    });
  };

  // Client user session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("viva-saved-active-user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.nivel === UserLevel.PASTOR) {
          const customPastor = localStorage.getItem("viva-pastor-name");
          if (customPastor) {
            u.nome = customPastor;
          }
        }
        return u;
      } catch (_) {}
    }
    return null;
  });
  const [isProfileExpanded, setIsProfileExpanded] = useState<boolean>(false);

  // Cross-tab interaction context (triggers AI prompts from other actions)
  const [vivaIAPrompt, setVivaIAPrompt] = useState<string>("");

  const [pastorName, setPastorName] = useState<string>(() => {
    return localStorage.getItem("viva-pastor-name") || "Pr. Erivaldo Lima Ferreira";
  });

  const [churchLogoUrl, setChurchLogoUrl] = useState<string>(() => {
    return localStorage.getItem("viva-church-logo-url") || "";
  });

  const [ministryNames, setMinistryNames] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("viva-ministry-custom-names");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return {
      "Louvor": "Louvor",
      "Infantil": "Infantil",
      "Mídia": "Mídia",
      "Recepção": "Recepção",
      "Jovens": "Jovens"
    };
  });

  const handleUpdatePastorName = (newName: string) => {
    setPastorName(newName);
    localStorage.setItem("viva-pastor-name", newName);
    if (currentUser?.nivel === UserLevel.PASTOR) {
      const updatedUser = { ...currentUser, nome: newName };
      setCurrentUser(updatedUser);
      localStorage.setItem("viva-saved-active-user", JSON.stringify(updatedUser));
    }
  };

  const handleUpdateChurchLogoUrl = (newUrl: string) => {
    setChurchLogoUrl(newUrl);
    localStorage.setItem("viva-church-logo-url", newUrl);
  };

  const handleUpdateMinistryName = (key: string, value: string) => {
    const updated = { ...ministryNames, [key]: value };
    setMinistryNames(updated);
    localStorage.setItem("viva-ministry-custom-names", JSON.stringify(updated));
  };

  // Customizable church branch identifiers (for denominations with specific mother-church or mission tags)
  const [hqName, setHqName] = useState<string>(() => {
    return localStorage.getItem("viva-hq-name") || "Sede Central — Ativo";
  });
  const [congName, setCongName] = useState<string>(() => {
    return localStorage.getItem("viva-cong-name") || "Sede Igreja Viva";
  });

  const [isEditingHq, setIsEditingHq] = useState<boolean>(false);
  const [isEditingCong, setIsEditingCong] = useState<boolean>(false);
  const [tempHq, setTempHq] = useState<string>("");
  const [tempCong, setTempCong] = useState<string>("");

  const handleSaveHq = () => {
    const trimmed = tempHq.trim();
    if (trimmed) {
      setHqName(trimmed);
      localStorage.setItem("viva-hq-name", trimmed);
    }
    setIsEditingHq(false);
  };

  const handleSaveCong = () => {
    const trimmed = tempCong.trim();
    if (trimmed) {
      setCongName(trimmed);
      localStorage.setItem("viva-cong-name", trimmed);
    }
    setIsEditingCong(false);
  };

  // Load initial data on startup
  useEffect(() => {
    const data = getInitialState();
    setMembers(data.members);
    setVisitors(data.visitors);
    setTransactions(data.transactions);
    setEvents(data.events);
    setScales(data.scales);
    setPgms(data.pgms);
    setCourses(data.courses);
  }, []);

  // Sync state helpers
  const handleAddMember = (m: Member) => {
    const updated = [m, ...members];
    setMembers(updated);
    saveMembersList(updated);
  };

  const handleUpdateMember = (m: Member) => {
    const updated = members.map((x) => (x.id === m.id ? m : x));
    setMembers(updated);
    saveMembersList(updated);
  };

  const handleRemoveMember = (id: string) => {
    const updated = members.filter((x) => x.id !== id);
    setMembers(updated);
    saveMembersList(updated);
  };

  const handleAddVisitor = (v: Visitor) => {
    const updated = [v, ...visitors];
    setVisitors(updated);
    saveVisitorsList(updated);
  };

  const handleUpdateVisitor = (v: Visitor) => {
    const updated = visitors.map((x) => (x.id === v.id ? v : x));
    setVisitors(updated);
    saveVisitorsList(updated);
  };

  const handleRemoveVisitor = (id: string) => {
    const updated = visitors.filter((x) => x.id !== id);
    setVisitors(updated);
    saveVisitorsList(updated);
  };

  const handleAddTransaction = (t: FinancialTransaction) => {
    const updated = [t, ...transactions];
    setTransactions(updated);
    saveFinancialTransactions(updated);
  };

  const handleAddEvent = (ev: EventSchedule) => {
    const updated = [ev, ...events];
    setEvents(updated);
    saveEventsSchedule(updated);
  };

  const handleAddScale = (sc: VolunteerScale) => {
    const updated = [sc, ...scales];
    setScales(updated);
    saveVolunteerScales(updated);
  };

  const handleUpdateScale = (sc: VolunteerScale) => {
    const updated = scales.map((x) => (x.id === sc.id ? sc : x));
    setScales(updated);
    saveVolunteerScales(updated);
  };

  const handleAddPgm = (p: PgmCell) => {
    const updated = [p, ...pgms];
    setPgms(updated);
    savePgmsList(updated);
  };

  const handleAddCourse = (c: TrainingCourse) => {
    const updated = [c, ...courses];
    setCourses(updated);
    saveCoursesList(updated);
  };

  const handleUpdateCourse = (c: TrainingCourse) => {
    const updated = courses.map((x) => (x.id === c.id ? c : x));
    setCourses(updated);
    saveCoursesList(updated);
  };

  // Cross-Tab Assistant bridge pipeline
  const handleAskVivaIAPrompt = (promptText: string) => {
    setVivaIAPrompt(promptText);
    setActiveTab("viva-ia");
  };

  const handleClearVivaIAPrompt = () => {
    setVivaIAPrompt("");
  };

  // Skip Splash Screen trigger
  const handleSkipSplash = () => {
    setScreen("login");
  };

  // Finish Login trigger
  const handleLoginSuccess = (userObj: User) => {
    if (userObj.nivel === UserLevel.PASTOR) {
      const customPastor = localStorage.getItem("viva-pastor-name");
      if (customPastor) {
        userObj.nome = customPastor;
      }
    }
    setCurrentUser(userObj);
    localStorage.setItem("viva-saved-active-user", JSON.stringify(userObj));
    setScreen("app");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("viva-saved-active-user");
    setScreen("login");
  };

  // Render Screens based on active routing
  if (screen === "splash") {
    return <SplashScreen onComplete={handleSkipSplash} />;
  }

  if (screen === "login") {
    return <LoginScreen onLogin={handleLoginSuccess} />;
  }
  return (
    <div id="i-viva-app" className="min-h-screen bg-[#FAF9F5] flex flex-col md:flex-row antialiased font-sans pb-16 md:pb-0">
      
      {/* Sidebar Navigation - Oculto no Mobile por padrão para melhorar a UX */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          
          {/* Logo container brand */}
          <ChurchLogo size={32} showText={true} logoUrl={churchLogoUrl} />

          {/* User profile brief card - Compacto, limpo e profissional */}
          <div 
            onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-2 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
            title="Clique para abrir configurações de perfil"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="w-6 h-6 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-inner shrink-0">
                {currentUser?.nome?.charAt(0) || "P"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-slate-800 truncate leading-none mb-0.5">{currentUser?.nome || "Pastor Titular"}</span>
                <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">
                  {currentUser?.nivel === UserLevel.PASTOR ? "Pastor" : currentUser?.nivel === UserLevel.MEMBRO ? "Membro" : "Visitante"}
                </span>
              </div>
              <span className="text-[9px] text-slate-450 font-bold transition-transform duration-200">
                {isProfileExpanded ? "▲" : "▼"}
              </span>
            </div>

            {isProfileExpanded && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="mt-1 pt-2 border-t border-slate-200/60 flex flex-col gap-2 text-xs"
              >
                <div className="flex items-center justify-between text-[8px] text-slate-400 font-black uppercase tracking-wider">
                  <span>Ajustes de Perfil / Painel</span>
                </div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={hideFinancialValues}
                    onChange={handleToggleHideFinancial}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-650 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Apresentação Segura (Visitas)</span>
                </label>
              </div>
            )}
          </div>

          {/* Navigation Links layout - Categorized as per ministerial UX audit */}
          <div className="space-y-5">
            
            {/* GRUPO 1: COMUNHÃO & CULTIVO */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-stone-400 block uppercase px-3 tracking-widest">
                Vida em Comunidade
              </span>
              <nav className="space-y-0.5">
                {/* Nav: Início Dashboard */}
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  <Home size={14} className={activeTab === "dashboard" ? "text-emerald-700" : ""} /> 
                  <span>Início & Comunhão</span>
                </button>

                {/* Nav: Painel de Gestão */}
                <button
                  onClick={() => setActiveTab("painel")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "painel"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard size={14} className={activeTab === "painel" ? "text-emerald-700" : ""} /> 
                  <span>Liderança & Secretaria</span>
                </button>

                {/* Nav: Mural Principal */}
                <button
                  onClick={() => setActiveTab("mural")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "mural"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  <Megaphone size={14} className={activeTab === "mural" ? "text-emerald-700" : ""} /> 
                  <span>Mural de Avisos</span>
                </button>

                {/* Nav: Membros */}
                <button
                  onClick={() => setActiveTab("membros")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "membros"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  <Users size={14} className={activeTab === "membros" ? "text-emerald-700" : ""} /> 
                  <span>{churchMode === "small" ? "Família & Ovelhas" : "Família da Fé (Membros)"}</span>
                </button>

                {/* Nav: Visitantes */}
                <button
                  onClick={() => setActiveTab("visitantes")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "visitantes"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  <UserCheck size={14} className={activeTab === "visitantes" ? "text-emerald-700" : ""} /> 
                  <span>{churchMode === "small" ? "Cuidado & Acolhimento" : "Acolhimento & Integração"}</span>
                </button>

                {/* Nav: Financeiro */}
                <button
                  onClick={() => setActiveTab("financeiro")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "financeiro"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  <DollarSign size={14} className={activeTab === "financeiro" ? "text-emerald-700" : ""} /> 
                  <span>{churchMode === "small" ? "Tesouraria Solidária" : "Finanças & Mordomia"}</span>
                </button>

                {/* Nav: Doações */}
                <button
                  onClick={() => setActiveTab("doacoes")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "doacoes"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-[#1B7A2D]"
                      : "text-slate-500 hover:text-[#1B7A2D] hover:bg-slate-50"
                  }`}
                >
                  <Heart size={14} className={activeTab === "doacoes" ? "text-[#1B7A2D] fill-rose-100" : ""} /> 
                  <span>Semear & Contribuir (PIX)</span>
                </button>

                {/* Nav: Loja & Afiliados */}
                <button
                  onClick={() => setActiveTab("loja-affiliates")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "loja-affiliates"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  <ShoppingBag size={14} className={activeTab === "loja-affiliates" ? "text-emerald-700" : ""} /> 
                  <span>Livraria & Recomendações</span>
                </button>

                {/* Nav: Viva IA */}
                <button
                  onClick={() => setActiveTab("viva-ia")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "viva-ia"
                      ? "bg-emerald-50 text-emerald-950 font-black border-l-4 border-emerald-600 flex items-center justify-between shadow-xxs"
                      : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/20"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bot size={14} /> 
                    <span>{churchMode === "small" ? "Conselheiro Viva IA" : "Pastor Virtual Viva IA"}</span>
                  </span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                </button>
              </nav>
            </div>

            {/* GRUPO 2: MENU MINISTERIAL */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-stone-400 block uppercase px-3 tracking-widest">
                Frentes de Serviço
              </span>
              <nav className="space-y-0.5">
                {/* Nav: Ministérios */}
                <button
                  onClick={() => setActiveTab("ministerios")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "ministerios"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-55"
                  }`}
                >
                  <Award size={14} className={activeTab === "ministerios" ? "text-emerald-700" : ""} /> 
                  <span>Divisão & Departamentos</span>
                </button>

                {/* Nav: Escalas e Agenda */}
                <button
                  onClick={() => setActiveTab("escalas")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "escalas"
                      ? "bg-emerald-50/60 text-[#1E4D2B] font-extrabold border-l-4 border-emerald-700"
                      : "text-slate-500 hover:text-slate-850 hover:bg-slate-55"
                  }`}
                >
                  <CalendarCheck size={14} className={activeTab === "escalas" ? "text-emerald-700" : ""} /> 
                  <span>{churchMode === "small" ? "Cultos & Voluntários" : "Escalas de Cultos"}</span>
                </button>

              </nav>
            </div>

          </div>
        </div>

        {/* Exit control area */}
        <div className="p-4 border-t border-slate-150">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold text-red-650 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar indicators + Onboarding Interactive Size Control Widget */}
        <header className="bg-white border-b border-slate-200 py-3.5 px-6 shrink-0 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {isEditingHq ? (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 shadow-3xs">
                <input
                  type="text"
                  value={tempHq}
                  onChange={(e) => setTempHq(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveHq()}
                  className="bg-transparent text-slate-800 text-[10px] font-bold border-none outline-none focus:ring-0 focus:outline-none max-w-[150px] p-0"
                  autoFocus
                  placeholder="Nome do local (Ex: Igreja Mãe)"
                />
                <button
                  type="button"
                  onClick={handleSaveHq}
                  className="p-0.5 ml-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md cursor-pointer transition-colors"
                  title="Salvar"
                >
                  <Check size={10} className="stroke-[3px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingHq(false)}
                  className="p-0.5 bg-red-50 text-red-800 hover:bg-red-100 rounded-md cursor-pointer transition-colors"
                  title="Cancelar"
                >
                  <X size={10} className="stroke-[3px]" />
                </button>
              </div>
            ) : (
              <span
                onClick={() => {
                  setTempHq(hqName);
                  setIsEditingHq(true);
                }}
                className="bg-emerald-100 text-[#2E7D32] text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-3xs cursor-pointer hover:bg-emerald-200 transition-all flex items-center gap-1.5"
                title="Clique para editar identificador"
              >
                {hqName} <Pencil size={8} className="translate-y-[-0.5px] opacity-70" />
              </span>
            )}

            <span className="text-slate-300 text-xs font-semibold hidden sm:inline">|</span>

            {isEditingCong ? (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 shadow-3xs">
                <span className="text-[11px] text-slate-400 font-bold hidden sm:inline mr-1">Congregação:</span>
                <input
                  type="text"
                  value={tempCong}
                  onChange={(e) => setTempCong(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveCong()}
                  className="bg-transparent text-slate-800 text-[11px] font-bold border-none outline-none focus:ring-0 focus:outline-none max-w-[180px] p-0"
                  autoFocus
                  placeholder="Ex: Frente Missionária"
                />
                <button
                  type="button"
                  onClick={handleSaveCong}
                  className="p-0.5 ml-1 bg-blue-100 text-blue-900 hover:bg-blue-200 rounded-md cursor-pointer transition-colors"
                  title="Salvar"
                >
                  <Check size={10} className="stroke-[3px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingCong(false)}
                  className="p-0.5 bg-red-50 text-red-800 hover:bg-red-100 rounded-md cursor-pointer transition-colors"
                  title="Cancelar"
                >
                  <X size={10} className="stroke-[3px]" />
                </button>
              </div>
            ) : (
              <span
                onClick={() => {
                  setTempCong(congName);
                  setIsEditingCong(true);
                }}
                className="text-[11px] text-slate-600 hidden sm:flex items-center gap-1.5 font-bold cursor-pointer hover:bg-slate-100 rounded-md px-2 py-0.5 border border-transparent hover:border-slate-200/60 transition-all"
                title="Clique para editar congregação"
              >
                Congregação: <strong className="font-extrabold text-[#1565C0]">{congName}</strong>
                <Pencil size={8} className="text-slate-450 opacity-70" />
              </span>
            )}
          </div>

          {/* Interactive Church Mode Swapper Selector (Modo Igreja Pequena) */}
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-150 px-3 py-1.5 rounded-2xl shadow-3xs text-xs">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Modo da Igreja:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-150">
              <button
                type="button"
                onClick={() => handleSetChurchMode("small")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  churchMode === "small"
                    ? "bg-amber-100 text-amber-900 shadow-xxs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Até 20 membros (Modo simplificado e focado em acolhimento)"
              >
                🌱 Até 20
              </button>
              <button
                type="button"
                onClick={() => handleSetChurchMode("medium")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  churchMode === "medium"
                    ? "bg-blue-100 text-blue-900 shadow-xxs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="De 20 a 100 membros (Modo estruturado)"
              >
                🌿 20-100
              </button>
              <button
                type="button"
                onClick={() => handleSetChurchMode("large")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  churchMode === "large"
                    ? "bg-emerald-100 text-emerald-950 shadow-xxs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Mais de 100 membros (Modo estruturado e focado em multiplicação)"
              >
                🌳 100+
              </button>
            </div>
          </div>

          {/* Privacy/Visitor Mode Interactive Toggle */}
          <button
            type="button"
            onClick={handleToggleHideFinancial}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all shadow-3xs cursor-pointer ${
              hideFinancialValues
                ? "bg-amber-50 border-amber-200 text-amber-900 font-extrabold"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
            }`}
            title={
              hideFinancialValues
                ? "Valores financeiros ocultados para visitantes"
                : "Ocultar valores financeiros (Ex: ao receber visitantes)"
            }
          >
            {hideFinancialValues ? (
              <>
                <EyeOff size={14} className="text-amber-600" />
                <span>Oculto (Modo Visitante)</span>
              </>
            ) : (
              <>
                <Eye size={14} className="text-slate-500" />
                <span>Ocultar Valores</span>
              </>
            )}
          </button>
        </header>

        {/* Slot view */}
        <div className="flex-1 p-3.5 sm:p-6 pb-24 md:pb-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === "dashboard" && (
            <DashboardKPIs
              members={members}
              visitors={visitors}
              transactions={transactions}
              events={events}
              onNavigateToTab={setActiveTab}
              onAskVivaIAPrompt={handleAskVivaIAPrompt}
              churchMode={churchMode}
              hideFinancialValues={hideFinancialValues}
              onToggleHideFinancial={handleToggleHideFinancial}
              currentUser={currentUser}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              pastorName={pastorName}
              onUpdatePastorName={handleUpdatePastorName}
              churchLogoUrl={churchLogoUrl}
              onUpdateChurchLogoUrl={handleUpdateChurchLogoUrl}
              ministryNames={ministryNames}
            />
          )}

          {activeTab === "painel" && (
            <PainelGestao
              members={members}
              visitors={visitors}
              transactions={transactions}
              events={events}
              scales={scales}
              onNavigateToTab={setActiveTab}
              onAskVivaIAPrompt={handleAskVivaIAPrompt}
              churchMode={churchMode}
              onSetChurchMode={handleSetChurchMode}
              hideFinancialValues={hideFinancialValues}
              onToggleHideFinancial={handleToggleHideFinancial}
              currentUser={currentUser}
              onAddVisitor={handleAddVisitor}
              onUpdateVisitor={handleUpdateVisitor}
              onRemoveVisitor={handleRemoveVisitor}
              onAddTransaction={handleAddTransaction}
              hqName={hqName}
              setHqName={setHqName}
              congName={congName}
              setCongName={setCongName}
              pastorName={pastorName}
              onUpdatePastorName={handleUpdatePastorName}
              churchLogoUrl={churchLogoUrl}
              onUpdateChurchLogoUrl={handleUpdateChurchLogoUrl}
              ministryNames={ministryNames}
              onUpdateMinistryName={handleUpdateMinistryName}
            />
          )}

          {activeTab === "membros" && (
            <MemberManager
              members={members}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onRemoveMember={handleRemoveMember}
            />
          )}

          {activeTab === "mural" && (
            <ChurchBillboard
              events={events}
              scales={scales}
              currentUser={currentUser}
              onAddEvent={handleAddEvent}
            />
          )}

          {activeTab === "ministerios" && (
            <MinistriesArea
              members={members}
              visitors={visitors}
              scales={scales}
              events={events}
              pgms={pgms}
              courses={courses}
              currentUser={currentUser}
              onAddPgm={handleAddPgm}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onAskVivaIAPrompt={handleAskVivaIAPrompt}
              pastorName={pastorName}
              ministryNames={ministryNames}
            />
          )}

          {activeTab === "visitantes" && (
            <VisitorTracker
              visitors={visitors}
              onAddVisitor={handleAddVisitor}
              onUpdateVisitor={handleUpdateVisitor}
              onRemoveVisitor={handleRemoveVisitor}
              onAskVivaIAPrompt={handleAskVivaIAPrompt}
            />
          )}

          {activeTab === "financeiro" && (
            <FinanceModule
              members={members}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              hideFinancialValues={hideFinancialValues}
            />
          )}

          {activeTab === "doacoes" && (
            <DonationsModule />
          )}

          {activeTab === "loja-affiliates" && (
            <StoreAffiliates />
          )}

          {activeTab === "escalas" && (
            <MinistriesScales
              members={members}
              events={events}
              scales={scales}
              onAddEvent={handleAddEvent}
              onAddScale={handleAddScale}
              onUpdateScale={handleUpdateScale}
            />
          )}

          {activeTab === "viva-ia" && (
            <VivaIAChat
              initialPrompt={vivaIAPrompt}
              onClearInitialPrompt={handleClearVivaIAPrompt}
              visitors={visitors}
              onUpdateVisitor={handleUpdateVisitor}
            />
          )}
        </div>

      </main>

      {/* Mobile Drawer Slide-over Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay mask */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-all"
          />
          
          {/* Menu Drawer Panels */}
          <div className="relative flex flex-col w-full max-w-[270px] bg-white h-full shadow-2xl p-5 justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E4D2B] to-[#2E7D32] flex items-center justify-center text-white text-xs font-black">
                    ⛪
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 leading-none">Igreja Viva</h2>
                    <span className="text-[9px] text-[#2E7D32] font-black uppercase mt-1 block">Menu de Navegação</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Comprehensive List of All 11 specialized tabs */}
              <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest mb-1.5 px-2">Módulos</span>
                
                {[
                  { id: "dashboard", label: "Início (Home)", icon: Home },
                  { id: "painel", label: "Painel de Gestão", icon: LayoutDashboard },
                  { id: "mural", label: "Mural de Comunicados", icon: Megaphone },
                  { id: "membros", label: "Cadastro de Membros", icon: Users },
                  { id: "visitantes", label: "Visitantes & Acolha", icon: UserCheck },
                  { id: "loja-affiliates", label: "Loja & Afiliados Center", icon: ShoppingBag },
                  { id: "viva-ia", label: "Viva IA Teológica", icon: Bot },
                  { id: "ministerios", label: "Ministérios & Visão", icon: Award },
                  { id: "escalas", label: "Escalas & Agenda", icon: CalendarCheck },
                  { id: "financeiro", label: "Gasto & Receita", icon: DollarSign },
                  { id: "doacoes", label: "Doações & PIX", icon: Heart },
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-50 text-emerald-950 font-black"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <IconComp size={14} className={isActive ? "text-[#1E4D2B]" : "text-slate-400"} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#1E4D2B] font-bold text-xs uppercase shadow-inner">
                  {currentUser?.nome?.charAt(0) || "P"}
                </div>
                <div className="min-w-0 max-w-[120px]">
                  <h4 className="text-[11px] font-black text-slate-800 truncate leading-none">{currentUser?.nome || "Pastor Admin"}</h4>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block mt-1">{currentUser?.level || "Admin"}</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                title="Sair"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navbar - Estilo nativo moderno, otimizado para celulares */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center md:hidden z-40 px-2 shadow-xl shrink-0">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "dashboard" ? "text-[#1E4D2B]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Home size={19} className={activeTab === "dashboard" ? "text-[#1E4D2B] stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-black mt-1 tracking-tight">Início</span>
        </button>

        <button
          onClick={() => setActiveTab("mural")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "mural" ? "text-[#1E4D2B]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Megaphone size={19} className={activeTab === "mural" ? "text-[#1E4D2B] stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-black mt-1 tracking-tight">Mural</span>
        </button>

        <button
          onClick={() => setActiveTab("painel")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "painel" ? "text-[#1E4D2B]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutDashboard size={19} className={activeTab === "painel" ? "text-[#1E4D2B] stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-black mt-1 tracking-tight">Painel</span>
        </button>

        <button
          onClick={() => setActiveTab("ministerios")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "ministerios" ? "text-[#1E4D2B]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Award size={19} className={activeTab === "ministerios" ? "text-[#1E4D2B] stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-black mt-1 tracking-tight">Ministérios</span>
        </button>

        <button
          onClick={() => setActiveTab("viva-ia")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "viva-ia" ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Bot size={19} className={activeTab === "viva-ia" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-black mt-1 tracking-tight">Viva IA</span>
        </button>
      </nav>
    </div>
  );
}
