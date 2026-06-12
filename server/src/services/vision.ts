import { callMimoAPI } from './mimo.js';
import { ContextMessage, ContentPart } from '../types/index.js';

export async function processVision(
  text: string,
  imageBase64?: string,
  history: ContextMessage[] = []
): Promise<string> {
  try {
    // 构建消息内容
    const content: ContentPart[] = [{ type: 'text', text }];

    // 如果有图片，添加到内容中
    if (imageBase64) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    }

    // 构建完整的消息列表
    const messages: ContextMessage[] = [
      {
        role: 'system',
        content: `你是一个AI视觉对话助手。你可以看到用户的摄像头画面，并与用户进行自然对话。
请用简洁、自然的中文回复。如果看到图片，请描述图片中的内容。
保持回复友好、有帮助。回复长度控制在100字以内，除非用户要求详细解释。`,
      },
      ...history,
      { role: 'user', content },
    ];

    // 调用 Vision API
    const response = await callMimoAPI('/chat/completions', {
      model: 'mimo-v2.5',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const result = await response.json();
    return result.choices?.[0]?.message?.content || '抱歉，我无法理解';
  } catch (error) {
    console.error('Vision processing error:', error);
    throw new Error('视觉理解失败');
  }
}
