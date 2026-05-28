import React, { useState } from "react";
import { Member, PgmCell, TrainingCourse } from "../types";
import { Users, GraduationCap, ChevronRight, Award, Plus, Calendar, Compass, Search, Target, CheckCircle, Sparkles } from "lucide-react";

interface TrainingGroupsProps {
  members: Member[];
  pgms: PgmCell[];
  courses: TrainingCourse[];
  onAddPgm: (pgm: PgmCell) => void;
  onAddCourse: (course: TrainingCourse) => void;
  onUpdateCourse: (course: TrainingCourse) => void;
  onAskVivaIAPrompt: (prompt: string) => void;
}

export default function TrainingGroups({
  members,
  pgms,
  courses,
  onAddPgm,
  onAddCourse,
  onUpdateCourse,
  onAskVivaIAPrompt,
}: TrainingGroupsProps) {
  const [activeSubView, setActiveSubView] = useState<"pgm" | "capacitacao">("pgm");
  const [isPgmFormOpen, setIsPgmFormOpen] = useState(false);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);

  // Form states - PGM
  const [pgmNome, setPgmNome] = useState("");
  const [pgmLider, setPgmLider] = useState("");
  const [pgmSupervisor, setPgmSupervisor] = useState("");
  const [pgmHorario, setPgmHorario] = useState("");
  const [pgmEndereco, setPgmEndereco] = useState("");

  // Form states - Course
  const [crsNome, setCrsNome] = useState("");
  const [crsDesc, setCrsDesc] = useState("");
  const [crsCarga, setCrsCarga] = useState("");
  const [crsInstrutor, setCrsInstrutor] = useState("");

  const handleCreatePgm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgmNome.trim() || !pgmLider) return;

    const created: PgmCell = {
      id: "cel-" + Date.now(),
      nome: pgmNome,
      líderNome: pgmLider,
      supervisorNome: pgmSupervisor || "Pastor Titular",
      membrosQuantidade: 4,
      diaSemanaHorario: pgmHorario || "Quarta-feira, 20h",
      enderecoCompleto: pgmEndereco,
      multiplicacaoRacio: 20,
    };

    onAddPgm(created);
    setPgmNome("");
    setPgmLider("");
    setPgmSupervisor("");
    setPgmHorario("");
    setPgmEndereco("");
    setIsPgmFormOpen(false);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crsNome.trim()) return;

    const created: TrainingCourse = {
      id: "crs-" + Date.now(),
      nome: crsNome,
      descricao: crsDesc || "Curso de treinamento para líderes e vocacionados.",
      cargaHoraria: crsCarga || "16 horas",
      instrutorNome: crsInstrutor || "Pastor Sênior",
      participantesQtd: 0,
      progressoConcluintes: 0,
    };

    onAddCourse(created);
    setCrsNome("");
    setCrsDesc("");
    setCrsCarga("");
    setCrsInstrutor("");
    setIsCourseFormOpen(false);
  };

  // Simulated class action increase
  const handleSimulateLessonComplete = (course: TrainingCourse) => {
    const updatedProgress = Math.min(course.progressoConcluintes + 15, 100);
    onUpdateCourse({
      ...course,
      progressoConcluintes: updatedProgress,
      participantesQtd: course.participantesQtd + (updatedProgress === 15 ? 1 : 0),
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs switches */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubView("pgm")}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer ${
            activeSubView === "pgm"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🍇 Pequenos Grupos Multiplicadores (PGMs)
        </button>
        <button
          onClick={() => setActiveSubView("capacitacao")}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer ${
            activeSubView === "capacitacao"
              ? "border-[#1565C0] text-[#1565C0]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🎓 Trilha & Capacitação Ministerial
        </button>
      </div>

      {activeSubView === "pgm" ? (
        <div className="space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pequenos Grupos Multiplicadores (PGMs) 🍇</h2>
              <p className="text-xs text-slate-500">Acompanhe a liderança, endereços de reuniões residenciais e metas de discipulado.</p>
            </div>
            <button
              onClick={() => setIsPgmFormOpen(true)}
              className="px-4 py-2 bg-[#2E7D32] text-white hover:bg-[#1b5e20] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={15} /> Novo Pequeno Grupo
            </button>
          </div>

          {/* Form Create PGM Drawer */}
          {isPgmFormOpen && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#2E7D32] block mb-4">Novo PGM / Célula</span>
              <form onSubmit={handleCreatePgm} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="pg-nome" className="block text-xs font-bold text-slate-705">Nome do PGM</label>
                  <input
                    id="pg-nome"
                    type="text"
                    required
                    value={pgmNome}
                    onChange={(e) => setPgmNome(e.target.value)}
                    placeholder="PGM Esperança Viva"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="pg-lider" className="block text-xs font-bold text-slate-705">Nome do Líder do Grupo</label>
                  <input
                    id="pg-lider"
                    type="text"
                    required
                    value={pgmLider}
                    onChange={(e) => setPgmLider(e.target.value)}
                    placeholder="Marcos Alencar Rocha"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="pg-super" className="block text-xs font-bold text-slate-705">Divisão / Supervisor</label>
                  <input
                    id="pg-super"
                    type="text"
                    value={pgmSupervisor}
                    onChange={(e) => setPgmSupervisor(e.target.value)}
                    placeholder="Pr. Elton Santos"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="pg-hr" className="block text-xs font-bold text-slate-705">Dia da Semana & Horário</label>
                  <input
                    id="pg-hr"
                    type="text"
                    value={pgmHorario}
                    onChange={(e) => setPgmHorario(e.target.value)}
                    placeholder="Quarta-feira, 20h"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="pg-end" className="block text-xs font-bold text-slate-705">Endereço de Realização do PGM</label>
                  <input
                    id="pg-end"
                    type="text"
                    value={pgmEndereco}
                    onChange={(e) => setPgmEndereco(e.target.value)}
                    placeholder="Av. das Tulipas, 298 - Centro"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsPgmFormOpen(false)}
                    className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#2E7D32] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Confirmar Criação
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid of active PGMs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pgms.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                      🍇 Ativo
                    </span>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Supervisor: {p.supervisorNome}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">{p.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      👑 Líder: <span className="font-bold text-slate-755">{p.líderNome}</span>
                    </p>
                  </div>

                  {/* Growth Progress Slider representing multiplication analytics */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Proximidade de Multiplicação:</span>
                      <span className="text-emerald-700 font-extrabold">{p.multiplicacaoRacio}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E7D32]" style={{ width: `${p.multiplicacaoRacio}%` }} />
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-2 text-[11px] text-slate-650 space-y-1">
                    <p>🕒 Reuniões: <strong>{p.diaSemanaHorario}</strong></p>
                    {p.enderecoCompleto && <p className="truncate">📍 {p.enderecoCompleto}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Membros: {p.membrosQuantidade || 0}</span>
                  <button
                    onClick={() =>
                      onAskVivaIAPrompt(
                        `Olá Viva IA! Analise o índice de multiplicação de ${p.multiplicacaoRacio}% do PGM "${p.nome}" liderado por "${p.líderNome}". Que orientações espirituais, sugestão de dinâmicas divertidas de quebra-gelo e focos de evangelismo você recomenda para atingirmos o alvo de duplicação este mês?`
                      )
                    }
                    className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-emerald-100"
                  >
                    <Sparkles size={11} /> Diagnóstico IA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Trilha de Capacitação Subtab module */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Capacitação e Desenvolvimento Ministerial 🎓</h2>
              <p className="text-xs text-slate-500">Desenvolva dons espirituais na sua comunidade por meio de trilhas, cursos ou aulas EBD.</p>
            </div>
            <button
              onClick={() => setIsCourseFormOpen(true)}
              className="px-4 py-2 bg-[#1565C0] text-white hover:bg-[#0d47a1] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={15} /> Novo Curso / Trilha
            </button>
          </div>

          {/* Form Create Course Drawer */}
          {isCourseFormOpen && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-205">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#1565C0] block mb-4">Novo Curso de Teologia / Liderança</span>
              <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="cr-name" className="block text-xs font-bold text-slate-700">Título do Curso</label>
                  <input
                    id="cr-name"
                    type="text"
                    required
                    value={crsNome}
                    onChange={(e) => setCrsNome(e.target.value)}
                    placeholder="Maturidade Espiritual — Escola de Líderes"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="cr-carga" className="block text-xs font-bold text-slate-700">Carga Horária</label>
                  <input
                    id="cr-carga"
                    type="text"
                    value={crsCarga}
                    onChange={(e) => setCrsCarga(e.target.value)}
                    placeholder="12 Horas"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="cr-inst" className="block text-xs font-bold text-slate-700">Instrutor Responsável</label>
                  <input
                    id="cr-inst"
                    type="text"
                    value={crsInstrutor}
                    onChange={(e) => setCrsInstrutor(e.target.value)}
                    placeholder="Pr Seteventos"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div className="md:col-span-4">
                  <label htmlFor="cr-desc" className="block text-xs font-bold text-slate-700">Explanação Detalhada das Lições</label>
                  <textarea
                    id="cr-desc"
                    rows={2}
                    value={crsDesc}
                    onChange={(e) => setCrsDesc(e.target.value)}
                    placeholder="Grade bíblica, focos de formação teológica contínua..."
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsCourseFormOpen(false)}
                    className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#1565C0] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Gravar Curso
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Courses grid list layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((crs) => (
              <div
                key={crs.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between shadow-xs relative"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-[#1565C0]/5 text-[#1565C0] font-black text-[9px] tracking-wider px-2.5 py-0.5 rounded-full uppercase border border-blue-100">
                      Carga: {crs.cargaHoraria}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold">
                      Instrutor: {crs.instrutorNome}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">{crs.nome}</h4>
                    <p className="text-[11px] text-slate-655 mt-1 leading-normal font-semibold">
                      {crs.descricao}
                    </p>
                  </div>

                  {/* Progress completion level visual simulator */}
                  <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex justify-between text-[10px] font-bold text-slate-450 uppercase mb-1">
                      <span>Nível Geral de Conclusão:</span>
                      <span className="text-[#1565C0]">{crs.progressoConcluintes}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1565C0]" style={{ width: `${crs.progressoConcluintes}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Matriculados: {crs.participantesQtd || 0}</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSimulateLessonComplete(crs)}
                      title="Simula a conclusão voluntária de um módulo pelo estudante"
                      className="px-2.5 py-1.5 bg-[#1565C0]/5 hover:bg-[#1565C0]/15 text-[#1565C0] font-extrabold rounded-lg tracking-wide select-none cursor-pointer transition-colors"
                    >
                      ✔ Assistir Aula
                    </button>
                    <button
                      onClick={() =>
                        onAskVivaIAPrompt(
                          `Olá Viva IA! Esboce uma ementa teológica detalhada com 4 aulas sequenciais contendo temas de estudos, dinâmicas e tarefas para a trilha de capacitação intitulada "${crs.nome}" promovida pelo instrutor "${crs.instrutorNome}".`
                        )
                      }
                      className="px-2 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[10px]"
                    >
                      <Sparkles size={11} /> Cronograma IA
                    </button>
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
