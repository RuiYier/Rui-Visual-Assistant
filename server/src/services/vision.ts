import { callMimoAPI } from './mimo.js';
import { ContextMessage, ContentPart } from '../types/index.js';

export async function processVision(
  text: string,
  imageBase64?: string,
  history: ContextMessage[] = []
): Promise<string> {
  try {
    const content: ContentPart[] = [{ type: 'text', text }];

    if (imageBase64) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    }

    const messages: ContextMessage[] = [
      {
        role: 'system',
        content: `你是一个AI视觉对话助手。你可以看到用户的摄像头画面，并与用户进行自然对话。
要求：
1. 用简洁、自然的口语化中文回复
2. 不要使用任何 emoji 表情符号
3. 不要使用 markdown 格式
4. 直接输出纯文本，像正常说话一样
5. 回复长度控制在 100 字以内
6. 如果看到画面，请自然地描述你看到的内容
7. 像朋友聊天一样轻松自然
8. 如果用户说的话不完整或不清楚，根据上下文合理推测并回复
9. 不要说"抱歉，我无法理解"，而是尝试理解并给出有意义的回复`,
      },
      ...history,
      { role: 'user', content },
    ];

    const response = await callMimoAPI('/chat/completions', {
      model: 'mimo-v2.5',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const result = await response.json();
    console.log('Vision API response:', JSON.stringify(result).substring(0, 500));

    const aiResponse = result.choices?.[0]?.message?.content;
    if (!aiResponse || aiResponse.trim().length === 0) {
      return '我在听，请继续说';
    }

    return aiResponse;
  } catch (error) {
    console.error('Vision error:', error);
    throw new Error('视觉理解失败');
  }
}
