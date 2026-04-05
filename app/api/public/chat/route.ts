import { streamText } from 'ai';
import { getAIProvider } from '@/services/ai/adapter';
import { systemPrompts } from '@/services/ai/prompts/systemPrompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Lấy system prompt cho PUBLIC CARE
        const systemPrompt = systemPrompts.PUBLIC_CARE;

        const res = await fetch('https://llm.chiasegpu.vn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GEMMA_API_KEY || 'sk-694f5fe48b5ac1f00eb9bc62c55d02c0f5d5ca1322e5044675aac9d7cf3f9a22'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gemma-4-31b-it',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                stream: true
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`ChiaseGPU API Error (${res.status}): ${errorText}`);
        }

        const stream = new ReadableStream({
            async start(controller) {
                if (!res.body) {
                    controller.close();
                    return;
                }
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('data: ')) {
                            const dataStr = trimmed.slice(6);
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                const content = data.choices?.[0]?.delta?.content;
                                if (content) {
                                    controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(content)}\n`));
                                }
                            } catch (e) {
                                // Ignore unparsable chunks
                            }
                        }
                    }
                }
                controller.close();
            }
        });

        return new Response(stream, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error("Error in public chat API:", error);
        return new Response(JSON.stringify({ error: 'Đã có lỗi xảy ra trong quá trình xử lý AI.', details: error.message || String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
