import { createOpenAI } from '@ai-sdk/openai';

export function getAIProvider() {
  const gemmaProvider = createOpenAI({
    baseURL: 'https://llm.chiasegpu.vn/v1',
    // Sử dụng biến môi trường hoặc fallback về key hardcode để chạy thử
    apiKey: process.env.GEMMA_API_KEY || 'sk-694f5fe48b5ac1f00eb9bc62c55d02c0f5d5ca1322e5044675aac9d7cf3f9a22',
    
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
