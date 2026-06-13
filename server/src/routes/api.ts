import { Router, Request, Response } from 'express';
import { getTTSConfig, clearTTSCache } from '../services/tts.js';

const router = Router();

// 健康检查
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取 TTS 音色列表
router.get('/voices', (req: Request, res: Response) => {
  const voices = [
    { id: 'alloy', name: 'Alloy', description: '中性、平衡', gender: 'neutral' },
    { id: 'echo', name: 'Echo', description: '男性、沉稳', gender: 'male' },
    { id: 'fable', name: 'Fable', description: '男性、温暖', gender: 'male' },
    { id: 'onyx', name: 'Onyx', description: '男性、深沉', gender: 'male' },
    { id: 'nova', name: 'Nova', description: '女性、活泼', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', description: '女性、柔和', gender: 'female' },
  ];

  res.json({ voices });
});

// 获取当前 TTS 配置
router.get('/tts/config', (req: Request, res: Response) => {
  const config = getTTSConfig();
  res.json({ config });
});

// 清除 TTS 缓存
router.post('/tts/clear-cache', (req: Request, res: Response) => {
  clearTTSCache();
  res.json({ success: true, message: 'TTS 缓存已清除' });
});

export default router;
