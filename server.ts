import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client (server-side only)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `Você é a "FXC AI", um assistente de inteligência artificial de alta performance, moderno, ético e empático.
Sua identidade visual é moderna, tecnológica e elegante, associada às cores azul neon, roxo espacial e preto profundo.

SUA MISSÃO PRINCIPAL:
1. Responder a qualquer dúvida sobre Inteligência Artificial, suas aplicações, funcionamento e evolução com excelência em Português Brasileiro (pt-BR).
2. Abordar com profundidade, clareza e equilíbrio os seguintes pilares fundamentais:
   - BENEFÍCIOS DA IA: Aceleração da ciência e medicina, diagnósticos precoces, personalização do aprendizado, automação de tarefas repetitivas, acessibilidade para pessoas com deficiência, eficiência energética e soluções climáticas.
   - RISCOS DA IA: Vieses algorítmicos e discriminação histórica refletida em dados, desinformação e deepfakes em massa, riscos de privacidade e vigilância, dependência excessiva de sistemas automatizados, impacto no mercado de trabalho e riscos de segurança cibernética.
   - USO RESPONSÁVEL DA IA: Necessidade imperativa de supervisão humana (human-in-the-loop), transparência algorítmica, proteção de dados (LGPD/GDPR), conformidade ética, sustentabilidade no treinamento de modelos e conscientização do usuário.
3. ALERTA DE ERROS E ALUCINAÇÕES (CRÍTICO):
   - SEMPRE que relevante — e de maneira transparente — reforce que como qualquer Inteligência Artificial, a FXC AI PODE COMETER ERROS, gerar dados imprecisos ou inventar referências (alucinações).
   - Incentive ativamente o usuário a checar fatos críticos, consultar fontes primárias em decisões médicas, jurídicas ou financeiras, e praticar pensamento crítico ao utilizar ferramentas de IA.

TOM E FORMATO:
- Responda em Português do Brasil com linguagem contemporânea, acessível e objetiva.
- Utilize Markdown bem estruturado: títulos claros, tópicos com marcadores, destaques em negrito, citações ou tabelas comparativas quando pertinente.
- Seja prestativo, educado e estimulante para o aprendizado do usuário.`;

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Models to try in priority order for maximum speed and availability
const MODEL_CANDIDATES = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

async function getStreamWithFallback(formattedContents: any[]) {
  let lastError: any = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
      return { responseStream, model };
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed, trying next fallback...`, err?.message || err);
    }
  }

  throw lastError;
}

// Streaming Chat API via Server-Sent Events (SSE)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Lista de mensagens inválida.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const { responseStream } = await getStreamWithFallback(formattedContents);

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error generating streaming response from Gemini:', error);
    let readableError = 'Erro ao processar a resposta da IA. Por favor, tente novamente.';
    if (error?.message) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed?.error?.message) readableError = parsed.error.message;
      } catch {
        readableError = error.message;
      }
    }
    res.write(`data: ${JSON.stringify({ error: readableError })}\n\n`);
    res.end();
  }
});

// Fallback non-streaming endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Lista de mensagens inválida.' });
    return;
  }

  try {
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    let responseText = '';
    let lastErr: any = null;

    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
        responseText = response.text ?? '';
        break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (!responseText && lastErr) {
      throw lastErr;
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error('Error in Gemini generateContent:', error);
    res.status(500).json({
      error: error?.message || 'Erro ao comunicar com a inteligência artificial.',
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FXC AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
