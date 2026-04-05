'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, Bot, User, AlertCircle, Sparkles } from 'lucide-react';

interface ChatAreaProps {
    moduleSlug: string;
    moduleLabel: string;
    moduleColor: string;
    moduleBg: string;
    welcomeMessage?: string;
}

export default function ChatArea({ moduleSlug, moduleLabel, moduleColor, moduleBg, welcomeMessage }: ChatAreaProps) {
    const chatInstance = useMemo(() => new Chat({
        transport: new DefaultChatTransport({
            api: '/api/staff/chat',
            body: { module: moduleSlug },
        }),
    }), [moduleSlug]);

    const { messages, sendMessage, status } = useChat({ chat: chatInstance });
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isLoading = status === 'streaming' || status === 'submitted';

    // Local welcome message
    const [localMessages] = useState([{
        id: `welcome-${moduleSlug}`,
        role: 'assistant' as const,
        content: welcomeMessage ?? `Xin chào! Tôi là AIVA Staff – module **${moduleLabel}**. Hãy cho tôi biết bạn cần hỗ trợ gì?`,
    }]);

    const allMessages = useMemo(() => {
        const sdkIds = new Set(messages.map((m: any) => m.id));
        const welcomeFiltered = localMessages.filter(m => !sdkIds.has(m.id));
        return [...welcomeFiltered, ...messages];
    }, [messages, localMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allMessages]);

    const resetTextarea = () => {
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput('');
        resetTextarea();
        await sendMessage({ text: trimmed });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getText = (m: any) => {
        if (typeof m.content === 'string') return m.content;
        if (Array.isArray(m.parts)) {
            return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text || '').join('');
        }
        return '';
    };

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm">
                <div className={`w-9 h-9 rounded-xl ${moduleBg} border border-white/10 flex items-center justify-center flex-shrink-0`}>
                    <Sparkles className={`w-4 h-4 ${moduleColor}`} />
                </div>
                <div>
                    <h2 className="text-white font-semibold text-sm leading-none">
                        Bạn đang ở module: <span className={moduleColor}>{moduleLabel}</span>
                    </h2>
                    <p className="text-slate-500 text-[11px] mt-1">
                        AI đang phục vụ với System Prompt chuyên biệt cho {moduleLabel} · Mọi cuộc trò chuyện được bảo mật
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
                {allMessages.map((m: any) => {
                    const isUser = m.role === 'user';
                    const text = getText(m);
                    return (
                        <div key={m.id} className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${isUser ? 'bg-indigo-600/20 border-indigo-500/30' : `${moduleBg} border-white/10`}`}>
                                {isUser ? <User className="w-3.5 h-3.5 text-indigo-400" /> : <Bot className={`w-3.5 h-3.5 ${moduleColor}`} />}
                            </div>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-600/20' : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-white/5 shadow-lg'}`}>
                                {text}
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex items-end gap-3">
                        <div className={`w-7 h-7 rounded-full ${moduleBg} border border-white/10 flex items-center justify-center flex-shrink-0`}>
                            <Bot className={`w-3.5 h-3.5 ${moduleColor}`} />
                        </div>
                        <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 pb-5 pt-3 border-t border-white/5 bg-slate-900/50">
                <div className="relative flex items-end gap-2 bg-slate-800 rounded-2xl border border-white/10 shadow-xl pr-2 pl-4 py-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 resize-none outline-none text-[14px] leading-relaxed min-h-[24px] max-h-32 py-1.5"
                        placeholder={`Nhắn tin cho AIVA ${moduleLabel}... (Enter để gửi, Shift+Enter xuống dòng)`}
                        value={input}
                        rows={1}
                        disabled={isLoading}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${!isLoading && input.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:scale-105' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
                <p className="text-[11px] text-slate-600 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Nội dung do AI tạo ra có thể chưa chính xác. Luôn kiểm tra với chuyên gia y tế.
                </p>
            </div>
        </div>
    );
}
