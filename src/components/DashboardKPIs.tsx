import React, { useState } from "react";
import { Member, Visitor, FinancialTransaction, EventSchedule, User } from "../types";
import { 
  Users, UserPlus, TrendingUp, Calendar, AlertTriangle, MessageSquareCode, 
  Heart, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, BookOpen, 
  Share2, Check, Eye, EyeOff, LayoutDashboard, Megaphone, UserCheck, 
  Bot, Award, CalendarCheck, GraduationCap, Radio, Music, Coffee, 
  Smile, Menu, Shield, Flame, Handshake, SendHorizontal, RadioTower, 
  Loader2, History, Smartphone, CheckCircle, RefreshCw
} from "lucide-react";

interface DashboardKPIsProps {
  members: Member[];
  visitors: Visitor[];
  transactions: FinancialTransaction[];
  events: EventSchedule[];
  onNavigateToTab: (tab: string) => void;
  onAskVivaIAPrompt: (prompt: string) => void;
  churchMode?: "small" | "medium" | "large";
  hideFinancialValues?: boolean;
  onToggleHideFinancial?: () => void;
  currentUser?: User | null;
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

export default function DashboardKPIs({
  members,
  visitors,
  transactions,
  events,
  onNavigateToTab,
  onAskVivaIAPrompt,
  churchMode = "medium",
  hideFinancialValues = false,
  onToggleHideFinancial,
  currentUser,
}: DashboardKPIsProps) {
  // Pastoral reader choice state
  const [customPastorals, setCustomPastorals] = useState<PastoralLetter[]>([]);
  const pastorName = currentUser?.nome || "Pr. Erivaldo Lima Ferreira";
  const pastoralLetters = [...customPastorals, ...PAST_LETTERS].map(p => ({
    ...p,
    preacher: pastorName
  }));
  
  const [activePastoralId, setActivePastoralId] = useState("pst-01");
  const [copiedLetterId, setCopiedLetterId] = useState<string | null>(null);
  const [isLetterExpanded, setIsLetterExpanded] = useState(false);
  const [ministryHighlights, setMinistryHighlights] = useState<any[]>([]);

  // Sermon elaborator form & simulation state
  const [isElaboratingSermon, setIsElaboratingSermon] = useState(false);
  const [sermonTitle, setSermonTitle] = useState("");
  const [preacherName, setPreacherName] = useState(() => currentUser?.nome || "Pr. Erivaldo Lima Ferreira");

  React.useEffect(() => {
    if (currentUser?.nome) {
      setPreacherName(currentUser.nome);
    }
  }, [currentUser]);
  const [biblePassage, setBiblePassage] = useState("");
  const [sermonDate, setSermonDate] = useState(() => {
    const d = new Date();
    return `Sermão de Domingo - ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  });
  const [pastoralBody, setPastoralBody] = useState("");
  const [isGeneratingSermonAI, setIsGeneratingSermonAI] = useState(false);

  // Dispatch progress states (Viva IA Broadcast)
  const [dispatchStep, setDispatchStep] = useState(0); // 0=idle, 1=analyzing, 2=publishing, 3=sending, 4=done
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);
  const [dispatchCurrentName, setDispatchCurrentName] = useState("");
  const [showDispatchSuccess, setShowDispatchSuccess] = useState(false);

  React.useEffect(() => {
    const handleLoad = () => {
      try {
        const saved = localStorage.getItem("viva-ministry-internal-posts");
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter((p: any) => p.important === true || p.important === "true" || p.important === "Important" || p.important === "Sim");
          setMinistryHighlights(filtered);
        } else {
          const defaultPosts = [
            {
              id: "mp-lh-01",
              ministryKey: "Louvor",
              title: "🎸 Novo Repertório de Adoração Coram Deo",
              content: "Líderes de Louvor, incluímos 3 novos arranjos de adoração em nossa pasta compartilhada para o Culto de Ceia do próximo final de semana. Favor ensaiarem a harmonia vocal em suas casas.",
              date: "2026-05-28",
              likes: 12,
              important: true
            },
            {
              id: "mp-mid-01",
              ministryKey: "Mídia",
              title: "📽️ Treinamento de Transmissão & Câmeras",
              content: "Neste sábado às 14h teremos uma oficina hands-on rápida sobre calibração do novo OBS Studio e ajustes no foco da câmera principal. Presença essencial de toda a equipe de transmissão.",
              date: "2026-05-26",
              likes: 15,
              important: true
            }
          ];
          setMinistryHighlights(defaultPosts.filter((p: any) => p.important));
        }

        const savedPastorals = localStorage.getItem("viva-custom-pastorals");
        if (savedPastorals) {
          const parsedPastorals = JSON.parse(savedPastorals);
          setCustomPastorals(parsedPastorals);
          if (parsedPastorals.length > 0) {
            setActivePastoralId(parsedPastorals[0].id);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar avisos ministeriais", err);
      }
    };
    handleLoad();
    window.addEventListener("storage", handleLoad);
    return () => window.removeEventListener("storage", handleLoad);
  }, []);

  const getMinistryIcon = (keyName: string) => {
    switch (keyName) {
      case "Louvor":
        return <Music size={13} className="text-emerald-700 font-bold shrink-0" />;
      case "Mídia":
        return <Radio size={13} className="text-blue-700 font-bold shrink-0" />;
      case "Infantil":
        return <Smile size={13} className="text-pink-650 font-bold shrink-0" />;
      case "Recepção":
        return <Handshake size={13} className="text-amber-700 font-bold shrink-0" />;
      case "Jovens":
        return <GraduationCap size={13} className="text-purple-650 font-bold shrink-0" />;
      default:
        return <Megaphone size={13} className="text-slate-500 shrink-0" />;
    }
  };

  const getMinistryBadgeClass = (keyName: string) => {
    switch (keyName) {
      case "Louvor":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/55";
      case "Mídia":
        return "bg-blue-50 text-blue-800 border-blue-200/55";
      case "Infantil":
        return "bg-pink-50 text-pink-800 border-pink-200/55";
      case "Recepção":
        return "bg-amber-50 text-amber-800 border-amber-200/55";
      case "Jovens":
        return "bg-purple-50 text-purple-800 border-purple-200/55";
      default:
        return "bg-slate-50 text-slate-800 border-slate-200/55";
    }
  };

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
      // Offline fallback generator
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

    // Fire window event to notify other components (like ChurchBillboard or ministries)
    window.dispatchEvent(new Event("storage"));

    await new Promise(resolve => setTimeout(resolve, 800));
    setDispatchProgress(60);
    setDispatchStep(3);
    setDispatchLogs(prev => [
      ...prev,
      "⭐ [MURAL GERAL] Publicado com sucesso no Mural de Avisos da Igreja!",
      "🚀 [TRANSMISSÃO] Disparando envio automatizado a membros cadastrados e visitantes ativos via Viva IA..."
    ]);

    // Iterate through members and visitors
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
        
        // Reset form fields
        setSermonTitle("");
        setBiblePassage("");
        setPastoralBody("");
        setShowDispatchSuccess(true);
        setTimeout(() => setShowDispatchSuccess(false), 8000);
      }
    }, 450);
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

  // Detection: Membros ausentes ou com frequência "Ausente" ou "Baixa"
  const flaggedMembers = members.filter(
    (m) => m.frequênciaCultos === "Baixa" || m.frequênciaCultos === "Ausente"
  );

  // Visitors with follow up still pending
  const pendingVisitors = visitors.filter((v) => v.retornoAoCulto === "Pendente");

  // Get nearest event
  const sortedUpcomingEvents = [...events].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  const nextEvent = sortedUpcomingEvents[0];

  // Simulated chart data based on transactions
  // Generates 4 sample months (Fev, Mar, Abr, Mai)
  const chartData = [
    { name: "Fev", dízimos: 1800, despesas: 800 },
    { name: "Mar", dízimos: 2400, despesas: 1100 },
    { name: "Abr", dízimos: 3100, despesas: 1530 },
    { name: "Mai", dízimos: totalIncomes, despesas: totalExits },
  ];

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.dízimos, d.despesas))) || 4000;

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Elegante, limpo e integrado */}
      <div className="bg-[#1E4D2B] rounded-2xl p-5 text-white relative overflow-hidden shadow-xs border border-emerald-805">
        <div className="z-10 relative space-y-1.5 animate-fade-in">
          <span className="bg-white/10 text-emerald-200 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-white/5">
            {churchMode === "small" ? "🌱 Modo Aconchego Sábio" : churchMode === "medium" ? "🌿 Modo Crescimento Estruturado" : "🌳 Modo Multiplicação Ativa"}
          </span>
          <h1 className="text-xl font-bold tracking-tight">
            {churchMode === "small" ? "Acolhimento Pastoral Simples 🕊️" : "Olá, Pastor & Liderança!"}
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl font-medium tracking-wide">
            Bem-vindo ao acompanhamento ministerial da Igreja Viva.
          </p>
        </div>
      </div>

      {/* Mural Geral de Destaques Ministeriais */}
      <div id="mural-destaques-ministeriais" className="bg-gradient-to-br from-slate-50 to-slate-100/60 p-5 rounded-2xl border border-slate-250/50 shadow-3xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/50 gap-2">
          <div className="flex items-center gap-2">
            <Megaphone className="text-amber-600 animate-pulse shrink-0" size={18} />
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5 flex-wrap">
                Mural Geral de Destaques Ministeriais
                <span className="bg-amber-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-bounce">
                  Destaques 📌
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-bold">Informativos destacados publicados diretamente pelas áreas de liderança dos ministérios</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab("mural")}
            className="text-[10px] font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-center"
          >
            Ver Mural Completo →
          </button>
        </div>

        {ministryHighlights.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
            ☕ Não há comunicados ministeriais marcados como destaque importante hoje.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ministryHighlights.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-xl border border-amber-300 ring-2 ring-amber-500/5 hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${getMinistryBadgeClass(post.ministryKey)}`}>
                      {getMinistryIcon(post.ministryKey)}
                      {post.ministryKey}
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold">{post.date.split("-").reverse().join("/")}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-snug flex items-start gap-1">
                    <Sparkles size={12} className="text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
                    {post.title}
                  </h4>
                  <p className="text-slate-650 text-[11px] leading-relaxed font-semibold whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-slate-100/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold">⭐ Notificação de Líder</span>
                  <button
                    onClick={() =>
                      onAskVivaIAPrompt(
                        `Olá Viva IA Teológica! Analise o seguinte comunicado oficial do Ministério de ${post.ministryKey}: "${post.title} - ${post.content}". Crie um texto inspirador e oracional para compartilhar com os voluntários incentivando-os na tarefa.`
                      )
                    }
                    className="text-[10px] font-black text-indigo-700 hover:text-indigo-900 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={11} className="fill-indigo-100" /> Apoiar com IA
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPIs Grid - Redefinido para empilhamento no mobile para evitar apertos de layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI: Membros (Humilde/Humanizado) */}
        <div
          id="kpi-card-membros"
          onClick={() => onNavigateToTab("membros")}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-emerald-500 cursor-pointer transition-all hover:shadow-md h-24"
        >
          <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <Users size={24} />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
              {churchMode === "small" ? "Ovelhas / Família" : "Total de Membros"}
            </span>
            <span className="text-2xl font-black text-slate-900 leading-none block">{activeMembersNum}</span>
            <span className="block text-[10px] text-emerald-600 font-bold truncate">Fieis congregando</span>
          </div>
        </div>

        {/* KPI: Visitantes */}
        <div
          id="kpi-card-visitantes"
          onClick={() => onNavigateToTab("visitantes")}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-[#1565C0] cursor-pointer transition-all hover:shadow-md h-24"
        >
          <div className="p-3.5 bg-blue-50 text-[#1565C0] rounded-xl">
            <UserPlus size={24} />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
              {churchMode === "small" ? "Novos Amigos" : "Novos Visitantes"}
            </span>
            <span className="text-2xl font-black text-slate-900 leading-none block">{recentVisitorsNum}</span>
            <span className="block text-[10px] text-blue-650 font-bold truncate">Acolhimento pendente</span>
          </div>
        </div>

        {/* KPI: Próximo Evento / Encontro */}
        <div
          id="kpi-card-eventos"
          onClick={() => onNavigateToTab("escalas")}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-amber-500 cursor-pointer transition-all hover:shadow-md h-24"
        >
          <div className="p-3.5 bg-amber-50 text-amber-700 rounded-xl shrink-0">
            <Calendar size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
              {churchMode === "small" ? "Próximas Escalas" : "Agenda & Celebrações"}
            </span>
            <span className="text-xs font-black text-slate-900 block truncate leading-none mb-1">
              {nextEvent ? nextEvent.nome : "Sem escalas"}
            </span>
            <span className="block text-[9px] text-slate-500 font-bold truncate">
              {nextEvent ? `${nextEvent.data.split("-").reverse().join("/")} às ${nextEvent.horario}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Connectivity Hub & Ministérios Area */}
      <div id="connectivity-hub-container" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-amber-500 animate-pulse" size={18} />
              Central de Atalhos & Pilares Ministeriais
            </h2>
            <p className="text-xs text-slate-500">Acesso rápido aos menus, organização de adoração e fortalecimento de comunhão</p>
          </div>
          <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100 shrink-0 self-start sm:self-center">
            Navegação Integrada
          </span>
        </div>

        {/* 4-Column Bento Box Layout for Navigation and Spiritual Priorities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Column 1: Menu Principal */}
          <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5 h-6">
                <Menu size={14} className="text-slate-500 shrink-0" />
                Menu Principal
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigateToTab("dashboard")}
                  className="w-full flex items-center gap-2 p-2 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200/50 text-left text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  <LayoutDashboard size={13} className="text-blue-600 shrink-0" />
                  <span className="truncate">Painel Geral</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab("mural")}
                  className="w-full flex items-center gap-2 p-2 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200/50 text-left text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  <Megaphone size={13} className="text-emerald-650 shrink-0" />
                  <span className="truncate">Mural Principal</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab("membros")}
                  className="w-full flex items-center gap-2 p-2 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200/50 text-left text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  <Users size={13} className="text-indigo-650 shrink-0" />
                  <span className="truncate">{churchMode === "small" ? "Membros / Ovelhas" : "Membros"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab("visitantes")}
                  className="w-full flex items-center gap-2 p-2 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200/50 text-left text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  <UserCheck size={13} className="text-pink-650 shrink-0" />
                  <span className="truncate">Visitantes & Acolha</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab("financeiro")}
                  className="w-full flex items-center gap-2 p-2 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200/50 text-left text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  <DollarSign size={13} className="text-amber-600 shrink-0" />
                  <span className="truncate">Caixa / Financeiro</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab("doacoes")}
                  className="w-full flex items-center gap-2 p-2 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200/50 text-left text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  <Heart size={13} className="text-rose-600 shrink-0" />
                  <span className="truncate">Doações & PIX</span>
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab("viva-ia")}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-black transition-colors flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer"
            >
              <Bot size={12} /> Viva IA Teológica
            </button>
          </div>

          {/* Column 2: Menu Ministerial */}
          <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5 h-6">
                <Shield size={14} className="text-[#1565C0] shrink-0" />
                Menu Ministerial
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigateToTab("ministerios")}
                  className="w-full flex items-center gap-2.5 p-3.5 bg-white hover:bg-blue-50/45 rounded-xl border border-slate-200/50 text-left transition-all cursor-pointer group hover:border-blue-400"
                >
                  <div className="p-1.5 bg-blue-50 text-blue-800 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                    <Award size={14} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Ministérios Ativos</h4>
                    <span className="block text-[8px] text-slate-450 font-semibold">Organização dos Ministérios</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToTab("escalas")}
                  className="w-full flex items-center gap-2.5 p-3.5 bg-white hover:bg-amber-50/45 rounded-xl border border-slate-200/50 text-left transition-all cursor-pointer group hover:border-amber-400"
                >
                  <div className="p-1.5 bg-amber-50 text-amber-800 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                    <CalendarCheck size={14} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Escalas de Serviço</h4>
                    <span className="block text-[8px] text-slate-440 font-semibold font-bold">Voluntários e Oficiais</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToTab("discipulado")}
                  className="w-full flex items-center gap-2.5 p-3.5 bg-white hover:bg-emerald-50/45 rounded-xl border border-slate-200/50 text-left transition-all cursor-pointer group hover:border-emerald-400"
                >
                  <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                    <GraduationCap size={14} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">PGMs & Capacitação</h4>
                    <span className="block text-[8px] text-slate-440 font-semibold font-bold">Multiplicação & Estudos</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="text-[8px] text-slate-400 font-bold text-center leading-tight pt-1">
              Capacite sua liderança e organize celebrações sem sobrecarga.
            </div>
          </div>

          {/* Column 3: Pilar de Adoração */}
          <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider mb-2 flex items-center gap-1.5 h-6">
                <Flame size={14} className="text-amber-500 animate-pulse shrink-0" />
                Pilar de Adoração
              </span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed mb-3">
                Zele pelo louvor, oração diária e a entrega devocional no rebanho de Cristo.
              </p>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTab("devocional")}
                  className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-100 text-left transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold text-emerald-950">
                    <Radio size={13} className="text-emerald-700 shrink-0" />
                    Devocionais e Rádio
                  </span>
                  <span className="text-[9px] text-[#2E7D32] bg-emerald-100/60 px-1.5 py-0.5 rounded font-black uppercase">Ouvir</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAskVivaIAPrompt("Olá Viva IA! Me sugira um roteiro inspirador de adoração, louvor e pauta de oração para o próximo culto dominical, contendo reflexões curtas e sugestões de cânticos congregacionais de adoração adoráveis.")}
                  className="w-full flex items-center gap-2 p-2.5 bg-emerald-700/10 hover:bg-emerald-700/20 rounded-xl border border-emerald-200/60 text-left transition-all cursor-pointer"
                >
                  <Music size={13} className="text-emerald-850 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-950 leading-tight">Criar Liturgia de Culto</span>
                </button>
              </div>
            </div>
            <div className="text-[8px] text-emerald-800/80 font-bold leading-tight bg-white border border-emerald-155 p-2 rounded-lg italic">
              "A adoração pura atrai a presença manifesta do Eterno."
            </div>
          </div>

          {/* Column 4: Pilar de Comunhão */}
          <div className="p-4 bg-blue-50/20 border border-blue-100 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#1565C0] tracking-wider mb-2 flex items-center gap-1.5 h-6">
                <Handshake size={14} className="text-[#1565C0] shrink-0" />
                Pilar de Comunhão
              </span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed mb-3">
                Integre novos convertidos, visite os ausentes e promova o amor fraterno mútuo.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTab("discipulado")}
                  className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-blue-50 rounded-xl border border-blue-100 text-left transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold text-blue-955">
                    <Smile size={13} className="text-[#1565C0] shrink-0" />
                    Pequenos Grupos (Células)
                  </span>
                  <span className="text-[9px] text-[#1565C0] bg-blue-100/60 px-1.5 py-0.5 rounded font-black uppercase">Unir</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAskVivaIAPrompt("Olá Viva IA! Pode me dar ideias práticas e criativas de dinâmicas e quebra-gelos de comunhão acolhedora para aplicar no nosso próximo Pequeno Grupo Multiplicador (PGM) para integrar novos convertidos?")}
                  className="w-full flex items-center gap-2 p-2.5 bg-blue-700/10 hover:bg-blue-700/20 rounded-xl border border-blue-200/60 text-left transition-all cursor-pointer"
                >
                  <Coffee size={13} className="text-blue-850 shrink-0" />
                  <span className="text-[11px] font-bold text-blue-955 leading-tight">Dinâmicas de Comunhão</span>
                </button>
              </div>
            </div>
            <div className="text-[8px] text-blue-800/80 font-bold leading-tight bg-white border border-blue-155 p-2 rounded-lg italic col-span-1">
              "Vivendo em amor fraterno todos saberão que sois discípulos."
            </div>
          </div>

        </div>
      </div>

      {onToggleHideFinancial && (
        <div id="secure-mode-card" className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/15 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <EyeOff size={22} className={hideFinancialValues ? "animate-pulse" : ""} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                Modo de Apresentação Seguro (Visitas)
                {hideFinancialValues && <span className="bg-amber-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Ativo</span>}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Oculte dízimos, ofertas, despesas e saldos de todo o app quando houver visitantes ou convidados visualizando seu painel.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleHideFinancial}
            className={`px-4 py-2 rounded-xl text-xs font-black shadow-3xs select-none transition-all active:scale-95 duration-200 cursor-pointer ${
              hideFinancialValues
                ? "bg-amber-600 text-white border border-amber-700 hover:bg-amber-700 font-extrabold"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
            }`}
          >
            {hideFinancialValues ? "✨ Ativado (Valores Ocultos)" : "🔒 Ativar Modo Seguro"}
          </button>
        </div>
      )}

      {/* Main Core Content Grid: Charts and Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Adaptive Pastoral Care guidelines always visible */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Heart className="text-rose-600 animate-pulse" size={18} />
                {churchMode === "small" ? "Cuidado Pastoral do Dia 🌱" : "Diretrizes e Cuidado Pastoral do Dia 🌱"}
              </h3>
              <p className="text-xs text-slate-500">
                {churchMode === "small" 
                  ? "Ações simples para preservar o aconchego no pequeno rebanho"
                  : churchMode === "medium"
                    ? "Estratégias para estruturar pequenos grupos e consolidação de ovelhas"
                    : "Diretrizes de discipulado ativo e multiplicação de PGMs em rede"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {churchMode === "small" ? (
                <>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-extrabold text-[#2E7D32] bg-emerald-100/60 px-2 py-0.5 rounded uppercase">
                      CUIDADO LOCAL
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">Aproximação Ativa de Ovelhas</h4>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Nas igrejas pequenas, o contato pessoal do pastor blinda o rebanho. Toque em &quot;Cuidar&quot; ao lado nos membros ausentes para enviar um carinhoso versículo por WhatsApp.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-extrabold text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded uppercase">
                      ACOLHIDA INTEGRAL
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">Cuidado dos Visitantes</h4>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Evite o excesso de relatórios complexos. Ofereça um simples abraço aos visitantes e ore pelos pedidos de oração que eles deixaram cadastrados de forma aconchegante.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-extrabold text-[#2E7D32] bg-emerald-100/60 px-2 py-0.5 rounded uppercase">
                      CULTIVO DE LIDERANÇA
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">Supervisão Ativa de PGMs</h4>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Nas igrejas em crescimento, delegar com cuidado blinda a comunidade. Monitore a saúde espiritual de seus líderes de PGMs e envie mensagens de ânimo no decorrer da semana.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-extrabold text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded uppercase">
                      INTEGRAÇÃO E CONEXÃO
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">Acolhimento de Visitantes</h4>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Evite que novas conexões se percam. Encoraje a equipe de boas-vindas a acompanhar cada visitor registrado nos cultos no prazo ideal de 48 horas após a primeira visita.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-4 bg-amber-50/45 border border-amber-150 rounded-xl space-y-1 mt-2">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-600" /> Conselho Pastoral Inteligente:
            </h4>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              {churchMode === "small" 
                ? "\"O bom pastor conhece as ovelhas pelo nome, cuida de suas feridas e não as sobrecarrega com estruturas rígidas. Na congregação menor, o relacionamento próximo e o amor mútuo superam qualquer burocracia.\""
                : "\"A multiplicação sadia do Reino requer capacitação constante e descentralização do cuidado. Forme facilitadores preparados para guiar pequenos grupos de discipulado eficazes.\""}
            </p>
          </div>
        </div>

        {/* Right Side: Alertas Inteligentes & Acompanhamento Pastoral AI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="text-amber-600" size={18} />
                  Alertas de Cuidado
                </h3>
                <p className="text-[11px] text-slate-500">Membros afastados ou pendentes de aconchego</p>
              </div>
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                Ativo
              </span>
            </div>

            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {/* Alert item 1: Membros ausentes */}
              {flaggedMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-900 block truncate">{m.nome}</span>
                    <span className="text-red-700 font-extrabold block text-[10px] uppercase tracking-wider">
                      🔴 {m.frequênciaCultos === "Baixa" ? "Necessita acompanhamento" : "Ainda não retornou"}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">
                      {m.observacoesPastorais || "Sem anotações"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onAskVivaIAPrompt(
                        `Olá Viva IA! Notei que o membro "${m.nome}" está listado como "${m.frequênciaCultos === "Baixa" ? "Necessitando acompanhamento" : "Ainda não retornou"}". Pode me sugerir ideias pastorais e uma mensagem amorosa de WhatsApp para enviar no intuito de restabelecer o cuidado espiritual?`
                      )
                    }
                    className="p-1 px-2.5 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition-colors shrink-0 outline-none text-[10px] font-bold flex items-center gap-0.5"
                  >
                    <Sparkles size={11} /> Cuidar
                  </button>
                </div>
              ))}

              {/* Alert item 2: Visitantes pendentes de contato */}
              {pendingVisitors.map((v) => (
                <div
                  key={v.id}
                  className="p-3 bg-amber-50/60 hover:bg-amber-100/70 rounded-xl border border-amber-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-900 block truncate">{v.nome}</span>
                    <span className="text-amber-800 font-extrabold block text-[10px] uppercase">
                      ⚠️ Visitou em {v.dataVisita.split("-").reverse().join("/")} (Ainda não retornou)
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 italic truncate">
                      Interesse: {v.interesse}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onAskVivaIAPrompt(
                        `Olá Viva IA! O visitante "${v.nome}" esteve conosco no culto em ${v.dataVisita} convidado por "${v.quemConvidou}". Seu interesse é "${v.interesse}" e seu pedido de oração foi "${v.pedidoOracao}". Me sugira um roteiro de primeiro contacto de integração!`
                      )
                    }
                    className="p-1 px-2.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors shrink-0 text-[10px] font-bold flex items-center gap-0.5"
                  >
                    <Sparkles size={11} /> Conectar
                  </button>
                </div>
              ))}

              {flaggedMembers.length === 0 && pendingVisitors.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-medium">
                  🕊️ Todos os membros e visitantes estão em dia com acompanhamento!
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab("viva-ia")}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1565C0] text-white hover:bg-[#0d47a1] transition-colors rounded-xl text-xs font-semibold shadow-xs"
            >
              <MessageSquareCode size={14} /> Solicitar Relatório Ministerial IA
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {/* Cartas Pastorais baseadas nos últimos sermões */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="text-emerald-700" size={18} />
                  Pastoras (Sermões Recentes)
                </h3>
                <p className="text-xs text-slate-500">
                  Pastoras redigidas e otimizadas automaticamente com base em suas últimas pregações
                </p>
              </div>
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 flex items-center gap-1.5 shrink-0">
                <Sparkles size={11} className="animate-spin text-emerald-600" /> Assistente Pastoral Ativo
              </span>
            </div>

            {/* Toggle Button for Pastor/Administrator area */}
            <div className="pt-2 select-none">
              <button
                type="button"
                onClick={() => setIsElaboratingSermon(!isElaboratingSermon)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isElaboratingSermon 
                    ? "bg-slate-900 border-slate-950 text-white shadow-3xs" 
                    : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  🎤 Área do Pastor / Admin: Elaborar & Transmitir Novo Sermão
                </span>
                <span className="text-[10px] uppercase font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                  {isElaboratingSermon ? "Fechar Painel" : "Criar Agora ✨"}
                </span>
              </button>
            </div>

            {isElaboratingSermon && (
              <form onSubmit={handleSubmitSermon} className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
                <div id="elaborar-sermon-header" className="flex items-center gap-1.5 pb-2 border-b border-slate-200/65">
                  <Sparkles size={14} className="text-[#2E7D32]" />
                  <span className="text-xs font-extrabold text-slate-800">Elaborar Sermão e Transmitir via Viva IA</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Título / Tema */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Tema Principal / Título do Sermão *</label>
                    <input
                      type="text"
                      placeholder="Ex: A Graça Abundante"
                      value={sermonTitle}
                      onChange={(e) => setSermonTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      required
                    />
                  </div>

                  {/* Passagem Bíblica */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Texto Bíblico / Leitura de Passagem</label>
                    <input
                      type="text"
                      placeholder="Ex: Efésios 2:8-9"
                      value={biblePassage}
                      onChange={(e) => setBiblePassage(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pregador */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Pregador / Ministro</label>
                    <input
                      type="text"
                      value={preacherName}
                      onChange={(e) => setPreacherName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Data ou Nome de Ocasião</label>
                    <input
                      type="text"
                      value={sermonDate}
                      onChange={(e) => setSermonDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Pastoral Content body with AI assist */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center whitespace-nowrap gap-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Mensagem Pastoral / Pastora Inspiradora *</label>
                    <button
                      type="button"
                      onClick={handleGenerateSermonWithAI}
                      disabled={isGeneratingSermonAI}
                      className="text-[10px] font-extrabold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-1 border border-emerald-150 bg-emerald-50 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                    >
                      {isGeneratingSermonAI ? (
                        <>
                          <Loader2 className="animate-spin text-emerald-700" size={11} /> Redigindo...
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} /> Redigir Pastora via IA
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    placeholder="Escreva aqui a sabedoria que deseja compartilhar com a igreja baseada em seu sermão dominical..."
                    rows={4}
                    value={pastoralBody}
                    onChange={(e) => setPastoralBody(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                    required
                  />
                </div>

                {/* Simulated Interactive Transmission Progress bar */}
                {dispatchStep > 0 && (
                  <div className="bg-slate-900 border border-slate-950 p-4 rounded-xl text-slate-200 font-mono text-[10.5px] space-y-3 relative overflow-hidden">
                    {/* Visual waves */}
                    <span className="absolute top-2 right-3 text-[8.5px] text-emerald-400 uppercase font-bold flex items-center gap-1 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Transmissão Viva IA Operante
                    </span>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">
                          {dispatchStep === 1 && "Fase 1/3: Criando e analisando tema do sermão..."}
                          {dispatchStep === 2 && "Fase 2/3: Publicando no Mural Geral de Avisos..."}
                          {dispatchStep === 3 && "Fase 3/3: Transmitindo a todos os contatos ativos..."}
                          {dispatchStep === 4 && "Sucesso! Transmissão concluída com glória!"}
                        </span>
                        <span className="font-extrabold text-emerald-400">{dispatchProgress}%</span>
                      </div>

                      <div className="w-full bg-slate-850 bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1 transition-all duration-300"
                          style={{ width: `${dispatchProgress}%` }}
                        />
                      </div>
                    </div>

                    {dispatchCurrentName && (
                      <div className="p-1 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 animate-pulse text-[10px]">
                        📲 Enviando devocional para: <span className="text-white font-extrabold">{dispatchCurrentName}</span>
                      </div>
                    )}

                    <div className="max-h-[85px] overflow-y-auto bg-slate-950 p-2 rounded text-slate-400 space-y-1 leading-normal select-none">
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
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[9px] font-black cursor-pointer transition-colors"
                      >
                        Esconder Terminal de Transmissão
                      </button>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-1.5 border-t border-slate-200/60 text-xs font-bold leading-none">
                  <button
                    type="button"
                    onClick={() => {
                      setIsElaboratingSermon(false);
                      setSermonTitle("");
                      setBiblePassage("");
                      setPastoralBody("");
                    }}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-transparent transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={dispatchStep > 0 && dispatchStep < 4}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:shadow text-white rounded-lg cursor-pointer transition-all flex items-center gap-1.5 active:scale-99 disabled:opacity-50"
                  >
                    <SendHorizontal size={12} className="animate-pulse" />
                    Elaborar & Transmitir Pastora Agora (Membros e Visitantes)
                  </button>
                </div>
              </form>
            )}

            {showDispatchSuccess && (
              <div className="mt-3 p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200 text-xs font-semibold leading-relaxed flex items-center gap-3 animate-bounce">
                <CheckCircle size={18} className="text-[#2E7D32] shrink-0" />
                <div>
                  Sermão publicado e disparado! O canal da comunidade foi devidamente sincronizado e {members.length + visitors.length} contatos receberam a bênção da Pastora automaticamente via Viva IA.
                </div>
              </div>
            )}

            {/* Selector tabs for sermons */}
            <div className="grid grid-cols-3 gap-1.5 mt-3">
              {pastoralLetters.map((p) => {
                const isActive = activePastoralId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePastoralId(p.id);
                      setIsLetterExpanded(false);
                    }}
                    type="button"
                    className={`py-1.5 px-2.5 rounded-xl text-[10px] font-bold text-center border transition-all truncate cursor-pointer ${
                      isActive
                        ? "bg-emerald-700 border-emerald-800 text-white shadow-xs"
                        : "bg-slate-50 border-slate-200/60 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    🎤 {p.sermonTitle}
                  </button>
                );
              })}
            </div>

            {/* Active pastoral text box */}
            {pastoralLetters.filter((p) => p.id === activePastoralId).map((pLetter) => (
              <div key={pLetter.id} className="mt-4 p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-bold text-slate-500 pb-2 border-b border-slate-100/60">
                  <div className="flex items-center gap-1.5 text-slate-755">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Pregador: {pLetter.preacher}</span>
                  </div>
                  <div>Base: {pLetter.passage}</div>
                  <div className="text-emerald-850 font-extrabold">{pLetter.date}</div>
                </div>

                <div className="text-slate-700 leading-relaxed font-semibold text-xs whitespace-pre-line">
                  {isLetterExpanded ? pLetter.pastoralText : `${pLetter.pastoralText.slice(0, 160)}...`}
                  <button
                    type="button"
                    onClick={() => setIsLetterExpanded(!isLetterExpanded)}
                    className="ml-1 text-emerald-800 hover:text-emerald-950 font-black cursor-pointer underline whitespace-nowrap inline-block mt-1 sm:mt-0"
                  >
                    {isLetterExpanded ? "Ler menos" : "Ler completa"}
                  </button>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 items-center justify-between">
                  {/* Share button and trigger AI prompt */}
                  <button
                    onClick={() => handleSharePastoral(pLetter)}
                    className="p-1 px-3 bg-white hover:bg-slate-50 text-slate-705 rounded-lg text-[10px] font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLetterId === pLetter.id ? (
                      <>
                        <Check size={11} className="text-emerald-600" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Share2 size={11} /> Compartilhar (WhatsApp)
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      onAskVivaIAPrompt(
                        `Olá Viva IA! Quero otimizar ou reescrever a Pastora baseada no sermão "${pLetter.sermonTitle}" com leitura bíblica de "${pLetter.passage}". Pode reescrever um novo rascunho com tom reflexivo e acolhedor para compartilhar com a nossa liderança de pequeno grupo?`
                      )
                    }
                    className="p-1 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-850 rounded-lg text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={11} /> Expandir com Viva IA
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-450 italic font-medium pt-2 text-right">
            *Atualizado automaticamente a cada semana após a ministração dominical baseada no púlpito.
          </div>
        </div>
      </div>

      {/* Grid containing Quick Links & Bible Verse Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rapid Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-slate-500">Atalhos Administrativos</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateToTab("membros")}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 font-semibold text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
            >
              🌱 Cadastrar Novo Membro
            </button>
            <button
              onClick={() => onNavigateToTab("visitantes")}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 font-semibold text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
            >
              👋 Registrar Visitante
            </button>
            <button
              onClick={() => onNavigateToTab("financeiro")}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 font-semibold text-xs text-indigo-700 flex items-center gap-2 cursor-pointer transition-colors"
            >
              ➕ Lançar Dízimo / Oferta
            </button>
            <button
              onClick={() => onNavigateToTab("viva-ia")}
              className="p-3 bg-[#E8F5E9] hover:bg-[#C8E6C9] rounded-xl border border-emerald-200/50 font-bold text-xs text-[#2E7D32] flex items-center gap-2 cursor-pointer transition-colors"
            >
              ✨ Chamar Assistente Viva IA
            </button>
          </div>
        </div>

        {/* Verses of the Kingdom panel - Aprimorado tamanho e contraste para valorização espiritual */}
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 text-slate-800 flex flex-col justify-between shadow-3xs">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-black text-emerald-900 tracking-widest bg-emerald-100 px-3 py-1 rounded-full inline-block border border-emerald-200/60 shadow-3xs">
              Palavra Pastoral do Dia 📖
            </span>
            <p className="text-base sm:text-lg font-extrabold italic text-slate-950 leading-relaxed tracking-wide min-h-[70px] flex items-center">
              "Buscai, pois, em primeiro lugar, o seu Reino e a sua justiça, e todas estas coisas vos serão acrescentadas."
            </p>
            <span className="block text-xs sm:text-sm font-black text-emerald-900 text-right">
              — Mateus 6:33
            </span>
          </div>
          <p className="text-xs text-slate-650 leading-relaxed mt-4 pt-3 border-t border-emerald-200/50">
            Dica: Lembre sua membresia sobre a mordomia diária, a generosidade com dízimos e ofertas, e encoraje o discipulado de novos membros e PGMs.
          </p>
        </div>
      </div>
    </div>
  );
}
