import React, { useState } from "react";
import { Member, EventSchedule, VolunteerScale } from "../types";
import { Calendar, Users, ShieldAlert, Sparkles, Plus, Check, Clock, UserCheck, CheckCircle2, RotateCcw, HelpCircle } from "lucide-react";

interface MinistriesScalesProps {
  members: Member[];
  events: EventSchedule[];
  scales: VolunteerScale[];
  onAddEvent: (event: EventSchedule) => void;
  onAddScale: (scale: VolunteerScale) => void;
  onUpdateScale: (scale: VolunteerScale) => void;
}

export default function MinistriesScales({
  members,
  events,
  scales,
  onAddEvent,
  onAddScale,
  onUpdateScale,
}: MinistriesScalesProps) {
  // UI views
  const [activeSubView, setActiveSubView] = useState<"agenda" | "escalas">("escalas");
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isScaleFormOpen, setIsScaleFormOpen] = useState(false);

  // Event Form states
  const [evtNome, setEvtNome] = useState("");
  const [evtData, setEvtData] = useState("");
  const [evtHorario, setEvtHorario] = useState("");
  const [evtDescricao, setEvtDescricao] = useState("");
  const [evtLocal, setEvtLocal] = useState("Templo Central");
  const [evtCategoria, setEvtCategoria] = useState<any>("Culto");

  // Scale Form states
  const [selMinisterio, setSelMinisterio] = useState<any>("Louvor");
  const [selMembroId, setSelMembroId] = useState("");
  const [selEventoId, setSelEventoId] = useState("");
  const [selFuncao, setSelFuncao] = useState("");

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtNome.trim() || !evtData) return;

    const created: EventSchedule = {
      id: "ev-" + Date.now(),
      nome: evtNome,
      data: evtData,
      horario: evtHorario || "19:00",
      descricao: evtDescricao || "Culto especial na igreja Sede.",
      local: evtLocal,
      categoria: evtCategoria,
      inscritos: 0,
    };

    onAddEvent(created);
    setEvtNome("");
    setEvtData("");
    setEvtHorario("");
    setEvtDescricao("");
    setIsEventFormOpen(false);
  };

  const handleCreateScale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selMembroId || !selEventoId) return;

    const memberMatch = members.find((m) => m.id === selMembroId);
    const eventMatch = events.find((ev) => ev.id === selEventoId);
    if (!memberMatch || !eventMatch) return;

    const created: VolunteerScale = {
      id: "sc-" + Date.now(),
      ministério: selMinisterio,
      membroId: selMembroId,
      membroNome: memberMatch.nome,
      eventoId: selEventoId,
      eventoNome: eventMatch.nome,
      data: eventMatch.data,
      funcaoScale: selFuncao || "Voluntário Geral",
      confirmado: "Pendente",
    };

    onAddScale(created);
    setSelFuncao("");
    setIsScaleFormOpen(false);
  };

  const handleScaleConfirmToggle = (scale: VolunteerScale, value: "Sim" | "Não" | "Pendente") => {
    onUpdateScale({
      ...scale,
      confirmado: value,
    });
  };

  // AI-Assisted Auto Scaling Draft algorithm
  const handleAISmartScaleGenerator = () => {
    // Collect next events
    const nextEvt = events[0];
    if (!nextEvt) {
      alert("Por favor, adicione pelo menos um evento na agenda antes de gerar escalas automáticas.");
      return;
    }

    // Try finding available matching members
    // Louvor candidates (likes Louvor)
    const singers = members.filter((m) => m.ministerio === "Louvor");
    const mediaGuys = members.filter((m) => m.ministerio === "Mídia");
    const kidsTeachers = members.filter((m) => m.ministerio === "Infantil");
    const receptionists = members.filter((m) => m.ministerio === "Pastoral" || m.ministerio === "Recepção");

    let countGenerated = 0;

    // Check if scales already draft-assigned for nextEvt
    const isAlreadyAssigned = scales.some((s) => s.eventoId === nextEvt.id);
    if (isAlreadyAssigned) {
      alert(`As escalas para o evento "${nextEvt.nome}" já se encontram organizadas ou rascunhadas!`);
      return;
    }

    // Assign Louvor
    if (singers.length > 0) {
      onAddScale({
        id: "sc-ai-1-" + Date.now(),
        ministério: "Louvor",
        membroId: singers[0].id,
        membroNome: singers[0].nome,
        eventoId: nextEvt.id,
        eventoNome: nextEvt.nome,
        data: nextEvt.data,
        funcaoScale: "Líder Musical & Instrumento (Gerado por IA)",
        confirmado: "Pendente",
      });
      countGenerated++;
    }

    // Assign Kids
    if (kidsTeachers.length > 0) {
      onAddScale({
        id: "sc-ai-2-" + Date.now(),
        ministério: "Infantil",
        membroId: kidsTeachers[0].id,
        membroNome: kidsTeachers[0].nome,
        eventoId: nextEvt.id,
        eventoNome: nextEvt.nome,
        data: nextEvt.data,
        funcaoScale: "Professor(a) de Crianças (Gerado por IA)",
        confirmado: "Pendente",
      });
      countGenerated++;
    }

    // Assign Mídia
    if (mediaGuys.length > 0) {
      onAddScale({
        id: "sc-ai-3-" + Date.now(),
        ministério: "Mídia",
        membroId: mediaGuys[0].id,
        membroNome: mediaGuys[0].nome,
        eventoId: nextEvt.id,
        eventoNome: nextEvt.nome,
        data: nextEvt.data,
        funcaoScale: "Sonorização & Projeção Live (Gerado por IA)",
        confirmado: "Pendente",
      });
      countGenerated++;
    }

    alert(`⛪ Viva IA Scale Builder: Foram geradas com sucesso ${countGenerated} escalas de sugestões baseadas nas especialidades dos membros para o evento "${nextEvt.nome}"!`);
  };

  const ministriesList = ["Louvor", "Infantil", "Jovens", "Casais", "Família", "EBD", "Recepção", "Mídia", "Pastoral"];

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubView("escalas")}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer ${
            activeSubView === "escalas"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📋 Escalas Ministeriais & Equipes
        </button>
        <button
          onClick={() => setActiveSubView("agenda")}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer ${
            activeSubView === "agenda"
              ? "border-[#1565C0] text-[#1565C0] "
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📅 Agenda & Eventos Próximos
        </button>
      </div>

      {activeSubView === "escalas" ? (
        <div className="space-y-6">
          {/* Escalas Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Escalas Ativas de Voluntariado 👥</h3>
              <p className="text-xs text-slate-500">Veja quem está escalado por eventos ou clique no gerador de escalas por I.A.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAISmartScaleGenerator}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-emerald-700 to-blue-800 text-white rounded-xl text-xs font-black shadow-md hover:from-emerald-800 hover:to-blue-900 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={14} /> Viva IA: Escala Inteligente
              </button>
              <button
                onClick={() => setIsScaleFormOpen(true)}
                className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus size={14} /> Adicionar Escala
              </button>
            </div>
          </div>

          {/* Scale Registry Form Drawer */}
          {isScaleFormOpen && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-250 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#2E7D32]">Nova Escala de Voluntários</span>
                <button onClick={() => setIsScaleFormOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Fechar</button>
              </div>

              <form onSubmit={handleCreateScale} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Event Select */}
                <div className="md:col-span-2">
                  <label htmlFor="sc-evt" className="block text-xs font-bold text-slate-650">Selecione o Culto / Evento</label>
                  <select
                    id="sc-evt"
                    value={selEventoId}
                    onChange={(e) => setSelEventoId(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  >
                    <option value="">-- Escolha um evento ativo --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.nome} ({ev.data.split("-").reverse().join("/")})</option>
                    ))}
                  </select>
                </div>

                {/* Ministry Select */}
                <div>
                  <label htmlFor="sc-min" className="block text-xs font-bold text-slate-650">Ministério</label>
                  <select
                    id="sc-min"
                    value={selMinisterio}
                    onChange={(e: any) => setSelMinisterio(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  >
                    {ministriesList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Member selection */}
                <div>
                  <label htmlFor="sc-memb" className="block text-xs font-bold text-slate-650">Escolha o Voluntário</label>
                  <select
                    id="sc-memb"
                    value={selMembroId}
                    onChange={(e) => setSelMembroId(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-700"
                  >
                    <option value="">-- Selecione um membro --</option>
                    {members
                      .filter((m) => m.frequênciaCultos !== "Ausente")
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.nome} (Atuação: {m.ministerio})</option>
                      ))}
                  </select>
                </div>

                {/* Function role */}
                <div className="md:col-span-3">
                  <label htmlFor="sc-func" className="block text-xs font-bold text-slate-650">Função Específica na Rota</label>
                  <input
                    id="sc-func"
                    type="text"
                    required
                    value={selFuncao}
                    onChange={(e) => setSelFuncao(e.target.value)}
                    placeholder="Ex: Teclado, Recepção de entrada, Aula de Juniores..."
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                {/* Submit Controls */}
                <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setIsScaleFormOpen(false)}
                    className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#2E7D32] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Adicionar à Escala
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Roster Cards List view */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scales.map((s) => {
              let tagColor = "bg-amber-100 text-amber-900 border-amber-200";
              if (s.confirmado === "Sim") tagColor = "bg-emerald-100 text-emerald-950 border-emerald-200";
              if (s.confirmado === "Não") tagColor = "bg-red-100 text-red-950 border-red-200";

              return (
                <div
                  key={s.id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="bg-[#1565C0]/10 text-[#1565C0] font-black uppercase text-[9px] tracking-widest px-2.5 py-0.5 rounded-full border border-[#1565C0]/20">
                        {s.ministério}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${tagColor}`}>
                        Confirmado: {s.confirmado}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900">{s.membroNome}</h4>
                      <p className="text-xs text-slate-700 mt-1 font-semibold flex items-center gap-1">
                        🎬 Funçao: <span className="font-medium text-slate-500">{s.funcaoScale}</span>
                      </p>
                    </div>

                    <div className="border-t border-slate-50 pt-2 text-[11px] text-slate-500 leading-normal">
                      <span className="font-bold flex items-center gap-1.5 text-indigo-900">
                        <Clock size={12} /> {s.eventoNome} — {s.data.split("-").reverse().join("/")}
                      </span>
                    </div>
                  </div>

                  {/* Status buttons toggles */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Mudar presença:</span>
                    <div className="flex gap-1 text-[10px] font-bold">
                      <button
                        onClick={() => handleScaleConfirmToggle(s, "Sim")}
                        className={`px-3 py-1 rounded-md border transition-all cursor-pointer ${
                          s.confirmado === "Sim"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Presença Confirmada
                      </button>
                      <button
                        onClick={() => handleScaleConfirmToggle(s, "Não")}
                        className={`px-3 py-1 rounded-md border transition-all cursor-pointer ${
                          s.confirmado === "Não"
                            ? "bg-red-600 text-white border-red-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Recusado
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {scales.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white border border-dashed border-slate-200 rounded-xl">
                📭 Nenhuma equipe ou escala ministerial foi criada para os próximos cultos.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Event Roster subtab agenda (MÓDULO 8 - EVENTOS) */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center sm:gap-4 flex-col sm:flex-row">
            <div>
              <h3 className="text-base font-bold text-slate-900">Agenda e Festividades Ativas 📅</h3>
              <p className="text-xs text-slate-500">Crie ou administre eventos do Reino e aulas de capacitação ministerial.</p>
            </div>
            <button
              onClick={() => setIsEventFormOpen(true)}
              className="px-4 py-2 bg-[#1565C0] text-white hover:bg-[#0d47a1] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer mt-2 sm:mt-0"
            >
              <Plus size={14} /> Adicionar Evento
            </button>
          </div>

          {/* Create Event Form Drawer */}
          {isEventFormOpen && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-250">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#1565C0]">Novo Evento da Agenda</span>
                <button onClick={() => setIsEventFormOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Fechar</button>
              </div>

              <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="ev-nome" className="block text-xs font-bold text-slate-700">Título do Evento</label>
                  <input
                    id="ev-nome"
                    type="text"
                    required
                    value={evtNome}
                    onChange={(e) => setEvtNome(e.target.value)}
                    placeholder="Ex: Campanha de Oração pelas Famílias, Chá de Mulheres..."
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="ev-data" className="block text-xs font-bold text-slate-700">Data</label>
                  <input
                    id="ev-data"
                    type="date"
                    required
                    value={evtData}
                    onChange={(e) => setEvtData(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-650"
                  />
                </div>

                <div>
                  <label htmlFor="ev-horario" className="block text-xs font-bold text-slate-700">Horário</label>
                  <input
                    id="ev-horario"
                    type="text"
                    required
                    value={evtHorario}
                    onChange={(e) => setEvtHorario(e.target.value)}
                    placeholder="19:00"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="ev-local" className="block text-xs font-bold text-slate-700">Local de Celebração</label>
                  <input
                    id="ev-local"
                    type="text"
                    value={evtLocal}
                    onChange={(e) => setEvtLocal(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="ev-cat" className="block text-xs font-bold text-slate-700">Categoria</label>
                  <select
                    id="ev-cat"
                    value={evtCategoria}
                    onChange={(e: any) => setEvtCategoria(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  >
                    <option value="Culto">Culto</option>
                    <option value="PGM">Solenidade PGM</option>
                    <option value="Encontro de Jovens">Encontro de Jovens</option>
                    <option value="EBD">EBD (Escola Teológica)</option>
                    <option value="Ação de Capacitação">Ação de Capacitação</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label htmlFor="ev-desc" className="block text-xs font-bold text-slate-700">Breve Descrição do Evento</label>
                  <textarea
                    id="ev-desc"
                    rows={2}
                    value={evtDescricao}
                    onChange={(e) => setEvtDescricao(e.target.value)}
                    placeholder="Descreva a finalidade e público destinado para divulgar com amor..."
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEventFormOpen(false)}
                    className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#1565C0] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Marcar na Agenda
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events Grid layout list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 flex items-start gap-4 shadow-xs"
              >
                {/* Date Side circle badge */}
                <div className="p-3.5 bg-slate-100 border border-slate-150 rounded-xl text-center shrink-0 min-w-[64px]">
                  <span className="block text-sm font-black text-slate-800 tracking-tight">
                    {ev.data.split("-")[2]}
                  </span>
                  <span className="block text-[8px] font-extrabold uppercase text-slate-400">
                    {new Date(ev.data).toLocaleString("pt-BR", { month: "short" }).replace(".", "")}
                  </span>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <span className="bg-[#1565C0]/5 text-[#1565C0] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#1565C0]/15">
                    {ev.categoria}
                  </span>
                  
                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{ev.nome}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {ev.descricao}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-bold pt-1.5 border-t border-slate-50">
                    <span>⏰ Horário: {ev.horario}</span>
                    <span>📍 Local: {ev.local}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
