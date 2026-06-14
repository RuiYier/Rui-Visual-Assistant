import { Router, Request, Response } from 'express';
import { getTTSConfig, clearTTSCache } from '../services/tts.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.get('/voices', (_req: Request, res: Response) => {
  res.json({
    voices: [
      { id: 'mimo_default', name: 'MiMo默认', description: '默认音色' },
      { id: '冰糖', name: '冰糖', description: '中文女性' },
      { id: '茉莉', name: '茉莉', description: '中文女性' },
      { id: '苏打', name: '苏打', description: '中文男性' },
      { id: '白桦', name: '白桦', description: '中文男性' },
      { id: 'Mia', name: 'Mia', description: '英文女性' },
      { id: 'Chloe', name: 'Chloe', description: '英文女性' },
      { id: 'Milo', name: 'Milo', description: '英文男性' },
      { id: 'Dean', name: 'Dean', description: '英文男性' },
    ],
  });
});

router.get('/tts/config', (_req: Request, res: Response) => {
  res.json({ config: getTTSConfig() });
});

router.post('/tts/clear-cache', (_req: Request, res: Response) => {
  clearTTSCache();
  res.json({ success: true });
});

export default router;
