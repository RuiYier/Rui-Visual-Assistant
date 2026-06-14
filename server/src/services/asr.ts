import { callMimoAPI } from './mimo.js';

// Base64 大小限制：10MB
const MAX_BASE64_SIZE = 10 * 1024 * 1024;

// 水词列表（无意义的词语）
const FILLER_WORDS = [
  '嗯', '嗯？', '嗯。', '嗯！', '嗯，',
  '啊', '啊？', '啊。', '啊！', '啊，',
  '哦', '哦？', '哦。', '哦！', '哦，',
  '呃', '呃？', '呃。', '呃！', '呃，',
  '额', '额？', '额。', '额！', '额，',
  '吗', '吗？', '吗。',
  '吧', '吧？', '吧。',
  '呢', '呢？', '呢。',
  '哈', '哈？', '哈。', '哈！',
  '嘿', '嘿？', '嘿。', '嘿！',
  '唉', '唉？', '唉。', '唉！',
  '喂', '喂？', '喂。',
  '呀', '呀？', '呀。',
  '啦', '啦？', '啦。',
  '嘛', '嘛？', '嘛。',
  '咯', '咯？', '咯。',
  '咧', '咧？', '咧。',
  '咯', '咯？', '咯。',
  '噢', '噢？', '噢。',
  '哟', '哟？', '哟。',
  '咦', '咦？', '咦。',
  '呵', '呵？', '呵。', '呵！',
  '嘶', '嘶？', '嘶。',
  '哼', '哼？', '哼。', '哼！',
  '呸', '呸？', '呸。', '呸！',
  '啧', '啧？', '啧。',
  '啊哈', '啊哈？', '啊哈。',
  '嗯哼', '嗯哼？', '嗯哼。', '?' ,
];

// 检查是否是水词
function isFillerWord(text: string): boolean {
  const trimmed = text.trim();
  return FILLER_WORDS.includes(trimmed);
}

export async function processAudio(audioBase64: string, mimeType?: string): Promise<string> {
  try {
    console.log('=== ASR Processing Start ===');
    console.log('Input audioBase64 length:', audioBase64.length);
    console.log('MIME type:', mimeType);

    // 检查 Base64 大小
    if (audioBase64.length > MAX_BASE64_SIZE) {
      throw new Error(`音频数据过大: ${(audioBase64.length / 1024 / 1024).toFixed(2)}MB，上限 10MB`);
    }

    // 根据 MIME 类型选择正确的 data URL 前缀
    let dataUrlPrefix = 'data:audio/wav;base64,';

    if (mimeType) {
      if (mimeType.includes('webm')) {
        // Mimo ASR 不支持 webm，需要提示用户
        console.warn('Warning: webm format may not be supported by Mimo ASR');
        // 尝试使用 mp3 格式
        dataUrlPrefix = 'data:audio/mpeg;base64,';
      } else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
        dataUrlPrefix = 'data:audio/mpeg;base64,';
      } else if (mimeType.includes('wav')) {
        dataUrlPrefix = 'data:audio/wav;base64,';
      }
    }

    const dataUrl = `${dataUrlPrefix}${audioBase64}`;

    console.log('Data URL length:', dataUrl.length);
    console.log('Data URL prefix:', dataUrl.substring(0, 50));

    // 构建请求体（完全符合文档格式）
    const requestBody = {
      model: 'mimo-v2.5-asr',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'input_audio',
              input_audio: {
                data: dataUrl,
              },
            },
          ],
        },
      ],
      asr_options: {
        language: 'zh', // 指定中文，提升识别效果
      },
    };

    console.log('Calling ASR API...');
    console.log('Audio data size:', (audioBase64.length / 1024).toFixed(2), 'KB');

    // 调用 ASR API
    const response = await callMimoAPI('/chat/completions', requestBody);
    const result = await response.json();

    console.log('ASR response status:', response.status);
    console.log('ASR response:', JSON.stringify(result).substring(0, 300));

    // 提取识别结果（OpenAI 兼容格式）
    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];
      if (choice.message && choice.message.content) {
        const text = choice.message.content.trim();
        console.log('ASR result:', text);

        // 过滤水词
        if (isFillerWord(text)) {
          console.log('Filtered filler word:', text);
          return '';
        }

        return text;
      }
    }

    // 尝试其他可能的响应格式
    if (result.text) {
      const text = result.text.trim();
      if (isFillerWord(text)) {
        console.log('Filtered filler word:', text);
        return '';
      }
      return text;
    }

    if (result.result) {
      const text = result.result.trim();
      if (isFillerWord(text)) {
        console.log('Filtered filler word:', text);
        return '';
      }
      return text;
    }

    console.log('Unexpected ASR response format:', JSON.stringify(result).substring(0, 500));
    return '';
  } catch (error) {
    console.error('=== ASR Processing Error ===');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
    throw new Error('语音识别失败');
  }
}

export async function processAudioStream(
  audioChunks: string[],
  mimeType?: string
): Promise<string> {
  // 合并多个音频块
  const buffers = audioChunks.map((chunk) => Buffer.from(chunk, 'base64'));
  const combinedBuffer = Buffer.concat(buffers);

  return processAudio(combinedBuffer.toString('base64'), mimeType);
}
