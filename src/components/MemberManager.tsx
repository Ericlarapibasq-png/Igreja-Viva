import React, { useState } from "react";
import { Member } from "../types";
import { Search, UserPlus, Filter, Phone, Calendar, Heart, Shield, Trash2, Edit3, X, Check } from "lucide-react";

interface MemberManagerProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onRemoveMember: (id: string) => void;
}

export default function MemberManager({
  members,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}: MemberManagerProps) {
  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterMinistry, setSelectedFilterMinistry] = useState("Todos");
  const [selectedFilterFrequency, setSelectedFilterFrequency] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [dataBatismo, setDataBatismo] = useState("");
  const [dataConversao, setDataConversao] = useState("");
  const [ministerio, setMinisterio] = useState("Louvor");
  const [estadoCivil, setEstadoCivil] = useState<"Solteiro(a)" | "Casado(a)" | "Divorciado(a)" | "Viúvo(a)">("Solteiro(a)");
  const [participacaoPgm, setParticipacaoPgm] = useState(false);
  const [frequênciaCultos, setFrequênciaCultos] = useState<"Alta" | "Média" | "Baixa" | "Ausente">("Alta");
  const [observacoesPastorais, setObservacoesPastorais] = useState("");

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setWhatsapp("");
    setEndereco("");
    setDataNascimento("");
    setDataBatismo("");
    setDataConversao("");
    setMinisterio("Louvor");
    setEstadoCivil("Solteiro(a)");
    setParticipacaoPgm(false);
    setFrequênciaCultos("Alta");
    setObservacoesPastorais("");
    setEditingMember(null);
    setIsFormOpen(false);
  };

  const handleOpenForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEditOpen = (member: Member) => {
    setEditingMember(member);
    setNome(member.nome);
    setTelefone(member.telefone);
    setWhatsapp(member.whatsapp);
    setEndereco(member.endereco);
    setDataNascimento(member.dataNascimento);
    setDataBatismo(member.dataBatismo || "");
    setDataConversao(member.dataConversao || "");
    setMinisterio(member.ministerio);
    setEstadoCivil(member.estadoCivil);
    setParticipacaoPgm(member.participacaoPgm);
    setFrequênciaCultos(member.frequênciaCultos);
    setObservacoesPastorais(member.observacoesPastorais || "");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editingMember) {
      const updated: Member = {
        ...editingMember,
        nome,
        telefone,
        whatsapp,
        endereco,
        dataNascimento,
        dataBatismo: dataBatismo || undefined,
        dataConversao: dataConversao || undefined,
        ministerio,
        estadoCivil,
        participacaoPgm,
        frequênciaCultos,
        observacoesPastorais: observacoesPastorais || undefined,
      };
      onUpdateMember(updated);
    } else {
      const created: Member = {
        id: "mb-" + Date.now(),
        nome,
        telefone,
        whatsapp,
        endereco,
        dataNascimento,
        dataBatismo: dataBatismo || undefined,
        dataConversao: dataConversao || undefined,
        ministerio,
        estadoCivil,
        participacaoPgm,
        frequênciaCultos,
        observacoesPastorais: observacoesPastorais || undefined,
        dataCadastro: new Date().toISOString().split("T")[0],
      };
      onAddMember(created);
    }
    resetForm();
  };

  // Filtering calculations
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.telefone.includes(searchQuery) ||
      m.endereco.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMinistry = selectedFilterMinistry === "Todos" || m.ministerio === selectedFilterMinistry;
    const matchesFrequency = selectedFilterFrequency === "Todos" || m.frequênciaCultos === selectedFilterFrequency;

    return matchesSearch && matchesMinistry && matchesFrequency;
  });

  const ministriesList = ["Louvor", "Infantil", "Jovens", "Casais", "Família", "EBD", "Recepção", "Mídia", "Pastoral"];

  return (
    <div className="space-y-6">
      {/* Header controls layout */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cadastro de Membros 👥</h2>
          <p className="text-xs text-slate-500">Exponha, busque, integre ou modifique membros da congregação.</p>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2E7D32] text-white hover:bg-[#1b5e20] transition-colors rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <UserPlus size={16} /> Novo Membro
        </button>
      </div>

      {/* Interactive Form Drawer (Conditional Modal Layout) */}
      {isFormOpen && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-inner relative max-w-3xl animate-in fade-in slide-in-from-top-4 duration-350">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 p-1 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={16} />
          </button>
          
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#2E7D32] mb-4 flex items-center gap-1.5">
            {editingMember ? "📝 Editar Dados do Membro" : "➕ Ficha de Inscrição Sacerdotal"}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field: Nome */}
            <div className="md:col-span-2">
              <label htmlFor="mb-nome" className="block text-xs font-bold text-slate-700">Nome Completo</label>
              <input
                id="mb-nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Carlos de Souza Martins"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/50 text-xs"
              />
            </div>

            {/* Field: Estado Civil */}
            <div>
              <label htmlFor="mb-civil" className="block text-xs font-bold text-slate-700">Estado Civil</label>
              <select
                id="mb-civil"
                value={estadoCivil}
                onChange={(e: any) => setEstadoCivil(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              >
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>

            {/* Field: Telefone */}
            <div>
              <label htmlFor="mb-tel" className="block text-xs font-bold text-slate-700">Telefone Fixo / Celular</label>
              <input
                id="mb-tel"
                type="text"
                value={telefone}
                onChange={(e) => {
                  setTelefone(e.target.value);
                  if(!whatsapp) setWhatsapp(e.target.value); // Sync WhatsApp for convenience
                }}
                placeholder="(11) 98888-7777"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Field: WhatsApp */}
            <div>
              <label htmlFor="mb-whats" className="block text-xs font-bold text-slate-700">WhatsApp Oficial</label>
              <input
                id="mb-whats"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 98888-7777"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Field: Data Nascimento */}
            <div>
              <label htmlFor="mb-nasc" className="block text-xs font-bold text-slate-700">Data de Nascimento</label>
              <input
                id="mb-nasc"
                type="date"
                required
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-600"
              />
            </div>

            {/* Field: Endereço */}
            <div className="md:col-span-3">
              <label htmlFor="mb-end" className="block text-xs font-bold text-slate-700">Endereço Residencial</label>
              <input
                id="mb-end"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex Rua Augusta, 430, Apt 12 - São Paulo, SP"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Field: Data Conversão */}
            <div>
              <label htmlFor="mb-conv" className="block text-xs font-bold text-slate-700">Data de Conversão</label>
              <input
                id="mb-conv"
                type="date"
                value={dataConversao}
                onChange={(e) => setDataConversao(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-600"
              />
            </div>

            {/* Field: Data Batismo */}
            <div>
              <label htmlFor="mb-bat" className="block text-xs font-bold text-slate-700">Data de Batismo nas Águas</label>
              <input
                id="mb-bat"
                type="date"
                value={dataBatismo}
                onChange={(e) => setDataBatismo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-600"
              />
            </div>

            {/* Field: Ministério */}
            <div>
              <label htmlFor="mb-min" className="block text-xs font-bold text-slate-700">Atuação / Ministério</label>
              <select
                id="mb-min"
                value={ministerio}
                onChange={(e) => setMinisterio(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              >
                {ministriesList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Field: Frequência Cultos */}
            <div>
              <label htmlFor="mb-freq" className="block text-xs font-bold text-slate-700">Frequência nos Cultos</label>
              <select
                id="mb-freq"
                value={frequênciaCultos}
                onChange={(e: any) => setFrequênciaCultos(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none text-xs"
              >
                <option value="Alta">Alta (Assíduo)</option>
                <option value="Média">Média (Participante)</option>
                <option value="Baixa">Baixa (Pouco frequente)</option>
                <option value="Ausente">Ausente (Afastado)</option>
              </select>
            </div>

            {/* Field: PGM Toggle */}
            <div className="flex items-center gap-2 md:col-span-2 pt-5">
              <input
                id="mb-pgm-toggle"
                type="checkbox"
                checked={participacaoPgm}
                onChange={(e) => setParticipacaoPgm(e.target.checked)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded-sm cursor-pointer"
              />
              <label htmlFor="mb-pgm-toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                Ativo em Pequeno Grupo Multiplicador (PGM / Célula)?
              </label>
            </div>

            {/* Field: Observações Pastorais */}
            <div className="md:col-span-3">
              <label htmlFor="mb-obs" className="block text-xs font-bold text-slate-700">Anotações Pastorais e Acompanhamento</label>
              <textarea
                id="mb-obs"
                rows={2}
                value={observacoesPastorais}
                onChange={(e) => setObservacoesPastorais(e.target.value)}
                placeholder="Registre acontecimentos espirituais relevantes, visitas pastorais ou notas de crescimento..."
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Submit controls */}
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
                className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white transition-colors text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Check size={14} /> {editingMember ? "Salvar Alterações" : "Efetuar Inscrição"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtering area */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por nome, tel ou end..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter Ministry */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-bold uppercase shrink-0">Ministério:</span>
          <select
            value={selectedFilterMinistry}
            onChange={(e) => setSelectedFilterMinistry(e.target.value)}
            className="block w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos</option>
            {ministriesList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Filter Frequency */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-bold uppercase shrink-0">Frequência:</span>
          <select
            value={selectedFilterFrequency}
            onChange={(e) => setSelectedFilterFrequency(e.target.value)}
            className="block w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todas as frequências</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
            <option value="Ausente">Ausente (Afastado)</option>
          </select>
        </div>
      </div>

      {/* Grid of members cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((m) => {
          let freqColor = "bg-green-100 text-green-800";
          if (m.frequênciaCultos === "Média") freqColor = "bg-blue-100 text-blue-800";
          if (m.frequênciaCultos === "Baixa") freqColor = "bg-amber-100 text-amber-800";
          if (m.frequênciaCultos === "Ausente") freqColor = "bg-red-100 text-red-800";

          return (
            <div
              key={m.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${freqColor}`}>
                    {m.frequênciaCultos}
                  </span>

                  <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditOpen(m)}
                      title="Editar membro"
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o ficha do membro ${m.nome}?`)) {
                          onRemoveMember(m.id);
                        }
                      }}
                      title="Excluir membro"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{m.nome}</h4>
                <p className="text-[10px] text-[#1565C0] font-bold uppercase tracking-widest mt-0.5">
                  Ministério de {m.ministerio}
                </p>

                <div className="space-y-1.5 mt-4 text-xs text-slate-600 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{m.telefone || "(WhatsApp indisponível)"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span>Nasc: {m.dataNascimento ? m.dataNascimento.split("-").reverse().join("/") : "Não informado"}</span>
                  </div>
                  {m.endereco && (
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      📍 {m.endereco}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-400 font-medium">
                  {m.participacaoPgm ? "🍇 Ativo no PGM" : "❌ Fora de PGM"}
                </span>
                
                {m.observacoesPastorais && (
                  <span
                    title={m.observacoesPastorais}
                    className="text-emerald-700 underline cursor-help"
                  >
                    Ver observações...
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium bg-white rounded-2xl border border-dashed border-slate-200">
            📭 Nenhum membro encontrado com os termos pesquisados.
          </div>
        )}
      </div>
    </div>
  );
}
