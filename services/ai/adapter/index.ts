import { createOpenAI } from '@ai-sdk/openai';

export function getAIProvider() {
  const gemmaProvider = createOpenAI({
    baseURL: 'https://llm.chiasegpu.vn/v1',
    // Sử dụng biến môi trường hoặc fallback về key hardcode để chạy thử
    apiKey: process.env.GEMMA_API_KEY || 'sk-694f5fe48b5ac1f00eb9bc62c55d02c0f5d5ca1322e5044675aac9d7cf3f9a22',
  });
  
  // Trả về model gemma-4-31b-it theo như hệ thống đã đăng ký
  return gemmaProvider('gemma-4-31b-it');
}
