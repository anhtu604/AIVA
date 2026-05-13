import { createOpenAI } from '@ai-sdk/openai';

export function getAIProvider() {
  const baseURL = process.env.LLM_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:20129/v1' : undefined);

  if (!baseURL) {
    throw new Error('Missing LLM_API_URL environment variable');
  }

  const gemmaProvider = createOpenAI({
    baseURL,
    apiKey: process.env.LLM_API_KEY || process.env.GEMMA_API_KEY,

    
    // ── Fetch Interceptor: Sửa lỗi Header của chiasegpu.vn ────────────────────
    // ChiaseGPU đôi khi trả về application/json cho luồng stream, 
    // khiến AI SDK bị lỗi parsing. Chúng ta force nó về text/event-stream.
    fetch: async (url, options) => {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');
      
      // Nếu là stream request (thường có body.stream = true) và trả về JSON thay vì event-stream,
      // chúng ta force header về text/event-stream để AI SDK có thể parse được.
      if (response.ok && contentType?.includes('application/json')) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('content-type', 'text/event-stream; charset=utf-8');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
      return response;
    },
  });
  
  // Trả về model gemma-4-31b-it theo như hệ thống đã đăng ký
  return gemmaProvider('gemma-4-31b-it');
}
