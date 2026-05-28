import React, { useState } from "react";
import { Heart, Copy, Check, QrCode, DollarSign, Wallet, Phone, MessageSquare, ArrowRight, Share2 } from "lucide-react";

export default function DonationsModule() {
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("geral");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const pixKey = "financeiro@igrejaviva.org.br";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { id: "geral", label: "Dízimo Geral", desc: "Manutenção do templo e suporte pastoral" },
    { id: "missoes", label: "Oferta Missionária", desc: "Apoio a missionários e expansão do Reino" },
    { id: "reforma", label: "Reforma & Construção", desc: "Melhorias de infraestrutura e novo templo" },
    { id: "social", label: "Ação Social", desc: "Cestas básicas e assistência a famílias carentes" },
  ];

  const quickAmounts = [20, 50, 100, 200, 500];

  const getActiveAmount = (): string => {
    if (selectedAmount !== null) {
      return `R$ ${selectedAmount.toFixed(2)}`;
    }
    if (customAmount) {
      const parsed = parseFloat(customAmount.replace(",", "."));
      if (!isNaN(parsed) && parsed > 0) {
        return `R$ ${parsed.toFixed(2)}`;
      }
    }
    return "";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="donations-module">
      {/* Title Header with theological subtitle */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#1565C0] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[80%] bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[35%] h-[60%] bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Heart size={12} className="fill-white" />
            Generosidade Cristã
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Contribuições e Doações
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base max-w-2xl font-medium tracking-wide">
            "Sua contribuição ajuda a expandir o Reino de Deus."
          </p>
        </div>
      </div>

      {/* Main Grid Layout for Donation Card & Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Options & Customization (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
          
          {/* Step 1: Destination Selector */}
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold text-xs">
                1
              </span>
              Destino do seu Recurso
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedCategory === cat.id
                      ? "border-[#2E7D32] bg-emerald-50/40 ring-1 ring-[#2E7D32]"
                      : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
                  }`}
                >
                  <span className={`block text-xs font-bold ${selectedCategory === cat.id ? "text-emerald-950 font-black" : "text-slate-800"}`}>
                    {cat.label}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-1 leading-snug">
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Amount (Optional Simulation) */}
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold text-xs">
                2
              </span>
              Valor Especial (Opcional)
            </h2>
            
            {/* Quick buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    selectedAmount === amount
                      ? "bg-[#1565C0] text-white border-[#1565C0] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  R$ {amount}
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedAmount(null);
                  setCustomAmount("");
                }}
                className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  selectedAmount === null && !customAmount
                    ? "bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Livre / Outro
              </button>
            </div>

            {/* Custom input or summary */}
            {(selectedAmount === null) && (
              <div className="relative rounded-xl border border-slate-200 px-3 py-1 bg-slate-50 max-w-xs focus-within:ring-1 focus-within:ring-[#1565C0]">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-extrabold">R$</span>
                <input
                  type="text"
                  placeholder="0,00"
                  value={customAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9,.]/g, "");
                    setCustomAmount(val);
                  }}
                  className="pl-6 w-full bg-transparent border-none text-slate-800 text-sm font-bold focus:ring-0 focus:outline-none p-1.5"
                />
              </div>
            )}
          </div>

          {/* Info Card - Direct instructions */}
          <div className="bg-[#FAF9F5] border border-slate-150 p-4 rounded-xl flex items-start gap-3">
            <div className="bg-emerald-100 text-[#2E7D32] p-1.5 rounded-lg shrink-0 mt-0.5">
              <Wallet size={16} />
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
              <p className="font-extrabold text-slate-800">Como funciona o PIX?</p>
              <p>
                As doações enviadas por PIX são compensadas instantaneamente no sistema de tesouraria. O comprovante pode ser guardado com você ou enviado ao financeiro pelo botão do WhatsApp ao lado.
              </p>
              <p className="font-bold text-[#1B7A2D]">
                Igreja Viva garante total transparência, controle fiscal e prestação de contas mensal aos membros.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Centralized QR Code & Copy Information (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main PIX QR Code Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-xs">
            <span className="text-[#1B7A2D] bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4 inline-flex items-center gap-1.5">
              <QrCode size={12} />
              PIX Copie e Cole / QR Code
            </span>

            {/* QR Code central container */}
            <div className="relative bg-white p-4 border border-slate-150 rounded-2xl shadow-xxs max-w-[200px] w-full flex items-center justify-center mb-4 group hover:scale-[1.02] transition-transform">
              
              {/* Dynamic decorative corner markers */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#1B7A2D]" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#111827]" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#1565C0]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#1B7A2D]" />

              {/* Styled clean high-fidelity vector QR design representing a real QR */}
              <svg className="w-full aspect-square text-slate-800" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Patterns of QR */}
                <rect x="5" y="5" width="20" height="20" stroke="currentColor" strokeWidth="4" />
                <rect x="11" y="11" width="8" height="8" fill="currentColor" />
                <rect x="75" y="5" width="20" height="20" stroke="currentColor" strokeWidth="4" />
                <rect x="81" y="11" width="8" height="8" fill="currentColor" />
                <rect x="5" y="75" width="20" height="20" stroke="currentColor" strokeWidth="4" />
                <rect x="11" y="81" width="8" height="8" fill="currentColor" />
                
                {/* Simulated Data blocks */}
                <path d="M 35 5 H 40 V 15 H 45 V 5 H 55 V 10 H 65 V 25 H 45 V 35" stroke="currentColor" strokeWidth="3" strokeDasharray="3 2" />
                <path d="M 5 35 H 15 V 45 H 25 V 55 H 35 V 45" stroke="currentColor" strokeWidth="3" />
                <path d="M 75 35 H 65 V 45 H 55 V 65 H 75 V 70" stroke="currentColor" strokeWidth="4" strokeDasharray="2 2" />
                <path d="M 35 75 H 45 V 85 H 65 V 95 M 50 75 V 95" stroke="currentColor" strokeWidth="3" />
                <rect x="42" y="42" width="16" height="16" fill="#1B7A2D" rx="2" />
                
                {/* Subtle Cross/Cruz graphic custom-styled in the middle of QR */}
                <path d="M 50 45 V 55 M 47 48 H 53" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {/* Overlay with details */}
              <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 rounded-2xl">
                <p className="text-[10px] font-black text-slate-800 leading-snug">
                  {getActiveAmount() ? `PIX Valor:\n${getActiveAmount()}` : "Dízimo & Oferta"}
                </p>
                <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold">Igreja Viva</p>
              </div>
            </div>

            {/* Targeted Amount dynamic display */}
            {getActiveAmount() && (
              <div className="mb-4 bg-emerald-50 text-[#2E7D32] px-4 py-1.5 rounded-xl text-xs font-black shadow-3xs animate-fade-in flex items-center gap-1.5">
                <Wallet size={12} />
                Valor Selecionado: {getActiveAmount()}
              </div>
            )}

            {/* Simulated PIX description category helper */}
            <p className="text-[11px] font-medium text-slate-500 mb-1">
              Finalidade: <strong className="text-slate-800">{categories.find(c => c.id === selectedCategory)?.label}</strong>
            </p>

            {/* PIX Key display container */}
            <div className="w-full bg-slate-50 rounded-xl p-2.5 border border-slate-150 mb-4 text-left">
              <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Chave Oficial (E-mail)</span>
              <span className="block text-xs font-mono font-bold text-slate-700 select-all break-all">{pixKey}</span>
            </div>

            {/* Action Button: Copy PIX Key */}
            <button
              onClick={handleCopyKey}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-emerald-650 hover:bg-emerald-700 text-white shadow-xs"
              }`}
              style={{ backgroundColor: copied ? "#1e293b" : "#1B7A2D" }}
            >
              {copied ? <Check size={14} className="stroke-[3px]" /> : <Copy size={14} />}
              {copied ? "Chave Copiada!" : "Copiar Chave PIX"}
            </button>
          </div>

          {/* Financial WhatsApp Button Card */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 text-center flex flex-col items-center shadow-3xs">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#1B7A2D] flex items-center justify-center mb-3 shadow-3xs">
              <Phone size={18} className="fill-emerald-100" />
            </div>
            <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1">Tesouraria & Finanças</h3>
            <p className="text-[11px] text-slate-600 leading-normal max-w-xs mb-4">
              Precisa de ajuda com relatórios, prestação de contas ou possui alguma dúvida sobre deduções fiscais? Fale agora diretamente com o financeiro.
            </p>
            
            {/* WhatsApp Link button */}
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20contribui%C3%A7%C3%B5es%20da%20Igreja%20Viva!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare size={14} className="fill-white" />
              WhatsApp Financeiro
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
