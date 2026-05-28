import React, { useState, useRef, useEffect } from "react";
import { Devotional, RadioTrack } from "../types";
import { STATIC_RADIO_TRACKS, STATIC_DEVOTIONALS } from "../data";
import { Headphones, Radio, Play, Pause, SkipForward, SkipBack, Sparkles, MessageCircle, Volume2, BookOpen, Clock, Youtube, RadioTower, CheckCircle } from "lucide-react";

interface CommunicationRadioProps {
  onAskVivaIAPrompt: (prompt: string) => void;
}

export default function CommunicationRadio({ onAskVivaIAPrompt }: CommunicationRadioProps) {
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
