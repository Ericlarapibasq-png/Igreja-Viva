import React, { useState } from "react";
import { Visitor } from "../types";
import { Search, UserCheck, MessageSquareCode, Phone, Calendar, Heart, Trash2, X, Sparkles, Check } from "lucide-react";

interface VisitorTrackerProps {
  visitors: Visitor[];
  onAddVisitor: (visitor: Visitor) => void;
  onUpdateVisitor: (visitor: Visitor) => void;
  onRemoveVisitor: (id: string) => void;
  onAskVivaIAPrompt: (prompt: string) => void;
}

export default function VisitorTracker({
  visitors,
  onAddVisitor,
  onUpdateVisitor,
  onRemoveVisitor,
  onAskVivaIAPrompt,
}: VisitorTrackerProps) {
  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("Todos");
  const [isVisitorFormOpen, setIsVisitorFormOpen] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dataVisita, setDataVisita] = useState(new Date().toISOString().split("T")[0]);
  const [quemConvidou, setQuemConvidou] = useState("");
  const [interesse, setInteresse] = useState("Crescimento Espiritual e Casais");
  const [pedidoOracao, setPedidoOracao] = useState("");
  const [retornoAoCulto, setRetornoAoCulto] = useState<"Sim" | "Não" | "Pendente">("Pendente");
  const [statusDiscipulado, setStatusDiscipulado] = useState<"Novo" | "Contactado" | "Em Integração" | "Integrado">("Novo");

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setWhatsapp("");
    setDataVisita(new Date().toISOString().split("T")[0]);
    setQuemConvidou("");
    setInteresse("Crescimento Espiritual e Casais");
    setPedidoOracao("");
    setRetornoAoCulto("Pendente");
    setStatusDiscipulado("Novo");
    setIsVisitorFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const created: Visitor = {
      id: "vt-" + Date.now(),
      nome,
      telefone,
      whatsapp,
      dataVisita,
      quemConvidou: quemConvidou || undefined,
      interesse,
      pedidoOracao: pedidoOracao || undefined,
      retornoAoCulto,
      statusDiscipulado,
      dataCadastro: new Date().toISOString().split("T")[0],
    };

    onAddVisitor(created);
    resetForm();
  };

  const handleToggleRetorno = (visitor: Visitor, value: "Sim" | "Não" | "Pendente") => {
    onUpdateVisitor({
      ...visitor,
      retornoAoCulto: value,
    });
  };

  const handleToggleDiscipulado = (visitor: Visitor, value: "Novo" | "Contactado" | "Em Integração" | "Integrado") => {
    onUpdateVisitor({
      ...visitor,
      statusDiscipulado: value,
    });
  };

  // Filter calculations
  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.interesse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.quemConvidou && v.quemConvidou.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesInterest = selectedInterest === "Todos" || v.interesse === selectedInterest;

    return matchesSearch && matchesInterest;
  });

  const interestsList = [
    "Crescimento Espiritual e Casais",
    "Estudos Bíblicos e Atividades para Crianças",
    "Pequenos Grupos (PGM)",
    "Serviço e Voluntariado",
    "Ajuda Psicológica ou Social"
  ];

  return (
    <div className="space-y-6">
      {/* Header controls layout */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Acompanhamento de Visitantes 👋</h2>
          <p className="text-xs text-slate-500">Acolha, rastreie pedidos de oração e ajude na integração de novas vidas ao Reino.</p>
        </div>
        <button
          onClick={() => setIsVisitorFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1565C0] text-white hover:bg-[#0d47a1] transition-colors rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <UserCheck size={16} /> Acolher Visitante
        </button>
      </div>

      {/* Register Visitor Drawer Form */}
      {isVisitorFormOpen && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner relative max-w-3xl animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 p-1 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={16} />
          </button>

          <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#1565C0] mb-4 flex items-center gap-1.5">
            📝 Ficha de Acolhimento de Visitante
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="vt-nome" className="block text-xs font-bold text-slate-700">Nome Completo</label>
              <input
                id="vt-nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Laura Martins Rocha"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-xs"
              />
            </div>

            {/* Visit Date */}
            <div>
              <label htmlFor="vt-data" className="block text-xs font-bold text-slate-700">Data da Visita</label>
              <input
                id="vt-data"
                type="date"
                required
                value={dataVisita}
                onChange={(e) => setDataVisita(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-600"
              />
            </div>

            {/* Telephone */}
            <div>
              <label htmlFor="vt-tel" className="block text-xs font-bold text-slate-700">Telefone / WhatsApp</label>
              <input
                id="vt-tel"
                type="text"
                value={telefone}
                onChange={(e) => {
                  setTelefone(e.target.value);
                  if(!whatsapp) setWhatsapp(e.target.value);
                }}
                placeholder="(11) 97777-6666"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Convidado Por */}
            <div>
              <label htmlFor="vt-conv" className="block text-xs font-bold text-slate-700">Quem Convidou?</label>
              <input
                id="vt-conv"
                type="text"
                value={quemConvidou}
                onChange={(e) => setQuemConvidou(e.target.value)}
                placeholder="Mariana Alencar"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Interesse */}
            <div>
              <label htmlFor="vt-int" className="block text-xs font-bold text-slate-700">Interesse Principal</label>
              <select
                id="vt-int"
                value={interesse}
                onChange={(e) => setInteresse(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              >
                {interestsList.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* Pedido de Oração */}
            <div className="md:col-span-3">
              <label htmlFor="vt-ora" className="block text-xs font-bold text-slate-700">Pedido Específico de Oração</label>
              <textarea
                id="vt-ora"
                rows={2}
                value={pedidoOracao}
                onChange={(e) => setPedidoOracao(e.target.value)}
                placeholder="Pela cura física, libertação de vícios, harmonia conjugal..."
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Discipulado Status */}
            <div>
              <label htmlFor="vt-status" className="block text-xs font-bold text-slate-700">Acompanhamento Inicial</label>
              <select
                id="vt-status"
                value={statusDiscipulado}
                onChange={(e: any) => setStatusDiscipulado(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              >
                <option value="Novo">Novo (Sem contato)</option>
                <option value="Contactado">Contactado</option>
                <option value="Em Integração">Em Integração (Participando)</option>
                <option value="Integrado">Integrado (Membro/PGM)</option>
              </select>
            </div>

            {/* Retornou ao culto */}
            <div>
              <label htmlFor="vt-ret" className="block text-xs font-bold text-slate-700 font-bold">Retornou ao Culto?</label>
              <select
                id="vt-ret"
                value={retornoAoCulto}
                onChange={(e: any) => setRetornoAoCulto(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              >
                <option value="Pendente">Aguardando Retorno (Pendente)</option>
                <option value="Sim">Sim, Retornou</option>
                <option value="Não">Não retornou / Mudou-se</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1565C0] hover:bg-[#0d47a1] text-white transition-colors text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Check size={14} /> Registrar Acolhimento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar visitantes por nome, anfitrião..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter Interests */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-bold uppercase shrink-0">Interesse:</span>
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="block w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos os interesses</option>
            {interestsList.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visitors list layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVisitors.map((v) => {
          let discColor = "bg-slate-100 text-slate-800";
          if (v.statusDiscipulado === "Contactado") discColor = "bg-amber-100 text-amber-900 border border-amber-200";
          if (v.statusDiscipulado === "Em Integração") discColor = "bg-blue-100 text-blue-900 border border-blue-200";
          if (v.statusDiscipulado === "Integrado") discColor = "bg-emerald-100 text-emerald-900 border border-emerald-200";

          return (
            <div
              key={v.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 relative group flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${discColor}`}>
                      {v.statusDiscipulado}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                      v.retornoAoCulto === "Sim"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : v.retornoAoCulto === "Não"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      Retornou: {v.retornoAoCulto}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remover ficha do visitante ${v.nome}?`)) {
                        onRemoveVisitor(v.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{v.nome}</h4>
                <p className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">
                  Foco: {v.interesse}
                </p>

                {v.pedidoOracao && (
                  <div className="bg-slate-50 border border-slate-100/80 p-3 rounded-xl mt-3 text-xs text-slate-600">
                    <span className="font-bold text-slate-800 flex items-center gap-1 mb-1 text-[10px] uppercase">
                      🙏 Pedido de Oração:
                    </span>
                    <p className="italic text-slate-600 block pr-2">"{v.pedidoOracao}"</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Contato</span>
                    <span className="font-semibold text-slate-700">{v.whatsapp || v.telefone || "Não informado"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Visita em</span>
                    <span className="font-semibold text-slate-700">{v.dataVisita.split("-").reverse().join("/")}</span>
                  </div>
                  {v.quemConvidou && (
                    <div className="col-span-2 pt-1 border-t border-slate-200/50 mt-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Anfitrião convidante</span>
                      <span className="font-semibold text-emerald-800">{v.quemConvidou}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* State Controls Row */}
              <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {/* Retorno toggler */}
                  <div className="flex rounded-md border border-slate-200 overflow-hidden text-[9px] font-bold">
                    <button
                      onClick={() => handleToggleRetorno(v, "Sim")}
                      className={`px-1.5 py-1 ${v.retornoAoCulto === "Sim" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                    >
                      Voltou
                    </button>
                    <button
                      onClick={() => handleToggleRetorno(v, "Pendente")}
                      className={`px-1.5 py-1 border-l border-slate-200 ${v.retornoAoCulto === "Pendente" ? "bg-amber-500 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                    >
                      Pend
                    </button>
                  </div>

                  {/* Discipulado updates quick clicks */}
                  <div className="flex rounded-md border border-slate-200 overflow-hidden text-[9px] font-bold">
                    <button
                      onClick={() => handleToggleDiscipulado(v, "Contactado")}
                      className={`px-1.5 py-1 ${v.statusDiscipulado === "Contactado" ? "bg-amber-600 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                    >
                      Ligar
                    </button>
                    <button
                      onClick={() => handleToggleDiscipulado(v, "Em Integração")}
                      className={`px-1.5 py-1 border-l border-slate-200 ${v.statusDiscipulado === "Em Integração" ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                    >
                      Integrar
                    </button>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onAskVivaIAPrompt(
                      `Olá Viva IA! Gere um roteiro pastoral caloroso e respeitoso de contato por WhatsApp para enviar ao visitante "${v.nome}", que esteve no culto em ${v.dataVisita.split("-").reverse().join("/")} convidado por "${v.quemConvidou}". O interesse dele é "${v.interesse}" e seu pedido de oração foi "${v.pedidoOracao}". Incentive-o lembrando um versículo amigável de esperança e acolhimento.`
                    )
                  }
                  className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100 transition-colors text-[10px] font-extrabold flex items-center gap-1 shrink-0 self-end"
                >
                  <Sparkles size={11} /> Mensagem IA
                </button>
              </div>
            </div>
          );
        })}

        {filteredVisitors.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium bg-white rounded-2xl border border-dashed border-slate-200">
            📭 Nenhum visitante de acolhimento recente corresponde à busca.
          </div>
        )}
      </div>
    </div>
  );
}
