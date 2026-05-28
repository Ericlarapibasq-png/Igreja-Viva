import React, { useState } from "react";
import { Member, Visitor, FinancialTransaction, EventSchedule } from "../types";
import { Users, UserPlus, TrendingUp, Calendar, AlertTriangle, MessageSquareCode, Heart, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, BookOpen, Share2, Check, Eye, EyeOff } from "lucide-react";

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
}: DashboardKPIsProps) {
  // Pastoral reader choice state
  const [activePastoralId, setActivePastoralId] = useState("pst-01");
  const [copiedLetterId, setCopiedLetterId] = useState<string | null>(null);
  const [isLetterExpanded, setIsLetterExpanded] = useState(false);

  const handleSharePastoral = (pLetter: PastoralLetter) => {
    const formattedText = `🕊️ *CARTA PASTORAL - IGREJA VIVA* \n\n*Assunto:* ${pLetter.sermonTitle}\n*Texto Bíblico:* ${pLetter.passage}\n*Pregador:* ${pLetter.preacher}\n\n${pLetter.pastoralText}\n\n_Compartilhado via Igreja Viva App_`;
    
    try {
      navigator.clipboard.writeText(formattedText);
      setCopiedLetterId(pLetter.id);
      setTimeout(() => setCopiedLetterId(null), 3500);
    } catch (e) {
      alert("Copiado com sucesso!");
    }
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

      {/* KPIs Grid - Redefinido para empilhamento no mobile para evitar apertos de layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* KPI: Financeiro (Com suporte ao modo de ocultar valores) */}
        <div
          id="kpi-card-financeiro"
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-[#2E7D32]/60 cursor-pointer transition-all hover:shadow-md relative group h-24"
        >
          <div
            onClick={() => onNavigateToTab("financeiro")}
            className="p-3.5 bg-teal-50 text-teal-800 rounded-xl flex items-center justify-center shrink-0"
          >
            <DollarSign size={24} />
          </div>
          <div className="flex-1 min-w-0" onClick={() => onNavigateToTab("financeiro")}>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
              Saldo Atual
            </span>
            <span className="text-xl font-black text-slate-900 block truncate leading-tight">
              {hideFinancialValues
                ? "R$ ••••••"
                : `R$ ${currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span className="block text-[10px] text-emerald-650 font-bold truncate">
              Dízimos & dotações
            </span>
          </div>

          {/* Quick toggle overlay for privacy mode inside the card */}
          {onToggleHideFinancial && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleHideFinancial();
              }}
              className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors z-10"
              title={hideFinancialValues ? "Mostrar Valores" : "Ocultar Valores (Modo Visita)"}
            >
              {hideFinancialValues ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          )}
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

      {/* Main Core Content Grid: Charts and Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Interactive Generosity & SVG Chart */}
        {churchMode !== "small" ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Histórico de Crescimento & Caixa</h3>
                <p className="text-xs text-slate-500">Fluxo comparativo mensal entre Dízimos/Ofertas recebidos vs Saídas acumuladas</p>
              </div>
              <span className="text-xs font-semibold text-[#1565C0] bg-blue-50 px-2.5 py-1 rounded-full">
                Maio Completo
              </span>
            </div>

            {/* SVG Responsive Area Chart Graphic */}
            <div className="relative pt-4">
              <svg viewBox="0 0 500 240" className="w-full h-56 overflow-visible">
                {/* Grid Lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="40" y1="180" x2="480" y2="180" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="40" y1="210" x2="480" y2="210" stroke="#94A3B8" strokeWidth="1.5" />

                {/* Monthly X-Axis Markers */}
                {chartData.map((d, index) => {
                  const xVal = 40 + index * 140;
                  return (
                    <text key={d.name} x={xVal} y="228" textAnchor="middle" className="text-[11px] font-bold fill-slate-500">
                      {d.name}
                    </text>
                  );
                })}

                {/* Y Axis Markers */}
                <text x="32" y="32" textAnchor="end" className="text-[9px] fill-slate-400">R$ {hideFinancialValues ? "•••" : maxVal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</text>
                <text x="32" y="112" textAnchor="end" className="text-[9px] fill-slate-400">R$ {hideFinancialValues ? "•••" : Math.round(maxVal / 2).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</text>
                <text x="32" y="212" textAnchor="end" className="text-[9px] fill-slate-400">R$ 0</text>

                {/* AREA PATH: RECEITAS (Green #2E7D32) */}
                <path
                  d={`M 40,${210 - (chartData[0].dízimos / maxVal) * 180} 
                     L 180,${210 - (chartData[1].dízimos / maxVal) * 180} 
                     L 320,${210 - (chartData[2].dízimos / maxVal) * 180} 
                     L 460,${210 - (chartData[3].dízimos / maxVal) * 180} 
                     L 460,210 L 40,210 Z`}
                  fill="url(#green_gradient)"
                  opacity="0.15"
                />

                {/* AREA PATH: DESPESAS (Blue #1565C0) */}
                <path
                  d={`M 40,${210 - (chartData[0].despesas / maxVal) * 180} 
                     L 180,${210 - (chartData[1].despesas / maxVal) * 180} 
                     L 320,${210 - (chartData[2].despesas / maxVal) * 180} 
                     L 460,${210 - (chartData[3].despesas / maxVal) * 180} 
                     L 460,210 L 40,210 Z`}
                  fill="url(#blue_gradient)"
                  opacity="0.12"
                />

                {/* LINE PATHS & CIRCLE POINTS */}
                {/* Receitas (Green Line) */}
                <path
                  d={`M 40,${210 - (chartData[0].dízimos / maxVal) * 180} 
                     L 180,${210 - (chartData[1].dízimos / maxVal) * 180} 
                     L 320,${210 - (chartData[2].dízimos / maxVal) * 180} 
                     L 460,${210 - (chartData[3].dízimos / maxVal) * 180}`}
                  stroke="#2E7D32"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Despesas (Blue Line) */}
                <path
                  d={`M 40,${210 - (chartData[0].despesas / maxVal) * 180} 
                     L 180,${210 - (chartData[1].despesas / maxVal) * 180} 
                     L 320,${210 - (chartData[2].despesas / maxVal) * 180} 
                     L 460,${210 - (chartData[3].despesas / maxVal) * 180}`}
                  stroke="#1565C0"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Markers for final points */}
                <circle cx="460" cy={210 - (chartData[3].dízimos / maxVal) * 180} r="6" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="460" cy={210 - (chartData[3].despesas / maxVal) * 180} r="5" fill="#1565C0" stroke="#FFFFFF" strokeWidth="2" />

                {/* Defs block for gradient area fillings */}
                <defs>
                  <linearGradient id="green_gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E7D32" />
                    <stop offset="100%" stopColor="#2E7D32" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="blue_gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1565C0" />
                    <stop offset="100%" stopColor="#1565C0" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Legend indicators & Resumo do mês acolhedor e inteligente */}
              <div className="space-y-3 max-w-md mx-auto mt-3">
                <div className="flex gap-4 items-center justify-center text-xs px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <span className="w-3.5 h-1.5 bg-[#2E7D32] rounded-full inline-block" />
                    Dízimos e Ofertas
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-blue-800">
                    <span className="w-3.5 h-1.5 bg-[#1565C0] rounded-full inline-block" />
                    Despesas
                  </span>
                </div>
                
                <div className="text-center p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] font-semibold text-emerald-850 leading-relaxed shadow-3xs">
                  📈 <strong className="font-extrabold text-emerald-900">Resumo do mês:</strong> Entradas maiores que despesas neste período. Isto indica superávit saudável para investimentos espirituais e suporte ministerial de comunhão!
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-5 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <Heart className="text-rose-600 animate-pulse" size={18} />
                  Cuidado Pastoral do Dia 🌱
                </h3>
                <p className="text-xs text-slate-500">Ações simples para preservar o aconchego no pequeno rebanho</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              </div>
            </div>

            <div className="p-4 bg-amber-50/45 border border-amber-150 rounded-xl space-y-1 mt-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-600" /> Conselho Pastoral Inteligente:
              </h4>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &quot;O bom pastor conhece as ovelhas pelo nome, cuida de suas feridas e não as sobrecarrega com estruturas rígidas. Na congregação menor, o relacionamento próximo e o amor mútuo superam qualquer burocracia.&quot;
              </p>
            </div>
          </div>
        )}

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
                  Cartas Pastorais (Sermões Recentes)
                </h3>
                <p className="text-xs text-slate-500">
                  Pastorais redigidas e otimizadas automaticamente com base em suas últimas pregações
                </p>
              </div>
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 flex items-center gap-1.5 shrink-0">
                <Sparkles size={11} className="animate-spin text-emerald-600" /> Assistente Pastoral Ativo
              </span>
            </div>

            {/* Selector tabs for sermons */}
            <div className="grid grid-cols-3 gap-1.5 mt-3">
              {PAST_LETTERS.map((p) => {
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
            {PAST_LETTERS.filter((p) => p.id === activePastoralId).map((pLetter) => (
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
                        `Olá Viva IA! Quero otimizar ou reescrever a carta pastoral baseada no sermão "${pLetter.sermonTitle}" com leitura bíblica de "${pLetter.passage}". Pode reescrever um novo rascunho com tom reflexivo e acolhedor para compartilhar com a nossa liderança de pequeno grupo?`
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
