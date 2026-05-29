import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Calendar, 
  Heart, 
  Bell, 
  BellOff, 
  Sparkles, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Award, 
  Share2, 
  MessageCircle, 
  Music, 
  Users, 
  UserCheck 
} from "lucide-react";
import { EventSchedule, VolunteerScale, User, UserLevel } from "../types";

interface ChurchBillboardProps {
  events: EventSchedule[];
  scales: VolunteerScale[];
  currentUser: User | null;
  onAddEvent?: (ev: EventSchedule) => void;
}

interface MuralItem {
  id: string;
  type: "culto" | "evento" | "campanha" | "aviso";
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  image?: string;
  highlight?: boolean;
  likes: number;
  likedByUser?: boolean;
  notified?: boolean;
  tag?: string;
  ministry?: string; // Louvor, Infantil, etc.
}

const INITIAL_MURAL_STATIC_ITEMS: MuralItem[] = [
  {
    id: "mural-c-01",
    type: "campanha",
    title: "Campanha do Quilo Solidário",
    description: "Arrecadação de alimentos não perecíveis para apoiar famílias assistidas na ação social. Traga sua doação no próximo domingo!",
    date: "2026-06-15",
    location: "Recepção Principal",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop&q=80",
    highlight: true,
    likes: 42,
    likedByUser: false,
    notified: false,
    tag: "Ação Social",
    ministry: "Pastoral"
  },
  {
    id: "mural-a-01",
    type: "aviso",
    title: "Novo Curso EBD: Maturidade Cristã",
    description: "Inscrições abertas para a nova classe dominical. Aulas presenciais todo domingo às 09h.",
    date: "2026-05-31",
    time: "09:00",
    location: "Salas Anexas",
    highlight: false,
    likes: 18,
    likedByUser: false,
    notified: false,
    tag: "Capacitação",
    ministry: "Ensino"
  },
  {
    id: "mural-ca-02",
    type: "campanha",
    title: "Campanha de Oração pelas Famílias",
    description: "Clamor especial diário por lares restaurados. Junte-se a nós às 06h, 12h ou 20h diariamente.",
    date: "2026-06-10",
    highlight: false,
    likes: 31,
    likedByUser: false,
    notified: false,
    tag: "Oração",
    ministry: "Pastoral"
  }
];

export default function ChurchBillboard({
  events,
  scales,
  currentUser,
  onAddEvent
}: ChurchBillboardProps) {
  const [filterType, setFilterType] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [muralItems, setMuralItems] = useState<MuralItem[]>([]);
  const [likedList, setLikedList] = useState<Record<string, boolean>>({});
  const [notifiedList, setNotifiedList] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Custom announcement states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<MuralItem["type"]>("aviso");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newMinistry, setNewMinistry] = useState("");
  const [newHighlight, setNewHighlight] = useState(false);

  // Load and combine static items with dynamic events and scales
  useEffect(() => {
    // Read persisted mural adjustments if any
    const savedLikes = localStorage.getItem("viva-mural-likes");
    const savedNotifications = localStorage.getItem("viva-mural-notifications");
    
    let likesMap: Record<string, boolean> = savedLikes ? JSON.parse(savedLikes) : {};
    let notifiedMap: Record<string, boolean> = savedNotifications ? JSON.parse(savedNotifications) : {};
    setLikedList(likesMap);
    setNotifiedList(notifiedMap);

    const merged: MuralItem[] = [];

    // 1. Core default campaigns / notices
    INITIAL_MURAL_STATIC_ITEMS.forEach(it => {
      merged.push({
        ...it,
        likedByUser: !!likesMap[it.id],
        likes: likesMap[it.id] ? it.likes + 1 : it.likes,
        notified: !!notifiedMap[it.id]
      });
    });

    // 2. Automatic integration with Events: transform EventSchedule list into interactive cards
    events.forEach(ev => {
      const isCulto = ev.categoria.toLowerCase().includes("culto");
      const matchedScales = scales.filter(sc => sc.eventoId === ev.id);
      
      let extraDesc = ev.descricao;
      if (matchedScales.length > 0) {
        const Louvores = matchedScales.filter(s => s.ministério === "Louvor").map(s => s.membroNome).join(", ");
        const Midia = matchedScales.filter(s => s.ministério === "Mídia").map(s => s.membroNome).join(", ");
        const Recepcao = matchedScales.filter(s => s.ministério === "Recepção").map(s => s.membroNome).join(", ");
        
        let scalesTxt = "";
        if (Louvores) scalesTxt += ` 🎸 Louvor: ${Louvores}.`;
        if (Midia) scalesTxt += ` 📽️ Mídia: ${Midia}.`;
        if (Recepcao) scalesTxt += ` 🤝 Recepção: ${Recepcao}.`;
        
        if (scalesTxt) {
          extraDesc += `\n\n📌 Escala Ativa:${scalesTxt}`;
        }
      }

      merged.push({
        id: `ev-int-${ev.id}`,
        type: isCulto ? "culto" : "evento",
        title: ev.nome,
        description: extraDesc,
        date: ev.data,
        time: ev.horario,
        location: ev.local,
        highlight: isCulto, // Cultos get highlight style automated
        likes: (isCulto ? 28 : 14) + (likesMap[`ev-int-${ev.id}`] ? 1 : 0),
        likedByUser: !!likesMap[`ev-int-${ev.id}`],
        notified: !!notifiedMap[`ev-int-${ev.id}`],
        tag: ev.categoria,
        ministry: matchedScales.length > 0 ? matchedScales[0].ministério : "Geral"
      });
    });

    // Read custom user announcements from LocalStorage
    const customAnnouncements = localStorage.getItem("viva-user-announcements");
    if (customAnnouncements) {
      const list: MuralItem[] = JSON.parse(customAnnouncements);
      list.forEach(item => {
        merged.push({
          ...item,
          likedByUser: !!likesMap[item.id],
          likes: likesMap[item.id] ? item.likes + 1 : item.likes,
          notified: !!notifiedMap[item.id]
        });
      });
    }

    // Sort: Featured on top, then by Date descending
    merged.sort((a, b) => {
      if (a.highlight && !b.highlight) return -1;
      if (!a.highlight && b.highlight) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setMuralItems(merged);
  }, [events, scales]);

  // Handle Likes
  const handleToggleLike = (itemId: string) => {
    const isAlreadyLiked = !!likedList[itemId];
    const newLikedMap = { ...likedList, [itemId]: !isAlreadyLiked };
    setLikedList(newLikedMap);
    localStorage.setItem("viva-mural-likes", JSON.stringify(newLikedMap));

    setMuralItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          likedByUser: !isAlreadyLiked,
          likes: isAlreadyLiked ? item.likes - 1 : item.likes + 1
        };
      }
      return item;
    }));
  };

  // Handle Future notification toggle
  const handleToggleNotification = (itemId: string, titleStr: string) => {
    const isNotified = !!notifiedList[itemId];
    const newNotifiedMap = { ...notifiedList, [itemId]: !isNotified };
    setNotifiedList(newNotifiedMap);
    localStorage.setItem("viva-mural-notifications", JSON.stringify(newNotifiedMap));

    setMuralItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, notified: !isNotified };
      }
      return item;
    }));

    // Soft feedback notification UI
    if (!isNotified) {
      const confirmAlert = document.createElement("div");
      confirmAlert.className = "fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1E4D2B] text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg border border-emerald-300/30 animate-bounce flex items-center gap-2";
      confirmAlert.innerHTML = `🔔 Notificação Futura Ativada para: "${titleStr.substring(0,25)}..."`;
      document.body.appendChild(confirmAlert);
      setTimeout(() => confirmAlert.remove(), 3000);
    }
  };

  // Handle Add custom outline
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newItem: MuralItem = {
      id: `custom-m-${Date.now()}`,
      type: newType,
      title: newTitle,
      description: newDesc,
      date: newDate || new Date().toISOString().split("T")[0],
      time: newTime || undefined,
      location: newLoc || undefined,
      highlight: newHighlight,
      likes: 0,
      likedByUser: false,
      notified: false,
      tag: newTag || "Comunidade",
      ministry: newMinistry || "Geral"
    };

    // Save state locally
    const saved = localStorage.getItem("viva-user-announcements");
    const currentList: MuralItem[] = saved ? JSON.parse(saved) : [];
    const updatedList = [newItem, ...currentList];
    localStorage.setItem("viva-user-announcements", JSON.stringify(updatedList));

    // Also trigger if it was formatted like an EventSchedule
    if (onAddEvent && (newType === "culto" || newType === "evento")) {
      onAddEvent({
        id: `ev-gen-${Date.now()}`,
        nome: newTitle,
        data: newDate || new Date().toISOString().split("T")[0],
        horario: newTime || "19:00",
        descricao: newDesc,
        local: newLoc || "Templo Central",
        categoria: newType === "culto" ? "Culto" : "Outro"
      });
    }

    // Refresh state
    setMuralItems(prev => [newItem, ...prev]);

    // Reset fields
    setNewTitle("");
    setNewDesc("");
    setNewLoc("");
    setNewTime("");
    setNewDate("");
    setNewTag("");
    setNewMinistry("");
    setNewHighlight(false);
    setShowAddForm(false);
  };

  const handleClearCustomAnnouncements = () => {
    if (window.confirm("Deseja realmente limpar as postagens personalizadas?")) {
      localStorage.removeItem("viva-user-announcements");
      window.location.reload();
    }
  };

  // Filter and search computation
  const filteredItems = muralItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tag && item.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.ministry && item.ministry.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (filterType === "todos") return matchesSearch;
    return item.type === filterType && matchesSearch;
  });

  // Split into highlight items and regular list
  const highlights = filteredItems.filter(item => item.highlight);
  const regularItems = filteredItems.filter(item => !item.highlight);

  return (
    <div className="space-y-5 sm:space-y-8 max-w-5xl mx-auto px-0 sm:px-4" id="church-billboard-module">
      
      {/* Title Header with elegant, minimalist look */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle, soft emerald accent background blob */}
        <div className="absolute top-[-40%] right-[-10%] w-[35%] h-[80%] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Megaphone size={11} className="text-emerald-700" />
              Mural Principal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Mural de Programações
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Acompanhe campanhas oficiais, ensaios e escalas ministeriais de forma simplificada.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser?.nivel === UserLevel.PASTOR && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#1E4D2B] text-white border border-transparent font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#153a1f] flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus size={13} className="stroke-[3px]" />
                Publicar Aviso
              </button>
            )}

            {currentUser?.nivel === UserLevel.PASTOR && (
              <button
                onClick={handleClearCustomAnnouncements}
                className="border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold px-3 py-2 rounded-xl text-xs flex items-center transition-colors cursor-pointer"
                title="Limpar Postagens Personalizadas"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Announcement Modal/Form */}
      {showAddForm && (
        <form 
          onSubmit={handleCreateAnnouncement}
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-md space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={16} className="text-[#1B7A2D]" />
              Nova Publicação no Mural da Igreja
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Título da Mensagem</label>
              <input
                type="text"
                placeholder="Ex: Ensaio Geral do Louvor"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Tipo de Publicação</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as MuralItem["type"])}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
              >
                <option value="aviso">Aviso Geral</option>
                <option value="culto">Culto Oficial</option>
                <option value="campanha">Membro / Campanha</option>
                <option value="evento">Evento Especial</option>
              </select>
            </div>

            {/* Tag label */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Marcador / Categoria</label>
              <input
                type="text"
                placeholder="Ex: Intercessão, Louvor, Jovens"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Data do Acontecimento</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Horário (Opcional)</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Local / Plataforma</label>
              <input
                type="text"
                placeholder="Ex: Templo Sede, Salas de EBD"
                value={newLoc}
                onChange={e => setNewLoc(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            {/* Ministry automatic integration key */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Ministério Associado</label>
              <select
                value={newMinistry}
                onChange={e => setNewMinistry(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
              >
                <option value="">Nenhum (Geral)</option>
                <option value="Louvor">Louvor & Coral</option>
                <option value="Mídia">Mídia & Transmissão</option>
                <option value="Infantil">Infantil (Ministério da Criança)</option>
                <option value="Recepção">Recepção & Diaconato</option>
                <option value="Jovens">Geração Jovem</option>
              </select>
            </div>

            {/* Switch Highlight */}
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="check-highlight"
                checked={newHighlight}
                onChange={e => setNewHighlight(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="check-highlight" className="text-xs font-bold text-slate-700 cursor-pointer">
                Publicação em Destaque Geral ⭐
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase">Detalhamento e Orientação Pastoral</label>
            <textarea
              placeholder="Descreva as orientações principais, voluntários convocados, passagens bíblicas orientativas..."
              value={newDesc}
              required
              rows={3}
              onChange={e => setNewDesc(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-650 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#2E7D32] text-white font-black px-5 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
            >
              Publicar no Mural
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xxs">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs focus-within:ring-1 focus-within:ring-[#1565C0] rounded-xl border border-slate-200 px-3 py-1.5 bg-slate-50 flex items-center gap-2">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar no mural..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-700 text-xs font-bold focus:ring-0 focus:outline-none p-0.5"
          />
        </div>

        {/* Filter categories tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 hidden lg:inline">
            Filtrar:
          </span>
          
          {[
            { id: "todos", label: "Tudo" },
            { id: "culto", label: "Cultos" },
            { id: "evento", label: "Eventos" },
            { id: "campanha", label: "Campanhas" },
            { id: "aviso", label: "Avisos" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? "bg-[#1E4D2B] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic List */}
      <div className="space-y-6">
        
        {/* SECTION 1: HIGHLIGHTED CARD - DESTAQUE VISUAL */}
        {highlights.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} className="text-emerald-700" />
              Destaque Informativo
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 rounded-2xl p-6 text-white shadow-xs relative overflow-hidden border border-slate-800 font-sans">
              
              {/* Text area (Col span 8) */}
              <div className="lg:col-span-8 space-y-4 relative z-10 flex flex-col justify-between">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 mt-0.5 rounded uppercase tracking-wider">
                      Importante
                    </span>
                    <span className="text-slate-400 text-[10px] whitespace-nowrap">
                      {new Date(highlights[0].date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                    {highlights[0].title}
                  </h3>
                  
                  <p className="text-slate-350 text-xs font-normal leading-relaxed max-w-2xl whitespace-pre-line">
                    {highlights[0].description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  {highlights[0].time && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      <span>{highlights[0].time}</span>
                    </span>
                  )}
                  {highlights[0].location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="truncate max-w-[200px]">{highlights[0].location}</span>
                    </span>
                  )}
                  {highlights[0].tag && (
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-slate-300">
                      #{highlights[0].tag}
                    </span>
                  )}
                  {highlights[0].ministry && (
                    <span className="text-emerald-400">
                      • {highlights[0].ministry}
                    </span>
                  )}
                </div>

                {/* Like and Bell Toggle layout in Highlights */}
                <div className="flex items-center gap-2 pt-1">
                  {/* Botão Curtir */}
                  <button
                    onClick={() => handleToggleLike(highlights[0].id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      highlights[0].likedByUser
                        ? "bg-rose-500/20 text-rose-350 border border-rose-500/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-705 border border-slate-700/60"
                    }`}
                  >
                    <Heart size={13} className={highlights[0].likedByUser ? "fill-rose-350" : ""} />
                    <span>{highlights[0].likes}</span>
                  </button>

                  {/* Lembrete Futuro */}
                  <button
                    onClick={() => handleToggleNotification(highlights[0].id, highlights[0].title)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      highlights[0].notified
                        ? "bg-emerald-500/20 text-emerald-355 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-705 border border-slate-700/60"
                    }`}
                    title="Ativar alerta futuro"
                  >
                    {highlights[0].notified ? <CheckCircle size={13} /> : <Bell size={13} />}
                    <span>{highlights[0].notified ? "Lembrete Ativado" : "Lembrar-me"}</span>
                  </button>
                </div>

              </div>

              {/* Decorative Image panel (Col span 4) */}
              <div className="lg:col-span-4 hidden lg:block relative rounded-xl overflow-hidden h-full min-h-[160px] border border-slate-800">
                <img
                  src={highlights[0].image || "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=500&auto=format&fit=crop&q=80"}
                  alt={highlights[0].title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>

            </div>
          </div>
        )}

        {/* SECTION 2: OTHER CARDS LIST - EVENTOS, AVISOS, CULTOS, CAMPANHAS */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {filterType === "todos" ? "Todas as Comunicações & Escalas" : `Filtrados por "${filterType.toUpperCase()}"`}
          </h2>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-150 p-12 text-center text-slate-450 space-y-2">
              <Megaphone size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Nenhuma postagem correspondente ao filtro foi encontrada.</p>
              <p className="text-[11px] text-slate-400">Tente buscar por termos como "Louvor", "Culto" ou mude o filtro.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => {
                // Design parameters based on notification type
                const isCulto = item.type === "culto";
                const isCampanha = item.type === "campanha";
                const isEvento = item.type === "evento";
                
                let typeColor = "bg-blue-50 text-[#1565C0] border-blue-105";
                let typeLabel = "Aviso";
                
                if (isCulto) {
                  typeColor = "bg-emerald-50 text-[#2E7D32] border-emerald-105";
                  typeLabel = "Culto";
                } else if (isCampanha) {
                  typeColor = "bg-amber-50 text-amber-800 border-amber-105";
                  typeLabel = "Campanha";
                } else if (isEvento) {
                  typeColor = "bg-purple-50 text-purple-800 border-purple-105";
                  typeLabel = "Evento";
                }

                return (
                  <div 
                    key={item.id}
                    className="bg-white border border-slate-200/75 rounded-xl p-4.5 hover:border-slate-350 transition-colors flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-2">
                      {/* Top Header Card Metadata */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`${typeColor} font-bold text-[8.5px] px-1.5 py-0.5 rounded uppercase border tracking-wider`}>
                            {typeLabel}
                          </span>
                          
                          {item.ministry && (
                            <span className="text-slate-400 text-[9.5px] font-semibold">
                              {item.ministry}
                            </span>
                          )}
                        </div>

                        <span className="text-[9.5px] font-bold text-slate-400 font-mono">
                          {new Date(item.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                        </span>
                      </div>

                      {/* Title & Body */}
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-slate-900 tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3 whitespace-pre-line">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Meta specifics of scheduler */}
                    {(item.time || item.location || item.tag) && (
                      <div className="bg-slate-50/75 rounded-xl p-2.5 text-[10px] space-y-1 border border-slate-100">
                        {item.time && (
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Clock size={11} className="text-[#1565C0] shrink-0" />
                            <span>Horário: <strong>{item.time}</strong></span>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <MapPin size={11} className="text-[#2E7D32] shrink-0" />
                            <span className="truncate">Local: <strong>{item.location}</strong></span>
                          </div>
                        )}
                        {item.tag && (
                          <div className="text-[9px] font-black text-slate-400">
                            #{item.tag}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Actions: Copiar/Compartilhar, Curtir, Notificação de agenda */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      
                      {/* Left: Like & Reminder */}
                      <div className="flex items-center gap-1.5">
                        
                        {/* Botão Curtir */}
                        <button
                          onClick={() => handleToggleLike(item.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-colors cursor-pointer ${
                            item.likedByUser 
                              ? "bg-red-50 text-red-600 ring-1 ring-red-200" 
                              : "text-slate-500 hover:text-red-500 hover:bg-slate-50"
                          }`}
                        >
                          <Heart size={12} className={item.likedByUser ? "fill-red-650 text-red-650" : ""} />
                          <span>{item.likes}</span>
                        </button>

                        {/* Lembrar-me */}
                        <button
                          onClick={() => handleToggleNotification(item.id, item.title)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-colors cursor-pointer ${
                            item.notified
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                              : "text-slate-500 hover:text-amber-600 hover:bg-slate-50"
                          }`}
                          title={item.notified ? "Lembrete ativo" : "Ativar lembrete futuro"}
                        >
                          {item.notified ? <BellOff size={12} className="text-amber-500 shrink-0" /> : <Bell size={12} className="shrink-0" />}
                          <span>{item.notified ? "Alerta Ativo" : "Lembrar"}</span>
                        </button>

                      </div>

                      {/* Right: Quick Share text link */}
                      <button
                        onClick={() => {
                          const txt = `📢 *MURAL IGREJA VIVA* \n\n*${item.title}*\n${item.description}\n\n_Data:_ ${item.date}${item.time ? ` às ${item.time}` : ""}${item.location ? `\n_Local:_ ${item.location}` : ""}`;
                          navigator.clipboard.writeText(txt);
                          
                          const copiedAlert = document.createElement("div");
                          copiedAlert.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-850 text-white font-bold text-xs px-3 py-2 rounded-lg z-50 shadow-md";
                          copiedAlert.innerText = "Copiado para área de transferência!";
                          document.body.appendChild(copiedAlert);
                          setTimeout(() => copiedAlert.remove(), 2500);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Copiar texto formatado"
                      >
                        <Share2 size={13} />
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
