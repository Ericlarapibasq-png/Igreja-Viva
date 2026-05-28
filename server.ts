import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Instantiate Gemini with standard header
  let ai: any = null;
  const key = process.env.GEMINI_API_KEY;
  const isKeyConfigured = key && key !== "MY_GEMINI_API_KEY" && key !== "";

  if (isKeyConfigured) {
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // API 1: Viva IA pastoral conversation
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, prompt } = req.body;

      if (!ai) {
        return res.json({
          text: `Olá! Sou a **Viva IA**, o assistente inteligente da plataforma **Igreja Viva**. 

Atualmente, estou operando no **Modo de Demonstração Offline** (sua chave \`GEMINI_API_KEY\` não foi adicionada no painel de Segredos/Secrets do AI Studio). Mesmo assim, posso te responder com sugestões pré-programadas do meu banco pastoral! 

**Como posso contribuir com seu ministério hoje?**
1. *Gerar ideias de sermões*
2. *Organizar estudos para pequenos grupos*
3. *Criar uma escala de serviço* 

*Sinta-se livre para digitar qualquer mensagem. Vou responder usando nossa sabedoria prática reformada.*`
        });
      }

      // Format messages into Content array for Google GenAI SDK
      const contents = messages
        ? messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.text }],
          }))
        : [{ role: "user", parts: [{ text: prompt }] }];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: `Você é a "Viva IA", a conselheira teológica e assistente inteligente da plataforma Igreja Viva. Sua missão é auxiliar pastores e líderes cristãos. Adote sempre uma postura extremamente acolhedora, humana, pastoral e repleta de carinho espiritual. 

CRÍTICO: Você não é um ERP comercial ou software corporativo. NUNCA use terminologias empresariais frias como "KPIs", "pipeline", "leads", "conversão de membros", "processamento", "endpoints" ou "mecanismos de retenção". Em vez disso, use termos como "ovelhas sob cuidado", "cuidado pastoral", "família da fé", "acolhimento de novos amigos", "recursos para a obra" ou "crescimento espiritual".

Seus recursos principais incluem:
- Responder dúvidas teológicas e práticas de liderança de forma bíblica, zelosa, com profundo apego às Escrituras.
- Sugerir esboços de sermons, devocionais edificantes e materiais de Pequenos Grupos.
- Recomendar mensagens amorosas de WhatsApp para aproximar membros ausentes e aproximar novos visitantes de forma espontânea e calorosa.
- Formate suas respostas com formatação Markdown clara e limpa, priorizando sabedoria bíblica contextualizada.`,
        },
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini Chat Error:", err);
      res.status(500).json({ error: "Erro na conexão com a Viva IA: " + err.message });
    }
  });

  // API 2: Devocional automated builder
  app.post("/api/gemini/devocional", async (req, res) => {
    try {
      const { tema } = req.body;

      if (!ai) {
        // Fallback static devotionals
        return res.json({ text: getMockDevotionalText(tema) });
      }

      const prompt = `Gere uma devocional diária inspiradora e edificante para o povo de Deus sobre o tema cristão "${tema}".
A devocional deve possuir rigorosamente a seguinte estrutura em Markdown:
1. **Título Teológico** (Frase curta impactante)
2. **Leitura Bíblica** (Um versículo por extenso + Livro Capítulo:Versículo)
3. **Reflexão Prática** (2 a 3 parágrafos sobre a caminhada fiel de serviço e amor)
4. **Oração Pastoral** (Clamor sincero ao coração de Deus)
5. **Desafio do Dia** (Uma ação tangível dirigida à comunhão, discipulado ou generosidade)

Mantenha o estilo fiel ao Reino de Deus, bíblico, inspirador e edificante.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini Devocional Error:", err);
      res.status(500).json({ error: "Erro ao gerar devocional com a Viva IA." });
    }
  });

  // Serve static UI assets and route mapping via Vite middleware or standard production build
  if (process.env.NODE_ENV !== "production") {
    // Import dynamically so it only runs in non-production
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Igreja Viva Server] Executando com sucesso na porta ${PORT}`);
  });
}

function getMockDevotionalText(tema: string): string {
  switch (tema) {
    case "Fé":
      return `### Fé: O Aliscer das Promessas Divinas

> **Hebreus 11:1**  
> *"Ora, a fé é a certeza de coisas que se esperam, a convicção de fatos que se não veem."*

**Reflexão Prática:**
A fé madura e produtiva se move mesmo diante de escassez e incerteza física. Quando lideramos frentes ministeriais, pequenos grupos, ou mesmo ao lidar com orações aparentemente não respondidas, somos chamados a apoiar os pés firme nas promessas do Senhor. Fé é a ferramenta que abre portas para a multiplicação do Reino.

**Oração Pastoral:**
*Pai do céu, ensina-nos a confiar integralmente em Teus braços de provisão. Nutre a nossa comunidade com confiança e que nossas famílias encontrem abrigo de fé no Teu Espírito Santo. Amém.*

**Desafio do Dia:**
Envie hoje uma palavra de vitória e fé para um irmão ou colega de escala que esteja passando por lutas de saúde ou desemprego.`;
    case "Generosidade":
      return `### A Alegria de Semear no Reino

> **2 Coríntios 9:7**  
> *"Cada um contribua segundo propôs no seu coração; não com tristeza ou por necessidade, porquanto Deus ama ao que dá com alegria."*

**Reflexão Prática:**
A nossa generosidade reflete o caráter do Pai Eterno que entregou o Seu Filho amado por nós. Contribuições, dízimos, ofertas e entrega voluntária não são obrigações burocráticas, mas sim atos profundos de adoração alegre. Ao abrir nossas mãos com confiança, somos abençoados com paz, permitindo que a igreja permaneça viva, apoiando necessitados e enviando novos discípulos.

**Oração Pastoral:**
*Senhor Grandioso, doador de todo bem perfeito. Desperta em nosso peito um coração desprendido e grato. Que nossa generosidade sirva de alimento espiritual e socorro aos mais vulneráveis. Amém.*

**Desafio do Dia:**
Participe de uma doação especial ou prepare uma oferta voluntária com alegria em seu coração para apoiar as atividades práticas da igreja ou causas missionárias.`;
    case "Amor":
      return `### O Maior de Todos os Vínculos

> **João 13:35**  
> *"Nisto conhecerão todos que sois meus discípulos: se tiverdes amor uns aos outros."*

**Reflexão Prática:**
Podemos organizar as melhores escalas, usar as melhores tecnologias ministeriais e criar as maiores finanças. Contudo, sem amor prático pelos perdidos, órfãos e viúvas, somos como metal que soa. O amor sustenta o discipulado autêntico e faz da igreja um refúgio acolhedor.

**Oração Pastoral:**
*Senhor Jesus, derrama Teu amor incondicional sobre as nossas vidas. Que a nossa congregação transborde de acolhimento alegre para que todo visitante sinta o calor do Teu Reino de graça. Amém.*

**Desafio do Dia:**
Perdoe alguém ou busque restaurar uma relação desgastada, demonstrando em atitudes reais o amor que recebemos de Cristo.`;
    default:
      return `### Servir Conforme o Chamado de Deus

> **Mateus 20:28**  
> *"Tal como o Filho do Homem, que não veio para ser servido, mas para servir e dar a sua vida em resgate por muitos."*

**Reflexão Prática:**
Ser voluntário na recepção, nas mídias, no infantil ou servindo café é partilhar da própria realeza espiritual de servir com amor. Todo esforço, por menor que pareça, constrói templos de vidas transformadas. Deixe Deus usar seus dons hoje!

**Oração Pastoral:**
*Deus do Trabalho Fiel, dá-nos alegria no servir na congregação e nos Pequenos Grupos. Fortalece o ânimo de cada discipulador e coordenador de ministério do Reino. Amém.*

**Desafio do Dia:**
Confirme sua presença na próxima escala semanal de serviço e faça suas tarefas com integridade de espírito.`;
  }
}

startServer();
