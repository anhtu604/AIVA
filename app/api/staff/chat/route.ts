import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // 1. Auth guard (Staff only)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { query, conversation_id, module } = await req.json();

        // 2. Proxy to Dify API
        const difyUrl = `${process.env.DIFY_API_URL}/chat-messages`;
        const difyKey = process.env.DIFY_STAFF_API_KEY;

        const payload = {
            inputs: {
                // Pass module slug to Dify if the agent needs to know which module is active
                module_slug: module || 'staff-general', 
            },
            query,
            response_mode: 'streaming',
            conversation_id: conversation_id || '',
            user: user.id || 'staff-user',
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
