import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  MessageSquareCode, 
  ArrowBigUpDash, 
  Bot, 
  User, 
  Trash2, 
  Send, 
  HelpCircle, 
  FileText, 
  Presentation,
  Check,
  ExternalLink,
  ChevronRight,
  Copy,
  Info,
  Smartphone,
  Play,
  Zap,
  CheckCircle,
  Eye,
  AlertTriangle,
  History,
  CheckCheck,
  MessageSquare,
  Search,
  CheckSquare,
  UserCheck,
  RefreshCw
} from "lucide-react";
import { jsPDF } from "jspdf";
import pptxgen from "pptxgenjs";
import { Visitor } from "../types";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface VivaIAChatProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  visitors?: Visitor[];
  onUpdateVisitor?: (v: Visitor) => void;
}

export default function VivaIAChat({ 
  initialPrompt, 
  onClearInitialPrompt,
  visitors = [],
  onUpdateVisitor
}: VivaIAChatProps) {
  // 1. Navigation Tab state: "chat" | "automation"
  const [vivaIaTab, setVivaIaTab] = useState<"chat" | "automation">("chat");

  // 2. Chat States
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

  // 3. Automation States
  const [localVisitors, setLocalVisitors] = useState<Visitor[]>([]);
  const [isAutomationActive, setIsAutomationActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("viva-automation-active");
    return saved !== null ? saved === "true" : true;
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return localStorage.getItem("viva-automation-selected-temp") || "temp1";
  });
  const [customTemplate, setCustomTemplate] = useState<string>(() => {
    return localStorage.getItem("viva-automation-custom-text") || 
      "Oi, {nome}! Que alegria imensa ter você conosco no culto da Igreja Viva em {dataVisita}. Esperamos que tenha sentido o amor de Cristo! Queremos marcar uma visita ou orar por você. Se tiver um pedido especial de oração, conte com a gente por aqui! 🌱";
  });
  const [automationLogs, setAutomationLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem("viva-automation-logs");
    return saved ? JSON.parse(saved) : [
      `[${new Date().toLocaleTimeString("pt-BR")}] ⚙️ Motor de Automação de Visitantes ativo.`,
      `[${new Date().toLocaleTimeString("pt-BR")}] 🟢 Monitoramento de Acolhimento em espera de novos cadastros.`
    ];
  });
  const [sendingVisitorId, setSendingVisitorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync incoming visitors
  useEffect(() => {
    if (visitors && visitors.length > 0) {
      setLocalVisitors(visitors);
    } else {
      const stored = localStorage.getItem("iv_visitors");
      if (stored) {
        try {
          setLocalVisitors(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [visitors]);

  // Quick prompt shortcuts list - humanized and non-corporate
  const suggestedPrompts = [
    { label: "📖 Esboço de Sermão", text: "Me ajude com 3 ideias de temas para sermões edificantes baseados no livro de Filipenses, contendo passagens de apoio e títulos cheios de esperança." },
    { label: "🌱 Estudo para Pequenos Grupos", text: "Gere um roteiro acolhedor de estudo semanal para Pequenos Grupos contendo quebra-gelo, leitura bíblica, reflexão prática e perguntas de partilha mútua." },
    { label: "❤️ Acolher Visitante Recente", text: "Escreva uma mensagem de WhatsApp amigável para enviar a um visitante recente, dizendo o quanto ficamos felizes em tê-lo conosco no domingo, sem formalismo." },
    { label: "🕊️ Organização Sem Sobrecarga", text: "Que práticas humanizadas e pastorais um líder de pequena igreja em crescimento pode usar para cuidar das escalas de voluntários sem desgastar os obreiros?" }
  ];

  // Template approaches presets
  const presets = {
    temp1: {
      name: "🌱 Conexão de Célula (PGM)",
      text: "Oi, {nome}! Ficamos muito felizes com a sua visita no culto do dia {dataVisita}. Sabia que temos pequenos grupos (PGMs) pertinho de você para partilhar a Bíblia e amizades com um bom café? Se quiser conhecer um de nossos grupos nesta semana, nos mande uma mensagem! Grande abraço! 🌱"
    },
    temp2: {
      name: "🕊️ Abraço Pastoral e Oração",
      text: "Olá, {nome}! Que alegria imensa ter você conosco no culto de {dataVisita}. Esperamos que tenha sentido o amor de Cristo! Queremos orar por seu lar. Se tiver um pedido de oração, nos envie por aqui. Abençoados sejam você e sua família! 🕊"
    },
    temp3: {
      name: "⛪ Visita Dominical Informativa",
      text: "Prezado(a) {nome}, aqui é do ministério de acolhimento da Igreja Viva. Gostaríamos de agradecer profundamente sua presença em nossa celebração do dia {dataVisita}. Como podemos te apoiar esta semana? Se quiser conversar com um pastor, estamos à disposição! 🙏"
    }
  };

  // Auto handle triggers from outer dashboard click actions
  useEffect(() => {
    if (initialPrompt) {
      setVivaIaTab("chat");
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    // Smooth scrolling down when messages update
    if (vivaIaTab === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAsking, vivaIaTab]);

  // Logging engine helper
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    const formatted = `[${timestamp}] ${message}`;
    setAutomationLogs(prev => {
      const updated = [formatted, ...prev].slice(0, 50);
      localStorage.setItem("viva-automation-logs", JSON.stringify(updated));
      return updated;
    });
  };

  const clearLogs = () => {
    setAutomationLogs([]);
    localStorage.removeItem("viva-automation-logs");
  };

  // Toggle master scanner switch
  const handleToggleAutomation = () => {
    const newValue = !isAutomationActive;
    setIsAutomationActive(newValue);
    localStorage.setItem("viva-automation-active", String(newValue));
    addLog(`⚙️ Automação de boas-vindas marcada como ${newValue ? "ATIVA" : "INATIVA"}.`);
  };

  const handleSelectTemplate = (id: string, text: string) => {
    setSelectedTemplateId(id);
    setCustomTemplate(text);
    localStorage.setItem("viva-automation-selected-temp", id);
    localStorage.setItem("viva-automation-custom-text", text);
    addLog(`📝 Modelo de mensagem predefinido selecionado: "${presets[id as keyof typeof presets]?.name || "Personalizado"}"`);
  };

  const handleUpdateCustomTemplate = (text: string) => {
    setCustomTemplate(text);
    localStorage.setItem("viva-automation-custom-text", text);
  };

  // Dynamic variable placeholder parsing
  const customizeMessage = (template: string, visitor: Visitor) => {
    return template
      .replace(/{nome}/g, visitor.nome || "amigo(a)")
      .replace(/{dataVisita}/g, visitor.dataVisita ? new Date(visitor.dataVisita + "T00:00:00").toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"))
      .replace(/{interesse}/g, visitor.interesse || "Crescimento Espiritual")
      .replace(/{pedidoOracao}/g, visitor.pedidoOracao || "Nenhum informado")
      .replace(/{quemConvidou}/g, visitor.quemConvidou || "Acolhimento");
  };

  // WhatsApp formatted target link
  const getWhatsAppUrl = (phone: string, text: string) => {
    const digits = phone.replace(/\D/g, "");
    let cleanPhone = digits;
    if (digits.length >= 10 && !digits.startsWith("55")) {
      cleanPhone = "55" + digits;
    }
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  // Simulated Dispatch flow for CRM interaction (updating status)
  const handleSimulateSend = (visitor: Visitor) => {
    if (sendingVisitorId) return;
    setSendingVisitorId(visitor.id);
    addLog(`🚀 Iniciando disparo automático via Viva IA para [${visitor.nome}] (${visitor.telefone})...`);
    
    setTimeout(() => {
      // Create clone with modified CRM status tag
      const updatedVisitor: Visitor = {
        ...visitor,
        statusDiscipulado: "Contactado"
      };

      if (onUpdateVisitor) {
        onUpdateVisitor(updatedVisitor);
      } else {
        const updatedList = localVisitors.map((x) => (x.id === visitor.id ? updatedVisitor : x));
        setLocalVisitors(updatedList);
        localStorage.setItem("iv_visitors", JSON.stringify(updatedList));
      }

      setSendingVisitorId(null);
      addLog(`✅ Disparo de acolhimento concluído via Viva IA para [${visitor.nome}]!`);
      
      const tooltip = document.createElement("div");
      tooltip.className = "fixed bottom-10 right-10 z-[100] bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-lg border border-emerald-300/30 animate-fade-in flex items-center gap-2";
      tooltip.innerHTML = `📬 Mensagem de boas-vindas enviada para ${visitor.nome}!`;
      document.body.appendChild(tooltip);
      setTimeout(() => tooltip.remove(), 2500);
    }, 1500);
  };

  // Files/Document generators preserved
  const downloadAsPDF = (text: string) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/### (.*)/g, "\n=== $1 ===\n")
        .replace(/## (.*)/g, "\n[ $1 ]\n")
        .replace(/# (.*)/g, "\n\nHOMILIA: $1\n")
        .replace(/\* /g, " • ")
        .replace(/- /g, " • ");

      doc.setFillColor(46, 125, 50);
      doc.rect(0, 0, 210, 25, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("IGREJA VIVA - TECNOLOGIA MINISTERIAL", 15, 11);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Viva IA Teologica - Relatorio de Planejamento Pastoral", 15, 17);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 145, 17);

      doc.setTextColor(30, 41, 59);
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
      addLog("📄 Documento PDF gerado e salvo localmente com sucesso.");
    } catch (e) {
      console.error(e);
    }
  };

  const downloadAsWord = (text: string, filenameSuffix?: string) => {
    try {
      const formattedTitle = filenameSuffix ? `Viva IA - ${filenameSuffix}` : "Planejamento Ministerial - Viva IA";
      const formattedHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>${formattedTitle}</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333333; }
            h1 { color: #2E7D32; border-bottom: 2px solid #2E7D32; padding-bottom: 5px; font-size: 20pt; font-family: 'Georgia', serif; }
            h2 { color: #1565C0; font-size: 15pt; margin-top: 20px; font-family: 'Georgia', serif; }
            h3 { color: #374151; font-size: 13pt; margin-top: 15px; }
            p { font-size: 11pt; margin-bottom: 8px; }
            li { font-size: 11pt; margin-bottom: 4px; }
            strong { color: #2E7D32; font-weight: bold; }
            .footer { font-size: 9pt; color: #777777; margin-top: 50px; border-top: 1px solid #dddddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>DIRETRIZES E PLANEJAMENTO MINISTERIAL</h1>
          <p><i>Gerado eletronicamente pela Viva IA Pastoral em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</i></p>
          <hr/>
          ${text
            .split("\n")
            .map((line) => {
              if (line.startsWith("# ")) return `<h1>${line.substring(2)}</h1>`;
              if (line.startsWith("## ")) return `<h2>${line.substring(3)}</h2>`;
              if (line.startsWith("### ")) return `<h3>${line.substring(4)}</h3>`;
              if (line.startsWith("* ") || line.startsWith("- ")) return `<li>${line.substring(2)}</li>`;
              if (line.trim() === "") return "<br/>";
              const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
              return `<p>${boldFormatted}</p>`;
            })
            .join("\n")}
          <div class="footer">
            <p>Igreja Viva - Tecnologia a serviço do Reino de Deus</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(["\ufeff" + formattedHtml], { type: "application/msword;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Viva_IA_Planejamento_${filenameSuffix || "Sessao"}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      addLog("📝 Documento do MS Word (.doc) exportado com sucesso.");
    } catch (err) {
      console.error(err);
    }
  };

  const downloadEntireHistoryAsWord = () => {
    if (messages.length <= 1) return;
    const combinedText = messages
      .map((m) => {
        const timeHeader = m.role === "user" ? "👨‍💻 SEÇÃO: DIRETRIZ OU PERGUNTA DO PASTOR" : "🕊️ SEÇÃO: DIRETRIZES DE PLANEJAMENTO DA VIVA IA";
        return `## ${timeHeader}\n\n${m.text}\n\n---\n`;
      })
      .join("\n");
    downloadAsWord(combinedText, "Historico_Completo");
  };

  const downloadEntireHistoryAsPDF = () => {
    if (messages.length <= 1) return;
    const combinedText = messages
      .map((m) => {
        const timeHeader = m.role === "user" ? "=== DIRETRIZ DO PASTOR ===" : "=== PLANEJAMENTO VIVA IA ===";
        return `\n${timeHeader}\n\n${m.text}\n\n-------------------------\n`;
      })
      .join("\n");
    downloadAsPDF(combinedText);
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

          currentSlide = { title: headerText, items: [] };
          slidesList.push(currentSlide);
        } else {
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

      if (slidesList.length === 0) {
        let contentItems: string[] = [];
        lines.forEach((line) => {
          const trimmed = line.trim().replace(/^[\s*\-•\d\.]+\s+/, "").replace(/\*\阳光/g, "");
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

      const pptx = new pptxgen();
      pptx.title = mainTitle;
      pptx.author = "Viva IA - Igreja Viva";
      pptx.subject = "Esboço Ministerial";

      const coverSlide = pptx.addSlide();
      coverSlide.background = { fill: "0F5132" };

      coverSlide.addText("IGREJA VIVA   |   TECNOLOGIA PARA O REINO", {
        x: 0.8,
        y: 1.0,
        w: "80%",
        h: 0.4,
        fontSize: 10,
        fontFace: "Arial",
        bold: true,
        color: "E2C799",
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

      coverSlide.addText(mainSubtitle + "\n\nSlides gerados de apoio teológico", {
        x: 0.8,
        y: 3.8,
        w: "80%",
        h: 1.2,
        fontSize: 12,
        fontFace: "Arial",
        color: "E2E8F0",
        italic: true,
      });

      slidesList.forEach((sl, idx) => {
        const slide = pptx.addSlide();
        slide.background = { fill: "FAF9F5" };

        slide.addText("IGREJA VIVA   |   VISÃO MINISTERIAL", {
          x: 0.8,
          y: 0.3,
          w: "80%",
          h: 0.3,
          fontSize: 8,
          fontFace: "Arial",
          bold: true,
          color: "1565C0",
        });

        slide.addText(sl.title, {
          x: 0.8,
          y: 0.7,
          w: "80%",
          h: 0.8,
          fontSize: 20,
          fontFace: "Georgia",
          bold: true,
          color: "111827",
          valign: "middle",
        });

        if (sl.items.length > 0) {
          const textObjects = sl.items.map((item) => ({
            text: item,
            options: {
              bullet: true,
              indent: 15,
              color: "374151",
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
        }

        slide.addText(`Slide ${idx + 2} de ${slidesList.length + 1}   •   Viva IA Teológica`, {
          x: 0.8,
          y: 6.4,
          w: "80%",
          h: 0.3,
          fontSize: 8,
          fontFace: "Arial",
          color: "9CA3AF",
        });
      });

      pptx.writeFile({ fileName: `Apoio_Pastoral_${mainTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pptx` });
      addLog("📊 Outline de Slides do PowerPoint (.pptx) gerado com sucesso.");
    } catch (err) {
      console.error(err);
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
      addLog(`💬 Recebida nova orientação pastoral da Viva IA.`);
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
    if (confirm("Deseja apagar o histórico de homilias e planejamento?")) {
      setMessages([
        {
          id: "viva-init",
          role: "assistant",
          text: "Histórico redefinido. Estou pronta para um novo planejamento ministerial, Pastor. O que deseja criar?"
        }
      ]);
      addLog(`🧹 Histórico do Chat apagado pelo usuário.`);
    }
  };

  const parseMarkdownToReact = (text: string): React.ReactNode[] => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;

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

      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const bulletText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc pl-1 py-0.5 text-xs text-slate-700 leading-normal font-semibold">
            {bulletText}
          </li>
        );
      }

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

      return (
        <p key={idx} className="text-xs text-slate-700 leading-normal font-semibold min-h-[12px] py-0.5">
          {content}
        </p>
      );
    });
  };

  // Filter visitor list to those matching search
  const filteredVisitorsList = localVisitors.filter((v) => {
    const matchesSearch = v.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (v.telefone && v.telefone.includes(searchTerm));
    return matchesSearch;
  });

  // Calculate total "Novo" (uncontacted) visitors
  const newVisitorsCount = localVisitors.filter(v => v.statusDiscipulado === "Novo").length;

  return (
    <div id="i-viva-app" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col min-h-[620px] max-h-[780px] overflow-hidden">
      
      {/* 1. Header Banner & Integrated Subtab Switcher */}
      <div className="p-4 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-blue-800 text-white rounded-2xl shadow-inner">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1.5 leading-none">
              Viva IA Teológica
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Assistência de Gabinete & Central de Acolhimento</p>
          </div>
        </div>

        {/* Dynamic sub tab controllers */}
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-2xl w-full md:w-auto border border-slate-700">
          <button
            type="button"
            onClick={() => setVivaIaTab("chat")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              vivaIaTab === "chat"
                ? "bg-[#2E7D32] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare size={13} />
            <span>Conselho & Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setVivaIaTab("automation")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              vivaIaTab === "automation"
                ? "bg-[#1E4D2B] text-emerald-400 border border-emerald-500/30 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap size={13} className={vivaIaTab === "automation" ? "fill-emerald-400" : ""} />
            <span>Automação WhatsApp</span>
            {newVisitorsCount > 0 && (
              <span className="bg-red-500 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full animate-bounce shrink-0">
                {newVisitorsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Chat Layout Module */}
      {vivaIaTab === "chat" && (
        <React.Fragment>
          {/* Action and exports panel */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
            <span className="text-[9px] uppercase font-bold text-slate-400">Auxílio Homilético & Relatórios</span>
            
            <div className="flex items-center gap-1.5">
              {messages.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={downloadEntireHistoryAsPDF}
                    className="px-2 py-1 bg-white hover:bg-emerald-50 text-[9px] font-black text-emerald-850 rounded-lg border border-slate-205 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText size={10} /> Exportar PDF
                  </button>
                  <button
                    type="button"
                    onClick={downloadEntireHistoryAsWord}
                    className="px-2 py-1 bg-white hover:bg-blue-50 text-[9px] font-black text-blue-850 rounded-lg border border-slate-205 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText size={10} /> Exportar Word
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={clearChatHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Messages view canvas */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/45 flex flex-col">
            {messages.map((m) => {
              const isAI = m.role === "assistant";
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto animate-fade-in" : "ml-auto flex-row-reverse"}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 self-start ${isAI ? "bg-[#2E7D32] text-white" : "bg-[#1565C0] text-white"}`}>
                    {isAI ? <Bot size={13} /> : <User size={13} />}
                  </div>

                  <div className={`p-4 rounded-3xl border text-xs max-w-full ${
                    isAI
                      ? "bg-white border-slate-200/60 text-slate-800 shadow-xs"
                      : "bg-blue-600 text-white border-blue-700 shadow-xs"
                  }`}>
                    <div className="space-y-1.5">
                      {isAI ? parseMarkdownToReact(m.text) : <p className="leading-normal font-semibold">{m.text}</p>}
                      
                      {isAI && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 justify-end">
                          <button
                            onClick={() => downloadAsPDF(m.text)}
                            type="button"
                            className="px-2.5 py-1 text-[9px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-black flex items-center gap-1 transition-colors border border-emerald-200/40 cursor-pointer"
                          >
                            <FileText size={10} /> Baixar PDF
                          </button>
                          <button
                            onClick={() => downloadAsWord(m.text)}
                            type="button"
                            className="px-2.5 py-1 text-[9px] text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-black flex items-center gap-1 transition-colors border border-indigo-200/40 cursor-pointer"
                          >
                            <FileText size={10} /> Salvar Word
                          </button>
                          <button
                            onClick={() => downloadAsPowerPointOutline(m.text)}
                            type="button"
                            className="px-2.5 py-1 text-[9px] text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg font-black flex items-center gap-1 transition-colors border border-blue-200/40 cursor-pointer"
                          >
                            <Presentation size={10} /> Esboço Slides
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isAsking && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-fade-in">
                <div className="p-2 bg-[#2E7D32]/90 text-white rounded-xl shrink-0 animate-bounce">
                  <Bot size={13} />
                </div>
                <div className="bg-white border border-slate-200/60 p-3.5 rounded-2xl flex items-center gap-2 shadow-xs text-xs">
                  <span className="font-semibold text-slate-400">Viva IA está buscando conselhos bíblicos...</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-1 h-1 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1 h-1 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>

          {/* Quick shortcuts pane */}
          {messages.length === 1 && !isAsking && (
            <div className="p-3 bg-white border-t border-slate-100 shrink-0 select-none">
              <span className="text-[8px] uppercase font-extrabold text-slate-400 block mb-1.5 pl-1 tracking-wider">Perguntas Rápidas sobre Igreja e Bíblia:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {suggestedPrompts.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSendMessage(s.text)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-900 rounded-xl text-[10px] font-bold shrink-0 transition-all cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom input area */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
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
                placeholder="Digite sobre homilias, conselhos, reuniões ou estudos..."
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-slate-900 font-medium disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isAsking || !inputText.trim()}
                className="p-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </React.Fragment>
      )}

      {/* 3. Welcome Automation System Module */}
      {vivaIaTab === "automation" && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
          
          {/* Left Block: Automation management console */}
          <div className="w-full lg:w-5/12 p-4 lg:p-5 border-r border-slate-200 overflow-y-auto space-y-5 bg-white shrink-0">
            
            {/* Master control switch */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-[8px] font-black tracking-widest text-[#1E4D2B] uppercase">
                    Central de Gatilhos
                  </span>
                  <h4 className="text-xs font-black text-slate-800">
                    Acolhimento Automático
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutomation}
                  className={`px-3 py-1 text-[9px] font-black rounded-full transition-all border cursor-pointer uppercase ${
                    isAutomationActive
                      ? "bg-emerald-100/80 text-emerald-800 border-emerald-300"
                      : "bg-slate-200 text-slate-500 border-slate-300"
                  }`}
                >
                  {isAutomationActive ? "🟢 ATIVO" : "⚪ INATIVO"}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Quando ativos, novos registros de visitantes na igreja são monitorados eletronicamente e recebem templates de contato direto via WhatsApp.
              </p>
            </div>

            {/* Template Selectors */}
            <div className="space-y-2">
              <span className="block text-[8px] uppercase font-black tracking-widest text-slate-400">
                Selecione o Modelo de Abordagem Viva IA
              </span>
              <div className="space-y-1.5">
                {Object.entries(presets).map(([id, p]) => {
                  const isSelected = selectedTemplateId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectTemplate(id, p.text)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? "bg-emerald-50/25 border-emerald-300 ring-1 ring-emerald-500/25 text-emerald-950"
                          : "bg-slate-50/30 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="block text-[11px] font-extrabold leading-tight">
                          {p.name}
                        </span>
                        <span className="block text-[8.5px] text-slate-400 truncate max-w-full font-medium mt-0.5 whitespace-nowrap">
                          {p.text}
                        </span>
                      </div>
                      {isSelected && (
                        <Check size={13} className="text-emerald-700 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customized template editing input */}
            <div className="space-y-2">
              <span className="block text-[8px] uppercase font-black tracking-widest text-slate-400">
                Texto Final da Mensagem
              </span>
              <textarea
                rows={4}
                value={customTemplate}
                onChange={(e) => handleUpdateCustomTemplate(e.target.value)}
                className="w-full text-xs font-semibold font-sans border border-slate-220 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed"
                placeholder="Adapte os parágrafos utilizando os marcadores dinâmicos abaixo..."
              />

              {/* Tag append triggers */}
              <div className="space-y-1">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tight">
                  Inserir marcador dinâmico no texto:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "👤 Nome", tag: "{nome}" },
                    { label: "🗓️ Data", tag: "{dataVisita}" },
                    { label: "🎯 Interesse", tag: "{interesse}" },
                    { label: "🙏 Oração", tag: "{pedidoOracao}" },
                    { label: "🤝 Convidado por", tag: "{quemConvidou}" },
                  ].map(chip => (
                    <button
                      key={chip.tag}
                      type="button"
                      onClick={() => {
                        const updated = customTemplate + " " + chip.tag;
                        handleUpdateCustomTemplate(updated);
                        addLog(`➕ Inserido dinamicamente marcador ${chip.tag}`);
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 rounded-md text-[9px] font-bold text-slate-600 border border-slate-200 shrink-0 cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Smartphone preview framing */}
            <div className="space-y-1.5 pt-1">
              <span className="block text-[8px] uppercase font-black tracking-widest text-slate-405 flex items-center gap-1">
                <Smartphone size={11} className="text-emerald-600" />
                Simulador de Tela do Visitante
              </span>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-3xs shrink-0 select-none">
                <div className="bg-[#075e54] text-white px-3 py-1.5 flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block shrink-0" />
                    <span className="text-[9px] font-semibold truncate leading-none">Visitante Recente (Visualização)</span>
                  </div>
                  <span className="text-[7px] uppercase bg-emerald-800 text-white px-1 py-0.5 rounded">WhatsApp</span>
                </div>
                
                <div className="p-2.5 bg-[#efeae2] min-h-[90px] flex flex-col justify-between">
                  <div className="bg-[#d9fdd3] text-slate-800 p-2 rounded-xl text-[9px] shadow-3xs max-w-[95%] font-medium leading-normal">
                    <p className="whitespace-pre-line">
                      {customizeMessage(customTemplate, {
                        id: "preview-id",
                        nome: "Mateus Ribeiro",
                        telefone: "(11) 98765-4321",
                        whatsapp: "(11) 98765-4321",
                        dataVisita: new Date().toISOString().split("T")[0],
                        interesse: "Capacitação e Estudo bíblico",
                        pedidoOracao: "Saúde familiar",
                        retornoAoCulto: "Pendente",
                        statusDiscipulado: "Novo",
                        dataCadastro: new Date().toISOString()
                      })}
                    </p>
                    <span className="block text-[7px] text-slate-400 text-right mt-1">
                      {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Block: Real visitor list & automation pipeline */}
          <div className="flex-1 p-4 lg:p-5 flex flex-col h-full overflow-hidden justify-between space-y-4">
            
            {/* Filter and metrics banner */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between shrink-0 bg-white p-3 rounded-2xl border border-slate-150">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filtrar por nome ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56 pl-3 pr-3 py-1 text-xs border border-slate-200 rounded-xl outline-none focus:border-slate-300 font-semibold"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded-md">
                  🚨 {newVisitorsCount} Novos Visitantes
                </span>
                <span className="text-[9px] bg-indigo-100 text-indigo-850 font-extrabold px-2 py-0.5 rounded-md">
                  🔋 Motor Pronto
                </span>
              </div>
            </div>

            {/* List canvas area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredVisitorsList.length === 0 ? (
                <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl space-y-2">
                  <UserCheck className="mx-auto text-slate-300" size={28} />
                  <h4 className="text-xs font-black text-slate-800">Nenhum visitante encontrado.</h4>
                  <p className="text-[9px] text-slate-400 font-semibold">Os novos de domingo são incorporados automaticamente.</p>
                </div>
              ) : (
                filteredVisitorsList.map((v) => {
                  const isNew = v.statusDiscipulado === "Novo";
                  const customizedText = customizeMessage(customTemplate, v);
                  const isSendingThisObj = sendingVisitorId === v.id;
                  const waUrl = getWhatsAppUrl(v.telefone || v.whatsapp, customizedText);

                  return (
                    <div 
                      key={v.id} 
                      className={`bg-white border rounded-2xl p-4 space-y-3 shadow-3xs hover:shadow-2xs transition-all ${
                        isNew ? "border-red-105 bg-red-50/10" : "border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <h5 className="text-sm font-black text-slate-900 leading-normal flex items-center gap-1.5 flex-wrap">
                            {v.nome}
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${
                              isNew 
                                ? "bg-red-50 text-red-800 border border-red-200" 
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}>
                              {v.statusDiscipulado}
                            </span>
                          </h5>
                          
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500 font-semibold mt-1">
                            <span>📱 WhatsApp: {v.telefone || v.whatsapp}</span>
                            <span>🗓️ Visita: {v.dataVisita}</span>
                            {v.interesse && <span>🎯 Interesse: {v.interesse}</span>}
                          </div>
                        </div>

                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                          ID: {v.id.substring(0, 8)}
                        </span>
                      </div>

                      {/* Tailored message preview */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] text-slate-700 leading-relaxed font-semibold">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest pb-0.5 mb-1.5 border-b border-slate-150">
                          Mensagem personalizada a ser enviada:
                        </span>
                        <p className="whitespace-pre-line">{customizedText}</p>
                      </div>

                      {/* Action buttons row */}
                      <div className="flex flex-wrap items-center gap-2 justify-end pt-0.5 select-none">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(customizedText);
                            const t = document.createElement("div");
                            t.className = "fixed bottom-10 right-10 z-[100] bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow border border-slate-700 animate-fade-in";
                            t.innerHTML = "📋 Texto copiado para a Área de Transferência!";
                            document.body.appendChild(t);
                            setTimeout(() => t.remove(), 2500);
                          }}
                          className="px-2 py-1 bg-white hover:bg-slate-50 text-[9px] mr-auto text-slate-500 border border-slate-205 rounded-lg font-black transition-colors cursor-pointer"
                        >
                          Copiar Texto
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            addLog(`🔗 Abertura direta do WhatsApp Web para [${v.nome}] no telefone [${v.telefone}].`);
                            if (v.statusDiscipulado === "Novo") {
                              const updated: Visitor = { ...v, statusDiscipulado: "Contactado" };
                              if (onUpdateVisitor) onUpdateVisitor(updated);
                            }
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[9.5px] font-black text-slate-750 border border-slate-250 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={10} className="text-emerald-600" />
                          Enviar via WhatsApp
                        </a>

                        <button
                          type="button"
                          disabled={isSendingThisObj || !!sendingVisitorId}
                          onClick={() => handleSimulateSend(v)}
                          className={`px-3 py-1.5 rounded-xl text-[9.5px] font-black uppercase flex items-center gap-1 transition-colors cursor-pointer ${
                            isSendingThisObj
                              ? "bg-amber-100 text-amber-800 animate-pulse border border-amber-300"
                              : "bg-[#2E7D32] hover:bg-[#1b5e20] text-white"
                          }`}
                        >
                          {isSendingThisObj ? (
                            <>
                              <RefreshCw size={10} className="animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <Zap size={10} className="fill-white" />
                              Autodisparo Viva IA
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Execution Logs */}
            <div className="border border-slate-150 rounded-2xl bg-slate-900 text-slate-300 p-3 h-24 flex flex-col justify-between shrink-0 font-mono select-none">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 shrink-0">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
                  <History size={10} className="text-emerald-500" />
                  LOGS DE OPERAÇÃO (CRM)
                </span>
                <button
                  type="button"
                  onClick={clearLogs}
                  className="text-[8px] text-slate-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                >
                  Limpar Logs
                </button>
              </div>

              <div className="flex-1 overflow-y-auto text-[8px] leading-relaxed pt-1.5 space-y-0.5 select-text">
                {automationLogs.length === 0 ? (
                  <span className="text-slate-650 italic block">Zeladoria limpa. Nenhuma atividade registrada no momento...</span>
                ) : (
                  automationLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`truncate ${
                        log.includes("✅") ? "text-emerald-400 font-extrabold" : 
                        log.includes("🚀") ? "text-amber-300" :
                        log.includes("⚙️") ? "text-slate-400" : "text-slate-350"
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
