import React, { useState } from "react";
import { Member, FinancialTransaction } from "../types";
import { GENEROSITY_VERSES } from "../data";
import { Search, DollarSign, TrendingUp, TrendingDown, ClipboardCheck, ClipboardCopy, Heart, Calendar, ArrowUpRight, ArrowDownRight, Tag, Wallet, Check, AlertCircle } from "lucide-react";

interface FinanceModuleProps {
  members: Member[];
  transactions: FinancialTransaction[];
  onAddTransaction: (transaction: FinancialTransaction) => void;
  hideFinancialValues?: boolean;
}

export default function FinanceModule({
  members,
  transactions,
  onAddTransaction,
  hideFinancialValues = false,
}: FinanceModuleProps) {
  // UI states
  const [activeSubTab, setActiveSubTab] = useState<"fluxo" | "doacao">("fluxo");
  const [transactionType, setTransactionType] = useState<"Receita" | "Despesa">("Receita");
  const [isLedgerFormOpen, setIsLedgerFormOpen] = useState(false);

  // Form states
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState<any>("Dízimo");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [membroId, setMembroId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<any>("PIX");

  // Donation UI states
  const [donorName, setDonorName] = useState("");
  const [donationValue, setDonationValue] = useState("50");
  const [donationPurpose, setDonationPurpose] = useState("Dízimo Geral");
  const [verseIndex, setVerseIndex] = useState(0);
  const [pixCopied, setPixCopied] = useState(false);

  const totalIncomes = transactions
    .filter((t) => t.tipo === "Receita")
    .reduce((sum, t) => sum + t.valor, 0);

  const totalExits = transactions
    .filter((t) => t.tipo === "Despesa")
    .reduce((sum, t) => sum + t.valor, 0);

  const currentBalance = totalIncomes - totalExits;

  // Ledger submit
  const handleLedgerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = parseFloat(valor);
    if (isNaN(parsedVal) || parsedVal <= 0) return;

    let selectedMembroNome = undefined;
    if (membroId) {
      const mbMatch = members.find((m) => m.id === membroId);
      if (mbMatch) selectedMembroNome = mbMatch.nome;
    }

    const created: FinancialTransaction = {
      id: "tx-" + Date.now(),
      tipo: transactionType,
      valor: parsedVal,
      categoria,
      data,
      membroId: membroId || undefined,
      membroNome: selectedMembroNome,
      descricao: descricao || `${categoria} lançado em secretaria`,
      formaPagamento,
    };

    onAddTransaction(created);
    setValor("");
    setMembroId("");
    setDescricao("");
    setIsLedgerFormOpen(false);
  };

  // Triggering simulated donation contribution
  const handleSimulateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = parseFloat(donationValue);
    if (isNaN(parsedVal) || parsedVal <= 0) return;

    const created: FinancialTransaction = {
      id: "tx-don-" + Date.now(),
      tipo: "Receita",
      valor: parsedVal,
      categoria: donationPurpose.includes("Dízimo") ? "Dízimo" : "Doação",
      data: new Date().toISOString().split("T")[0],
      descricao: `Contribuição PIX de ${donorName || "Doador Anônimo"} (${donationPurpose})`,
      formaPagamento: "PIX",
    };

    onAddTransaction(created);
    setDonorName("");
    setDonationValue("50");
    setPixCopied(false);
    alert(`Amém! Contribuição de R$ ${parsedVal.toFixed(2)} recebida via PIX com sucesso! Deus te abençoe.`);
  };

  const currentVerse = GENEROSITY_VERSES[verseIndex];

  const handleCopyPix = () => {
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  // Category listing depending on ledger type selection
  const categoriesList = transactionType === "Receita"
    ? ["Dízimo", "Oferta", "Doação", "Eventos"]
    : ["Reforma", "Aluguel", "Ação Social", "Luz/Água", "Som/Mídia", "Outros"];

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("fluxo")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === "fluxo"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📈 Fluxo de Caixa & Lançamentos
        </button>
        <button
          onClick={() => setActiveSubTab("doacao")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "doacao"
              ? "border-[#1565C0] text-[#1565C0]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Heart size={14} className="text-red-500 fill-red-500" /> Contribuição & Dízimos Online
        </button>
      </div>

      {activeSubTab === "fluxo" ? (
        <div className="space-y-6">
          {/* Dashboard balance items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-5 rounded-2xl border border-emerald-200/50">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Entradas do Mês</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black text-emerald-950">
                  {hideFinancialValues ? "R$ ••••••" : `R$ ${totalIncomes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
                <span className="p-2 bg-emerald-500 text-white rounded-lg">
                  <TrendingUp size={18} />
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-5 rounded-2xl border border-red-100">
              <span className="text-[10px] uppercase font-bold text-red-800 tracking-wider">Despesas / Saídas</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black text-red-950">
                  {hideFinancialValues ? "R$ ••••••" : `R$ ${totalExits.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
                <span className="p-2 bg-red-500 text-white rounded-lg">
                  <TrendingDown size={18} />
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1565C0]/5 to-[#1565C0]/15 p-5 rounded-2xl border border-blue-200">
              <span className="text-[10px] uppercase font-bold text-blue-900 tracking-wider">Status Geral</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black text-slate-900">
                  {hideFinancialValues ? "R$ ••••••" : `R$ ${currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
                <span className="text-[11px] font-extrabold bg-[#1565C0] text-white px-2.5 py-1 rounded-lg">
                  {currentBalance >= 0 ? "Superávit 🕊️" : "Déficit ⚠️"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Registry Trigger controls */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-600">Necessita lançar entradas físicas de dízimo ou faturas de manutenção?</span>
            <button
              onClick={() => {
                setTransactionType("Receita");
                setCategoria("Dízimo");
                setIsLedgerFormOpen(true);
              }}
              className="px-4 py-2 bg-[#2E7D32] text-white hover:bg-[#1b5e20] rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
            >
              ➕ Lançar Movimentação
            </button>
          </div>

          {/* Double column input form sheet */}
          {isLedgerFormOpen && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Lançamento de Registro Financeiro 💵
                </h3>
                <button onClick={() => setIsLedgerFormOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                  Fechar
                </button>
              </div>

              <form onSubmit={handleLedgerSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Type toggle */}
                <div>
                  <label htmlFor="tx-type" className="block text-xs font-semibold text-slate-700">Tipo de Fluxo</label>
                  <select
                    id="tx-type"
                    value={transactionType}
                    onChange={(e: any) => {
                      setTransactionType(e.target.value);
                      setCategoria(e.target.value === "Receita" ? "Dízimo" : "Reforma");
                    }}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  >
                    <option value="Receita">Receita (Entrada)</option>
                    <option value="Despesa">Despesa (Saída)</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label htmlFor="tx-val" className="block text-xs font-semibold text-slate-700">Valor (R$)</label>
                  <input
                    id="tx-val"
                    type="number"
                    step="0.01"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="250.00"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="tx-cat" className="block text-xs font-semibold text-slate-700">Categoria</label>
                  <select
                    id="tx-cat"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-700">Data de Compensação</label>
                  <input
                    id="tx-date"
                    type="date"
                    required
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-600"
                  />
                </div>

                {/* Payment method */}
                <div>
                  <label htmlFor="tx-forma" className="block text-xs font-semibold text-slate-700">Forma de Pagamento</label>
                  <select
                    id="tx-forma"
                    value={formaPagamento}
                    onChange={(e: any) => setFormaPagamento(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro Físico</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Transferência">Banco / Transferência</option>
                  </select>
                </div>

                {/* Member selection (Active match ONLY if Receita is Dízimo) */}
                {transactionType === "Receita" && categoria === "Dízimo" && (
                  <div className="md:col-span-2">
                    <label htmlFor="tx-mb" className="block text-xs font-semibold text-slate-700">Doador (Membro Cadastrado)</label>
                    <select
                      id="tx-mb"
                      value={membroId}
                      onChange={(e) => setMembroId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                    >
                      <option value="">-- Contribuinte Anônimo / Visitante --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description input */}
                <div className="md:col-span-2">
                  <label htmlFor="tx-desc" className="block text-xs font-semibold text-slate-700">Nota Descritiva</label>
                  <input
                    id="tx-desc"
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Dízimo referencial ou pagamento de zeladoria..."
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                {/* Submit buttons */}
                <div className="md:col-span-4 flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsLedgerFormOpen(false)}
                    className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Confirmar Lançamento
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table representation statement of Cash Ledger */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Histórico Completo de Consolidação
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Total de registros: {transactions.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-150 text-xs text-left">
                <thead className="bg-white text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3">Fluxo / Identificador</th>
                    <th scope="col" className="px-5 py-3">Data</th>
                    <th scope="col" className="px-5 py-3">Categoria</th>
                    <th scope="col" className="px-5 py-3">Memória / Descrição</th>
                    <th scope="col" className="px-5 py-3">Forma</th>
                    <th scope="col" className="px-5 py-3 text-right">Valor bruto</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
                  {[...transactions]
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold flex items-center gap-2">
                          {t.tipo === "Receita" ? (
                            <span className="bg-emerald-100 text-emerald-800 p-1 rounded-md">
                              <ArrowUpRight size={14} />
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 p-1 rounded-md">
                              <ArrowDownRight size={14} />
                            </span>
                          )}
                          <span className={t.tipo === "Receita" ? "text-emerald-800" : "text-red-800"}>
                            {t.tipo === "Receita" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {t.data.split("-").reverse().join("/")}
                        </td>
                        <td className="px-5 py-3.5 font-bold">
                          <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 text-[10px]">
                            {t.categoria}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-[200px] truncate">
                          <span className="block font-bold">{t.membroNome ? `Dízimo de ${t.membroNome}` : t.descricao}</span>
                          {t.membroNome && <span className="text-[10px] text-slate-400 block truncate">{t.descricao}</span>}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-600">{t.formaPagamento}</td>
                        <td className="px-5 py-3.5 text-right font-black text-slate-900 pr-6">
                          <span className={t.tipo === "Receita" ? "text-emerald-700" : "text-red-700"}>
                            {t.tipo === "Receita" ? "+" : "-"} R$ {hideFinancialValues ? "••••" : t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* The Generosity and Donation online layout module (COMPLIANCE VERSE carousel AND PIX input) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: Carousel of bible Verses on Generosity */}
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border border-emerald-200">
                Luz das Escrituras Sagradas 📖
              </span>

              {/* Animating display verse card selection */}
              <div key={verseIndex} className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-3.5">
                <p className="text-sm font-bold italic text-slate-800 leading-normal">
                  "{currentVerse.versículo}"
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-500 max-w-[200px] leading-normal italic block">
                    {currentVerse.contexto}
                  </span>
                  <span className="font-extrabold text-emerald-900 tracking-tight shrink-0">
                    — {currentVerse.referência}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation carousel triggers */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-emerald-100/50">
              <button
                onClick={() => setVerseIndex((prev) => (prev - 1 + GENEROSITY_VERSES.length) % GENEROSITY_VERSES.length)}
                className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-50 active:scale-95 transition-all text-center cursor-pointer"
              >
                ← Versículo Anterior
              </button>
              <span className="text-xs text-slate-400 font-bold uppercase">
                {verseIndex + 1} de {GENEROSITY_VERSES.length}
              </span>
              <button
                onClick={() => setVerseIndex((prev) => (prev + 1) % GENEROSITY_VERSES.length)}
                className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-50 active:scale-95 transition-all text-center cursor-pointer"
              >
                Próximo Versículo →
              </button>
            </div>
          </div>

          {/* Column 2: Simulated PIX Digital Donation Terminal */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Wallet className="text-[#1565C0]" size={20} />
              Maquininha de Contribuição On-line
            </h3>

            <form onSubmit={handleSimulateDonation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Donor name */}
                <div className="col-span-2">
                  <label htmlFor="don-name" className="block text-xs font-bold text-slate-700">Seu Nome (Para a Ata / Opcional)</label>
                  <input
                    id="don-name"
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Insira seu nome ou deixe em branco para anônimo..."
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs"
                  />
                </div>

                {/* Purpose destination selection */}
                <div>
                  <label htmlFor="don-purp" className="block text-xs font-bold text-slate-700">Destinação do Recurso</label>
                  <select
                    id="don-purp"
                    value={donationPurpose}
                    onChange={(e) => setDonationPurpose(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="Dízimo Geral">Dízimo Geral</option>
                    <option value="Oferta Voluntária">Oferta Voluntária</option>
                    <option value="Ação de Reforma">Fundo para Reforma / Som</option>
                    <option value="Apoio Social / Missão">Obra Social & Missões</option>
                  </select>
                </div>

                {/* Value picker */}
                <div>
                  <label htmlFor="don-val" className="block text-xs font-bold text-slate-700">Valor da Contribuição (R$)</label>
                  <input
                    id="don-val"
                    type="number"
                    step="5"
                    required
                    value={donationValue}
                    onChange={(e) => setDonationValue(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Fast values pick row */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Escolha Rápida de Valores:</label>
                <div className="flex gap-2">
                  {["20", "50", "100", "300"].map((btnVal) => (
                    <button
                      key={btnVal}
                      type="button"
                      onClick={() => setDonationValue(btnVal)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        donationValue === btnVal
                          ? "bg-[#1565C0] text-white border-[#1565C0]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      R$ {btnVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Render dynamic virtual PIX QRCode mockup and text code block copy-paste helper */}
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                
                {/* SVG QR Code Mockup representing Igreja Viva tech */}
                <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0 bg-white p-1 border border-slate-150 rounded-lg">
                  <path d="M 5,5 h 25 v 25 h -25 z M 10,10 h 15 v 15 h -15 z" fill="#1565C0" />
                  <path d="M 54,5 h 25 v 25 h -25 z M 59,10 h 15 v 15 h -15 z" fill="#1565C0" />
                  <path d="M 5,54 h 25 v 25 h -25 z M 10,59 h 15 v 15 h -15 z" fill="#1565C0" />
                  <path d="M 40,5 h 8 v 8 h -8 z" fill="#2E7D32" />
                  <path d="M 45,20 h 8 v 10 h -8 z" fill="#2E7D32" />
                  <path d="M 5,40 h 12 v 6 h -12 z" fill="#2E7D32" />
                  <path d="M 33,33 h 18 v 18 h -18 z" fill="#1565C0" opacity="0.3" />
                  <circle cx="42" cy="42" r="6" fill="#2E7D32" />
                  {/* Digital connecting lines */}
                  <path d="M 50,50 h 20 v 8 h -8 v 12 h 12" stroke="#2E7D32" strokeWidth="2" fill="none" />
                  <path d="M 40,68 h 10 v 10" stroke="#1565C0" strokeWidth="2" fill="none" />
                </svg>

                <div className="text-center sm:text-left space-y-1.5 min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-extrabold text-blue-800 tracking-wide block">Chave de Cópia Pix</span>
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white text-[10px] font-mono p-1">
                    <span className="truncate flex-1 px-1.5 text-slate-600 self-center">
                      00020126360014br.gov.bcb.pix0114igrejaviva@pix.com.br5204000053039865405{donationValue}.005802BR
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="p-1 px-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-all shrink-0 rounded-md cursor-pointer border-l border-slate-250 flex items-center gap-0.5"
                    >
                      {pixCopied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  {pixCopied && (
                    <span className="text-[10px] text-emerald-700 font-bold block animate-bounce">
                      ✨ Copiado com sucesso! Abra o app do seu banco para colar e contribuir.
                    </span>
                  )}
                </div>
              </div>

              {/* Confirm contribution simulated action */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#1565C0] text-white hover:bg-[#0d47a1] rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                Confirmar Pagamento Simulado do PIX R$ {parseFloat(donationValue || "0").toFixed(2)}
              </button>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-start gap-2 text-[10px] leading-relaxed text-amber-900">
                <AlertCircle className="shrink-0 text-amber-600 mt-0.5" size={12} />
                <span>
                  <strong>Atenção:</strong> Esta é uma simulação segura de tesouraria do MVP. Nenhum dinheiro real é transitado. Ao confirmar, a quantia entra instantaneamente como receita no balanço do caixa da igreja para demonstração.
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
