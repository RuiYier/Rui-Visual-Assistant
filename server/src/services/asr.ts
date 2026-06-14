import { callMimoAPI } from './mimo.js';

const MAX_BASE64_SIZE = 10 * 1024 * 1024;

const FILLER_WORDS = [
  '嗯', '嗯？', '嗯。', '嗯！',
  '啊', '啊？', '啊。', '啊！',
  '哦', '哦？', '哦。', '哦！',
  '呃', '呃？', '呃。', '呃！',
  '额', '额？', '额。', '额！',
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
  '噢', '噢？', '噢。',
  '哟', '哟？', '哟。',
  '咦', '咦？', '咦。',
  '呵', '呵？', '呵。', '呵！',
  '嘶', '嘶？', '嘶。',
  '哼', '哼？', '哼。', '哼！',
  '呸', '呸？', '呸。', '呸！',
  '啧', '啧？', '啧。',
  '?',
];

function isFillerWord(text: string): boolean {
  return FILLER_WORDS.includes(text.trim());
}

export async function processAudio(audioBase64: string, mimeType?: string): Promise<string> {
  try {
    if (audioBase64.length > MAX_BASE64_SIZE) {
      throw new Error('音频数据过大');
    }

    let dataUrlPrefix = 'data:audio/wav;base64,';
    if (mimeType?.includes('mp3') || mimeType?.includes('mpeg')) {
      dataUrlPrefix = 'data:audio/mpeg;base64,';
    }

    const dataUrl = `${dataUrlPrefix}${audioBase64}`;

    const response = await callMimoAPI('/chat/completions', {
      model: 'mimo-v2.5-asr',
      messages: [{
        role: 'user',
        content: [{
          type: 'input_audio',
          input_audio: { data: dataUrl },
        }],
      }],
      asr_options: { language: 'zh' },
    });

    const result = await response.json();

    if (result.choices?.[0]?.message?.content) {
      const text = result.choices[0].message.content.trim();
      return isFillerWord(text) ? '' : text;
    }

    if (result.text) {
      const text = result.text.trim();
      return isFillerWord(text) ? '' : text;
    }

    return '';
  } catch (error) {
    console.error('ASR error:', error);
    throw new Error('语音识别失败');
  }
}
