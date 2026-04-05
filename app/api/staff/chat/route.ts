import { streamText } from 'ai';
import { getAIProvider } from '@/services/ai/adapter';
import { systemPrompts } from '@/services/ai/prompts/systemPrompts';
import { createClient } from '@/lib/supabase/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // ── 1. Auth guard (Staff only) ────────────────────────────────────────
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { messages, module } = await req.json();

        // ── 2. Chọn System Prompt dựa trên module ──────────────────────────
        let systemPrompt = systemPrompts.STAFF_GENERAL;
        if (module === 'trinh-tu-nhap-lieu') {
            systemPrompt = systemPrompts.TRINH_TU_NHAP_LIEU;
        } else if (module === 'tu-van-chuyen-tuyen') {
            systemPrompt = systemPrompts.TU_VAN_CHUYEN_TUYEN;
        }

        // ── 3. Rửa dữ liệu: Chuyển mảng parts của SDK v3 thành text chuỗi ───────
        const cleanedMessages = messages.map((m: any) => {
            let contentStr = '';
            if (typeof m.content === 'string') {
                contentStr = m.content;
            } else if (Array.isArray(m.parts)) {
                contentStr = m.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text || '')
                    .join('');
            }
            return {
                role: m.role,
                content: contentStr.trim() || ' '
            };
        });

        // ── 4. Thực hiện streamText chính thống ───────────────────────────────
        const model = getAIProvider();
        const result = await streamText({
            model,
            system: systemPrompt,
            messages: cleanedMessages,
        });

        // ── 5. Trả về đúng chuẩn Vercel AI Data Stream Protocol ────────────────
        return result.toDataStreamResponse();

    } catch (error: any) {
        console.error("Error in staff chat API:", error);
        return new Response(JSON.stringify({ 
            error: 'Đã có lỗi xảy ra trong quá trình xử lý AI (Staff).', 
            details: error.message || String(error) 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
