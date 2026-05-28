import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquareCode, ArrowBigUpDash, Bot, User, Trash2, Send, HelpCircle, FileText, Presentation } from "lucide-react";
import { jsPDF } from "jspdf";
import pptxgen from "pptxgenjs";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface VivaIAChatProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export default function VivaIAChat({ initialPrompt, onClearInitialPrompt }: VivaIAChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "viva-init",
      role: "assistant",
      text: `Olá, amado pastor e companheiro de ministério! Eu sou a **Viva IA**, sua conselheira pastoral e assistente inteligente. 🕊️\n\nEstou aqui com alegria para caminhar com você: auxiliando no preparo de esboços bíblicos profundos, sugerindo mensagens carinhosas de acolhimento para visitantes, recomendando estudos de Pequenos Grupos e ajudando a zelar pelo rebanho com simplicidade e sabedoria.\n\n**Como podemos abençoar seu ministério hoje?** Toque em um dos caminhos abaixo ou compartilhe o que está em seu coração!`
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Quick prompt shortcuts list - humanized and non-corporate
  const suggestedPrompts = [
    { label: "📖 Esboço de Sermão", text: "Me ajude com 3 ideias de temas para sermões edificantes baseados no livro de Filipenses, contendo passagens de apoio e títulos cheios de esperança." },
    { label: "🌱 Estudo para Pequenos Grupos", text: "Gere um roteiro acolhedor de estudo semanal para Pequenos Grupos contendo quebra-gelo, leitura bíblica, reflexão prática e perguntas de partilha mútua." },
    { label: "❤️ Acolher Visitante Recente", text: "Escreva uma mensagem de WhatsApp amigável para enviar a um visitante recente, dizendo o quanto ficamos felizes em tê-lo conosco no domingo, sem formalismo." },
    { label: "🕊️ Organização Sem Sobrecarga", text: "Que práticas humanizadas e pastorais um líder de pequena igreja em crescimento pode usar para cuidar das escalas de voluntários sem desgastar os obreiros?" }
  ];

  // Auto handle triggers from outer dashboard click actions
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    // Smooth scrolling down when messages update
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAsking]);

  const downloadAsPDF = (text: string) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Clean up text
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold brackets
        .replace(/### (.*)/g, "\n=== $1 ===\n")
        .replace(/## (.*)/g, "\n[ $1 ]\n")
        .replace(/# (.*)/g, "\n\nHOMILIA: $1\n")
        .replace(/\* /g, " • ")
        .replace(/- /g, " • ");

      // Setup page styling
      doc.setFillColor(46, 125, 50); // Emerald color #2E7D32
      doc.rect(0, 0, 210, 25, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("IGREJA VIVA - TECNOLOGIA MINISTERIAL", 15, 11);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Viva IA Teologica - Relatorio de Planejamento Pastoral", 15, 17);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 145, 17);

      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFontSize(10.5);
      
      const splitText = doc.splitTextToSize(cleanText, 180);
      let yPos = 38;
      
      splitText.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 15, yPos);
        yPos += 6;
      });

      doc.save("Viva_IA_Planejamento_Pastoral.pdf");
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      // Fallback to simple txt download
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Viva_IA_Planejamento.txt";
      a.click();
    }
  };

  const downloadAsPowerPointOutline = (text: string) => {
    try {
      const lines = text.split("\n");
      interface SlideSection {
        title: string;
        items: string[];
      }
      const slidesList: SlideSection[] = [];
      let currentSlide: SlideSection | null = null;
      let mainTitle = "Planejamento Pastoral & Homilia";
      let mainSubtitle = "Gerado pela Viva IA Pastoral";

      // Parse AI output lines to construct a real slide structure
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
          const headerText = trimmed
            .replace(/^[#\s]+/, "")
            .replace(/\*\*/g, "")
            .trim();
          
          if (trimmed.startsWith("# ") && mainTitle === "Planejamento Pastoral & Homilia") {
            mainTitle = headerText;
          }

          currentSlide = {
            title: headerText,
            items: [],
          };
          slidesList.push(currentSlide);
        } else {
          // Clean bullet prefixes
          const cleanLine = trimmed
            .replace(/^[\s*\-•\d\.]+\s+/, "")
            .replace(/\*\*/g, "")
            .trim();

          if (cleanLine.length > 2) {
            if (currentSlide) {
              if (currentSlide.items.length < 6) {
                currentSlide.items.push(cleanLine);
              }
            } else {
              if (
                cleanLine.length < 120 &&
                !mainSubtitle.includes(cleanLine) &&
                mainSubtitle === "Gerado pela Viva IA Pastoral"
              ) {
                mainSubtitle = cleanLine;
              }
            }
          }
        }
      });

      // Simple safety fallback for plain responses without markdown headings
      if (slidesList.length === 0) {
        let contentItems: string[] = [];
        lines.forEach((line) => {
          const trimmed = line.trim().replace(/^[\s*\-•\d\.]+\s+/, "").replace(/\*\*/g, "");
          if (trimmed.length > 5 && !trimmed.startsWith("===") && !trimmed.startsWith("[")) {
            contentItems.push(trimmed);
          }
        });

        for (let i = 0; i < contentItems.length; i += 4) {
          const chunk = contentItems.slice(i, i + 4);
          slidesList.push({
            title: `Resumo & Aplicação - Parte ${Math.floor(i / 4) + 1}`,
            items: chunk,
          });
        }
      }

      // Initialize pptxgenjs
      const pptx = new pptxgen();
      pptx.title = mainTitle;
      pptx.author = "Viva IA - Igreja Viva";
      pptx.subject = "Esboço Ministerial";

      // Load church customized identity labels
      const churchHQ = localStorage.getItem("viva-hq-name") || "Sede Central — Ativo";
      const churchCong = localStorage.getItem("viva-cong-name") || "Sede Igreja Viva";

      // Slide 1: Welcome & Capa Slide (Deep Elegant Green theme)
      const coverSlide = pptx.addSlide();
      coverSlide.background = { fill: "0F5132" }; // Emerald theme

      coverSlide.addText(churchHQ.toUpperCase() + "  |  " + churchCong.toUpperCase(), {
        x: 0.8,
        y: 1.0,
        w: "80%",
        h: 0.4,
        fontSize: 10,
        fontFace: "Arial",
        bold: true,
        color: "E2C799", // Gold/Amber accent
      });

      coverSlide.addText(mainTitle, {
        x: 0.8,
        y: 1.4,
        w: "80%",
        h: 2.0,
        fontSize: 32,
        fontFace: "Georgia",
        bold: true,
        color: "FFFFFF",
        valign: "middle",
      });

      coverSlide.addText(mainSubtitle + "\n\nTecnologia a serviço do Reino • Esboço de Apoio Prédica", {
        x: 0.8,
        y: 3.8,
        w: "80%",
        h: 1.2,
        fontSize: 12,
        fontFace: "Arial",
        color: "E2E8F0",
        italic: true,
      });

      // Subsequent Slides (Elegant off-white pages)
      slidesList.forEach((sl, idx) => {
        const slide = pptx.addSlide();
        slide.background = { fill: "FAF9F5" }; // Soft custom ivory #FAF9F5

        // Top bar
        slide.addText(`IGREJA VIVA   |   ${churchHQ.toUpperCase()}`, {
          x: 0.8,
          y: 0.3,
          w: "80%",
          h: 0.3,
          fontSize: 8,
          fontFace: "Arial",
          bold: true,
          color: "1565C0", // Cyan/blue brand accent
        });

        // Top Header Title (Slate Dark bold text)
        slide.addText(sl.title, {
          x: 0.8,
          y: 0.7,
          w: "80%",
          h: 0.8,
          fontSize: 20,
          fontFace: "Georgia",
          bold: true,
          color: "111827", // Gray 900
          valign: "middle",
        });

        // Bullet point rows
        if (sl.items.length > 0) {
          const textObjects = sl.items.map((item) => ({
            text: item,
            options: {
              bullet: true,
              indent: 15,
              color: "374151", // Gray 700
              fontSize: 14,
              fontFace: "Arial",
              lineSpacing: 22,
            },
          }));

          slide.addText(textObjects, {
            x: 0.8,
            y: 1.8,
            w: "80%",
            h: 4.2,
            valign: "top",
          });
        } else {
          slide.addText("Esboço de conteúdo para reflexão pastoral.", {
            x: 0.8,
            y: 1.8,
            w: "80%",
            h: 1.5,
            fontSize: 14,
            fontFace: "Arial",
            color: "6B7280",
            italic: true,
          });
        }

        // Small Footnote index
        slide.addText(`Slide ${idx + 2} de ${slidesList.length + 1}   •   Gerado por Viva IA Pastoral`, {
          x: 0.8,
          y: 6.4,
          w: "80%",
          h: 0.3,
          fontSize: 8,
          fontFace: "Arial",
          color: "9CA3AF", // Gray 400
        });
      });

      // Trigger standard PPTX browser download
      pptx.writeFile({ fileName: `Esboco_Slides_${mainTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pptx` });
    } catch (err) {
      console.error("Erro ao gerar PowerPoint (.pptx):", err);
      // Clean fallback back to standard txt outline in case of library failure
      const outlineText = `Esboço de Slides:\n\n${text}`;
      const blob = new Blob([outlineText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Esboco_Slides_PowerPoint.txt";
      a.click();
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsAsking(true);

    try {
      const chatPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatPayload }),
      });

      if (!response.ok) throw new Error("Erro de conexão do servidor.");
      const data = await response.json();

      const aiMsg: Message = {
        id: "ai-" + Date.now(),
        role: "assistant",
        text: data.text || "Desculpe, não consegui obter uma resposta satisfatória da Viva IA.",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          text: `⚠️ Erro na conexão: ${err.message || "Não foi possível carregar a resposta."}. Atualmente executando no modo de simulação, tente novamente.`
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const clearChatHistory = () => {
    if (confirm("Deseja apagar o histórico da conversa com a Viva IA?")) {
      setMessages([
        {
          id: "viva-init",
          role: "assistant",
          text: "Histórico redefinido. Estou pronta para um novo planejamento ministerial, Pastor. O que deseja criar?"
        }
      ]);
    }
  };

  // Advanced dynamic Markdown translator helper
  const parseMarkdownToReact = (text: string): React.ReactNode[] => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;

      // Translate bold strings: **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        content = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-extrabold text-[#2E7D32]">{part}</strong>;
          }
          return part;
        });
      }

      // Identify bullet entries: * or -
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const bulletText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc pl-1 py-0.5 text-xs text-slate-700 leading-normal font-semibold">
            {bulletText}
          </li>
        );
      }

      // Translate headers
      if (line.startsWith("### ")) {
        return (
          <h5 key={idx} className="text-xs font-black uppercase text-[#1565C0] tracking-wider pt-3 pb-1">
            {line.substring(4)}
          </h5>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h4 key={idx} className="text-sm font-black text-[#2E7D32] tracking-tight pt-4 pb-1">
            {line.substring(3)}
          </h4>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h3 key={idx} className="text-base font-black text-slate-900 border-b border-slate-100 pb-1.5 pt-5">
            {line.substring(2)}
          </h3>
        );
      }

      // Ordinary block line
      return (
        <p key={idx} className="text-xs text-slate-700 leading-normal font-semibold min-h-[12px] py-0.5">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
      {/* Dynamic Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-emerald-600 to-blue-800 text-white rounded-xl">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1">
              Viva IA Pastoral
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Assistente Inteligente Ministerial Sênior</p>
          </div>
        </div>

        <button
          onClick={clearChatHistory}
          title="Limpar conversa"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isAI = m.role === "assistant";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`p-2 rounded-xl shrink-0 self-start ${isAI ? "bg-[#2E7D32] text-white" : "bg-[#1565C0] text-white"}`}>
                {isAI ? <Bot size={14} /> : <User size={14} />}
              </div>

              <div className={`p-4 rounded-3xl border text-xs max-w-full ${
                isAI
                  ? "bg-white border-slate-100 text-slate-800 shadow-xs"
                  : "bg-blue-600 text-white border-blue-700 shadow-xs"
              }`}>
                {/* Custom Parsed Output */}
                <div className="space-y-1.5">
                  {isAI ? parseMarkdownToReact(m.text) : <p className="leading-normal font-semibold">{m.text}</p>}
                  
                  {isAI && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 justify-end">
                      <button
                        onClick={() => downloadAsPDF(m.text)}
                        type="button"
                        className="px-2.5 py-1 text-[10px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-bold flex items-center gap-1 transition-colors border border-emerald-200/40 cursor-pointer"
                        title="Salvar em formato PDF"
                      >
                        <FileText size={11} /> Salvar PDF
                      </button>
                      <button
                        onClick={() => downloadAsPowerPointOutline(m.text)}
                        type="button"
                        className="px-2.5 py-1 text-[10px] text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg font-bold flex items-center gap-1 transition-colors border border-blue-200/40 cursor-pointer"
                        title="Salvar esboço de Slide Deck para PowerPoint"
                      >
                        <Presentation size={11} /> Salvar PowerPoint
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Loading Prompt status indicator */}
        {isAsking && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="p-2 bg-[#2E7D32]/90 text-white rounded-xl shrink-0 animate-bounce">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-slate-100 p-3.5 rounded-2xl flex items-center gap-2 shadow-xs text-xs">
              <span className="font-semibold text-slate-400">Viva IA está lapidando reflexões teológicas...</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompting shortcut cards */}
      {messages.length === 1 && !isAsking && (
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5 pl-1">Sugestões de Tarefas Rápidas:</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestedPrompts.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSendMessage(s.text)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-900 rounded-xl text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Area */}
      <div className="p-3 bg-slate-50 border-t border-slate-150 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isAsking}
            placeholder="Digite sua dúvida ou instrução para a Viva IA..."
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-slate-755 disabled:opacity-60"
          />
          <button
            id="btn-send-ia"
            type="submit"
            disabled={isAsking || !inputText.trim()}
            className="p-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

    </div>
  );
}
