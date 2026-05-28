import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import ChurchLogo from "./components/ChurchLogo";
import DashboardKPIs from "./components/DashboardKPIs";
import MemberManager from "./components/MemberManager";
import VisitorTracker from "./components/VisitorTracker";
import FinanceModule from "./components/FinanceModule";
import MinistriesScales from "./components/MinistriesScales";
import CommunicationRadio from "./components/CommunicationRadio";
import VivaIAChat from "./components/VivaIAChat";
import TrainingGroups from "./components/TrainingGroups";

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
import { LayoutDashboard, Users, UserCheck, DollarSign, CalendarCheck, GraduationCap, Radio, Bot, LogOut, RadioTower, Eye, EyeOff, Pencil, Check, X } from "lucide-react";

export default function App() {
  // Application Screen state: "splash" | "login" | "app"
  const [screen, setScreen] = useState<"splash" | "login" | "app">("splash");

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Cross-tab interaction context (triggers AI prompts from other actions)
  const [vivaIAPrompt, setVivaIAPrompt] = useState<string>("");

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
    setCurrentUser(userObj);
    setScreen("app");
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
          <ChurchLogo size={32} showText={true} />

          {/* User profile brief card - Compacto, limpo e profissional */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-inner shrink-0">
              {currentUser?.nome.charAt(0) || "P"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-slate-800 truncate leading-none mb-0.5">{currentUser?.nome || "Pastor Titular"}</span>
              <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">
                {currentUser?.nivel === UserLevel.PASTOR ? "Pastor" : currentUser?.nivel === UserLevel.MEMBRO ? "Membro" : "Visitante"}
              </span>
            </div>
          </div>

          {/* Navigation Links layout - Categorized as per ministerial UX audit */}
          <div className="space-y-5">
            
            {/* GRUPO 1: MENU PRINCIPAL */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase px-3 tracking-widest">
                Menu Principal
              </span>
              <nav className="space-y-0.5">
                {/* Nav: Dashboard */}
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-slate-50 text-slate-900 font-extrabold border-l-4 border-[#2E7D32]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  <LayoutDashboard size={14} /> 
                  <span>{churchMode === "small" ? "Início & Pastoral" : "Painel Geral"}</span>
                </button>

                {/* Nav: Membros */}
                <button
                  onClick={() => setActiveTab("membros")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "membros"
                      ? "bg-slate-50 text-slate-900 font-extrabold border-l-4 border-[#2E7D32]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  <Users size={14} /> 
                  <span>{churchMode === "small" ? "Membros & Ovelhas" : "Membros"}</span>
                </button>

                {/* Nav: Visitantes */}
                <button
                  onClick={() => setActiveTab("visitantes")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "visitantes"
                      ? "bg-slate-50 text-slate-900 font-extrabold border-l-4 border-[#2E7D32]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  <UserCheck size={14} /> 
                  <span>{churchMode === "small" ? "Cuidado & Visitantes" : "Visitantes & Acolha"}</span>
                </button>

                {/* Nav: Financeiro */}
                <button
                  onClick={() => setActiveTab("financeiro")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "financeiro"
                      ? "bg-slate-50 text-slate-900 font-extrabold border-l-4 border-[#2E7D32]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  <DollarSign size={14} /> 
                  <span>{churchMode === "small" ? "Caixa da Igreja" : "Financeiro"}</span>
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
                    <span>{churchMode === "small" ? "Conselheiro Viva IA" : "Viva IA Teológica"}</span>
                  </span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                </button>
              </nav>
            </div>

            {/* GRUPO 2: MENU MINISTERIAL */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase px-3 tracking-widest">
                Menu Ministerial
              </span>
              <nav className="space-y-0.5">
                {/* Nav: Escalas e Agenda */}
                <button
                  onClick={() => setActiveTab("escalas")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "escalas"
                      ? "bg-slate-50 text-slate-900 font-extrabold border-l-4 border-[#2E7D32]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  <CalendarCheck size={14} /> 
                  <span>{churchMode === "small" ? "Cultos & Voluntários" : "Escalas"}</span>
                </button>

                {/* Nav: Celulas e Discipulado */}
                <button
                  onClick={() => setActiveTab("discipulado")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "discipulado"
                      ? "bg-slate-50 text-slate-900 font-extrabold border-l-4 border-[#2E7D32]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  <GraduationCap size={14} /> 
                  <span>{churchMode === "small" ? "Pequenos Grupos" : "PGMs & Capacitação"}</span>
                </button>
              </nav>
            </div>

            {/* GRUPO 3: AVANÇADO E ADORAÇÃO */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase px-3 tracking-widest">
                Adoração & Comunicação
              </span>
              <nav className="space-y-0.5">
                {/* Nav: Devocional e Radio */}
                <button
                  onClick={() => setActiveTab("devocional")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "devocional"
                      ? "bg-slate-50 text-slate-900 font-extrabold border-l-4 border-[#2E7D32]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  <Radio size={14} /> 
                  <span>Rádio & Devocionais</span>
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
        <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
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

          {activeTab === "discipulado" && (
            <TrainingGroups
              members={members}
              pgms={pgms}
              courses={courses}
              onAddPgm={handleAddPgm}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onAskVivaIAPrompt={handleAskVivaIAPrompt}
            />
          )}

          {activeTab === "devocional" && (
            <CommunicationRadio onAskVivaIAPrompt={handleAskVivaIAPrompt} />
          )}

          {activeTab === "viva-ia" && (
            <VivaIAChat
              initialPrompt={vivaIAPrompt}
              onClearInitialPrompt={handleClearVivaIAPrompt}
            />
          )}
        </div>

      </main>

      {/* Mobile Bottom Navbar - Estilo nativo moderno, otimizado para celulares */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center md:hidden z-40 px-2 shadow-xl shrink-0">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "dashboard" ? "text-[#2E7D32]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutDashboard size={19} className={activeTab === "dashboard" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-bold mt-1 tracking-tight">Painel</span>
        </button>

        <button
          onClick={() => setActiveTab("membros")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "membros" ? "text-[#2E7D32]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users size={19} className={activeTab === "membros" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-bold mt-1 tracking-tight">Membros</span>
        </button>

        <button
          onClick={() => setActiveTab("financeiro")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "financeiro" ? "text-[#2E7D32]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <DollarSign size={19} className={activeTab === "financeiro" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-bold mt-1 tracking-tight">Financeiro</span>
        </button>

        <button
          onClick={() => setActiveTab("escalas")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "escalas" ? "text-[#2E7D32]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <CalendarCheck size={19} className={activeTab === "escalas" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-bold mt-1 tracking-tight">Escalas</span>
        </button>

        <button
          onClick={() => setActiveTab("viva-ia")}
          className={`flex flex-col items-center justify-center flex-1 py-1 h-full cursor-pointer transition-colors ${
            activeTab === "viva-ia" ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Bot size={19} className={activeTab === "viva-ia" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[9px] font-bold mt-1 tracking-tight">Viva IA</span>
        </button>
      </nav>
    </div>
  );
}
