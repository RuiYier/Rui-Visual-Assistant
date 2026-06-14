import { MimoConfig } from '../types/index.js';

function getConfig(): MimoConfig {
  const apiKey = process.env.MIMO_API_KEY || '';
  const baseUrl = process.env.MIMO_API_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1';

  if (!apiKey) {
    console.error('WARNING: MIMO_API_KEY is not set!');
  }

  return { apiKey, baseUrl };
}

export async function callMimoAPI(
  endpoint: string,
  body: any,
  isFormData = false
): Promise<any> {
  const config = getConfig();
  const url = `${config.baseUrl}${endpoint}`;

  // 根据文档使用 api-key 请求头
  const headers: Record<string, string> = {
    'api-key': config.apiKey,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`Calling Mimo API: ${url}`);
  console.log(`API Key: ${config.apiKey.substring(0, 8)}...`);
  console.log(`API Key length: ${config.apiKey.length}`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Mimo API error: ${response.status} - ${errorText}`);
    throw new Error(`Mimo API error: ${response.status} - ${errorText}`);
  }

  return response;
}

export async function callMimoStreamAPI(
  endpoint: string,
  body: any
): Promise<ReadableStream> {
  const config = getConfig();
  const url = `${config.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mimo API error: ${response.status} - ${errorText}`);
  }

  return response.body!;
}

export { getConfig };
