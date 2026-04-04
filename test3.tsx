import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';

export function Test() {
    const { messages, sendMessage } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' })
    });
    console.log(messages[0].text);
}
