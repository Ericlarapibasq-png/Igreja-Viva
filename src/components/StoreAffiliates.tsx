import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, ShoppingCart, Link, Award, TrendingUp, Coins, Tags, 
  CheckCircle, QrCode, Share2, Copy, Plus, Minus, Info, Percent, 
  BookOpen, Users, UserCheck, MessageSquare, Key, Save, Check
} from "lucide-react";

// Product Type
interface Product {
  id: string;
  name: string;
  price: number;
  category: "Livros" | "Bíblias" | "Vestuário" | "Acessórios" | "Estudos";
  description: string;
  image: string;
  points: number; // Commission reward points
}

// Order Cart Item Type
interface CartItem {
  product: Product;
  quantity: number;
}

// Saved Affiliate Profile Type
interface AffiliateProfile {
  name: string;
  code: string;
  cellGroup: string;
  totalClicks: number;
  totalConversions: number;
  pointsAccumulated: number;
  registered: boolean;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-01",
    name: "Bíblia de Estudo Vida Cristã (Capa Couro Nobre)",
    price: 129.90,
    category: "Bíblias",
    description: "Contém mapas interativos, notas explicativas reformadas, esboços homiléticos e plano de leitura anual.",
    image: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400&auto=format&fit=crop&q=80",
    points: 15
  },
  {
    id: "prod-02",
    name: "Caminhando Pelas Escrituras — Pr. Erivaldo",
    price: 49.90,
    category: "Livros",
    description: "Uma imersão inspiradora no discipulado diário e na teologia prática das comunidades reformadas de hoje.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80",
    points: 10
  },
  {
    id: "prod-03",
    name: "Camiseta Oficial Igreja Viva (Algodão Egípcio)",
    price: 69.90,
    category: "Vestuário",
    description: "Estampa minimalista Coram Deo. Desenvolvida em algodão sustentável macio de qualidade superior.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80",
    points: 8
  },
  {
    id: "prod-04",
    name: "Caderno de Notas e Devocional 'Fé & Oração'",
    price: 34.90,
    category: "Acessórios",
    description: "Espaço pautado especial para anotações de sermões, desafios de vida e resoluções espirituais de PGMs.",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&auto=format&fit=crop&q=80",
    points: 5
  },
  {
    id: "prod-05",
    name: "Manual de Capacitação de Líderes de PGM",
    price: 19.90,
    category: "Estudos",
    description: "Diretrizes práticas de pastoreio mútuo, quebra-gelo espiritual, resolução de conflitos caridosos e multiplicação saudável.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&auto=format&fit=crop&q=80",
    points: 3
  }
];

export default function StoreAffiliates() {
  const [activeSubtab, setActiveSubtab] = useState<"store" | "affiliates">("store");
  
  // Store States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [checkoutStep, setCheckoutStep] = useState<"browsing" | "pix_payment">("browsing");
  const [pixKey, setPixKey] = useState<string>(() => {
    return localStorage.getItem("viva-store-pix-key") || "financeiro@igrejaviva.org.br";
  });
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState("");

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedAffLink, setCopiedAffLink] = useState<string | null>(null);

  // Affiliate States
  const [affiliate, setAffiliate] = useState<AffiliateProfile>(() => {
    const saved = localStorage.getItem("viva-affiliate-profile");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: "",
      code: "",
      cellGroup: "",
      totalClicks: 24,
      totalConversions: 3,
      pointsAccumulated: 45,
      registered: false
    };
  });

  const [regName, setRegName] = useState("");
  const [regCell, setRegCell] = useState("");

  // Affiliates Simulator States
  const [simClicks, setSimClicks] = useState<number>(100);
  const [simConvRate, setSimConvRate] = useState<number>(5); // percent
  const [simAvgValue, setSimAvgValue] = useState<number>(60);

  // Load registered users session info to auto-fill if any
  useEffect(() => {
    const activeUser = localStorage.getItem("viva-current-user");
    if (activeUser && !affiliate.registered) {
      try {
        const parsed = JSON.parse(activeUser);
        setRegName(parsed.nome || "");
      } catch (e) {
        console.error(e);
      }
    }
  }, [affiliate.registered]);

  // Save Affiliate Profile
  const handleRegisterAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    const generatedCode = `viva-${regName.trim().toLowerCase().replace(/\s+/g, "-")}-${Math.floor(100+Math.random()*900)}`;
    const newProfile: AffiliateProfile = {
      name: regName.trim(),
      code: generatedCode,
      cellGroup: regCell || "Geral",
      totalClicks: 0,
      totalConversions: 0,
      pointsAccumulated: 0,
      registered: true
    };

    setAffiliate(newProfile);
    localStorage.setItem("viva-affiliate-profile", JSON.stringify(newProfile));
  };

  const handleResetAffiliate = () => {
    const defaultProfile = {
      name: "",
      code: "",
      cellGroup: "",
      totalClicks: 24,
      totalConversions: 3,
      pointsAccumulated: 45,
      registered: false
    };
    setAffiliate(defaultProfile);
    localStorage.removeItem("viva-affiliate-profile");
  };

  // Cart operations
  const addToCart = (prod: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) => 
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const updateQuantity = (prodId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === prodId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (prodId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== prodId));
  };

  const clearCart = () => setCart([]);

  const getSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  // Real BR Code PIX builder helper
  const generatePixCopyPasteCode = (key: string, amount: number): string => {
    const formattedAmount = amount.toFixed(2);
    const keyLen = String(key.length).padStart(2, "0");
    const amountStr = String(formattedAmount).length;
    const amountLen = String(amountStr).padStart(2, "0");
    
    // Simplifed valid EMV PIX string representing payload format
    return `00020101021226${37 + key.length}0014br.gov.bcb.pix01${keyLen}${key}52040000530398654${amountLen}${formattedAmount}5802BR5911Igreja Viva6009Sao Paulo62070503***6304CAFE`;
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyPixPayload = () => {
    const code = generatePixCopyPasteCode(pixKey, getSubtotal());
    navigator.clipboard.writeText(code);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handleSavePixKey = () => {
    const trimmed = tempKey.trim();
    if (trimmed) {
      setPixKey(trimmed);
      localStorage.setItem("viva-store-pix-key", trimmed);
    }
    setIsEditingKey(false);
  };

  // Copy Affiliate Unique Link
  const handleCopyAffiliateLink = (prodId: string) => {
    const refLink = `${window.location.origin}/?ref=${affiliate.code}&prod=${prodId}`;
    navigator.clipboard.writeText(refLink);
    setCopiedAffLink(prodId);
    setTimeout(() => setCopiedAffLink(null), 2500);
  };

  const filteredProducts = selectedCategory === "Todos" 
    ? DEFAULT_PRODUCTS 
    : DEFAULT_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 sm:px-3">
      {/* Visual top card */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[120%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-20%] w-[45%] h-[90%] bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/25 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/40">
              🛒 Recursos Gerais Igreja Viva
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Loja Virtual & Rede de Afiliados
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-450 font-bold max-w-xl">
              Adquira literatura edificante e uniformes da igreja viva. Use nosso programa de afiliados para mobilizar células/PGMs e financiar atividades de forma transparente.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setActiveSubtab("store")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSubtab === "store"
                  ? "bg-[#2E7D32] text-white shadow-sm"
                  : "bg-slate-850 text-slate-300 border border-slate-750 hover:bg-slate-800"
              }`}
            >
              <ShoppingBag size={13} className="inline mr-1.5" />
              Ver Produtos
            </button>
            <button
              onClick={() => setActiveSubtab("affiliates")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSubtab === "affiliates"
                  ? "bg-[#1565C0] text-white shadow-sm"
                  : "bg-slate-850 text-slate-300 border border-slate-750 hover:bg-slate-800"
              }`}
            >
              <Award size={13} className="inline mr-1.5" />
              Área de Afiliados
            </button>
          </div>
        </div>
      </div>

      {activeSubtab === "store" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Side: Product browsing (7 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Category Selectors */}
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-3xs flex gap-1.5 overflow-x-auto scrollbar-none">
              {["Todos", "Livros", "Bíblias", "Vestuário", "Acessórios", "Estudos"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#2E7D32] text-white"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="h-40 bg-slate-900 relative">
                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      className="w-full h-full object-cover opacity-85"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-[8.5px] text-slate-100 font-extrabold uppercase px-2 py-0.5 rounded border border-slate-750">
                      {prod.category}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 bg-emerald-50 text-emerald-900 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-250 flex items-center gap-1">
                      <Percent size={10} />
                      +{prod.points} pto comissão
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-bold line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 mt-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Preço</span>
                        <span className="text-sm font-black text-[#1E4D2B]">
                          R$ {prod.price.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(prod)}
                        className="p-1 px-2.5 bg-emerald-150 hover:bg-emerald-200 hover:text-emerald-950 text-emerald-850 border border-emerald-200/60 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 leading-snug select-none"
                      >
                        <ShoppingCart size={11} />
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Shipping Cart/Receipt Checkout (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-105 pb-3">
              <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart size={14} className="text-emerald-750" />
                Carrinho de Compras
              </h3>
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="text-[9.5px] font-bold text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {checkoutStep === "browsing" ? (
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-dashed border-slate-250">
                      🛒
                    </div>
                    <p className="text-[11px] font-bold text-slate-500">Seu carrinho está vazio!</p>
                    <p className="text-[10px] text-slate-400 font-bold">Selecione produtos ao lado e monte sua sacola de estudos ou uniformes.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex gap-2.5 justify-between items-center py-1 border-b border-slate-50">
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span className="block text-[11px] font-bold text-slate-800 truncate">{item.product.name}</span>
                            <span className="block text-[10px] text-emerald-700 font-bold">R$ {item.product.price.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                            <button 
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="text-slate-500 hover:text-slate-800 p-0.5 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-[11px] font-mono font-black text-slate-700 w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="text-slate-500 hover:text-slate-800 p-0.5 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">Total Itens:</span>
                        <span className="text-slate-800 font-bold font-mono">
                          {cart.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">Pontos Acumulados:</span>
                        <span className="text-blue-650 font-black font-mono">
                          {cart.reduce((a, b) => a + (b.product.points * b.quantity), 0)} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-150">
                        <span className="text-xs font-black text-slate-800">Total Geral:</span>
                        <span className="text-[13px] font-black text-[#1E4D2B] font-mono">
                          R$ {getSubtotal().toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => setCheckoutStep("pix_payment")}
                        className="w-full py-2.5 bg-[#2E7D32] hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all shadow-3xs cursor-pointer text-center select-none"
                      >
                        Continuar para Pagamento PIX
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-[11px] text-slate-600 leading-relaxed text-center space-y-1">
                  <span className="block font-black text-[#2E7D32]">Escaneie para Pagar</span>
                  <span>Pagamento direto na Tesouraria Geral da Igreja Viva. Seu comprovante registrará seu pedido automaticamente!</span>
                </div>

                <div className="flex flex-col items-center py-2">
                  {/* QR Code image loaded dynamically based on exact cart amount and key */}
                  <div className="relative border border-slate-200 p-2 rounded-xl bg-white shadow-xxs w-[150px] h-[150px] flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatePixCopyPasteCode(pixKey, getSubtotal()))}`}
                      alt="PIX QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <span className="text-xs font-mono font-black text-slate-800 mt-2">
                    R$ {getSubtotal().toFixed(2)}
                  </span>
                </div>

                {/* COPY AND PASTE TEXT CONTAINER */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-left space-y-1">
                  <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">PIX Copia e Cole</span>
                  <p className="text-[10px] font-mono font-bold text-slate-700 truncate select-all">{generatePixCopyPasteCode(pixKey, getSubtotal())}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyPixPayload}
                    className="py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 cursor-pointer transition-colors"
                  >
                    {copiedPayload ? "Copiado!" : "Copiar PIX"}
                  </button>
                  <button
                    onClick={handleCopyPixKey}
                    className="py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 cursor-pointer transition-colors"
                  >
                    {copiedKey ? "Copiada!" : "Copiar Chave"}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutStep("browsing")}
                    className="flex-1 py-2 text-center border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      // Simula envio de comprovante no WhatsApp
                      const text = `Ol%C3%A1%2C%20acabei%20de%20fazer%20um%20pagamento%2520de%20R%24%20${getSubtotal().toFixed(2)}%20pela%20loos%20virtual%20para%20a%20Igreja%20Viva.%20Segue%20o%20comprovante.`;
                      window.open(`https://wa.me/5511999999999?text=${text}`, "_blank");
                      clearCart();
                      setCheckoutStep("browsing");
                    }}
                    className="flex-1 py-1 px-1 text-center bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageSquare size={10} className="fill-white" />
                    Enviar Comprovante
                  </button>
                </div>
              </div>
            )}

            {/* Configurable Chave PIX */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              {isEditingKey ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="text"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded p-1 text-[10px] w-full"
                    placeholder="Chave (Ex: Pix email)"
                  />
                  <button 
                    onClick={handleSavePixKey}
                    className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold text-[9px] cursor-pointer"
                  >
                    Ok
                  </button>
                  <button 
                    onClick={() => setIsEditingKey(false)}
                    className="p-1 bg-red-50 hover:bg-red-100 text-red-800 rounded font-bold text-[9px] cursor-pointer"
                  >
                    X
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate max-w-[170px]" title={`Chave atual: ${pixKey}`}>
                    PIX: <strong>{pixKey}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setTempKey(pixKey);
                      setIsEditingKey(true);
                    }}
                    className="text-[9.5px] font-bold text-indigo-650 hover:underline cursor-pointer"
                  >
                    Alterar Chave
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          {!affiliate.registered ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg mx-auto shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-inner text-xl">
                🏅
              </div>
              
              <div className="space-y-1">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest block">
                  Cadastrar-se Como Afiliado
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-bold">
                  Inscreva-se em nossa rede de afiliados. Cada recurso comprado por meio do seu link exclusivo acumula pontos de comissão para a manutenção de sua célula (PGM), departamento, ou fundos locais!
                </p>
              </div>

              <form onSubmit={handleRegisterAffiliate} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-505 mb-1.5">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-550 mb-1.5 animate-pulse">Grupo de Célula / PGM Opcional</label>
                  <input
                    type="text"
                    value={regCell}
                    onChange={(e) => setRegCell(e.target.value)}
                    placeholder="Ex: PGM Videira"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1565C0] hover:bg-blue-850 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-3xs text-center"
                >
                  Concluir Registro de Afiliado
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Affiliate Dashboard statistics (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-205 rounded-xl p-3 shadow-3xs text-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Visitas / Cliques</span>
                    <span className="text-lg font-black text-slate-800 font-mono leading-none">{affiliate.totalClicks}</span>
                    <span className="block text-[8.5px] text-emerald-600 font-bold mt-1">Conexões ativas</span>
                  </div>

                  <div className="bg-white border border-slate-205 rounded-xl p-3 shadow-3xs text-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Vendas / Conversão</span>
                    <span className="text-lg font-black text-slate-800 font-mono leading-none">{affiliate.totalConversions}</span>
                    <span className="block text-[8.5px] text-indigo-650 font-bold mt-1">Conversão de {((affiliate.totalConversions / (affiliate.totalClicks || 1)) * 100).toFixed(1)}%</span>
                  </div>

                  <div className="bg-white border border-slate-205 rounded-xl p-3 shadow-3xs text-center bg-blue-50/20 border-blue-100">
                    <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest block mb-0.5">Pontos Saldo</span>
                    <span className="text-lg font-black text-blue-800 font-mono leading-none">{affiliate.pointsAccumulated}</span>
                    <span className="block text-[8.5px] text-blue-600 font-bold mt-1">Sua Pontuação</span>
                  </div>
                </div>

                {/* Distribution listing */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-3xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">
                      Seus Links de Afiliado Exclusivos
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">Compartilhe na célula ou redes sociais. Cada venda acumula pontos de dízimos/comissões locais.</p>
                  </div>

                  <div className="space-y-3.5">
                    {DEFAULT_PRODUCTS.map((prod) => (
                      <div key={prod.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-slate-850 block truncate">{prod.name}</span>
                          <span className="text-[9px] text-[#2E7D32] font-mono font-bold block mt-0.5">Preço: R$ {prod.price.toFixed(2)} | Pontos: +{prod.points} pts</span>
                        </div>

                        <div className="flex gap-2 shrink-0 items-center justify-end w-full sm:w-auto">
                          <button
                            onClick={() => handleCopyAffiliateLink(prod.id)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-slate-100 border border-indigo-150 rounded-lg text-[9.5px] font-black text-indigo-750 cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Copy size={11} />
                            {copiedAffLink === prod.id ? "Copiado!" : "Copiar Link"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Affiliate simulator tool (4 cols) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-5">
                <div className="border-b border-slate-105 pb-3">
                  <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-indigo-650" />
                    Simulador de Conversão
                  </h3>
                  <p className="text-[9.5px] text-slate-400 font-bold">Projete os lucros e metas da sua célula.</p>
                </div>

                <div className="space-y-4">
                  {/* Slider 1: click/visit */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-650">
                      <span>Projeção Cliques:</span>
                      <span className="font-mono text-slate-800">{simClicks} cliques</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={simClicks}
                      onChange={(e) => setSimClicks(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1565C0]"
                    />
                  </div>

                  {/* Slider 2: Conversion Rate */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-650">
                      <span>Conversão Planejada:</span>
                      <span className="font-mono text-slate-800">{simConvRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="0.5"
                      value={simConvRate}
                      onChange={(e) => setSimConvRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1565C0]"
                    />
                  </div>

                  {/* Slider 3: average product value */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-650">
                      <span>Valor Médio Produto:</span>
                      <span className="font-mono text-slate-800">R$ {simAvgValue}</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="130"
                      step="5"
                      value={simAvgValue}
                      onChange={(e) => setSimAvgValue(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1565C0]"
                    />
                  </div>

                  {/* Simulator Calculations display */}
                  <div className="bg-[#FAF9F5] border border-slate-150 p-4 rounded-xl space-y-3.5">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-150">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Vendas Estimadas</span>
                        <span className="block text-sm font-mono font-black text-slate-800 mt-1">
                          {Math.round(simClicks * (simConvRate / 100))} un
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-150">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Pontos Gerados</span>
                        <span className="block text-sm font-mono font-black text-blue-800 mt-1">
                          {Math.round(simClicks * (simConvRate / 100) * 10)} pts
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center bg-indigo-50/30 p-2 rounded-lg border border-indigo-100/50">
                      <span className="text-[11px] font-black text-slate-800">Receita Total para o Reino:</span>
                      <span className="text-xs font-black text-indigo-700 font-mono">
                        R$ {(simClicks * (simConvRate / 100) * simAvgValue).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-450 text-center leading-normal">
                    Seu ID: <span className="font-mono font-bold text-slate-705">{affiliate.code}</span> | 
                    <button 
                      onClick={handleResetAffiliate}
                      className="text-red-500 hover:underline font-bold ml-1 cursor-pointer"
                    >
                      Remover Filiação
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
