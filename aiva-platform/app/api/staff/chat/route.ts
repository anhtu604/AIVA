import { streamText } from 'ai';
import { getAIProvider } from '@/services/ai/adapter';
import { systemPrompts, MODULE_PROMPT_MAP } from '@/services/ai/prompts/systemPrompts';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

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
        const model = getAIProvider();
        const result = streamText({
            model,
            system: systemPrompt,
            messages,
        });

        return (result as any).toDataStreamResponse?.() ?? (result as any).toTextStreamResponse();
    } catch (err: any) {
        console.error('[staff/chat] AI error:', err);
        return new Response(
            JSON.stringify({ error: err.message ?? 'Đã có lỗi xảy ra trong quá trình xử lý AI.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
