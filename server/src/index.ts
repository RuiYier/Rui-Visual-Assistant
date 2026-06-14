import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleWebSocket } from './websocket/handler.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', apiRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

const httpServer = createServer(app);

const wss = new WebSocketServer({ port: Number(WS_PORT) });

wss.on('connection', (ws) => {
  handleWebSocket(ws);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (WS: ${WS_PORT})`);
});

process.on('SIGTERM', () => {
  wss.close(() => {
    httpServer.close(() => process.exit(0));
  });
});
