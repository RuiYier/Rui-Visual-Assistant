import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { handleWebSocket } from './websocket/handler.js';
import apiRoutes from './routes/api.js';

// 加载环境变量
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API 路由
app.use('/api', apiRoutes);

// HTTP 服务器
const httpServer = createServer(app);

// WebSocket 服务器
const wss = new WebSocketServer({ port: Number(WS_PORT) });

wss.on('connection', (ws) => {
  console.log('Client connected');
  handleWebSocket(ws);
});

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`WebSocket Server running on port ${WS_PORT}`);
});
