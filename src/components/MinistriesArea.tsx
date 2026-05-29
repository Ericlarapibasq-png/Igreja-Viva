import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Megaphone, 
  Sparkles, 
  Music, 
  Baby, 
  Video, 
  HeartHandshake, 
  Zap, 
  Plus, 
  Trash2, 
  Phone, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Check, 
  Bookmark,
  Share2,
  Heart,
  Eye,
  AlertCircle,
  GraduationCap,
  Radio,
  X,
  Compass,
  ArrowRight
} from "lucide-react";
import { 
  Member, 
  VolunteerScale, 
  EventSchedule, 
  User, 
  UserLevel,
  Visitor,
  PgmCell,
  TrainingCourse
} from "../types";

// Import nested components
import TrainingGroups from "./TrainingGroups";
import CommunicationRadio from "./CommunicationRadio";

// Ministry definition interface
interface MinistryInfo {
  id: string;
  name: string;
  keyName: "Louvor" | "Infantil" | "Mídia" | "Recepção" | "Jovens";
  icon: React.ReactNode;
  themeColor: string; // Tailwind bg/text combinations
  borderColor: string;
  ringColor: string;
  leaderName: string;
  leaderTitle: string;
  leaderAvatar: string;
  leaderPhrase: string;
  leaderPhone: string;
  goals: string[];
}

interface MinistryPost {
  id: string;
  ministryKey: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  liked?: boolean;
  important?: boolean;
}

interface MinistryMeeting {
  id: string;
  ministryKey: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

interface MinistriesAreaProps {
  members: Member[];
  visitors: Visitor[];
  scales: VolunteerScale[];
  events: EventSchedule[];
  pgms: PgmCell[];
  courses: TrainingCourse[];
  currentUser: User | null;
  onAddPgm: (pgm: Omit<PgmCell, "id">) => void;
  onAddCourse: (course: Omit<TrainingCourse, "id">) => void;
  onUpdateCourse: (course: TrainingCourse) => void;
  onAskVivaIAPrompt: (prompt: string) => void;
  ministryNames?: Record<string, string>;
  pastorName?: string;
}

export default function MinistriesArea({
  members,
  visitors,
  scales,
  events,
  pgms,
  courses,
  currentUser,
  onAddPgm,
  onAddCourse,
  onUpdateCourse,
  onAskVivaIAPrompt,
  ministryNames = {}
}: MinistriesAreaProps) {
  // Nested sub-tab state inside Ministries: "pillars" | "discipleship" | "departments" | "radio"
  const [subTab, setSubTab] = useState<"pillars" | "discipleship" | "departments" | "radio">("pillars");

  const [selectedMinistryKey, setSelectedMinistryKey] = useState<"Louvor" | "Infantil" | "Mídia" | "Recepção" | "Jovens">("Louvor");
  const [customPosts, setCustomPosts] = useState<MinistryPost[]>([]);
  const [customMeetings, setCustomMeetings] = useState<MinistryMeeting[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Mini Form states
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postIsImportant, setPostIsImportant] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLoc, setMeetingLoc] = useState("");

  const [syncToMain, setSyncToMain] = useState(true);

  // Initialize and load dynamic content from LocalStorage
  useEffect(() => {
    // Likes mapping
    const savedPostLikes = localStorage.getItem("viva-ministry-post-likes");
    if (savedPostLikes) {
      setLikedPosts(JSON.parse(savedPostLikes));
    }

    // Ministry custom announcements
    const savedPosts = localStorage.getItem("viva-ministry-internal-posts");
    if (savedPosts) {
      setCustomPosts(JSON.parse(savedPosts));
    } else {
      // Default placeholder posts for ministries
      const defaultPosts: MinistryPost[] = [
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
          id: "mp-inf-01",
          ministryKey: "Infantil",
          title: "🎨 Material de Apoio da EBD Infantil",
          content: "Professores, os novos cadernos didáticos ilustrados para a classe do Maternal e Primários já estão disponíveis na secretaria de apoio. Favor retirar até sábado meio-dia.",
          date: "2026-05-27",
          likes: 8,
          important: false
        },
        {
          id: "mp-mid-01",
          ministryKey: "Mídia",
          title: "📽️ Treinamento de Transmissão & Câmeras",
          content: "Neste sábado às 14h teremos uma oficina hands-on rápida sobre calibração do novo OBS Studio e ajustes no foco da câmera principal. Presença essencial de toda a equipe de transmissão.",
          date: "2026-05-26",
          likes: 15,
          important: true
        },
        {
          id: "mp-rec-01",
          ministryKey: "Recepção",
          title: "🤝 Escala de Consolidação de Visitantes",
          content: "Nossos diconatos e recepcionistas devem orientar os novos visitantes a preencherem o cartão de oração e encaminhá-los para nossa tenda Viva no pós-culto. Vamos espalhar amor!",
          date: "2026-05-25",
          likes: 6,
          important: false
        }
      ];
      setCustomPosts(defaultPosts);
      localStorage.setItem("viva-ministry-internal-posts", JSON.stringify(defaultPosts));
    }

    // Ministry custom meetings
    const savedMeetings = localStorage.getItem("viva-ministry-internal-meetings");
    if (savedMeetings) {
      setCustomMeetings(JSON.parse(savedMeetings));
    } else {
      const defaultMeetings: MinistryMeeting[] = [
        {
          id: "mm-lou-01",
          ministryKey: "Louvor",
          title: "Ensaio Geral Vozes e Banda",
          date: "2026-06-04",
          time: "19:30",
          location: "Santuário Sede"
        },
        {
          id: "mm-inf-01",
          ministryKey: "Infantil",
          title: "Planejamento Teatral das Crianças",
          date: "2026-05-30",
          time: "15:00",
          location: "Sala de Co-working"
        },
        {
          id: "mm-mid-01",
          ministryKey: "Mídia",
          title: "Alineamento das Câmeras de Live",
          date: "2026-05-30",
          time: "17:00",
          location: "Cabine de Som"
        }
      ];
      setCustomMeetings(defaultMeetings);
      localStorage.setItem("viva-ministry-internal-meetings", JSON.stringify(defaultMeetings));
    }
  }, []);

  // Department definitions
  const ministriesList: MinistryInfo[] = [
    {
      id: "m-01",
      name: ministryNames["Louvor"] || "Louvor & Adoração",
      keyName: "Louvor",
      icon: <Music className="text-sky-500 shrink-0" size={18} />,
      themeColor: "from-sky-500 to-[#1565C0] text-sky-950",
      borderColor: "border-sky-200",
      ringColor: "ring-sky-500",
      leaderName: "Carlos Eduardo Santos",
      leaderTitle: "Diretor Musical & Pastor Adjunto",
      leaderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      leaderPhrase: "Nossa adoração é a trilha sonora de um povo apaixonado pela Cruz de Cristo.",
      leaderPhone: "(11) 98765-4321",
      goals: ["Renovação de todos os cabos e microfones sem fio", "Formação do Coro Jovem de Adoração", "Gravação do Single ao vivo 'Igreja Viva'"]
    },
    {
      id: "m-02",
      name: ministryNames["Infantil"] || "Ministério de Crianças",
      keyName: "Infantil",
      icon: <Baby className="text-amber-500 shrink-0" size={18} />,
      themeColor: "from-amber-400 to-[#D97706] text-amber-950",
      borderColor: "border-amber-200",
      ringColor: "ring-amber-500",
      leaderName: "Mariana Alencar",
      leaderTitle: "Coordenadora de Educação Infantil",
      leaderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      leaderPhrase: "Educar a criança no caminho que deve andar garante gerações maduras no Evangelho.",
      leaderPhone: "(11) 97654-3210",
      goals: ["Reestruturação pedagógica das salas de 0 a 6 anos", "Treinamento em Primeiros Socorros para monitores", "Preparar Cantata de Natal Infantil"]
    },
    {
      id: "m-03",
      name: ministryNames["Mídia"] || "Mídia & Tecnologia",
      keyName: "Mídia",
      icon: <Video className="text-indigo-500 shrink-0" size={18} />,
      themeColor: "from-indigo-500 to-[#312E81] text-indigo-950",
      borderColor: "border-indigo-200",
      ringColor: "ring-indigo-500",
      leaderName: "Fernando de Souza",
      leaderTitle: "Diretor de Comunicação & TI",
      leaderAvatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&auto=format&fit=crop&q=80",
      leaderPhrase: "Usando a tecnologia moderna como amplificador para a voz eterna de salvação.",
      leaderPhone: "(11) 91234-5678",
      goals: ["Lentes novas para as câmeras de streaming", "Implementação de legendas automáticas ao vivo", "Consolidação operacional do Painel de LEDs"]
    },
    {
      id: "m-04",
      name: ministryNames["Recepção"] || "Recepção & Diaconato",
      keyName: "Recepção",
      icon: <HeartHandshake className="text-emerald-500 shrink-0" size={18} />,
      themeColor: "from-emerald-500 to-[#1E4D2B] text-emerald-950",
      borderColor: "border-emerald-200",
      ringColor: "ring-emerald-500",
      leaderName: "Antônio da Silva Ribeiro",
      leaderTitle: "Líder Geral do Corpo de Diáconos",
      leaderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      leaderPhrase: "Antes de ouvirem o sermão no púlpito, os visitantes veem o evangelho na recepção do templo.",
      leaderPhone: "(11) 98877-6655",
      goals: ["Uniformização da identidade visual da Recepção", "Criação do Ponto de Acolhimento pós-culto", "Suporte imediato de acessibilidade em libras"]
    },
    {
      id: "m-05",
      name: ministryNames["Jovens"] || "Geração Jovem",
      keyName: "Jovens",
      icon: <Zap className="text-violet-500 shrink-0" size={18} />,
      themeColor: "from-violet-500 to-[#4C1D95] text-violet-950",
      borderColor: "border-violet-200",
      ringColor: "ring-violet-500",
      leaderName: "Juliana Mendes",
      leaderTitle: "Presidente da Geração Jovem Viva",
      leaderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      leaderPhrase: "Identidade em Cristo, união profunda, fôlego missionário e nenhuma timidez espiritual.",
      leaderPhone: "(11) 96543-2198",
      goals: ["Expansão para 5 novas células de jovens", "Acampamento Metanoia Unificado 2026", "Café com Teologia mensal"]
    }
  ];

  const currentMinistry = ministriesList.find(m => m.keyName === selectedMinistryKey) || ministriesList[0];

  // Count active volunteers in this ministry list
  const activeMembers = members.filter(m => m.ministerio === currentMinistry.keyName);

  // Filter volunteer scales matching this ministry
  const activeScales = scales.filter(scale => scale.ministério === currentMinistry.keyName);

  // Matches existing general calendar events with this ministry category/description
  const relatedEvents = events.filter(e => {
    const titleMatch = e.nome.toLowerCase().includes(currentMinistry.keyName.toLowerCase());
    const descMatch = e.descricao.toLowerCase().includes(currentMinistry.keyName.toLowerCase());
    const categoryMatch = e.categoria.toLowerCase().includes(currentMinistry.keyName.toLowerCase());
    return titleMatch || descMatch || categoryMatch;
  });

  // Filter internal posts of THIS ministry
  const filteredPosts = customPosts.filter(p => p.ministryKey === currentMinistry.keyName);

  // Filter internal meetings of THIS ministry
  const filteredMeetings = customMeetings.filter(m => m.ministryKey === currentMinistry.keyName);

  // Post new bulletin
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPostId = `mp-user-${Date.now()}`;
    const newPost: MinistryPost = {
      id: newPostId,
      ministryKey: currentMinistry.keyName,
      title: postTitle,
      content: postContent,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
      important: postIsImportant
    };

    const updatedPosts = [newPost, ...customPosts];
    setCustomPosts(updatedPosts);
    localStorage.setItem("viva-ministry-internal-posts", JSON.stringify(updatedPosts));

    // AUTOMATIC INTEGRATION: if user selected sync, we write it to "viva-user-announcements"!
    if (syncToMain) {
      const mainAnnounceId = `m-sync-${Date.now()}`;
      const mainItem = {
        id: mainAnnounceId,
        type: "aviso" as const,
        title: `[${currentMinistry.name}] ${postTitle}`,
        description: `${postContent}\n\n📢 Postagem interna do Ministério de ${currentMinistry.name}. Líder responsável: ${currentMinistry.leaderName}`,
        date: new Date().toISOString().split("T")[0],
        highlight: postIsImportant,
        likes: 0,
        likedByUser: false,
        notified: false,
        tag: currentMinistry.keyName,
        ministry: currentMinistry.keyName
      };

      const savedAnnouncements = localStorage.getItem("viva-user-announcements");
      const currentList = savedAnnouncements ? JSON.parse(savedAnnouncements) : [];
      const updatedList = [mainItem, ...currentList];
      localStorage.setItem("viva-user-announcements", JSON.stringify(updatedList));

      // Trigger temporary confirmation tooltip to alert the user of this integration
      const tooltip = document.createElement("div");
      tooltip.className = "fixed bottom-10 right-10 z-[100] bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-lg border border-emerald-300/30 animate-fade-in flex items-center gap-2";
      tooltip.innerHTML = `🤝 Compartilhado Automaticamente com o Mural Geral da Igreja!`;
      document.body.appendChild(tooltip);
      setTimeout(() => tooltip.remove(), 3500);
    }

    setPostTitle("");
    setPostContent("");
    setPostIsImportant(false);
  };

  // Add new internal meeting to this ministry agenda
  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingDate.trim() || !meetingTime.trim()) return;

    const newMeeting: MinistryMeeting = {
      id: `mm-user-${Date.now()}`,
      ministryKey: currentMinistry.keyName,
      title: meetingTitle,
      date: meetingDate,
      time: meetingTime,
      location: meetingLoc || "Prédio Anexo"
    };

    // Keep state
    const updatedMeetings = [newMeeting, ...customMeetings];
    setCustomMeetings(updatedMeetings);
    localStorage.setItem("viva-ministry-internal-meetings", JSON.stringify(updatedMeetings));

    // Sync to main events
    if (syncToMain) {
      const mainEventId = `ev-sync-${Date.now()}`;
      const mainEventItem: EventSchedule = {
        id: mainEventId,
        nome: `[${currentMinistry.keyName}] ${meetingTitle}`,
        data: meetingDate,
        horario: meetingTime,
        descricao: `Agenda ministerial interna convocada pelo líder de ${currentMinistry.keyName}: ${currentMinistry.leaderName}. Detalhes: ${meetingTitle}`,
        local: meetingLoc || "Prédio Anexo",
        categoria: "Outro"
      };

      const savedEvents = localStorage.getItem("viva-custom-app-events");
      const currentEvs = savedEvents ? JSON.parse(savedEvents) : [];
      localStorage.setItem("viva-custom-app-events", JSON.stringify([mainEventItem, ...currentEvs]));
    }

    setMeetingTitle("");
    setMeetingDate("");
    setMeetingTime("");
    setMeetingLoc("");

    // Notification banner
    const tooltip = document.createElement("div");
    tooltip.className = "fixed bottom-10 right-10 z-[100] bg-blue-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-lg border border-blue-300/30 animate-fade-in flex items-center gap-2";
    tooltip.innerHTML = `🗓️ Reunião agendada em ${currentMinistry.keyName}!`;
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 2500);
  };

  // Like internal posts
  const handleLikePost = (postId: string) => {
    const isAlreadyLiked = !!likedPosts[postId];
    const newLikesMap = { ...likedPosts, [postId]: !isAlreadyLiked };
    setLikedPosts(newLikesMap);
    localStorage.setItem("viva-ministry-post-likes", JSON.stringify(newLikesMap));

    setCustomPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: isAlreadyLiked ? p.likes - 1 : p.likes + 1,
          liked: !isAlreadyLiked
        };
      }
      return p;
    }));
  };

  // Delete bullet post
  const handleDeletePost = (postId: string) => {
    if (window.confirm("Deseja realmente apagar esta postagem de comunicação?")) {
      const updated = customPosts.filter(p => p.id !== postId);
      setCustomPosts(updated);
      localStorage.setItem("viva-ministry-internal-posts", JSON.stringify(updated));
    }
  };

  // Delete custom scheduled meeting
  const handleDeleteMeeting = (meetId: string) => {
    if (window.confirm("Remover esta agenda ministerial interna?")) {
      const updated = customMeetings.filter(m => m.id !== meetId);
      setCustomMeetings(updated);
      localStorage.setItem("viva-ministry-internal-meetings", JSON.stringify(updated));
    }
  };

  // Pillars Definition Data
  const pillarsOfViva = [
    {
      title: "Pilar da Comunhão (Koinonia)",
      phrase: "União fraternal profunda, partindo o pão nas casas com alegria e sincera generosidade.",
      practical: [
        "Encontro semanal nos Pequenos Grupos Multiplicadores (PGMs)",
        "Acolhimento amoroso de novos convertidos e novos membros",
        "Cafés de união e jantares de comunhão pós-cultos"
      ],
      color: "border-rose-100 bg-rose-50/20 text-slate-800",
      textColor: "text-rose-900",
      icon: <Heart size={20} className="text-rose-600 fill-rose-150" />
    },
    {
      title: "Pilar do Discipulado (Matheteuo)",
      phrase: "Crescimento teológico consistente e acompanhamento mútuo focado nas Escrituras.",
      practical: [
        "Escola Bíblica Discipuladora (EBD) de domingo",
        "Classes de capacitação ministerial e novos membros",
        "Encontros de mentoria e caminhada espiritual saudável"
      ],
      color: "border-emerald-100 bg-emerald-50/15 text-slate-800",
      textColor: "text-emerald-900",
      icon: <Users size={20} className="text-emerald-700" />
    },
    {
      title: "Pilar da Adoração (Proskuneo)",
      phrase: "Viver em constante gratidão ao Pai, expressando louvor congregacional em espírito e em verdade.",
      practical: [
        "Diretrizes técnicas e oracionais do Louvor & Adoração",
        "Ensaios musicais dedicados e orquestração de cultos",
        "Liturgia de adoração com entrega e excelência estética"
      ],
      color: "border-sky-100 bg-sky-50/20 text-slate-800",
      textColor: "text-sky-900",
      icon: <Music size={20} className="text-[#1565C0]" />
    },
    {
      title: "Pilar do Evangelismo (Marturia)",
      phrase: "Proclamação corajosa do Evangelho e acolhimento imediato de cada novo visitante.",
      practical: [
        "Escalas de Recepção de Diáconos nos templos",
        "Acolhimento com o Cartão de Oração e visitas pastorais",
        "Células parceiras voltadas para acolher o bairro sede"
      ],
      color: "border-amber-100 bg-amber-50/20 text-slate-800",
      textColor: "text-amber-900",
      icon: <Sparkles size={20} className="text-amber-600" />
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="ministries-dashboard-viva">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-850">
        <div className="absolute top-0 right-0 w-48 h-full bg-[#1B7A2D]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-36 h-2/3 bg-[#1565C0]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 animate-fade-in">
            <span className="text-[10px] bg-slate-800 text-[#1B7A2D] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1 border border-slate-700">
              <Sparkles size={11} className="fill-[#1B7A2D]" />
              Painel de Integração Ministerial
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Área de Ministérios
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed">
              Consolidação de atividades, formação de pequenos grupos, devocionais oracionais e transmissão pastoral para toda a igreja.
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700 px-4 py-3 rounded-2xl flex items-center gap-3">
            <Compass className="text-emerald-500" size={20} />
            <div>
              <span className="block text-[8px] font-black text-slate-400 uppercase">Eixo Principal</span>
              <span className="block text-sm font-black text-white">4 Pilares Ativos</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUBTAB REGULATION - NESTED COMPASS SELECTOR */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setSubTab("pillars")}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === "pillars"
              ? "bg-white text-[#1E4D2B] shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-900 hover:bg-white/45"
          }`}
        >
          <Compass size={14} className={subTab === "pillars" ? "text-emerald-700" : ""} />
          <span>Visão & Pilares</span>
        </button>

        <button
          onClick={() => setSubTab("discipleship")}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === "discipleship"
              ? "bg-white text-[#1E4D2B] shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-900 hover:bg-white/45"
          }`}
        >
          <GraduationCap size={14} className={subTab === "discipleship" ? "text-emerald-700" : ""} />
          <span>PGMs & Capacitação</span>
        </button>

        <button
          onClick={() => setSubTab("radio")}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === "radio"
              ? "bg-white text-[#1E4D2B] shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-900 hover:bg-white/45"
          }`}
        >
          <Radio size={14} className={subTab === "radio" ? "text-emerald-700" : ""} />
          <span>Rádio & Devocionais</span>
        </button>

        <button
          onClick={() => setSubTab("departments")}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === "departments"
              ? "bg-white text-[#1E4D2B] shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-900 hover:bg-white/45"
          }`}
        >
          <Users size={14} className={subTab === "departments" ? "text-emerald-700" : ""} />
          <span>Departamentos Sede</span>
        </button>
      </div>

      {/* 3. CONDITIONAL MODULE RENDERER */}
      <div className="animate-fade-in">
        
        {/* SUBTAB 1: PILARES & COMUNHÃO */}
        {subTab === "pillars" && (
          <div className="space-y-6">
            
            {/* Banner/Intro */}
            <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row items-center gap-5 justify-between">
              <div className="space-y-1">
                <span className="text-[9px] bg-emerald-100 text-emerald-900 font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  Identidade do Evangelho 📖
                </span>
                <h2 className="text-lg font-black text-slate-900">Fundamentos de Crescimento e Vida de Comunhão</h2>
                <p className="text-xs text-slate-500 leading-normal max-w-xl font-medium">
                  A nossa identidade não reside em metodologias provisórias, mas sim na profundidade com que vivenciamos a fé em Cristo Jesus no dia a dia.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSubTab("discipleship")}
                  className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Ver Células / PGMs <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Grid of the 4 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillarsOfViva.map((p, index) => (
                <div key={index} className={`rounded-3xl border p-5 sm:p-6 space-y-3 shadow-3xs flex flex-col justify-between ${p.color}`}>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-205 flex items-center justify-center shadow-3xs shrink-0">
                        {p.icon}
                      </div>
                      <h3 className={`text-sm sm:text-base font-black ${p.textColor} uppercase`}>{p.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">{p.phrase}</p>
                  </div>

                  <div className="border-t border-slate-200/50 pt-3 space-y-1.5 mt-2">
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Atividades Práticas</span>
                    {p.practical.map((item, id) => (
                      <div key={id} className="flex items-center gap-1.5 text-slate-700 text-[11px] font-bold">
                        <Check size={11} className="text-emerald-600 shrink-0 stroke-[3px]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Communion Guidelines and Goals Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-3xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#1E4D2B] flex items-center justify-center text-sm font-black shadow-xxs">
                  🌿
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase">A Prática Dinâmica da Comunhão</h3>
                  <p className="text-xs text-slate-500 font-medium">As bases comuns em que cultivamos amor prático e acolhimento.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                
                {/* Rule 1 */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-rose-700 uppercase bg-rose-50 px-2 py-0.5 rounded">
                      Cuidado Mútuo Nos Lares
                    </span>
                    <p className="text-slate-650 leading-relaxed font-semibold">
                      Na igreja primitiva, perseveravam no partir do pão e orações. Nossos Pequenos Grupos Multiplicadores (PGMs) garantem que ninguém precise caminhar só; cada membro encontra um núcleo de suporte oracional, amizades autênticas e socorro prático diário.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSubTab("discipleship")}
                    className="text-[10px] text-emerald-800 font-black hover:underline cursor-pointer text-left self-start"
                  >
                    Explorar Células Cadastradas &rarr;
                  </button>
                </div>

                {/* Rule 2 */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      Comissão de Diaconato e Recepção
                    </span>
                    <p className="text-slate-650 leading-relaxed font-semibold">
                      Antes que o visitante ouça a mensagem do púlpito, ele vê a compaixão e o sorriso acolhedor da recepção. Nossa equipe está estruturada para orientar o tráfego, prover cadeiras extras, esclarecer as dependências e amparar as gestantes e idosos com prioridade de amor.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSubTab("departments")}
                    className="text-[10px] text-blue-850 font-black hover:underline cursor-pointer text-left self-start"
                  >
                    Detalhes do Departamento &rarr;
                  </button>
                </div>

                {/* Rule 3 */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                      Frequência e Alinhamento
                    </span>
                    <p className="text-slate-650 leading-relaxed font-semibold">
                      Os devocionais diários transmitidos pelas mídias e rádio da Igreja Viva nutrem os corações distantes durante a semana inteira. O culto presencial celebra essa base invisível de discipulado contínuo, culminando nos alvos de crescimento da membresia.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSubTab("radio")}
                    className="text-[10px] text-indigo-850 font-black hover:underline cursor-pointer text-left self-start"
                  >
                    Ouvir Rádio e Gerar Devocionais &rarr;
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 2: DISCIPULADO & PGMS & CAPACITAÇÃO */}
        {subTab === "discipleship" && (
          <div className="p-0.5 bg-white rounded-3xl border border-slate-100 shadow-3xs p-1 sm:p-5">
            <TrainingGroups
              members={members}
              pgms={pgms}
              courses={courses}
              onAddPgm={onAddPgm}
              onAddCourse={onAddCourse}
              onUpdateCourse={onUpdateCourse}
              onAskVivaIAPrompt={onAskVivaIAPrompt}
            />
          </div>
        )}

        {/* SUBTAB 3: RÁDIO & DEVOCIONAIS */}
        {subTab === "radio" && (
          <div className="p-0.5 bg-white rounded-3xl border border-slate-100 shadow-3xs p-1 sm:p-5">
            <CommunicationRadio 
              onAskVivaIAPrompt={onAskVivaIAPrompt} 
              members={members}
              visitors={visitors}
            />
          </div>
        )}

        {/* SUBTAB 4: DEPARTAMENTOS SEDE */}
        {subTab === "departments" && (
          <div className="space-y-6">
            
            {/* 2. Selector Tabs/Row - Responsive list */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100 rounded-3xl p-1.5 border border-slate-200">
              {ministriesList.map(item => {
                const isActive = selectedMinistryKey === item.keyName;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMinistryKey(item.keyName)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isActive 
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/45"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate max-w-full text-[10px] sm:text-xs">
                      {item.keyName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. Main Split View Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (Líder Responsável + Agenda Ministerial + Alvos) = 4 units on grid */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* CARD: Líder Responsável */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-150 flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <UserCheck size={14} className="text-[#1B7A2D]" />
                      Líder Responsável
                    </h2>
                    <span className="bg-slate-200 text-slate-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                      Ativo
                    </span>
                  </div>

                  <div className="p-5 flex flex-col items-center text-center space-y-3.5">
                    
                    {/* Leader Avatar wrapper */}
                    <div className="relative group">
                      <img
                        src={currentMinistry.leaderAvatar}
                        alt={currentMinistry.leaderName}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100 shadow-inner group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {currentMinistry.leaderName}
                      </h3>
                      <p className="text-[10px] text-[#1B7A2D] font-bold mt-0.5">
                        {currentMinistry.leaderTitle}
                      </p>
                    </div>

                    {/* Devotional Quote or phrase */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-left">
                      <p className="text-[10px] text-slate-500 italic leading-relaxed font-sans">
                        "{currentMinistry.leaderPhrase}"
                      </p>
                    </div>

                    {/* Contact Button */}
                    <a
                      href={`https://wa.me/${currentMinistry.leaderPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle size={12} className="text-[#25D366]" />
                      Falar com Liderança
                    </a>

                  </div>
                </div>

                {/* CARD: Agenda Internal Events & Rehearsals */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-150 flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#1565C0]" />
                      Agenda de Ensaios & Reuniões
                    </h2>
                    <span className="bg-[#1565C0]/10 text-[#1565C0] text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                      {filteredMeetings.length + relatedEvents.length} Agendas
                    </span>
                  </div>

                  <div className="p-4 space-y-3.5">
                    
                    {/* If no meetings scheduled */}
                    {filteredMeetings.length === 0 && relatedEvents.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 space-y-1.5">
                        <Calendar size={24} className="mx-auto text-slate-250" />
                        <p className="text-[10px] font-bold">Sem ensaios oficiais para os próximos dias.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        
                        {/* Dynamic user added local meetings */}
                        {filteredMeetings.map(meet => (
                          <div key={meet.id} className="border-l-4 border-[#1565C0] bg-slate-50/70 p-2.5 rounded-r-xl border border-y-slate-200 border-r-slate-200 space-y-1 group">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[#1565C0] text-[10px] uppercase tracking-wider">
                                Interno Equipe
                              </span>
                              
                              {(currentUser?.nivel === UserLevel.PASTOR || currentUser?.nome === currentMinistry.leaderName) && (
                                <button
                                  onClick={() => handleDeleteMeeting(meet.id)}
                                  className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded cursor-pointer"
                                  title="Apagar reunião"
                                >
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                            <h4 className="text-xs font-black text-slate-800 leading-snug">{meet.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] text-slate-500 pt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Clock size={10} />
                                {meet.date} às {meet.time}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <MapPin size={10} />
                                {meet.location}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* General church related events matching this ministry */}
                        {relatedEvents.map(ev => (
                          <div key={ev.id} className="border-l-4 border-slate-400 bg-slate-50/40 p-2.5 rounded-r-xl border border-y-slate-150 border-r-slate-150 space-y-1">
                            <span className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wider">
                              Programação Geral
                            </span>
                            <h4 className="text-xs font-extrabold text-slate-800 leading-snug">{ev.nome}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] text-slate-500 pt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Clock size={10} />
                                {ev.data} às {ev.horario}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <MapPin size={10} />
                                {ev.local}
                              </span>
                            </div>
                          </div>
                        ))}

                      </div>
                    )}

                    {/* Pastor Form to Schedule quick Rehearsal/Meeting */}
                    {(currentUser?.nivel === UserLevel.PASTOR || currentUser?.nome === currentMinistry.leaderName) && (
                      <div className="border-t border-slate-100 pt-3">
                        <span className="block text-[8px] font-black text-slate-400 uppercase mb-2">Marcar Ensaio ou Reunião</span>
                        <form onSubmit={handleAddMeeting} className="space-y-2">
                          <input
                            type="text"
                            placeholder="Ex: Ensaio de Vozes (Soprano)"
                            value={meetingTitle}
                            onChange={e => setMeetingTitle(e.target.value)}
                            required
                            className="w-full text-[10px] font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:bg-white"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="date"
                              value={meetingDate}
                              onChange={e => setMeetingDate(e.target.value)}
                              required
                              className="w-full text-[10px] font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:bg-white"
                            />
                            <input
                              type="time"
                              value={meetingTime}
                              onChange={e => setMeetingTime(e.target.value)}
                              required
                              className="w-full text-[10px] font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:bg-white"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Local de ensaio (Ex: Sala de Coral)"
                            value={meetingLoc}
                            onChange={e => setMeetingLoc(e.target.value)}
                            className="w-full text-[10px] font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:bg-white"
                          />

                          {/* Simple Sync Toggle Option */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="checkbox"
                              id="meet-sync-check"
                              checked={syncToMain}
                              onChange={e => setSyncToMain(e.target.checked)}
                              className="w-3 h-3 text-emerald-650"
                            />
                            <label htmlFor="meet-sync-check" className="text-[8px] font-extrabold text-slate-400 uppercase select-none cursor-pointer">
                              Publicar na agenda de eventos gerais
                            </label>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus size={11} className="stroke-[3px]" />
                            Adicionar na Agenda
                          </button>
                        </form>
                      </div>
                    )}

                  </div>
                </div>

                {/* CARD: Destaques & Alvos do Departamento */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-150">
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Bookmark size={14} className="text-[#D97706]" />
                      Alvos & Prioridades Trimestrais
                    </h2>
                  </div>
                  <div className="p-4 space-y-3">
                    {currentMinistry.goals.map((goal, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[10px] border border-amber-100 shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed pt-0.5">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (Mural de Avisos Próprio + Nova Postagem com Integração ao mural principal) = 8 units on grid */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Form: Postar comunicado em Destaque */}
                {(currentUser?.nivel === UserLevel.PASTOR || currentUser?.nome === currentMinistry.leaderName) && (
                  <div className="bg-white rounded-2xl border border-slate-200/95 p-5 shadow-xxs space-y-4">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                        <Megaphone size={14} className="text-[#1B7A2D]" />
                        Postar Comunicado Interno - {currentMinistry.keyName}
                      </h3>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Conexão Ativa
                      </span>
                    </div>

                    <form onSubmit={handleAddPost} className="space-y-3">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                        <input
                          type="text"
                          placeholder="Título da Notícia / Aviso Ministerial"
                          value={postTitle}
                          onChange={e => setPostTitle(e.target.value)}
                          required
                          className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white outline-none"
                        />
                        <textarea
                          placeholder="Descreva as diretrizes da atividade, voluntários convocados, material de estudo..."
                          value={postContent}
                          onChange={e => setPostContent(e.target.value)}
                          required
                          rows={3}
                          className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        
                        <div className="flex items-center gap-4">
                          {/* Switch sync */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              id="sync-mural-checkbox"
                              checked={syncToMain}
                              onChange={e => setSyncToMain(e.target.checked)}
                              className="w-4 h-4 text-emerald-650 rounded border-slate-350 focus:ring-emerald-500"
                            />
                            <label htmlFor="sync-mural-checkbox" className="text-[10px] font-black text-slate-500 uppercase select-none cursor-pointer">
                              Compartilhar no Mural Geral da Igreja ⭐
                            </label>
                          </div>

                          {/* Is important highlight */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              id="important-post"
                              checked={postIsImportant}
                              onChange={e => setPostIsImportant(e.target.checked)}
                              className="w-4 h-4 text-amber-500 rounded border-slate-350 focus:ring-amber-500"
                            />
                            <label htmlFor="important-post" className="text-[10px] font-black text-slate-500 uppercase select-none cursor-pointer">
                              Destaque importante 📌
                            </label>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="py-2.5 px-5 bg-gradient-to-r from-[#2E7D32] to-[#1565C0] text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all cursor-pointer"
                        >
                          <Plus size={14} className="stroke-[3px]" />
                          Postar no Mural Próprio
                        </button>

                      </div>

                    </form>
                  </div>
                )}

                {/* LIST: Mural Próprio & Comunicados */}
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Megaphone size={13} />
                      Mural de Avisos próprio de {currentMinistry.name}
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400">
                      Total: {filteredPosts.length} Comunicados
                    </span>
                  </div>

                  {filteredPosts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
                      <Megaphone size={36} className="mx-auto text-slate-200" />
                      <p className="text-xs font-extrabold text-slate-700">Seja o primeiro a enviar uma postagem corporativa!</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Utilize o painel principal acima para publicar novos comunicados para todos os membros ativos da sua equipe ministerial.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {filteredPosts.map(post => {
                        const isPostLiked = !!likedPosts[post.id];
                        return (
                          <div 
                            key={post.id}
                            className={`bg-white border rounded-2xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4 shadow-3xs ${
                              post.important ? "border-amber-300 ring-2 ring-amber-50" : "border-slate-200"
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  {post.important && (
                                    <span className="bg-amber-50 text-amber-800 border border-amber-200 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                      <Sparkles size={8} className="fill-amber-800" />
                                      Importante
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-slate-50 text-slate-655 font-bold px-2 py-0.5 rounded border border-slate-150">
                                    @{currentMinistry.keyName} Internal Feed
                                  </span>
                                </div>

                                <span className="text-[9px] font-bold text-slate-400 font-mono">
                                  {new Date(post.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <h3 className="text-sm font-black text-slate-900 leading-snug">
                                  {post.title}
                                </h3>
                                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                                  {post.content}
                                </p>
                              </div>
                            </div>

                            {/* Post Actions (Like, delete, share) */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleLikePost(post.id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-colors cursor-pointer ${
                                    isPostLiked 
                                      ? "bg-red-50 text-red-600 ring-1 ring-red-200" 
                                      : "text-slate-500 hover:text-red-500 hover:bg-slate-50"
                                  }`}
                                >
                                  <Heart size={11} className={isPostLiked ? "fill-red-650 text-red-650" : ""} />
                                  <span>{post.likes}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    const txt = `📢 *MURAL MINISTERIAL - ${currentMinistry.keyName.toUpperCase()}*\n\n*${post.title}*\n${post.content}\n\n_Data de Publicação:_ ${post.date}`;
                                    navigator.clipboard.writeText(txt);
                                    
                                    const pop = document.createElement("div");
                                    pop.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg z-[100] shadow-md";
                                    pop.innerText = "Copiado para área de transferência!";
                                    document.body.appendChild(pop);
                                    setTimeout(() => pop.remove(), 2000);
                                  }}
                                  className="p-1 px-2.5 text-slate-400 hover:text-slate-600 text-[10px] font-bold hover:bg-slate-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
                                  title="Compartilhar texto"
                                >
                                  <Share2 size={11} />
                                  <span>Copiar</span>
                                </button>
                              </div>

                              {/* Delete option if leadership matches */}
                              {(currentUser?.nivel === UserLevel.PASTOR || currentUser?.nome === currentMinistry.leaderName) && (
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                  title="Excluir do mural"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}

                            </div>

                          </div>
                        );
                      })}

                    </div>
                  )}

                </div>

                {/* Volunteer scales integration - AUTO INTEGRATED SCHEDULING WIDGET */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4 font-sans text-xs">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Users size={14} className="text-[#2E7D32]" />
                      Escalas de Voluntários Integradas
                    </h3>
                    <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded uppercase">
                      Geral
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    Abaixo são listados os voluntários ativos deste ministério convocados para as escalas do próximo culto de celebração orquestrado pela equipe diretiva do <strong>Igreja Viva</strong>.
                  </p>

                  {activeScales.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-[10px] font-bold">
                      Nenhum membro escalado para o próximo final de semana neste ministério.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeScales.map(scale => (
                        <div key={scale.id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="block text-xs font-black text-slate-800">{scale.membroNome}</span>
                            <span className="block text-[10px] text-slate-500 font-medium">Função: <strong>{scale.funcaoScale}</strong></span>
                            <span className="block text-[9px] text-[#1565C0] font-bold">{scale.eventoNome}</span>
                          </div>

                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            scale.confirmado === "Sim" 
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            {scale.confirmado === "Sim" ? "Confirmado" : "Pendente"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* List of active members that belong to this ministry */}
                  <div className="pt-2">
                    <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">Quadro Completo de Voluntários ({activeMembers.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeMembers.map(member => (
                        <span key={member.id} className="bg-slate-100 border border-slate-200/80 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          👤 {member.nome}
                        </span>
                      ))}
                      {activeMembers.length === 0 && (
                        <span className="text-[10px] text-slate-405 italic">Nenhum voluntário explicitamente alocado no disculado.</span>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
