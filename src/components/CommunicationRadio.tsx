import React, { useState, useRef, useEffect } from "react";
import { Devotional, RadioTrack, Member, Visitor } from "../types";
import { STATIC_RADIO_TRACKS, STATIC_DEVOTIONALS } from "../data";
import { 
  Headphones, Radio, Play, Pause, SkipForward, SkipBack, Sparkles, 
  MessageCircle, Volume2, BookOpen, Clock, Youtube, RadioTower, CheckCircle,
  Send, Users, Smartphone, History, Loader2, RefreshCw, SendHorizontal
} from "lucide-react";

interface CommunicationRadioProps {
  onAskVivaIAPrompt: (prompt: string) => void;
  members?: Member[];
  visitors?: Visitor[];
}

export default function CommunicationRadio({ onAskVivaIAPrompt, members, visitors }: CommunicationRadioProps) {
  // Devotional states
  const [devocionais, setDevocionais] = useState<Devotional[]>(STATIC_DEVOTIONALS);
  const [selectedTema, setSelectedTema] = useState("Generosidade");
  const [isLoadingDevotional, setIsLoadingDevotional] = useState(false);
  const [activeDevIndex, setActiveDevIndex] = useState(0);

  // Radio Audio States
  const [tracks, setTracks] = useState<RadioTrack[]>(STATIC_RADIO_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(25); // Simulated or active progress

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeTrack = tracks[currentTrackIndex];

  // Daily AI broadcast states
  const [dailyDispatches, setDailyDispatches] = useState<any[]>([]);
  const [selectedDispatchTheme, setSelectedDispatchTheme] = useState("Esperança");
  const [deliveryChannels, setDeliveryChannels] = useState<string[]>(["WhatsApp", "SMS"]);
  const [autoSendActive, setAutoSendActive] = useState(true);
  const [autoSendTime, setAutoSendTime] = useState("06:00");
  const [sendingStep, setSendingStep] = useState(0); // 0=idle, 1=analyzing, 2=generating, 3=sending, 4=done
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingCurrentRecipient, setSendingCurrentRecipient] = useState("");
  const [simulatedConsole, setSimulatedConsole] = useState<string[]>([]);
  const [showDispatchSuccessAlert, setShowDispatchSuccessAlert] = useState(false);

  // Helper retrieval for robust data loading
  const getMembersList = (): Member[] => {
    if (members && members.length > 0) return members;
    try {
      const saved = localStorage.getItem("iv_members");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const getVisitorsList = (): Visitor[] => {
    if (visitors && visitors.length > 0) return visitors;
    try {
      const saved = localStorage.getItem("iv_visitors");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Load past campaigns from localStorage on mount & check automated send
  useEffect(() => {
    try {
      const saved = localStorage.getItem("viva-daily-dispatches");
      let dList = saved ? JSON.parse(saved) : [];
      
      const todayStr = new Date().toISOString().split("T")[0];
      const hasSentToday = dList.some((d: any) => d.dateOnly === todayStr);

      // Automated morning trigger simulation
      if (!hasSentToday && autoSendActive) {
        // Create an automatic early morning send entry
        const autoDevId = "dev-gen-auto-" + Date.now();
        const autoDev: Devotional = {
          id: autoDevId,
          titulo: "Esperança: Renovo Diário nas Promessas",
          referenciaBiblica: "Lamentações 3:22-23",
          textoReferencia: "As misericórdias do Senhor são a causa de não sermos consumidos.",
          reflexao: "O Senhor derrama diariamente por IA o consolo aos nossos corações. Cada manhã se renovam os Seus divinos favores! Caminhe com a cabeça erguida, ciente de que Ele guia o seu ministério e as ovelhas do Seu redil.",
          oracao: "Senhor Deus, abençoa nossa igreja viva. Guia cada membro e visitante que recebeu este alimento espiritual hoje.",
          desafioPratico: "Envie uma mensagem de paz para alguém hoje.",
          autor: "Viva IA Devocional Autônoma",
          data: "Gerado Hoje"
        };

        const totalRecipients = getMembersList().length + getVisitorsList().length || 32;
        const autoDispatch = {
          id: "disp-auto-" + Date.now(),
          theme: "Esperança",
          dateOnly: todayStr,
          sentAt: `${new Date().toLocaleDateString("pt-BR")} às 06:00 BRT (Automático via IA)`,
          recipientCount: totalRecipients,
          channels: ["WhatsApp", "SMS"],
          title: "Esperança: Renovo Diário nas Promessas",
          devotional: autoDev,
          isAutomated: true
        };

        const updatedList = [autoDispatch, ...dList];
        localStorage.setItem("viva-daily-dispatches", JSON.stringify(updatedList));
        dList = updatedList;

        // Optionally prepend this automatic devotional to state list
        setDevocionais(prev => [autoDev, ...prev]);
      }

      setDailyDispatches(dList);
    } catch (err) {
      console.error("Erro ao carregar ou disparar campanhas diárias:", err);
    }
  }, []);

  // Trigger interactive daily AI dispatch simulation
  const handleLaunchDailyDispatch = async () => {
    if (sendingStep > 0) return;
    
    setSendingStep(1);
    setSendingProgress(5);
    setSimulatedConsole(["🔍 [CONEXÃO] Iniciando conexão segura com a Viva IA Pastoral..."]);
    
    const activeMembers = getMembersList();
    const activeVisitors = getVisitorsList();
    const combinedRecipients = [...activeMembers, ...activeVisitors];
    const totalCount = combinedRecipients.length || 15; // fallback count if lists are completely empty
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSendingProgress(15);
    setSendingStep(2);
    setSimulatedConsole(prev => [
      ...prev,
      "⚙️ [ANALISAR] Analisando o engajamento espiritual coletivo da igreja...",
      `📊 [MÉTRICA] Localizados: ${activeMembers.length} membros e ${activeVisitors.length} visitantes ativos.`,
      `🧠 [IA - GEMINI] Solicitando reflexão diária personalizada tema: "${selectedDispatchTheme}"...`
    ]);

    let generatedDevText = "";
    let fetchedTitle = `${selectedDispatchTheme}: O Caminho do Coração`;
    
    try {
      const response = await fetch("/api/gemini/devocional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: selectedDispatchTheme }),
      });

      if (response.ok) {
        const resData = await response.json();
        generatedDevText = resData.text || "";
        
        // Extract title if possible
        const firstLine = generatedDevText.split("\n")[0];
        if (firstLine && firstLine.includes("#")) {
          fetchedTitle = firstLine.replace(/[#*]/g, "").trim();
        }
      } else {
        throw new Error();
      }
    } catch {
      // Graceful local custom building
      generatedDevText = `### ${selectedDispatchTheme}: Caminhando na Direção do Alto

> **Salmos 119:105**  
"Lâmpada para os meus pés é tua palavra e luz, para o meu caminho."

O tema cristão da ${selectedDispatchTheme} nos ajuda a enxergar além das circunstâncias visíveis. Quando alimentamos o coração diariamente na Palavra, nosso ministério e comunhão se fortalecem mútuamente.

**Oração:** "Querido Jesus, guia nossos pensamentos de amor e nos una no mesmo espírito de cooperação."
**Desafio do Dia:** Faça uma ligação hoje para uma pessoa ausente do seu pequeno grupo.`;
    }

    const compiledDev: Devotional = {
      id: "dev-gen-disp-" + Date.now(),
      titulo: fetchedTitle,
      referenciaBiblica: "Escrituras Sagradas",
      textoReferencia: `Foco Diário: ${selectedDispatchTheme}`,
      reflexao: generatedDevText,
      oracao: "Querido Espírito Santo, nos fortalece no caminho da fé.",
      desafioPratico: `Vivenciar a virtude de ${selectedDispatchTheme} de forma concreta hoje.`,
      autor: "Viva IA Pastoral Broadcast",
      data: "Gerado Hoje"
    };

    setSendingProgress(40);
    setSendingStep(3);
    setSimulatedConsole(prev => [
      ...prev,
      "✨ [GERADO] Devocional cristão estruturado com sucesso pela assessoria teológica!",
      `💬 [TÍTULO] "${fetchedTitle}"`,
      `🚀 [DISPARO] Iniciando transmissão em massa pelos canais selecionados: ${deliveryChannels.join(" + ")}...`
    ]);

    // Let's do a fast animated interval to simulate sending progress for a subset of members/visitors
    const displayList = combinedRecipients.length > 0 
      ? combinedRecipients.slice(0, 5) 
      : [
          { nome: "Pastor Eric L. P.", telefone: "(11) 98888-7777" },
          { nome: "Amanda Santos (Líder Infantil)", telefone: "(11) 97777-6666" },
          { nome: "Clara Guedes (Visitante)", telefone: "(21) 96666-5555" }
        ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < displayList.length) {
        const item = displayList[currentIdx];
        setSendingCurrentRecipient(item.nome);
        
        setSimulatedConsole(prev => [
          ...prev,
          `✅ [ENVIADO] Canal ${deliveryChannels[0] || "WhatsApp"}: Sucesso p/ ${item.nome} (${item.telefone || "Contato Digital"})`
        ]);
        
        setSendingProgress(prev => Math.min(prev + Math.floor(55 / displayList.length), 95));
        currentIdx++;
      } else {
        clearInterval(interval);
        
        // Finalize Campaign
        setSendingProgress(100);
        setSendingStep(4);
        setSendingCurrentRecipient("");
        
        const todayStr = new Date().toISOString().split("T")[0];
        const newDispatch = {
          id: "disp-user-" + Date.now(),
          theme: selectedDispatchTheme,
          dateOnly: todayStr,
          sentAt: `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} (Manual via IA)`,
          recipientCount: totalCount,
          channels: deliveryChannels,
          title: fetchedTitle,
          devotional: compiledDev,
          isAutomated: false
        };

        const updatedDispatches = [newDispatch, ...dailyDispatches];
        localStorage.setItem("viva-daily-dispatches", JSON.stringify(updatedDispatches));
        setDailyDispatches(updatedDispatches);

        // Prepend generated devotional so it can be selected in the main reader
        setDevocionais(prev => [compiledDev, ...prev]);
        setActiveDevIndex(0);

        setShowDispatchSuccessAlert(true);
        setTimeout(() => {
          setShowDispatchSuccessAlert(false);
        }, 6000);
      }
    }, 600);
  };

  // Configure HTML Audio Player
  useEffect(() => {
    if (activeTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(activeTrack.url);
      audioRef.current.volume = 0.5;

      // Handle audio events
      const updateProgress = () => {
        if (audioRef.current) {
          const current = audioRef.current.currentTime;
          const total = audioRef.current.duration || 1;
          setAudioProgress((current / total) * 100);
        }
      };

      const handleAudioEnded = () => {
        handleSkip(1);
      };

      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("ended", handleAudioEnded);

      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("timeupdate", updateProgress);
          audioRef.current.removeEventListener("ended", handleAudioEnded);
          audioRef.current.pause();
        }
      };
    }
  }, [currentTrackIndex]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          alert("O streaming de áudio não pôde iniciar. O endereço do arquivo pode estar bloqueado por restrições CORS ou requisições de rede externas temporárias.");
        });
    }
  };

  const handleSkip = (direction: number) => {
    let nextIndex = currentTrackIndex + direction;
    if (nextIndex >= tracks.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = tracks.length - 1;
    setCurrentTrackIndex(nextIndex);
  };

  // Trigger Gemini dynamic devotion builder
  const handleGenerateDevotionalWithIA = async () => {
    setIsLoadingDevotional(true);
    try {
      const response = await fetch("/api/gemini/devocional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: selectedTema }),
      });

      if (!response.ok) throw new Error("Falha na chamada do servidor.");
      const data = await response.json();

      // Structure parsed result into a custom devotional
      const newDev: Devotional = {
        id: "dev-gen-" + Date.now(),
        titulo: `${selectedTema}: Nova Edificação`,
        referenciaBiblica: "Escrituras Sagradas",
        textoReferencia: `Inspirado no tema ${selectedTema}`,
        reflexao: data.text || "Sem reflexão retornada.",
        oracao: "Querido Pai, guia nossos passos conforme Teu design santo de amor.",
        desafioPratico: "Pratique um ato voluntário hoje.",
        autor: "Viva IA Pastoral Assistant",
        data: "Gerado Hoje"
      };

      // Set and select new devotional
      setDevocionais((prev) => [newDev, ...prev]);
      setActiveDevIndex(0);
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar ao servidor para gerar devocional.");
    } finally {
      setIsLoadingDevotional(false);
    }
  };

  const currentDev = devocionais[activeDevIndex] || STATIC_DEVOTIONALS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Devocional Reader section (Left 2/3) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="text-[#2E7D32]" size={18} />
              Alimento Diário & Devocionais
            </h3>
            <p className="text-[11px] text-slate-500">Desenvolva sua comunhão e fé através da palavra diária</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedTema}
              onChange={(e) => setSelectedTema(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="Fé">Fé</option>
              <option value="Amor">Amor</option>
              <option value="Esperança">Esperança</option>
              <option value="Generosidade">Generosidade</option>
            </select>
            <button
              onClick={handleGenerateDevotionalWithIA}
              disabled={isLoadingDevotional}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold rounded-lg text-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={11} /> {isLoadingDevotional ? "Gerando..." : "Gerar Devocional IA"}
            </button>
          </div>
        </div>

        {/* Display Active Devotional */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
            <span>AUTOR: {currentDev.autor}</span>
            <span>PUBLICADO EM: {currentDev.data}</span>
          </div>

          {/* Devotional content text */}
          <div className="space-y-4">
            <h4 className="text-lg font-black text-[#2E7D32] tracking-tight">{currentDev.titulo}</h4>
            
            {/* If it was generated, it might be raw markdown, display block */}
            {currentDev.id.startsWith("dev-gen-") ? (
              <div className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 border border-slate-200 rounded-2xl whitespace-pre-line prose max-w-none">
                {currentDev.reflexao}
              </div>
            ) : (
              /* If static pre-composed, render structured elements */
              <div className="space-y-4">
                <blockquote className="border-l-4 border-[#1565C0] pl-3.5 italic text-slate-800 text-xs py-1.5 bg-blue-50/50 rounded-r-xl">
                  <strong>{currentDev.referenciaBiblica}</strong> — {currentDev.textoReferencia}
                </blockquote>
                
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  {currentDev.reflexao}
                </p>

                <div className="p-4 bg-emerald-50 text-slate-800 rounded-2xl border border-emerald-100 text-xs">
                  <span className="font-extrabold text-[#2E7D32] block mb-1">Oração Recomendada:</span>
                  <p className="font-medium italic">"{currentDev.oracao}"</p>
                </div>

                <div className="p-4 bg-amber-50 text-slate-800 rounded-2xl border border-amber-100 text-xs">
                  <span className="font-extrabold text-amber-800 block mb-1">Prática de Exercício da Fé:</span>
                  <p className="font-bold">{currentDev.desafioPratico}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List of other devocionais if exists */}
        {devocionais.length > 1 && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Devocionais Disponíveis:</span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {devocionais.map((d, index) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDevIndex(index)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                    activeDevIndex === index
                      ? "bg-[#2E7D32] text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {d.titulo.split(":")[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PANEL: Central de Envio Diário via IA */}
        <div id="central-envio-ia" className="mt-6 pt-5 border-t border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
                <SendHorizontal size={16} className="animate-pulse" />
              </div>
              <div>
                <h4 id="devocional-card-header" className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 flex-wrap">
                  Disparo Diário de Devocionais por IA
                  <span className="text-[8px] bg-emerald-850 bg-emerald-700 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Automotivo & Ativo 🤖</span>
                </h4>
                <p className="text-[10.5px] text-slate-500 font-semibold leading-none mt-0.5">Alimentando diariamente membros e visitantes ativos da Igreja Viva</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs self-start sm:self-center">
              <span className="font-bold text-slate-400">Automatizado:</span>
              <button
                type="button"
                onClick={() => setAutoSendActive(!autoSendActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoSendActive ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    autoSendActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick stats & parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Stats */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
              <Users size={16} className="text-slate-600" />
              <div>
                <span className="block text-[9px] uppercase font-black text-slate-400">Público Alvo</span>
                <span className="text-xs font-extrabold text-[#2E7D32]">
                  {getMembersList().length + getVisitorsList().length} Pessoas no Rebanho
                </span>
                <span className="block text-[8px] text-slate-500 font-semibold italic">
                  ({getMembersList().length} membros + {getVisitorsList().length} visitantes)
                </span>
              </div>
            </div>

            {/* Config: canais */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone size={14} className="text-slate-600" />
                <span className="text-[9px] uppercase font-black text-slate-400">Canais de Entrega</span>
              </div>
              <div className="flex gap-2">
                {["WhatsApp", "SMS"].map(c => {
                  const has = deliveryChannels.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        if (has) {
                          setDeliveryChannels(deliveryChannels.filter(x => x !== c));
                        } else {
                          setDeliveryChannels([...deliveryChannels, c]);
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-all cursor-pointer ${
                        has ? "bg-indigo-50 text-indigo-800 border border-indigo-200" : "bg-slate-200/60 text-slate-500 border border-transparent"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Config: Tema & Agendamento */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock size={13} className="text-slate-600" />
                  <span className="text-[9px] uppercase font-black text-slate-400">Hora do Envio</span>
                </div>
                <input
                  type="time"
                  value={autoSendTime}
                  onChange={(e) => setAutoSendTime(e.target.value)}
                  className="bg-transparent border-0 p-0 text-xs font-black text-[#2E7D32] focus:ring-0 w-16"
                />
              </div>

              {/* Theme select for next manual trigger */}
              <select
                value={selectedDispatchTheme}
                onChange={(e) => setSelectedDispatchTheme(e.target.value)}
                className="px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
              >
                <option value="Fé">Fé</option>
                <option value="Amor">Amor</option>
                <option value="Esperança">Esperança</option>
                <option value="Generosidade">Generosidade</option>
                <option value="Perdão">Perdão</option>
                <option value="Restauração">Restauração</option>
              </select>
            </div>
          </div>

          {/* Interactive Trigger & Progress Simulation */}
          <div className="space-y-3">
            {sendingStep === 0 ? (
              <button
                type="button"
                onClick={handleLaunchDailyDispatch}
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-xl text-xs font-black transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-99"
              >
                <Sparkles size={14} className="animate-spin text-amber-305 text-amber-300" style={{ animationDuration: '4s' }} />
                Disparar Transmissão Diária por IA Agora (Integrar Rebanho)
              </button>
            ) : (
              <div className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl space-y-3 relative overflow-hidden font-mono text-[11px]">
                {/* Visual send waves */}
                <span className="absolute top-2 right-3 text-[9px] text-[#2E7D32] uppercase tracking-widest font-black flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Transmitindo por IA
                </span>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      {sendingStep === 1 && <Loader2 className="animate-spin text-emerald-500" size={13} />}
                      {sendingStep === 2 && <RefreshCw className="animate-spin text-blue-500" size={13} />}
                      {sendingStep === 3 && <RadioTower className="animate-pulse text-indigo-500" size={13} />}
                      {sendingStep === 4 && <CheckCircle className="text-emerald-500" size={13} />}

                      {sendingStep === 1 && "Fase 1: Diagnosticando Clima Espiritual"}
                      {sendingStep === 2 && "Fase 2: Elaborando Devocional com Gemini 3.5... "}
                      {sendingStep === 3 && `Fase 3: Transmissão em Lote para Contatos`}
                      {sendingStep === 4 && "Fase 4: Envio Concluído com Sucesso!"}
                    </span>
                    <span className="font-black text-emerald-500">{sendingProgress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-600 to-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${sendingProgress}%` }}
                    />
                  </div>
                </div>

                {sendingCurrentRecipient && (
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400 animate-pulse flex items-center gap-2">
                    <Smartphone size={12} />
                    <span>Enviando para: <span className="text-white font-extrabold">{sendingCurrentRecipient}</span>...</span>
                  </div>
                )}

                {/* Simulated live console logs */}
                <div className="space-y-1 max-h-[105px] overflow-y-auto bg-slate-150 bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-350">
                  {simulatedConsole.map((log, index) => (
                    <div key={index} className="leading-tight select-none">
                      {log}
                    </div>
                  ))}
                </div>

                {sendingStep === 4 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSendingStep(0);
                      setSimulatedConsole([]);
                    }}
                    className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-black transition-colors"
                  >
                    Fechar Terminal de Log
                  </button>
                )}
              </div>
            )}

            {showDispatchSuccessAlert && (
              <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 text-xs font-bold leading-relaxed flex items-center gap-2.5 animate-bounce">
                <CheckCircle size={16} className="text-[#2E7D32] shrink-0" />
                <div>
                  Devocional Diário por IA disparado com sucesso! {getMembersList().length + getVisitorsList().length} contatos receberam a mensagem.
                  Ganhamos mais um dia de comunhão ativa.
                </div>
              </div>
            )}
          </div>

          {/* Table: Histórico de disparos diários */}
          {dailyDispatches.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5 select-none">
                <History size={12} />
                Histórico de Campanhas Diárias de Devocionais por IA
              </span>
              <div className="max-h-[185px] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-150 bg-white shadow-3xs">
                {dailyDispatches.map((dispatch) => (
                  <div key={dispatch.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase border ${
                          dispatch.isAutomated 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/25"
                        }`}>
                          {dispatch.isAutomated ? "Automático 06:00" : "Manual via IA"}
                        </span>
                        <span className="font-bold text-slate-600">Tema: {dispatch.theme}</span>
                        <span className="text-[9.5px] font-mono text-slate-400">{dispatch.sentAt}</span>
                      </div>
                      <h5 className="font-extrabold text-[#2E7D32] leading-snug truncate">{dispatch.title}</h5>
                      <div className="flex flex-wrap gap-2 text-[10px] items-center">
                        {dispatch.channels.map((chan: string) => (
                          <span key={chan} className="text-[8px] bg-indigo-50 border border-indigo-150 text-[#1565C0] px-1 rounded-sm font-bold">
                            {chan}
                          </span>
                        ))}
                        <span className="text-slate-450 font-semibold font-bold">
                          📱 {dispatch.recipientCount} pessoas alcançadas
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        // Prepend custom devotional if not found, and set active
                        const devIndex = devocionais.findIndex((dv) => dv.id === dispatch.devotional.id);
                        if (devIndex !== -1) {
                          setActiveDevIndex(devIndex);
                        } else {
                          setDevocionais((prev) => [dispatch.devotional, ...prev]);
                          setActiveDevIndex(0);
                        }
                        // Scroll to the devotional block
                        const element = document.getElementById("devocional-card-header");
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 rounded-lg shrink-0 transition-colors cursor-pointer"
                    >
                      Ler Texto
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Online Radio Player & Youtube Lives list (Right 1/3) */}
      <div className="space-y-6">
        
        {/* Component: Player Rádio Igreja Viva */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white p-5 rounded-3xl border border-slate-750 shadow-md flex flex-col justify-between h-80 relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 blur-xl w-32 h-32 bg-[#2E7D32] rounded-full" />
          
          <div className="flex justify-between items-center">
            <span className="bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
              <RadioTower size={10} className="animate-pulse" /> Rádio On-line
            </span>
            <Volume2 className="text-slate-400" size={16} />
          </div>

          <div className="text-center space-y-1.5">
            <span className="text-[#2E7D32] text-[10px] uppercase font-black tracking-widest block">A RÁDIO DO REINO</span>
            <h4 className="text-base font-black truncate max-w-[200px] mx-auto">{activeTrack.titulo}</h4>
            <p className="text-[11px] text-slate-400 block truncate">{activeTrack.autor}</p>

            {/* EQ Animated Soundwaves (Only active if playing) */}
            <div className="h-6 flex items-center justify-center gap-1.5 pt-3">
              {[1, 2, 3, 4, 5, 6].map((bar) => (
                <span
                  key={bar}
                  className="w-1 bg-[#2E7D32] rounded-full"
                  style={{
                    height: isPlaying ? `${Math.floor(Math.random() * 20) + 4}px` : "4px",
                    transition: "height 0.2s ease-in-out",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress bar controller */}
          <div className="space-y-1 mt-3">
            <div className="w-full h-1 bg-slate-750 rounded-full overflow-hidden">
              <div className="h-full bg-[#2E7D32]" style={{ width: `${audioProgress}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase">
              <span>Ao Vivo</span>
              <span>Duração: {activeTrack.duracao}</span>
            </div>
          </div>

          {/* Control Triggers */}
          <div className="flex justify-center items-center gap-4 mt-2">
            <button
              onClick={() => handleSkip(-1)}
              className="p-2 bg-slate-800 text-white hover:bg-slate-750 rounded-full cursor-pointer hover:text-emerald-500 transition-colors"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={handleTogglePlay}
              className="p-4 bg-[#2E7D32] text-white hover:bg-[#1b5e20] rounded-full cursor-pointer transform hover:scale-105 active:scale-95 transition-all text-lg shadow-lg"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={() => handleSkip(1)}
              className="p-2 bg-slate-800 text-white hover:bg-slate-750 rounded-full cursor-pointer hover:text-emerald-500 transition-colors"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>

        {/* Preachings list selector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Acervo de Pregações & Estudos</span>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {tracks.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => setCurrentTrackIndex(idx)}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                  idx === currentTrackIndex
                    ? "bg-slate-50 border-emerald-500 font-bold"
                    : "bg-white hover:bg-slate-50 border-slate-100"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="block font-bold text-slate-900 truncate">{t.titulo}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{t.autor}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400 font-bold">
                  <Clock size={11} /> {t.duracao}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lives / YouTube block placeholder (YouTube API simulated) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Transmissões ao Vivo & Cultos</span>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noreferrer"
            className="p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl flex items-center gap-3 transition-colors text-xs text-red-900 font-bold"
          >
            <Youtube size={24} className="text-red-600" />
            <div>
              <span className="block leading-tight">Assista no YouTube Live</span>
              <span className="text-[10px] font-medium text-red-700 block">Transmissão Sede aos Domingos, 19h</span>
            </div>
          </a>
        </div>

      </div>
    </div>
  );
}
