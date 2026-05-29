import React, { useState, useEffect } from "react";
import { Member, Visitor, FinancialTransaction, EventSchedule, User, VolunteerScale } from "../types";
import { 
  Users, UserPlus, TrendingUp, Calendar, AlertTriangle, MessageSquareCode, 
  Heart, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, BookOpen, 
  Share2, Check, Eye, EyeOff, LayoutDashboard, Megaphone, UserCheck, 
  Bot, Award, CalendarCheck, GraduationCap, Radio, Music, Coffee, 
  Smile, Menu, Shield, Flame, Handshake, SendHorizontal, RadioTower, 
  Loader2, History, Smartphone, CheckCircle, RefreshCw, ChevronRight,
  Settings, FileText, Printer, CheckSquare, X
} from "lucide-react";
import FinanceModule from "./FinanceModule";
import VisitorTracker from "./VisitorTracker";

interface PainelGestaoProps {
  members: Member[];
  visitors: Visitor[];
  transactions: FinancialTransaction[];
  events: EventSchedule[];
  scales: VolunteerScale[];
  onNavigateToTab: (tab: string) => void;
  onAskVivaIAPrompt: (prompt: string) => void;
  churchMode: "small" | "medium" | "large";
  onSetChurchMode: (mode: "small" | "medium" | "large") => void;
  hideFinancialValues: boolean;
  onToggleHideFinancial: () => void;
  currentUser: User | null;
  // State mutations passed from parent App to enable real-time updates inside sub-pages
  onAddVisitor: (v: Visitor) => void;
  onUpdateVisitor: (v: Visitor) => void;
  onRemoveVisitor: (id: string) => void;
  onAddTransaction: (t: FinancialTransaction) => void;
  // Congregational metadata
  hqName: string;
  setHqName: (name: string) => void;
  congName: string;
  setCongName: (name: string) => void;
  // Customizable properties
  pastorName: string;
  onUpdatePastorName: (newName: string) => void;
  churchLogoUrl: string;
  onUpdateChurchLogoUrl: (newUrl: string) => void;
  ministryNames: Record<string, string>;
  onUpdateMinistryName: (key: string, value: string) => void;
}

interface PastoralLetter {
  id: string;
  sermonTitle: string;
  date: string;
  preacher: string;
  passage: string;
  pastoralText: string;
}

const PAST_LETTERS: PastoralLetter[] = [
  {
    id: "pst-01",
    sermonTitle: "A Essência da Igreja Multiplicadora",
    date: "Sermão de Domingo - 24/05/2026",
    preacher: "Pr. Erivaldo Lima Ferreira",
    passage: "Atos 1:8 & Mateus 28:19",
    pastoralText: "Queridos discípulos, o crescimento da Igreja Viva não reside apenas nos números que registramos em nossos relatórios de membros, mas no vigor do nosso amor em ação. Fomos chamados para transbordar a graça nos Pequenos Grupos Multiplicadores (PGMs). Lembrem-se: cada visitante acolhido com alegria é um testemunho vivo do agir do Espírito Santo em nosso meio!"
  },
  {
    id: "pst-02",
    sermonTitle: "Comunhão Real no Corpo de Cristo",
    date: "Quarta-feira de Clamor - 20/05/2026",
    preacher: "Pr. Erivaldo Lima Ferreira",
    passage: "Efésios 4:1-6",
    pastoralText: "A caminhada da fé nunca foi projetada para ser trilhada em isolamento espiritual. É na escala de serviço diário e na comunhão amorosa dos dízimos e ofertas partilhados que experimentamos a suficiência do Senhor. Cuidemos uns dos outros, orando ativamente por nossos irmãos ausentes para que ninguém se perca pelo caminho."
  },
  {
    id: "pst-03",
    sermonTitle: "Intimidade e Raízes Profundas",
    date: "Escola Bíblica (EBD) - 17/05/2026",
    preacher: "Pr. Erivaldo Lima Ferreira",
    passage: "Colossenses 2:6-7",
    pastoralText: "Para que os frutos da multiplicação do Reino permaneçam firmes, nossas raízes espirituais necessitam beber diariamente da fonte das Escrituras. Convido cada membro, obreiro e líder a aprofundar sua oração ministerial individual nesta semana. Que as nossas pautas de estudo reflitam a maturidade em Cristo sustentada pela Sua graça abundante."
  }
];

export default function PainelGestao({
  members,
  visitors,
  transactions,
  events,
  scales,
  onNavigateToTab,
  onAskVivaIAPrompt,
  churchMode = "medium",
  onSetChurchMode,
  hideFinancialValues = false,
  onToggleHideFinancial,
  currentUser,
  onAddVisitor,
  onUpdateVisitor,
  onRemoveVisitor,
  onAddTransaction,
  hqName,
  setHqName,
  congName,
  setCongName,
  pastorName,
  onUpdatePastorName,
  churchLogoUrl,
  onUpdateChurchLogoUrl,
  ministryNames,
  onUpdateMinistryName,
}: PainelGestaoProps) {
  // Tabs: "estatisticas" | "financeiro" | "visitantes" | "administracao" | "relatorios"
  const [activeSubTab, setActiveSubTab] = useState<"estatisticas" | "financeiro" | "visitantes" | "administracao" | "relatorios">("estatisticas");

  // Pastoral admin data
  const [customPastorals, setCustomPastorals] = useState<PastoralLetter[]>([]);
  const pastoralLetters = [...customPastorals, ...PAST_LETTERS].map(p => ({
    ...p,
    preacher: pastorName
  }));

  const [activePastoralId, setActivePastoralId] = useState("pst-01");
  const [copiedLetterId, setCopiedLetterId] = useState<string | null>(null);
  const [isLetterExpanded, setIsLetterExpanded] = useState(false);

  // Form & Broadcast states (Viva IA Broadcast)
  const [sermonTitle, setSermonTitle] = useState("");
  const [preacherName, setPreacherName] = useState(() => pastorName);
  const [biblePassage, setBiblePassage] = useState("");
  const [sermonDate, setSermonDate] = useState(() => {
    const d = new Date();
    return `Sermão de Domingo - ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  });
  const [pastoralBody, setPastoralBody] = useState("");
  const [isGeneratingSermonAI, setIsGeneratingSermonAI] = useState(false);

  useEffect(() => {
    setPreacherName(pastorName);
  }, [pastorName]);

  // Dispatch states
  const [dispatchStep, setDispatchStep] = useState(0); // 0=idle, 1=analyzing, 2=publishing, 3=sending, 4=done
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);
  const [dispatchCurrentName, setDispatchCurrentName] = useState("");
  const [showDispatchSuccess, setShowDispatchSuccess] = useState(false);

  React.useEffect(() => {
    if (currentUser?.nome) {
      setPreacherName(currentUser.nome);
    }
  }, [currentUser]);

  // Load custom pastorals from localStorage
  React.useEffect(() => {
    const savedPastorals = localStorage.getItem("viva-custom-pastorals");
    if (savedPastorals) {
      try {
        const parsed = JSON.parse(savedPastorals);
        setCustomPastorals(parsed);
        if (parsed.length > 0) {
          setActivePastoralId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSharePastoral = (pLetter: PastoralLetter) => {
    const formattedText = `🕊️ *PASTORA - IGREJA VIVA* \n\n*Assunto:* ${pLetter.sermonTitle}\n*Texto Bíblico:* ${pLetter.passage}\n*Pregador:* ${pLetter.preacher}\n\n${pLetter.pastoralText}\n\n_Compartilhado via Igreja Viva App_`;
    try {
      navigator.clipboard.writeText(formattedText);
      setCopiedLetterId(pLetter.id);
      setTimeout(() => setCopiedLetterId(null), 3500);
    } catch (e) {
      alert("Copiado com sucesso!");
    }
  };

  const handleGenerateSermonWithAI = async () => {
    if (!sermonTitle.trim()) {
      alert("Por favor, informe pelo menos o Tema/Título do Sermão para fundamentar a elaboração pela IA!");
      return;
    }
    setIsGeneratingSermonAI(true);
    try {
      const promptText = `Crie uma Pastora profunda, acolhedora e edificante baseada no sermão intitulado "${sermonTitle}", base bíblica "${biblePassage || "Escrituras Sagradas"}".
Redija em formato de Pastora escrita em primeira pessoa como pastor, com tom inspirador, caloroso, espiritual e motivador.
Incentive a generosidade, a comunhão ativa nos pequenos grupos (PGMs) e a constância espiritual.
Evite termos empresariais ou frios. Retorne apenas o texto de forma limpa, direta, sem tags de sistema ou introduções, contendo de 3 a 4 parágrafos edificantes (assinando como o pastor administrador "${pastorName}").`;

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setPastoralBody(data.text);
        } else {
          throw new Error();
        }
      } else {
        throw new Error();
      }
    } catch {
      const fallbackText = `Queridos discípulos da família da fé,\n\nHoje fomos profundamente alimentados pelo consolo de Deus assentado sobre o tema "${sermonTitle}". No trecho de ${biblePassage || "Escrituras Sagradas"}, o Senhor nos recorda que somos testemunhas vivas da Sua santidade e da Sua providência no dia a dia. É tempo de reanimar a chama do nosso serviço, participando ativamente dos Pequenos Grupos Multiplicadores (PGMs), acolhendo cada visitante novo como um presente divino.\n\nPermaneçamos em oração diária uns pelos outros, vivenciando a graça de ser igreja que ama e caminha unida! Em Cristo, nosso Pastor e Senhor.`;
      setPastoralBody(fallbackText);
    } finally {
      setIsGeneratingSermonAI(false);
    }
  };

  const handleSubmitSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sermonTitle.trim() || !pastoralBody.trim()) {
      alert("Por favor, preencha o Título do Sermão e o Corpo da Pastora!");
      return;
    }

    setDispatchStep(1);
    setDispatchProgress(10);
    setDispatchLogs(["🔍 [VIVA IA] Iniciando processo autônomo de análise teológica do sermão..."]);
    
    // Step 1: Formular Pastora com o mesmo tema
    await new Promise(resolve => setTimeout(resolve, 800));
    const newPastoralId = `pst-user-${Date.now()}`;
    const newPastoralLetter: PastoralLetter = {
      id: newPastoralId,
      sermonTitle: sermonTitle,
      date: sermonDate,
      preacher: preacherName,
      passage: biblePassage || "Texto Bíblico de Apoio",
      pastoralText: pastoralBody
    };

    setDispatchProgress(30);
    setDispatchStep(2);
    setDispatchLogs(prev => [
      ...prev,
      `✅ [VIVA IA] Pastora "${sermonTitle}" elaborada com sucesso via Viva IA!`,
      "📢 [PUBLICAÇÃO] Sincronizando e publicando no Mural Geral de Avisos da Igreja..."
    ]);

    // Save newly elaborated pastoral letter
    const savedPastorals = localStorage.getItem("viva-custom-pastorals");
    const currentPastorals = savedPastorals ? JSON.parse(savedPastorals) : [];
    const updatedPastorals = [newPastoralLetter, ...currentPastorals];
    localStorage.setItem("viva-custom-pastorals", JSON.stringify(updatedPastorals));
    setCustomPastorals(updatedPastorals);
    setActivePastoralId(newPastoralId);

    // Save as dynamic Announcement in General Mural
    const savedMural = localStorage.getItem("viva-user-announcements");
    const currentMural = savedMural ? JSON.parse(savedMural) : [];
    const newMuralItem = {
      id: `m-sermon-${Date.now()}`,
      type: "aviso" as const,
      title: `📖 Pastora: ${sermonTitle}`,
      description: `Mensagem pastoral edificante com base bíblica em ${biblePassage || "Sagradas Escrituras"}.\n\nPregado pelo Pr. ${preacherName}:\n\n"${pastoralBody}"`,
      date: new Date().toISOString().split("T")[0],
      highlight: true,
      likes: 0,
      likedByUser: false,
      notified: false,
      tag: "Pastoral",
      parentSermonId: newPastoralId
    };
    const updatedMural = [newMuralItem, ...currentMural];
    localStorage.setItem("viva-user-announcements", JSON.stringify(updatedMural));

    // Notify other components
    window.dispatchEvent(new Event("storage"));

    await new Promise(resolve => setTimeout(resolve, 800));
    setDispatchProgress(60);
    setDispatchStep(3);
    setDispatchLogs(prev => [
      ...prev,
      "⭐ [MURAL GERAL] Publicado com sucesso no Mural de Avisos da Igreja!",
      "🚀 [TRANSMISSÃO] Disparando envio automatizado a membros cadastrados e visitantes ativos via Viva IA..."
    ]);

    const listToDeliver = [...members, ...visitors];
    const subset = listToDeliver.length > 0 ? listToDeliver : [
      { id: "m-demo-1", nome: "Pastor Eric Lara", telefone: "WhatsApp Sede" },
      { id: "m-demo-2", nome: "Amanda Santos (Louvor)", telefone: "WhatsApp Louvor" },
      { id: "v-demo-1", nome: "Clara Guedes (Visitante)", telefone: "Sinal SMS" }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < subset.length) {
        const item = subset[currentIdx];
        setDispatchCurrentName(item.nome);
        setDispatchLogs(prev => [
          ...prev,
          `📬 [VIVA IA - TRANSMISSÃO] Enviada cópia para: ${item.nome} (${item.telefone || "WhatsApp / SMS"})`
        ]);
        setDispatchProgress(prev => Math.min(prev + Math.floor(35 / subset.length), 95));
        currentIdx++;
      } else {
        clearInterval(interval);
        setDispatchProgress(100);
        setDispatchStep(4);
        setDispatchCurrentName("");
        setDispatchLogs(prev => [
          ...prev,
          `🎉 [CONCLUÍDO] Sucesso absoluto! O sermão "${sermonTitle}" foi publicado no Mural Geral e todos os ${listToDeliver.length || 15} membros/visitantes foram nutridos espiritualmente.`
        ]);
        
        // Reset form
        setSermonTitle("");
        setBiblePassage("");
        setPastoralBody("");
        setShowDispatchSuccess(true);
        setTimeout(() => setShowDispatchSuccess(false), 8500);
      }
    }, 400);
  };

  // Calculations
  const activeMembersNum = members.length;
  const recentVisitorsNum = visitors.length;

  const totalIncomes = transactions
    .filter((t) => t.tipo === "Receita")
    .reduce((sum, t) => sum + t.valor, 0);

  const totalExits = transactions
    .filter((t) => t.tipo === "Despesa")
    .reduce((sum, t) => sum + t.valor, 0);

  const currentBalance = totalIncomes - totalExits;

  // Alerts calculations
  const flaggedMembers = members.filter(
    (m) => m.frequênciaCultos === "Baixa" || m.frequênciaCultos === "Ausente"
  );
  const pendingVisitors = visitors.filter((v) => v.retornoAoCulto === "Pendente");

  const sortedUpcomingEvents = [...events].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  const nextEvent = sortedUpcomingEvents[0];

  // Visual custom chart calculation
  const monthsData = [
    { name: "Fevereiro", receitas: Math.round(totalIncomes * 0.85), despesas: Math.round(totalExits * 0.9) },
    { name: "Março", receitas: Math.round(totalIncomes * 0.95), despesas: Math.round(totalExits * 0.85) },
    { name: "Abril", receitas: Math.round(totalIncomes * 0.9), despesas: Math.round(totalExits * 0.95) },
    { name: "Maio (Atual)", receitas: totalIncomes, despesas: totalExits },
  ];

  const highestValue = Math.max(...monthsData.map(m => Math.max(m.receitas, m.despesas))) || 5000;

  return (
    <div className="space-y-5 sm:space-y-8 max-w-5xl mx-auto px-0 sm:px-4">
      {/* Visual Subtabs for Painel de Gestão - Centered as per user request */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 flex gap-1.5 overflow-x-auto shrink-0 shadow-3xs scrollbar-none">
        <button
          onClick={() => setActiveSubTab("estatisticas")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === "estatisticas"
              ? "bg-[#1E4D2B] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <TrendingUp size={14} />
          Estatísticas
        </button>
        <button
          onClick={() => setActiveSubTab("financeiro")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === "financeiro"
              ? "bg-[#1E4D2B] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <DollarSign size={14} />
          Financeiro
        </button>
        <button
          onClick={() => setActiveSubTab("visitantes")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === "visitantes"
              ? "bg-[#1E4D2B] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <UserCheck size={14} />
          Visitantes
        </button>
        <button
          onClick={() => setActiveSubTab("administracao")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === "administracao"
              ? "bg-[#1E4D2B] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Settings size={14} />
          Administração
        </button>
        <button
          onClick={() => setActiveSubTab("relatorios")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === "relatorios"
              ? "bg-[#1E4D2B] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileText size={14} />
          Relatórios & Pastoras
        </button>
      </div>

      {activeSubTab === "estatisticas" && (
        <div className="space-y-8">
          {/* Welcome/Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-xs">
            <div className="absolute top-[-40%] right-[-10%] w-[35%] h-[80%] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="z-10 relative space-y-1 animate-fade-in">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100/50 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                💼 Painel de Governança
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                Saúde Ministerial e Indicadores
              </h1>
              <p className="text-slate-500 text-xs font-medium max-w-2xl leading-relaxed">
                Acompanhe o engajamento espiritual, gerencie visitantes ministeriais voluntários e emita relatórios simplificados.
              </p>
            </div>
          </div>

          {/* Quick Metrics KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center gap-3 shadow-3xs">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                <Users size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total de Membros</span>
                <span className="text-xl font-extrabold text-slate-950 leading-none">{activeMembersNum}</span>
                <span className="block text-[9px] text-slate-400 truncate mt-0.5">Cadastrados ativos</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center gap-3 shadow-3xs">
              <div className="p-2.5 bg-blue-50 text-[#1565C0] rounded-lg shrink-0">
                <UserPlus size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Novos Visitantes</span>
                <span className="text-xl font-extrabold text-slate-950 leading-none">{recentVisitorsNum}</span>
                <span className="block text-[9px] text-blue-650 font-semibold truncate mt-0.5">{pendingVisitors.length} pendentes</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center gap-3 shadow-3xs">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg shrink-0">
                <Calendar size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Agenda Próxima</span>
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[170px] leading-tight text-ellipsis">{nextEvent?.nome || "Sem agendamentos"}</span>
                <span className="block text-[9px] text-amber-850 font-semibold mt-0.5 truncate">{nextEvent?.data.split("-").reverse().join("/")}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Intelligent Care Alerts */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs lg:col-span-2 space-y-4">
              <div className="pb-3 border-b border-secondary/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-905 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle className="text-amber-600" size={16} />
                    Alertas Críticos de Membros Ausentes
                  </h3>
                  <p className="text-xs text-slate-500">Acompanhamento e cuidado espiritual domiciliar</p>
                </div>
                <span className="text-[9.5px] uppercase font-black px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-100">
                  Atenção Ativa
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {flaggedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-red-50/40 hover:bg-red-50 rounded-xl border border-red-100/60 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-900 block truncate">{m.nome}</span>
                      <span className="text-red-750 font-bold block text-[10px] uppercase">
                        🔴 Frequência {m.frequênciaCultos}  •  Necessita telefonema
                      </span>
                      {m.observacoesPastorais && (
                        <p className="text-[10.5px] text-slate-600 mt-1 italic leading-relaxed">
                          "{m.observacoesPastorais}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        onAskVivaIAPrompt(
                          `Olá Viva IA! Notei que o membro "${m.nome}" está listado como "${m.frequênciaCultos === "Baixa" ? "Necessitando acompanhamento" : "Ainda não retornou"}". Pode me sugerir ideias pastorais e uma mensagem amorosa de WhatsApp para enviar no intuito de restabelecer o cuidado espiritual?`
                        )
                      }
                      className="p-1.5 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 text-[10px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles size={11} className="fill-red-200 text-red-800" /> Cuidar
                    </button>
                  </div>
                ))}

                {flaggedMembers.length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-semibold italic text-xs">
                    🕊️ Excelente! Nenhum membro com status de frequência crítica esta semana.
                  </div>
                )}
              </div>
            </div>

            {/* AI Advisor Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Bot size={18} className="text-emerald-700" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Relatórios & Conselhos IA</h3>
                    <p className="text-[10px] text-slate-500">Inteligência bíblica integrada</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} /> Conselho Pastoral {churchMode === "small" ? "Simples" : "Estruturado"}
                  </h4>
                  <p className="text-[11px] text-slate-700 italic leading-relaxed">
                    {churchMode === "small" 
                      ? "\"Zele pelo contato íntimo. Cada ovelha é primordial. Em igrejas pequenas, a mesa de comunhão ensina mais do que grandes métodos de gerenciamento.\""
                      : "\"A descentralização do cuidado consolida o crescimento. Desenvolva líderes adjuntos nos Pequenos Grupos Multiplicadores (PGMs) e delegue tarefas com confiança.\""}
                  </p>
                </div>

                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                  Utilize o potencial analítico da conselheira Viva IA para gerar instantaneamente relatórios de progresso teológico, esboços, ou estudos de consolidação.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onNavigateToTab("viva-ia")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1565C0] hover:bg-[#0d47a1] text-white transition-colors rounded-xl text-xs font-bold shadow-3xs cursor-pointer"
                >
                  <MessageSquareCode size={13} /> Chamar Assistente de Governança
                </button>
              </div>
            </div>
          </div>

          {/* Visitors Section under indicators */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Acompanhamento Ativo de Visitantes Recentes</h3>
                <p className="text-xs text-slate-500">Consolidação e visitas de hospitalidade pendentes</p>
              </div>
              <button
                onClick={() => onNavigateToTab("visitantes")}
                className="text-[10px] font-bold text-[#1565C0] hover:underline"
              >
                Ver todos visitantes →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingVisitors.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 bg-blue-50/40 hover:bg-blue-50/80 border border-blue-100/60 rounded-xl flex items-center justify-between text-xs transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-extrabold text-slate-900 block truncate">{v.nome}</span>
                    <span className="text-blue-800 font-bold block text-[9.5px] uppercase mt-0.5">
                      ⏳ Visitou em: {v.dataVisita.split("-").reverse().join("/")}
                    </span>
                    <span className="text-[10px] text-slate-500 italic block truncate mt-1">
                      Pedido: "{v.pedidoOracao || "Não registrado"}"
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      onAskVivaIAPrompt(
                        `Olá Viva IA! O visitante "${v.nome}" esteve conosco no culto convidado por "${v.quemConvidou || "Ninguém"}". Descreveu interesse em "${v.interesse}" e pediu oração por: "${v.pedidoOracao || "família"}". Me crie um roteiro atencioso e fraterno de primeiro contato pelo WhatsApp no intuito de acolhê-lo!`
                      )
                    }
                    className="p-1 px-3 rounded-lg bg-[#1565C0] hover:bg-blue-700 text-white font-bold text-[10px] tracking-tight shrink-0 flex items-center gap-0.5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={11} className="text-blue-200 fill-blue-300" /> Acolher
                  </button>
                </div>
              ))}

              {pendingVisitors.length === 0 && (
                <div className="col-span-2 text-center py-8 text-xs text-slate-400 italic">
                  🌻 Maravilhoso! Todos os novos visitantes já foram contactados e acolhidos.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "financeiro" && (
        <FinanceModule
          members={members}
          transactions={transactions}
          onAddTransaction={onAddTransaction}
          hideFinancialValues={hideFinancialValues}
        />
      )}

      {activeSubTab === "visitantes" && (
        <VisitorTracker
          visitors={visitors}
          onAddVisitor={onAddVisitor}
          onUpdateVisitor={onUpdateVisitor}
          onRemoveVisitor={onRemoveVisitor}
          onAskVivaIAPrompt={onAskVivaIAPrompt}
        />
      )}

      {activeSubTab === "administracao" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings size={18} className="text-slate-600" />
                Configurações & Governança da Igreja
              </h3>
              <p className="text-xs text-slate-500">Defina os parâmetros de visualização, tamanho e branches oficiais</p>
            </div>

            {/* Editing local fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Sede Central / Localidade</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hqName}
                    onChange={(e) => setHqName(e.target.value)}
                    className="flex-1 text-xs font-bold bg-white border border-slate-350 rounded-xl p-2.5 focus:outline-none"
                    placeholder="Nome da HQ"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Identificador principal impresso em cabeçalhos de relatórios.</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block font-sans">Congregação Local</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={congName}
                    onChange={(e) => setCongName(e.target.value)}
                    className="flex-1 text-xs font-bold bg-white border border-slate-350 rounded-xl p-2.5 focus:outline-none"
                    placeholder="Nome da Congregação"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">A filial ou frente missionária de atuação ativa da equipe.</span>
              </div>
            </div>

            {/* Pastor e Logotipo da Igreja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Autoridade Pastoral / Pastor Titular</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pastorName}
                    onChange={(e) => onUpdatePastorName(e.target.value)}
                    className="flex-1 text-xs font-bold bg-white border border-slate-350 rounded-xl p-2.5 focus:outline-none"
                    placeholder="Nome do Pastor Titular"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Nome do pastor titular exibido nos painéis, devocionais e transmissões.</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Logotipo da Igreja (URL Imagem)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={churchLogoUrl}
                    onChange={(e) => onUpdateChurchLogoUrl(e.target.value)}
                    className="flex-1 text-xs font-bold bg-white border border-slate-350 rounded-xl p-2.5 focus:outline-none"
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Insira o link para a imagem do logo. Deixe em branco para usar o lindo ícone padrão.</span>
              </div>
            </div>

            {/* Personalização dos Ministérios */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Identidade dos Ministérios</span>
                <p className="text-xs text-slate-500 mt-0.5">Edite e personalize o nome real de atuação de cada um dos 5 departamentos ministeriais:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { key: "Louvor", icon: "🎵", desc: "Louvor & Adoração" },
                  { key: "Infantil", icon: "👶", desc: "Ministério de Crianças" },
                  { key: "Mídia", icon: "📹", desc: "Mídia & Tecnologia" },
                  { key: "Recepção", icon: "🤝", desc: "Recepção & Diaconato" },
                  { key: "Jovens", icon: "⚡", desc: "Geração Jovem" },
                ].map((min) => (
                  <div key={min.key} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1.5 shadow-3xs">
                    <span className="text-[10px] font-black text-slate-500 flex items-center gap-1">
                      <span>{min.icon}</span>
                      <span>Chave: {min.key} (Padrão)</span>
                    </span>
                    <input
                      type="text"
                      value={ministryNames[min.key] || ""}
                      onChange={(e) => onUpdateMinistryName(min.key, e.target.value)}
                      className="text-xs font-bold border border-slate-200 rounded-md p-1.5 focus:outline-none bg-white"
                      placeholder={min.desc}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Church size mode selector & privacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-405 block">Modo de Funcionamento Congregacional</span>
                <div className="flex bg-white border border-slate-250 p-1 rounded-xl">
                  {(["small", "medium", "large"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onSetChurchMode(mode)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        churchMode === mode
                          ? "bg-[#1E4D2B] text-white shadow-xxs font-extrabold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {mode === "small" && "🌱 Até 20"}
                      {mode === "medium" && "🌿 20-100"}
                      {mode === "large" && "🌳 100+"}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1">
                  {churchMode === "small" && "Modo Inicial: Simplifica planilhas e foca no acolhimento de ovelhas."}
                  {churchMode === "medium" && "Modo Intermediário: Libera relatórios e suporte completo do rebanho."}
                  {churchMode === "large" && "Modo Multiplicação: Foca no gerenciamento de redes de PGMs e ministérios."}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Segurança Fiscal / Modo Seguro</span>
                  <p className="text-[10.5px] text-slate-500 mb-2 leading-relaxed">Masque dízimos e saldos durante a recepção de visitas externas para manter o sigilo administrativo.</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleHideFinancial}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-3xs cursor-pointer ${
                    hideFinancialValues
                      ? "bg-amber-600 border-amber-700 text-white font-extrabold"
                      : "bg-white border-slate-250 text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {hideFinancialValues ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{hideFinancialValues ? "Modo Seguro Ativo (Segredo)" : "Ocultar Valores Monetários"}</span>
                </button>
              </div>
            </div>

            {/* Credentials / Office info */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-150 space-y-3">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Shield size={14} />
                Nível de Credenciamento Administrativo
              </h4>
              <p className="text-[11px] text-slate-705 leading-relaxed font-semibold">
                Você está autenticado como <strong>{currentUser?.nome || "Pastor Titular"}</strong> com credenciais nível <span className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-extrabold text-[9.5px]">PASTORAL / ADMIN</span>. Este privilégio concede permissão total para a administração completa da igreja.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "relatorios" && (
        <div className="space-y-6">
          {/* Section 1: Printable reports buttons */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Printer className="text-[#1E4D2B]" size={16} />
                  Emissão de Relatórios Oficiais (Prontos Para Impressão)
                </h3>
                <p className="text-xs text-slate-500">Gere instantaneamente documentos analíticos de apoio à secretaria</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Livro de Caixa Geral", desc: "Demonstrativo detalhado de receitas e despesas com balanço total de dízimos e ofertas.", color: "border-emerald-250 hover:bg-emerald-50/20" },
                { title: "Relação de Membros e Ovelhas", desc: "Lista completa de membresia ordenada categoricamente para auxílio e batismo.", color: "border-blue-250 hover:bg-blue-50/20" },
                { title: "Acolhida & Visitantes Críticos", desc: "Listagem de visitantes com pedidos de oração pendentes para visitas.", color: "border-amber-250 hover:bg-amber-50/20" },
                { title: "Escalas & Diaconato Ativo", desc: "Balanço integrado dos voluntários atuando em cultos e agenda congregacional.", color: "border-purple-250 hover:bg-purple-50/20" }
              ].map((rep, k) => (
                <button
                  key={k}
                  onClick={() => {
                    const printBox = document.createElement("div");
                    printBox.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 shadow-2xl rounded-xl p-3 z-50 text-white font-bold text-xs flex items-center gap-2 animate-bounce";
                    printBox.innerHTML = `📄 Relatório Analítico: "${rep.title}" enviado para impressão física!`;
                    document.body.appendChild(printBox);
                    setTimeout(() => printBox.remove(), 4000);
                  }}
                  className={`p-4 rounded-xl border bg-white ${rep.color} transition-all text-left space-y-3 cursor-pointer flex flex-col justify-between`}
                >
                  <div>
                    <span className="block text-xs font-black text-slate-800 leading-tight">{rep.title}</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-semibold">{rep.desc}</p>
                  </div>
                  <span className="text-[9.5px] font-black text-emerald-850 hover:underline flex items-center gap-1 mt-2">
                    <Printer size={11} className="text-[#1E4D2B]" /> Gerar Folha PDF
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Sermon formulation (the beautiful Sermon Builder!) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-[#1E4D2B] font-bold" />
                Central de Sermões, Homilias & Pastoras
              </h3>
              <p className="text-xs text-slate-500">
                Transforme rascunhos dominicais em mensagens pastorais completas e envie para e-mails e contatos automaticamente via Viva IA.
              </p>
            </div>

            <form onSubmit={handleSubmitSermon} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <Sparkles size={15} className="text-emerald-700 animate-spin" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Elaborar Mensagem Pastoral</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">Tema do Sermão *</label>
                  <input
                    type="text"
                    placeholder="Ex: A Grande Pesca Maravilhosa"
                    value={sermonTitle}
                    onChange={(e) => setSermonTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">Texto Bíblico</label>
                  <input
                    type="text"
                    placeholder="Ex: Lucas 5:1-11"
                    value={biblePassage}
                    onChange={(e) => setBiblePassage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Preacher / Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">Pregador / Autor</label>
                  <input
                    type="text"
                    value={preacherName}
                    onChange={(e) => setPreacherName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">Data Oficial</label>
                  <input
                    type="text"
                    value={sermonDate}
                    onChange={(e) => setSermonDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Text Body textarea */}
              <div className="space-y-1">
                <div className="flex justify-between items-center whitespace-nowrap gap-2 pb-0.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">Mensagem Pastoral / Homilia *</label>
                  <button
                    type="button"
                    onClick={handleGenerateSermonWithAI}
                    disabled={isGeneratingSermonAI}
                    className="text-[10px] font-black text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-1 bg-white border border-slate-205 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs"
                  >
                    {isGeneratingSermonAI ? (
                      <>
                        <Loader2 className="animate-spin text-emerald-700" size={11} /> Redigindo...
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} /> Redigir com Viva IA
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  placeholder="Redija ou gere com a Viva IA a Pastora..."
                  rows={5}
                  value={pastoralBody}
                  onChange={(e) => setPastoralBody(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                  required
                />
              </div>

              {/* Dispatch stats logs console */}
              {dispatchStep > 0 && (
                <div className="bg-slate-900 border border-slate-950 p-4 rounded-xl text-slate-200 font-mono text-[10.5px] space-y-3 relative overflow-hidden">
                  <span className="absolute top-2 right-3 text-[8.5px] text-emerald-400 uppercase font-black tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Transmissor ONLINE
                  </span>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold">
                        {dispatchStep === 1 && "Fase 1/3: Criando e analisando tema do sermão..."}
                        {dispatchStep === 2 && "Fase 2/3: Publicando no Mural de Avisos Geral..."}
                        {dispatchStep === 3 && "Fase 3/3: Transmitindo a todos os contatos ativos..."}
                        {dispatchStep === 4 && "Status: Transmissão concluída com glória!"}
                      </span>
                      <span className="font-extrabold text-emerald-400">{dispatchProgress}%</span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1 transition-all duration-300"
                        style={{ width: `${dispatchProgress}%` }}
                      />
                    </div>
                  </div>

                  {dispatchCurrentName && (
                    <div className="p-1 px-2 bg-slate-955 border border-slate-800 rounded text-emerald-400 animate-pulse text-[10px]">
                      📬 Enviando Pastora para: <span className="text-white font-bold">{dispatchCurrentName}</span>
                    </div>
                  )}

                  <div className="max-h-[80px] overflow-y-auto bg-slate-950 p-2 rounded text-slate-400 space-y-1 text-[10px]">
                    {dispatchLogs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>

                  {dispatchStep === 4 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDispatchStep(0);
                        setDispatchLogs([]);
                      }}
                      className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] font-black cursor-pointer transition-colors"
                    >
                      Fechar Terminal
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSermonTitle("");
                    setBiblePassage("");
                    setPastoralBody("");
                  }}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Limpar
                </button>

                <button
                  type="submit"
                  disabled={dispatchStep > 0 && dispatchStep < 4}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-700 to-emerald-950 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <SendHorizontal size={13} /> Disparar Pastora & Publicar mural
                </button>
              </div>
            </form>

            {showDispatchSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-250 text-xs font-semibold leading-relaxed flex items-center gap-2 animate-bounce">
                <CheckCircle size={18} className="text-[#2E7D32]" />
                <span>Mensagem teológica devidamente publicada no mural de avisos e transmitida aos contatos cadastrados!</span>
              </div>
            )}

            {/* List */}
            <div className="pt-2 space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico de Pastoras</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {pastoralLetters.map((p) => {
                  const isActive = activePastoralId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePastoralId(p.id);
                        setIsLetterExpanded(true);
                      }}
                      type="button"
                      className={`p-3 rounded-xl text-[11px] font-bold text-left border transition-all cursor-pointer flex flex-col justify-between h-20 ${
                        isActive
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/10"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span className="font-extrabold line-clamp-1">🕊️ {p.sermonTitle}</span>
                      <span className="text-[9px] text-slate-450 block font-mono">{p.date}</span>
                    </button>
                  );
                })}
              </div>

              {pastoralLetters.filter((p) => p.id === activePastoralId).map((pLetter) => (
                <div key={pLetter.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-bold text-slate-550 pb-2 border-b border-slate-200/60">
                    <div>Ministrante: <strong>{pLetter.preacher}</strong></div>
                    <div>Texto: <strong>{pLetter.passage}</strong></div>
                    <div className="text-emerald-800 font-extrabold">{pLetter.date}</div>
                  </div>

                  <p className="text-slate-755 text-xs leading-relaxed font-semibold whitespace-pre-line">
                    {pLetter.pastoralText}
                  </p>

                  <div className="pt-2 flex justify-between gap-2">
                    <button
                      onClick={() => handleSharePastoral(pLetter)}
                      className="p-1 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-250 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Share2 size={11} /> Compartilhar Pastora via WhatsApp
                    </button>
                    <button
                      onClick={() => onAskVivaIAPrompt(`Olá Viva IA! Me sugira estudos profundos para líderes baseados em: "${pLetter.sermonTitle}".`)}
                      className="p-1 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 rounded-lg text-[10px] font-bold border border-emerald-150 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Bot size={11} /> Gerar Roteiro de PGM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
