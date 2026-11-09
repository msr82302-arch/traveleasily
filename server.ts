import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '15mb' }));

  // Initialize Gemini API if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  let aiClient: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }

  // API Endpoint: AI Visa Concierge & Document Advisory
  app.post('/api/ai-concierge', async (req: Request, res: Response) => {
    try {
      const { prompt, destination, originPassport, context } = req.body;

      if (!aiClient) {
        return res.json({
          reply: `[EasyTravel Advisory: Simulation Mode]\nFor ${originPassport || 'travelers'} heading to ${destination || 'your destination'}: Please verify that your passport has at least 6 months remaining validity from your planned entry date and at least two blank visa pages. For standard tourist travel, eVisas take 24–72 hours for processing.`,
          simulated: true
        });
      }

      const systemInstruction = `You are Easy Travels' Senior Visa Concierge & Immigration Consultant based in Riffa, Bahrain.
You provide accurate, courteous, professional advice on global eVisas, ETAs, entry requirements, document specifications (photo dimensions, yellow fever vaccine, passport validity 6-month rule), and embassy processing workflows.
When answering, be clear, structured, and reassuring. Keep answers concise with actionable bullet points.`;

      const apiCall = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nTraveler Context: Origin passport is ${originPassport || 'Not specified'}, Traveling to ${destination || 'General Destination'}.\nPrior context: ${context || 'None'}\n\nTraveler Query: ${prompt}`
              }
            ]
          }
        ]
      });

      const timeoutPromise = new Promise<{ text: string }>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 5000)
      );

      const response = await Promise.race([apiCall, timeoutPromise]) as any;
      const reply = response.text || 'Thank you for reaching out to Easy Travels concierge. Our visa officers are available to verify your documents.';
      return res.json({ reply, simulated: false });
    } catch (error: any) {
      console.error('Error generating AI concierge response:', error);
      return res.status(200).json({
        reply: `Based on standard EasyTravel immigration protocols for ${req.body.destination || 'your destination'}: Ensure your passport is valid for at least 6 months past arrival, carry confirmed return flights, and have hotel reservations ready. Our Bahrain support desk is on standby for expedited handling.`,
        simulated: true,
        error: error.message
      });
    }
  });

  // API Endpoint: Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      platform: 'EasyTravel Borderless Engine',
      version: '2.4.0',
      timestamp: new Date().toISOString()
    });
  });

  // Mount Vite middleware in development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EasyTravel server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
