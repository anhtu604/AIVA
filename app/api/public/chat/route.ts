export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { query, conversation_id } = await req.json();

        // Proxy to Dify API
        const difyUrl = `${process.env.DIFY_API_URL}/chat-messages`;
        const difyKey = process.env.DIFY_CARE_API_KEY;

        const payload = {
            inputs: {},
            query,
            response_mode: 'streaming',
            conversation_id: conversation_id || '',
            user: 'public-user',
        };

        const response = await fetch(difyUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${difyKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Dify API error: ${response.status} ${errorText}`);
        }

        // Return the SSE stream directly
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

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
