import React, { useState, useEffect } from "react";
import { Member, Visitor, FinancialTransaction, EventSchedule, User, UserLevel } from "../types";
import { 
  Users, UserPlus, Calendar, Heart, DollarSign, Sparkles, BookOpen, 
  Share2, Check, LayoutDashboard, Megaphone, UserCheck, Bot, Award, 
  CalendarCheck, Clock, Eye, EyeOff, Bell, ArrowRight, ShieldCheck, 
  Smartphone, BookOpenCheck, Settings, Trash2, X, Plus, ChevronLeft, ChevronRight,
  MessageSquare, Copy, Star, Sparkle, Pencil
} from "lucide-react";
import ChurchLogo from "./ChurchLogo";

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
  onOpenMobileMenu?: () => void;
  pastorName?: string;
  onUpdatePastorName?: (name: string) => void;
  churchLogoUrl?: string;
  onUpdateChurchLogoUrl?: (url: string) => void;
  ministryNames?: Record<string, string>;
}

interface HighlightItem {
  id: string;
  type: "programacao" | "culto" | "aviso" | "campanha";
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
}

interface PastoralLetter {
  id: string;
  sermonTitle: string;
  date: string;
  preacher: string;
  passage: string;
  pastoralText: string;
}

interface PrayerRequest {
  id: string;
  author: string;
  requestText: string;
  date: string;
  prayersCount: number;
}

const DEFAULT_HIGHLIGHTS: HighlightItem[] = [
  {
    id: "hl-1",
    type: "programacao",
    title: "Culto de Celebração & Comunhão",
    subtitle: "Todo Domingo às 19:00",
    description: "Celebração semanal em família, adoração inspiradora e ensino bíblico relevante.",
    image: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&auto=format&fit=crop&q=80",
    ctaText: "Ver Agenda Completa"
  },
  {
    id: "hl-2",
    type: "culto",
    title: "Quinta-feira de Clamor & Oração",
    subtitle: "Toda Quinta às 19:30",
    description: "Momento focado em oração e clamor da igreja pelas congregações e famílias.",
    image: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=600&auto=format&fit=crop&q=80",
    ctaText: "Interceder na Capela"
  },
  {
    id: "hl-3",
    type: "programacao",
    title: "Pequenos Grupos Multiplicadores (PGMs)",
    subtitle: "Crescer em Família — Toda Quarta",
    description: "Discipulado, comunhão e partilha preciosa da Palavra diretamente nos lares.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80",
    ctaText: "Acessar PGMs"
  }
];

const LOCAL_PAST_LETTERS: PastoralLetter[] = [
  {
    id: "pst-lh-01",
    sermonTitle: "A Essência da Igreja Multiplicadora",
    date: "Domingo Recente",
    preacher: "Pr. Erivaldo Lima Ferreira",
    passage: "Atos 1:8 & Mateus 28:19",
    pastoralText: "Queridos discípulos, o crescimento da Igreja Viva não reside apenas nos números que registramos em nossos relatórios de membros, mas no vigor do nosso amor em ação. Fomos chamados para transbordar a graça nos Pequenos Grupos Multiplicadores (PGMs). Lembrem-se: cada visitante acolhido com alegria é um testemunho vivo do agir do Espírito Santo em nosso meio! Una-se com fervor na Escola Bíblica para entender o poder da semente."
  }
];

const BIBLE_VERSES = [
  { text: "O Senhor é o meu pastor; nada me faltará. Deita-me em verdes pastos, guia-me mansamente a águas tranquilas.", ref: "Salmo 23:1-2" },
  { text: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.", ref: "João 3:16" },
  { text: "Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.", ref: "Josué 1:9" },
  { text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Não maltrata, não procura seus interesses.", ref: "1 Coríntios 13:4-5" },
  { text: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.", ref: "1 Pedro 5:7" },
  { text: "Posso todas as coisas naquele que me fortalece.", ref: "Filipenses 4:13" },
  { text: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.", ref: "Isaías 40:31" }
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
  onOpenMobileMenu,
  pastorName = "Pr. Erivaldo Lima Ferreira",
  onUpdatePastorName,
  churchLogoUrl = "",
  onUpdateChurchLogoUrl,
  ministryNames = {},
}: DashboardKPIsProps) {
  
  const [isEditingPastorName, setIsEditingPastorName] = useState(false);
  const [tempPastorName, setTempPastorName] = useState(pastorName);
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [tempLogoUrl, setTempLogoUrl] = useState(churchLogoUrl);

  // Keep state sync when prop changes
  useEffect(() => {
    setTempPastorName(pastorName);
  }, [pastorName]);

  useEffect(() => {
    setTempLogoUrl(churchLogoUrl);
  }, [churchLogoUrl]);

  const activeLetters = LOCAL_PAST_LETTERS.map(p => ({
    ...p,
    preacher: pastorName
  }));

  const [activeHighlightIdx, setActiveHighlightIdx] = useState(0);
  const [showImage, setShowImage] = useState<boolean>(true);

  // States for modals and helpers
  const [selectedHighlightModal, setSelectedHighlightModal] = useState<HighlightItem | null>(null);
  const [selectedPastoralLetter, setSelectedPastoralLetter] = useState<PastoralLetter | null>(null);
  const [ministryHighlights, setMinistryHighlights] = useState<any[]>([]);

  // Notifications systems
  const [likedMinistryMap, setLikedMinistryMap] = useState<Record<string, boolean>>({});
  const [notifiedMinistryMap, setNotifiedMinistryMap] = useState<Record<string, boolean>>({});
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  // Show Android Export guide collapsed
  const [showAndroidPrepHub, setShowAndroidPrepHub] = useState(false);

  // Home interactive Tabbed Content Block: "prayer" | "letter" | "verse"
  const [homeSubTab, setHomeSubTab] = useState<"prayer" | "letter" | "verse">("verse");

  // Church Motto / Identity State - answering "3. Qual a identidade da igreja?"
  const [churchMotto, setChurchMotto] = useState(() => {
    return localStorage.getItem("viva-church-motto") || "Uma igreja viva para glorificar a Deus, acolher pessoas com amor genuíno e fazer a diferença no mundo.";
  });
  const [isEditingMotto, setIsEditingMotto] = useState(false);
  const [tempMotto, setTempMotto] = useState(churchMotto);

  // Keep state sync
  useEffect(() => {
    setTempMotto(churchMotto);
  }, [churchMotto]);

  const handleUpdateMotto = (newMotto: string) => {
    setChurchMotto(newMotto);
    localStorage.setItem("viva-church-motto", newMotto);
  };

  // Interactive Prayer Wall local state
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [newPrayerText, setNewPrayerText] = useState("");
  const [newPrayerAuthor, setNewPrayerAuthor] = useState("");
  const [verseOfDay, setVerseOfDay] = useState({ text: "", ref: "" });

  // Load custom stored states
  useEffect(() => {
    const day = new Date().getDate();
    const verse = BIBLE_VERSES[day % BIBLE_VERSES.length];
    setVerseOfDay(verse);

    const handleLoad = () => {
      try {
        const savedPrayersRaw = localStorage.getItem("viva-altar-prayers");
        if (savedPrayersRaw) {
          setPrayers(JSON.parse(savedPrayersRaw));
        } else {
          const defaultPrayers: PrayerRequest[] = [
            {
              id: "pr-1",
              author: "Irmã Cleide Souza",
              requestText: "Peço oração pela saúde do meu esposo Roberto, que se recupera de uma cirurgia cardíaca. Que o Senhor dê forças à nossa família.",
              date: "Hoje às 08:30",
              prayersCount: 14
            },
            {
              id: "pr-2",
              author: "Líder de Comunidade",
              requestText: "Pelo Pequeno Grupo do bairro das Flores. Que possamos acolher os novos visitantes do último domingo e dar bom testemunho ministerial.",
              date: "Ontem às 18:20",
              prayersCount: 9
            }
          ];
          setPrayers(defaultPrayers);
          localStorage.setItem("viva-altar-prayers", JSON.stringify(defaultPrayers));
        }

        const savedLikes = localStorage.getItem("viva-ministry-post-likes");
        if (savedLikes) setLikedMinistryMap(JSON.parse(savedLikes));

        const savedNotifs = localStorage.getItem("viva-ministry-notifications");
        if (savedNotifs) setNotifiedMinistryMap(JSON.parse(savedNotifs));

        const saved = localStorage.getItem("viva-ministry-internal-posts");
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter((p: any) => p.important === true || p.important === "true" || p.important === "Sim" || p.important === "Sim (Destaque)");
          setMinistryHighlights(filtered.slice(0, 2));
        } else {
          const defaultPosts = [
            {
              id: "mp-lh-01",
              ministryKey: "Louvor",
              title: "🎸 Ensaios Gerais Culto de Ceia",
              content: "Incluímos novos arranjos de adoração em nossa pasta compartilhada para o Culto do próximo final de semana.",
              date: "2026-05-28",
              likes: 12,
              important: true
            },
            {
              id: "mp-mid-01",
              ministryKey: "Mídia",
              title: "📽️ Treinamento de Câmeras OBS",
              content: "Neste sábado às 14h teremos uma oficina prática rápida sobre calibração e foco de câmeras para transmissão online.",
              date: "2026-05-26",
              likes: 15,
              important: true
            }
          ];
          setMinistryHighlights(defaultPosts);
        }
      } catch (e) {
        console.error(e);
      }
    };

    handleLoad();
    if (typeof window !== "undefined") {
      setNotifPermission((window.Notification && window.Notification.permission) || "default");
    }
  }, []);

  const handleToggleLikeMinistryPost = (postId: string) => {
    try {
      const isLiked = !!likedMinistryMap[postId];
      const newMap = { ...likedMinistryMap, [postId]: !isLiked };
      setLikedMinistryMap(newMap);
      localStorage.setItem("viva-ministry-post-likes", JSON.stringify(newMap));

      const savedPosts = localStorage.getItem("viva-ministry-internal-posts");
      let list = savedPosts ? JSON.parse(savedPosts) : [...ministryHighlights];
      const updated = list.map((p: any) => {
        if (p.id === postId) {
          return { ...p, likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1 };
        }
        return p;
      });
      localStorage.setItem("viva-ministry-internal-posts", JSON.stringify(updated));
      setMinistryHighlights(updated.filter((p: any) => p.important).slice(0, 2));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifyMinistryPost = (postId: string, titleStr: string) => {
    try {
      const isNotified = !!notifiedMinistryMap[postId];
      const newMap = { ...notifiedMinistryMap, [postId]: !isNotified };
      setNotifiedMinistryMap(newMap);
      localStorage.setItem("viva-ministry-notifications", JSON.stringify(newMap));

      if (!isNotified) {
        if (typeof window !== "undefined" && window.Notification && window.Notification.permission === "granted") {
          new window.Notification("Igreja Viva ⛪", {
            body: `Lembrete agendado: "${titleStr}"`,
            icon: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=120&auto=format&fit=crop&q=40"
          });
        }

        const alertContainer = document.createElement("div");
        alertContainer.className = "fixed bottom-16 right-4 z-50 bg-[#1E4D2B] text-white font-extrabold text-[11px] px-4 py-3 rounded-xl shadow-lg border border-emerald-300/20 flex items-center gap-2 animate-fade-in";
        alertContainer.innerHTML = `🔔 Notificação Ativada: "${titleStr.substring(0, 25)}..."`;
        document.body.appendChild(alertContainer);
        setTimeout(() => alertContainer.remove(), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestNativeNotifications = () => {
    if (typeof window === "undefined" || !window.Notification) {
      alert("Este navegador ou dispositivo não possui suporte nativo à notificações.");
      return;
    }

    window.Notification.requestPermission().then((permission) => {
      setNotifPermission(permission);
      if (permission === "granted") {
        new window.Notification("Igreja Viva — Notificações Push", {
          body: "Você ativou as notificações com sucesso!",
          badge: "⛪"
        });
      }
    });
  };

  const handleCtaClick = (item: HighlightItem) => {
    if (item.type === "programacao" || item.type === "culto") {
      onNavigateToTab("escalas");
    } else if (item.type === "aviso") {
      onNavigateToTab("viva-ia");
    } else if (item.type === "campanha") {
      onNavigateToTab("doacoes");
    }
    setSelectedHighlightModal(null);
  };

  const handleAddPrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerText.trim()) return;

    const authorName = newPrayerAuthor.trim() || currentUser?.nome || "Membro Convidado";
    const newReq: PrayerRequest = {
      id: `pr-${Date.now()}`,
      author: authorName,
      requestText: newPrayerText.trim(),
      date: "Agora mesmo",
      prayersCount: 1
    };

    const updated = [newReq, ...prayers];
    setPrayers(updated);
    localStorage.setItem("viva-altar-prayers", JSON.stringify(updated));
    setNewPrayerText("");
    setNewPrayerAuthor("");

    const alertContainer = document.createElement("div");
    alertContainer.className = "fixed bottom-16 right-4 z-50 bg-[#1E4D2B] text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg border border-emerald-250 animate-fade-in";
    alertContainer.innerHTML = "🕊️ Seu pedido de oração foi enviado para o Altar da Comunidade!";
    document.body.appendChild(alertContainer);
    setTimeout(() => alertContainer.remove(), 3000);
  };

  const handleSupportPrayer = (prayerId: string) => {
    const updated = prayers.map((p) => {
      if (p.id === prayerId) {
        return { ...p, prayersCount: p.prayersCount + 1 };
      }
      return p;
    });
    setPrayers(updated);
    localStorage.setItem("viva-altar-prayers", JSON.stringify(updated));
  };

  const nextHighlight = () => {
    setActiveHighlightIdx((prev) => (prev + 1) % DEFAULT_HIGHLIGHTS.length);
  };

  const prevHighlight = () => {
    setActiveHighlightIdx((prev) => (prev - 1 + DEFAULT_HIGHLIGHTS.length) % DEFAULT_HIGHLIGHTS.length);
  };

  const currentHighlight = DEFAULT_HIGHLIGHTS[activeHighlightIdx];

  const totalMembrosCount = members.length || 76;
  const novosVisitantesCount = visitors.length || 18;
  const activeScalesCount = 14; 

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto px-1 sm:px-2 relative" id="dashboard-container">
      
      {/* HEADER SECTION - High Contrast Elegant Logo/Pastor Customizer */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs relative">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onOpenMobileMenu}
            className="p-1 px-2.5 hover:bg-[#1E4D2B]/5 active:scale-95 rounded-xl transition-all cursor-pointer text-[#1E4D2B] md:hidden shrink-0 border border-stone-200 bg-stone-50"
            title="Menu lateral"
          >
            <Users size={14} className="stroke-[2.5]" />
          </button>
          
          {isEditingLogo ? (
            <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Cole URL do novo Logo..."
                value={tempLogoUrl}
                onChange={(e) => setTempLogoUrl(e.target.value)}
                className="text-[9.5px] w-36 font-semibold bg-white border border-stone-300 rounded-lg p-1 px-2 focus:outline-none focus:border-[#1E4D2B]"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateChurchLogoUrl?.(tempLogoUrl);
                  setIsEditingLogo(false);
                }}
                className="p-1 px-1.5 bg-[#1E4D2B] text-white rounded-lg text-[9px] font-bold cursor-pointer"
                title="Salvar Logotipo"
              >
                <Check size={10} className="stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempLogoUrl(churchLogoUrl);
                  setIsEditingLogo(false);
                }}
                className="p-1 px-1.5 bg-stone-500 hover:bg-stone-600 text-white rounded-lg text-[9px] font-bold cursor-pointer"
                title="Cancelar"
              >
                <X size={10} className="stroke-[3]" />
              </button>
            </div>
          ) : (
            <div className="relative group/logo">
              <ChurchLogo size={32} showText={false} logoUrl={churchLogoUrl} className="shrink-0 rounded-full animate-fade-in" />
              {currentUser?.nivel === UserLevel.PASTOR && (
                <button
                  type="button"
                  onClick={() => setIsEditingLogo(true)}
                  className="absolute -bottom-1 -right-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-full p-0.5 opacity-0 group-hover/logo:opacity-100 transition-opacity text-stone-650 shadow-3xs cursor-pointer flex items-center justify-center"
                  title="Alterar Logo da Igreja"
                >
                  <Pencil size={8} />
                </button>
              )}
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-1 font-sans uppercase">
                Igreja Viva
              </h1>
              <span className="text-[7px] uppercase font-black tracking-wider bg-emerald-50 text-[#1E4D2B] px-1.5 py-0.5 rounded border border-emerald-100">
                {currentUser?.nivel === UserLevel.PASTOR ? "Espaço do Pastor" : currentUser?.nivel === UserLevel.MEMBRO ? "Membro" : "Visitante Amado"}
              </span>
            </div>
            
            {isEditingPastorName ? (
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="text"
                  value={tempPastorName}
                  onChange={(e) => setTempPastorName(e.target.value)}
                  className="text-[10px] font-bold bg-stone-50 border border-stone-200 rounded-md px-1.5 py-0.5 focus:outline-none focus:border-[#1E4D2B] w-48"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    onUpdatePastorName?.(tempPastorName);
                    setIsEditingPastorName(false);
                  }}
                  className="p-1 text-[#1E4D2B] hover:bg-[#1E4D2B]/5 rounded cursor-pointer"
                  title="Salvar Nome do Pastor"
                >
                  <Check size={11} className="stroke-[3]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempPastorName(pastorName);
                    setIsEditingPastorName(false);
                  }}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                  title="Cancelar"
                >
                  <X size={11} className="stroke-[3]" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-[#1E4D2B] font-bold leading-none mt-1 font-serif italic flex items-center gap-1 group/name">
                Graça e Paz, {currentUser?.nome || "irmão(ã)"}! Deus te abençoe hoje.
                {currentUser?.nivel === UserLevel.PASTOR && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempPastorName(currentUser?.nome || pastorName);
                      setIsEditingPastorName(true);
                    }}
                    className="opacity-0 group-hover/name:opacity-100 p-0.5 hover:bg-stone-100 rounded transition-opacity text-stone-400 hover:text-stone-700 cursor-pointer"
                    title="Editar Nome do Pastor"
                  >
                    <Pencil size={9} />
                  </button>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Sync Controls & Tiny Notifications */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto z-10">
          <button
            onClick={() => handleRequestNativeNotifications()}
            className="px-2 py-1 rounded-xl hover:bg-stone-50 border border-stone-200 bg-white flex items-center gap-1 text-[9px] font-extrabold text-[#1E4D2B] transition-all cursor-pointer"
          >
            <Smartphone size={10} className={notifPermission === "granted" ? "text-emerald-700 font-bold" : "text-stone-400"} />
            <span>Notificações: {notifPermission === "granted" ? "Ativas" : "Sincronizar"}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-1.5 rounded-xl hover:bg-stone-100 bg-white border border-stone-200 text-stone-600 relative cursor-pointer flex items-center justify-center"
              title="Avisos importantes"
            >
              <Bell size={12} className="text-[#1E4D2B]" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#1E4D2B] rounded-full animate-ping" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#1E4D2B] rounded-full" />
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl p-3.5 space-y-3 z-40 text-left animate-slide-up">
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-[9px] font-black uppercase text-stone-500 tracking-wider">Avisos Recentes</span>
                  <button onClick={() => setShowNotificationsDropdown(false)} className="text-stone-400 hover:text-stone-700">
                    <X size={12} />
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="p-2 rounded-xl bg-emerald-50/50 text-[10px] text-emerald-950 border-l-2 border-[#1E4D2B]">
                    <strong className="block text-stone-900 text-[10.5px]">Escala Confirmada 🎸</strong>
                    <span>Você possui escala ativa para o próximo culto dominical às 19:00.</span>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50/50 text-[10px] text-amber-950 border-l-2 border-amber-600">
                    <strong className="block text-stone-900 text-[10.5px]">Recomendação Pastoral 📚</strong>
                    <span>Confira o livro "A Essência da Igreja" na aba de Livraria.</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleRequestNativeNotifications();
                    setShowNotificationsDropdown(false);
                  }}
                  className="w-full py-1.5 bg-[#1E4D2B] text-white text-[9.5px] font-black rounded-lg text-center cursor-pointer hover:bg-emerald-950 transition-colors"
                >
                  Confirmar Alertas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUESTION 1: O QUE ESTÁ ACONTECENDO HOJE? */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-2 gap-2">
          <div className="space-y-0.5 anonymity-helper">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#1E4D2B]">Cultos, Avisos e Programação</span>
            <h2 className="text-[13px] sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              1. O que está acontecendo hoje?
            </h2>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5 w-full sm:w-auto">
            {DEFAULT_HIGHLIGHTS.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveHighlightIdx(idx)}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-tight whitespace-nowrap transition-all cursor-pointer border ${
                  activeHighlightIdx === idx
                    ? "bg-[#1E4D2B] text-white border-[#1E4D2B] shadow-2xs"
                    : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
                }`}
              >
                {tab.type === "programacao" ? "📅 Programação" : tab.type === "culto" ? "🛐 Culto Dominical" : "📢 Aviso"}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {showImage && currentHighlight.image && (
            <div className="md:col-span-5 h-28 relative w-full overflow-hidden rounded-xl bg-stone-900">
              <img 
                src={currentHighlight.image} 
                alt={currentHighlight.title}
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button 
                  onClick={(e) => { e.stopPropagation(); prevHighlight(); }}
                  type="button"
                  className="p-1 bg-black/50 text-white rounded-full cursor-pointer pointer-events-auto hover:bg-black/70 border border-white/10"
                >
                  <ChevronLeft size={10} className="stroke-[3]" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextHighlight(); }}
                  type="button"
                  className="p-1 bg-black/50 text-white rounded-full cursor-pointer pointer-events-auto hover:bg-black/70 border border-white/10"
                >
                  <ChevronRight size={10} className="stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          <div className={`${showImage && currentHighlight.image ? "md:col-span-7" : "md:col-span-12"} space-y-2`}>
            <div className="flex items-center gap-2">
              <span className="text-[7.5px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                {currentHighlight.subtitle}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-stone-900 tracking-tight leading-tight">
              {currentHighlight.title}
            </h3>
            <p className="text-stone-600 text-[10.5px] sm:text-[11px] leading-relaxed font-semibold">
              {currentHighlight.description}
            </p>

            <div className="flex justify-between items-center pt-1">
              <div className="flex gap-1.5">
                {DEFAULT_HIGHLIGHTS.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveHighlightIdx(i)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${
                      i === activeHighlightIdx ? "w-3 bg-[#1E4D2B]" : "w-1.5 bg-stone-200"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedHighlightModal(currentHighlight)}
                className="py-1 px-3 bg-[#1E4D2B] hover:bg-emerald-900 text-white rounded-xl text-[9px] font-extrabold cursor-pointer transition-all flex items-center gap-1"
              >
                Ver Detalhes <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUESTION 2: O QUE EU PRECISO FAZER? */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-4">
        <div className="border-b border-stone-200 pb-2">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#1E4D2B]">Ações e Engajamento da Fé</span>
          <h2 className="text-[13px] sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            2. O que eu preciso fazer?
          </h2>
        </div>

        {/* Action blocks row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action A: Vida */}
          <button
            onClick={() => setHomeSubTab("prayer")}
            className="flex flex-col items-start p-3 bg-white hover:bg-stone-100/50 border border-stone-200 rounded-xl transition-all active:scale-97 text-left h-full cursor-pointer group"
          >
            <div className="p-1 px-1.5 rounded-lg bg-emerald-50 text-[#1E4D2B] shrink-0 mb-2 font-sans font-black flex items-center gap-1">
              <Heart size={12} className="fill-emerald-150 text-[#1E4D2B]" />
              <span className="text-[7.5px] tracking-tight uppercase">Vida</span>
            </div>
            <span className="text-[10px] sm:text-[11.5px] font-black text-stone-900 block leading-tight uppercase tracking-tight">Vida de Oração</span>
            <p className="text-[8.5px] text-stone-550 leading-normal mt-1 font-semibold">Interceda por clamores, orações e bençãos da família da fé.</p>
            <span className="text-[8px] font-extrabold text-[#1E4D2B] mt-auto group-hover:underline flex items-center gap-0.5 pt-2">Mural de Clamor →</span>
          </button>

          {/* Action B: Culto */}
          <button
            onClick={() => onNavigateToTab("escalas")}
            className="flex flex-col items-start p-3 bg-white hover:bg-stone-100/50 border border-stone-200 rounded-xl transition-all active:scale-97 text-left h-full cursor-pointer group"
          >
            <div className="p-1 px-1.5 rounded-lg bg-indigo-50 text-indigo-700 shrink-0 mb-2 font-sans font-black flex items-center gap-1">
              <CalendarCheck size={12} />
              <span className="text-[7.5px] tracking-tight uppercase">Culto</span>
            </div>
            <span className="text-[10px] sm:text-[11.5px] font-black text-stone-900 block leading-tight uppercase tracking-tight">Escalas do Culto</span>
            <p className="text-[8.5px] text-stone-550 leading-normal mt-1 font-semibold">Consulte escalas de louvor, mídia e recepção do Culto.</p>
            <span className="text-[8px] font-extrabold text-indigo-750 mt-auto group-hover:underline flex items-center gap-0.5 pt-2">Ver Minha Escala →</span>
          </button>

          {/* Action C: Comunhão */}
          <button
            onClick={() => onNavigateToTab("escalas")}
            className="flex flex-col items-start p-3 bg-white hover:bg-stone-100/50 border border-stone-200 rounded-xl transition-all active:scale-97 text-left h-full cursor-pointer group"
          >
            <div className="p-1 px-1.5 rounded-lg bg-amber-50 text-amber-850 shrink-0 mb-2 font-sans font-black flex items-center gap-1">
              <Users size={12} />
              <span className="text-[7.5px] tracking-tight uppercase">Comunhão</span>
            </div>
            <span className="text-[10px] sm:text-[11.5px] font-black text-stone-900 block leading-tight uppercase tracking-tight">Comunhão nos PGMs</span>
            <p className="text-[8.5px] text-stone-550 leading-normal mt-1 font-semibold">Participe de discipulado e comunhão preciosa nos lares.</p>
            <span className="text-[8px] font-extrabold text-amber-850 mt-auto group-hover:underline flex items-center gap-0.5 pt-2">Acessar PGMs →</span>
          </button>

          {/* Action D: Ações */}
          <button
            onClick={() => onNavigateToTab("doacoes")}
            className="flex flex-col items-start p-3 bg-white hover:bg-stone-100/50 border border-stone-200 rounded-xl transition-all active:scale-97 text-left h-full cursor-pointer group"
          >
            <div className="p-1 px-1.5 rounded-lg bg-rose-50 text-rose-600 shrink-0 mb-2 font-sans font-black flex items-center gap-1">
              <Heart size={12} className="fill-rose-100" />
              <span className="text-[7.5px] tracking-tight uppercase">Ações</span>
            </div>
            <span className="text-[10px] sm:text-[11.5px] font-black text-stone-900 block leading-tight uppercase tracking-tight">Doação & Caridade</span>
            <p className="text-[8.5px] text-stone-550 leading-normal mt-1 font-semibold">Contribua com amor prático através de dízimos e ofertas.</p>
            <span className="text-[8px] font-extrabold text-rose-700 mt-auto group-hover:underline flex items-center gap-0.5 pt-2">Ir para Doações →</span>
          </button>
        </div>

        {/* Devotional Sub Tabs for deep interaction inside Question 2 */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-3xs">
          <div className="bg-stone-100/70 border-b border-stone-200 grid grid-cols-3">
            <button
              onClick={() => setHomeSubTab("verse")}
              className={`py-2 text-[10px] font-black transition-all flex items-center justify-center gap-1 border-b-2 cursor-pointer ${
                homeSubTab === "verse"
                  ? "bg-white text-[#1E4D2B] border-[#1E4D2B]"
                  : "text-stone-500 border-transparent hover:text-stone-850 hover:bg-stone-100/50"
              }`}
            >
              <BookOpen size={11} className={homeSubTab === "verse" ? "text-emerald-700 font-extrabold" : ""} />
              <span>Versículo</span>
            </button>

            <button
              onClick={() => setHomeSubTab("prayer")}
              className={`py-2 text-[10px] font-black transition-all flex items-center justify-center gap-1 border-b-2 cursor-pointer ${
                homeSubTab === "prayer"
                  ? "bg-white text-[#1E4D2B] border-[#1E4D2B]"
                  : "text-stone-500 border-transparent hover:text-stone-850 hover:bg-stone-100/50"
              }`}
            >
              <Heart size={11} className={homeSubTab === "prayer" ? "text-emerald-700 font-extrabold" : ""} />
              <span>Pedidos de Oração</span>
            </button>

            <button
              onClick={() => setHomeSubTab("letter")}
              className={`py-2 text-[10px] font-black transition-all flex items-center justify-center gap-1 border-b-2 cursor-pointer ${
                homeSubTab === "letter"
                  ? "bg-white text-[#1E4D2B] border-[#1E4D2B]"
                  : "text-stone-500 border-transparent hover:text-stone-850 hover:bg-stone-100/50"
              }`}
            >
              <MessageSquare size={11} className={homeSubTab === "letter" ? "text-emerald-700 font-extrabold" : ""} />
              <span>Carta do Pastor</span>
            </button>
          </div>

          <div className="p-3 sm:p-4">
            {/* Panel A: Verse */}
            {homeSubTab === "verse" && (
              <div className="space-y-3 text-left animate-fade-in">
                <blockquote className="text-stone-800 text-xs sm:text-[12.5px] font-serif italic font-semibold leading-relaxed">
                  "{verseOfDay.text}"
                </blockquote>
                <div className="flex items-center justify-between gap-2.5 pt-1.5 border-t border-stone-150/70 justify-end sm:justify-between flex-wrap">
                  <cite className="text-[9.5px] font-black text-[#1E4D2B] not-italic">{verseOfDay.ref}</cite>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`"${verseOfDay.text}" — ${verseOfDay.ref} (Abençoado em comunhão pelo ecossistema Igreja Viva)`);
                        alert("Reflexão devocional copiada para enviar!");
                      }}
                      className="text-[9px] text-[#1E4D2B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-all font-extrabold"
                    >
                      <Copy size={9} /> Compartilhar Reflexão
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel B: Prayers */}
            {homeSubTab === "prayer" && (
              <div className="space-y-3 animate-fade-in text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {prayers.map((prayer) => (
                    <div key={prayer.id} className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl flex flex-col justify-between gap-1.5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[7.5px] text-stone-450 font-extrabold tracking-tight">
                          <span>🕊️ {prayer.author}</span>
                          <span>{prayer.date}</span>
                        </div>
                        <p className="text-stone-700 text-[9.5px] leading-normal font-semibold font-serif italic">
                          "{prayer.requestText}"
                        </p>
                      </div>
                      <button
                        onClick={() => handleSupportPrayer(prayer.id)}
                        className="self-end px-2 py-0.5 text-[8px] font-black bg-white hover:bg-emerald-50 text-stone-700 hover:text-[#1E4D2B] rounded bg-stone-100 border border-stone-250 flex items-center gap-1 transition-all active:scale-95 cursor-pointer leading-tight font-sans"
                      >
                        <span>🛐 Orar Junto</span>
                        <span className="bg-white px-1 py-0.2 rounded border text-stone-700 font-extrabold font-mono text-[7px]">
                          {prayer.prayersCount}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddPrayerSubmit} className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={newPrayerText}
                    onChange={(e) => setNewPrayerText(e.target.value)}
                    placeholder="Seu pedido ou agradecimento (Ex: Pela saúde da minha mãe...)"
                    className="flex-grow text-[10px] font-semibold bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]/60"
                  />
                  <div className="flex gap-1.5 shrink-0">
                    <input
                      type="text"
                      value={newPrayerAuthor}
                      onChange={(e) => setNewPrayerAuthor(e.target.value)}
                      placeholder="Seu nome"
                      className="w-24 text-[10px] font-semibold bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]/60"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-white bg-[#1E4D2B] hover:bg-emerald-900 rounded-lg text-[9.5px] font-black cursor-pointer shadow-3xs"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Panel C: Letter */}
            {homeSubTab === "letter" && (
              <div className="space-y-2 text-left animate-fade-in">
                <h4 className="text-[11.5px] font-black text-[#1E4D2B] uppercase tracking-wide">
                  Tema: "{activeLetters[0].sermonTitle}"
                </h4>
                <p className="text-[10px] sm:text-[11px] text-stone-655 leading-relaxed font-semibold italic">
                  "{activeLetters[0].pastoralText.substring(0, 195)}..."
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-stone-150/50 mt-1">
                  <span className="text-[8.5px] font-black text-stone-400">Pregador: {activeLetters[0].preacher}</span>
                  <button
                    onClick={() => setSelectedPastoralLetter(activeLetters[0])}
                    className="text-[9.5px] text-[#1E4D2B] bg-[#1E4D2B]/5 hover:bg-[#1E4D2B]/10 px-2.5 py-1 rounded-md font-black block cursor-pointer transition-colors border border-emerald-950/10"
                  >
                    Ler Carta Completa →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUESTION 3: QUAL A IDENTIDADE DA IGREJA? */}
      <div className="bg-gradient-to-tr from-[#1E4D2B] to-[#123119] text-white rounded-2xl p-4 sm:p-5 border border-emerald-800/40 relative overflow-hidden shadow-sm animate-fade-in">
        <div className="absolute top-[-25px] right-[-25px] w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[7.5px] font-black uppercase tracking-widest bg-emerald-800/60 text-emerald-250 px-2.5 py-0.5 rounded border border-emerald-700/50 inline-block font-sans">
                Identidade, Crença & Frase de Fé
              </span>
              <h3 className="text-[12px] sm:text-[13px] font-black uppercase tracking-tight font-sans">
                3. Qual a identidade da nossa igreja?
              </h3>
            </div>
            
            {currentUser?.nivel === UserLevel.PASTOR && !isEditingMotto && (
              <button
                type="button"
                onClick={() => setIsEditingMotto(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-200 transition-colors cursor-pointer"
                title="Editar Frase Curta"
              >
                <Pencil size={11} />
              </button>
            )}
          </div>

          {isEditingMotto ? (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <textarea
                value={tempMotto}
                onChange={(e) => setTempMotto(e.target.value)}
                className="w-full text-xs font-semibold bg-emerald-950/80 border border-emerald-850 rounded-lg p-2.5 focus:outline-none focus:border-emerald-550 text-white leading-relaxed resize-none h-16"
                placeholder="Insira a frase curta de identidade da igreja..."
              />
              <div className="flex gap-2 justify-end font-sans">
                <button
                  type="button"
                  onClick={() => setIsEditingMotto(false)}
                  className="py-1 px-3 bg-stone-700 text-stone-250 rounded-lg text-[9px] font-black cursor-pointer hover:bg-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateMotto(tempMotto);
                    setIsEditingMotto(false);
                  }}
                  className="py-1 px-3 bg-white text-[#1E4D2B] rounded-lg text-[9px] font-black cursor-pointer hover:bg-white/90"
                >
                  Confirmar Identidade
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5 select-none">🕊️</span>
              <p className="text-[12.5px] sm:text-sm font-serif italic text-emerald-50 font-semibold leading-relaxed">
                "{churchMotto}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DISCRETE OPERATIONAL FOOTER */}
      <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-stone-400 text-[10px] font-semibold">
        <div className="flex items-center gap-1.5 font-sans mx-auto sm:mx-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Igreja Viva • Comunidade, Fé e Amor Prático</span>
        </div>
      </div>

      {/* DISCRETE ADVANCED COMPILATION DRAWER FOR LEADERSHIP */}
      {currentUser?.nivel === UserLevel.PASTOR && (
        <div className="pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={() => setShowAndroidPrepHub(!showAndroidPrepHub)}
            className="text-[9px] font-black text-stone-400 hover:text-stone-700 flex items-center justify-center gap-1 cursor-pointer mx-auto py-0.5 uppercase tracking-widest"
          >
            <Settings size={9} />
            <span>{showAndroidPrepHub ? "Ocultar ferramentas de compilação" : "Recursos Android"}</span>
          </button>

          {showAndroidPrepHub && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 mt-2 space-y-2 text-left animate-slide-up font-sans">
              <span className="text-[7.5px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md inline-block">
                Controle Capacitor Android
              </span>
              <p className="text-[10px] font-semibold text-stone-600 leading-normal">
                Use os comandos abaixo no terminal do seu provedor de código para criar o pacote compilado nativo:
              </p>
              <code className="block text-[8px] font-mono p-2 bg-stone-900 text-stone-250 rounded select-all whitespace-pre">
                $ npm install @capacitor/core @capacitor/cli @capacitor/android{"\n"}
                $ npx cap init "Igreja Viva" "br.com.igrejaviva.app"{"\n"}
                $ npx cap add android
              </code>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CAROUSEL DETAILS */}
      {selectedHighlightModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xxs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl border border-stone-100 animate-scale-up">
            <div className="flex justify-between items-start">
              <span className="text-[8px] font-black bg-emerald-50 text-emerald-800 border-emerald-150 border px-2.5 py-0.5 rounded-md uppercase">
                {selectedHighlightModal.subtitle}
              </span>
              <button 
                onClick={() => setSelectedHighlightModal(null)}
                className="p-1 hover:bg-stone-100 rounded text-stone-450 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 text-left">
              <h3 className="text-xs sm:text-sm font-black text-stone-900">{selectedHighlightModal.title}</h3>
              <p className="text-[10.5px] sm:text-[11px] text-stone-600 leading-relaxed font-semibold">{selectedHighlightModal.description}</p>
            </div>

            <button
              onClick={() => handleCtaClick(selectedHighlightModal)}
              className="w-full py-2 bg-[#1E4D2B] hover:bg-[#1E4D2B] text-white rounded-xl text-[10.5px] font-black transition-colors cursor-pointer"
            >
              {selectedHighlightModal.ctaText}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: PASTORAL LETTER VIEW */}
      {selectedPastoralLetter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xxs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-150 animate-scale-up">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2 flex-wrap gap-2">
              <span className="text-[8px] font-black uppercase text-amber-850 tracking-wider bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-sans">Carta Pastoral Semanal</span>
              <button 
                onClick={() => setSelectedPastoralLetter(null)}
                className="p-1 hover:bg-stone-100 rounded text-stone-450 hover:text-stone-850 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-black text-stone-900 font-serif">"{selectedPastoralLetter.sermonTitle}"</h3>
                <div className="flex gap-2 text-[8.5px] text-stone-400 font-bold font-sans">
                  <span>De: {selectedPastoralLetter.preacher}</span>
                  <span>•</span>
                  <span>Escritura: {selectedPastoralLetter.passage}</span>
                </div>
              </div>

              <p className="text-[10.5px] sm:text-[11px] text-stone-700 font-semibold leading-relaxed font-serif indent-4">
                {selectedPastoralLetter.pastoralText}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => {
                  const formatted = `🕊️ *PALAVRA PASTORAL - IGREJA VIVA*\n\n*Tema:* ${selectedPastoralLetter.sermonTitle}\n*Pregador:* ${selectedPastoralLetter.preacher}\n\n"${selectedPastoralLetter.pastoralText}"`;
                  navigator.clipboard.writeText(formatted);
                  alert("Carta pastoral copiada para compartilhar!");
                }}
                className="flex-1 py-1 px-3 text-center border border-stone-200 hover:bg-stone-50 text-[10px] text-stone-700 font-black rounded-lg cursor-pointer"
              >
                Copiar Carta
              </button>
              <button
                onClick={() => setSelectedPastoralLetter(null)}
                className="flex-1 py-1.5 text-center bg-[#1E4D2B] hover:bg-emerald-950 text-white text-[10px] font-black rounded-lg cursor-pointer"
              >
                Fechar Carta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
