import { useState, useCallback } from 'react';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function useDifyChat({ api, initialMessages = [], moduleSlug }: { api: string, initialMessages?: ChatMessage[], moduleSlug?: string }) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const sendMessage = useCallback(async ({ text }: { text: string }) => {
        setIsLoading(true);
        const userMsgId = Date.now().toString();
        setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: text }]);

        try {
            const res = await fetch(api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: text,
                    conversation_id: conversationId,
                    module: moduleSlug, // used for Staff to distinguish modules
                })
            });

            if (!res.body) throw new Error('No stream body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let aiMsgId = (Date.now() + 1).toString();
            
            setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);
            
            let currentContent = '';
            let isFirstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (!dataStr) continue;
                        
                        try {
                            const data = JSON.parse(dataStr);
                            
                            // Initialize conversation ID on first response chunk
                            if (isFirstChunk && data.conversation_id && !conversationId) {
                                setConversationId(data.conversation_id);
                                isFirstChunk = false;
                            }

                            if (data.event === 'message') {
                                currentContent += data.answer;
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    newMsgs[newMsgs.length - 1].content = currentContent;
                                    return newMsgs;
                                });
                            }
                            
                            if (data.event === 'message_end') {
                                // optional handling for metadata like citations
                            }
                        } catch (e) {
                            // ignore parse errors for incomplete chunks in standard SSE
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error in useDifyChat:', error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Xin lỗi, đã có lỗi kết nối tới hệ thống AI. Vui lòng thử lại.' }]);
        } finally {
            setIsLoading(false);
        }
    }, [api, conversationId, moduleSlug]);

    return { 
        messages, 
        sendMessage, 
        isLoading, 
        status: isLoading ? 'streaming' as const : 'idle' as const 
    };
}
