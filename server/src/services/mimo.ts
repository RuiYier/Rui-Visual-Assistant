import { MimoConfig } from '../types/index.js';

const config: MimoConfig = {
  apiKey: process.env.MIMO_API_KEY || '',
  baseUrl: process.env.MIMO_API_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1',
};

export async function callMimoAPI(
  endpoint: string,
  body: any,
  isFormData = false
): Promise<any> {
  const url = `${config.baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mimo API error: ${response.status} - ${errorText}`);
  }

  return response;
}

export async function callMimoStreamAPI(
  endpoint: string,
  body: any
): Promise<ReadableStream> {
  const url = `${config.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
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

export function getConfig(): MimoConfig {
  return config;
}
