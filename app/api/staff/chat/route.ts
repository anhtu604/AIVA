import { streamText } from 'ai';
import { getAIProvider } from '@/services/ai/adapter';
import { systemPrompts, MODULE_PROMPT_MAP } from '@/services/ai/prompts/systemPrompts';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    // ── 1. Kiểm tra Auth bắt buộc ────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return new Response(
            JSON.stringify({ error: 'Unauthorized – Vui lòng đăng nhập để sử dụng tính năng này.' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // ── 2. Parse body ─────────────────────────────────────────────────────────
    let messages: any[];
    let module: string;

    try {
        const body = await req.json();
        messages = body.messages ?? [];
        module = (body.module ?? '').toLowerCase().trim();
    } catch {
        return new Response(
            JSON.stringify({ error: 'Invalid request body.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // ── 3. Chọn System Prompt theo module ─────────────────────────────────────
    const promptKey = MODULE_PROMPT_MAP[module] ?? 'STAFF_CBO';
    const systemPrompt = systemPrompts[promptKey];

    if (!systemPrompt) {
        return new Response(
            JSON.stringify({ error: `System prompt không tồn tại cho module: ${module}` }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // ── 4. Gọi AI và stream kết quả ───────────────────────────────────────────
    try {
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
    } catch (err: any) {
        console.error('[staff/chat] AI error:', err);
        return new Response(
            JSON.stringify({ error: err.message ?? 'Đã có lỗi xảy ra trong quá trình xử lý AI.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
