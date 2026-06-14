import { MimoConfig } from '../types/index.js';

function getConfig(): MimoConfig {
  const apiKey = process.env.MIMO_API_KEY || '';
  const baseUrl = process.env.MIMO_API_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1';
  return { apiKey, baseUrl };
}

export async function callMimoAPI(
  endpoint: string,
  body: any,
  isFormData = false
): Promise<any> {
  const config = getConfig();
  const url = `${config.baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'api-key': config.apiKey,
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
    throw new Error(`Mimo API ${response.status}: ${errorText.substring(0, 100)}`);
  }

  return response;
}

export { getConfig };
