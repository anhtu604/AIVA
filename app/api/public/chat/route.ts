import { streamText } from 'ai';
import { getAIProvider } from '@/services/ai/adapter';
import { systemPrompts } from '@/services/ai/prompts/systemPrompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // ── 1. Lấy model đã cấu hình interceptor ──────────────────────────────
        const model = getAIProvider();

        // ── 2. Lấy system prompt cho PUBLIC CARE ─────────────────────────────
        const systemPrompt = systemPrompts.PUBLIC_CARE;

        // ── 3. Rửa dữ liệu: Chuyển mảng parts của SDK v3 thành text chuỗi ───────
        // Một số AI backend không chấp nhận content rỗng, phải thay bằng dấu cách
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
        const result = await streamText({
            model,
            system: systemPrompt,
            messages: cleanedMessages,
        });

        // ── 5. Trả về đúng chuẩn Vercel AI Data Stream Protocol ────────────────
        // result.toDataStreamResponse() tự động xử lý X-Vercel-AI-Data-Stream: v1
        return result.toDataStreamResponse();

    } catch (error: any) {
        console.error("Error in public chat API:", error);
        return new Response(JSON.stringify({ 
            error: 'Đã có lỗi xảy ra trong quá trình xử lý AI (Public).', 
            details: error.message || String(error) 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
