import { streamText } from 'ai';
import { getAIProvider } from '@/services/ai/adapter';
import { systemPrompts } from '@/services/ai/prompts/systemPrompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Lấy system prompt cho PUBLIC CARE
        const systemPrompt = systemPrompts.PUBLIC_CARE;

        // Gọi model AI (mặc định lấy từ adapter đã cấu hình)
        const model = getAIProvider();

        const result = streamText({
            model,
            system: systemPrompt,
            messages,
        });

        return (result as any).toDataStreamResponse?.() ?? (result as any).toTextStreamResponse();
    } catch (error: any) {
        console.error("Error in public chat API:", error);
        return new Response(JSON.stringify({ error: 'Đã có lỗi xảy ra trong quá trình xử lý AI.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
