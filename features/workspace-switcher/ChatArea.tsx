'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import AivaLogo from '@/features/brand/AivaLogo';
import { Send, User, AlertCircle, ShieldCheck } from 'lucide-react';

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

    const [localMessages] = useState([{
        id: `welcome-${moduleSlug}`,
        role: 'assistant' as const,
        content: welcomeMessage ?? `Hệ thống đã sẵn sàng. Tôi là trợ lý AI chuyên môn **AIVA** cho module **${moduleLabel}**. Mời bạn nhập yêu cầu xử lý nghiệp vụ.`,
    }]);

    const allMessages = useMemo(() => {
        const sdkIds = new Set(messages.map((m: any) => m.id));
        const welcomeFiltered = localMessages.filter(m => !sdkIds.has(m.id));
        return [...welcomeFiltered, ...messages];
    }, [messages, localMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allMessages]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        await sendMessage({ text: trimmed });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getMessageText = (m: any) => {
        if (typeof m.content === 'string') return m.content;
        if (Array.isArray(m.parts)) {
            return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text || '').join('');
        }
        return '';
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 font-sans">
            {/* Enterprise Dashboard Header with branding */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-white/10 flex items-center justify-between bg-slate-900/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <AivaLogo size={36} showText={false} glow={true} />
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-white font-bold text-base leading-none tracking-tight">Hệ thống AIVA</h2>
                            <div className="bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest leading-none">Secured AI</span>
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs mt-1.5 font-medium tracking-tight">Nghiệp vụ: <span className="text-cyan-400 font-bold uppercase">{moduleLabel}</span></p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AIVA Core Online</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-wider">Enterprise Edition</p>
                    </div>
                    <div className="h-10 w-px bg-white/5 mx-1" />
                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <ShieldCheck className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                {allMessages.map((m: any) => {
                    const isUser = m.role === 'user';
                    const text = getMessageText(m);
                    
                    return (
                        <div key={m.id} className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="flex-shrink-0 mt-1">
                                {isUser
                                    ? (
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-600/20 border border-cyan-500/30">
                                            <User className="w-4 h-4 text-cyan-400" />
                                        </div>
                                      )
                                    : (
                                        <AivaLogo size={32} showText={false} glow={false} />
                                      )
                                }
                            </div>

                            <div className={`
                                max-w-[80%] rounded-2xl px-5 py-3.5 text-[14px] leading-relaxed whitespace-pre-wrap shadow-xl
                                ${isUser
                                    ? 'bg-rose-600 text-white rounded-tr-none border border-white/10'
                                    : 'bg-slate-900 text-slate-200 rounded-tl-none border border-white/10'
                                }
                            `}>
                                {text}
                            </div>
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex items-start gap-4">
                        <AivaLogo size={32} showText={false} glow={false} />
                        <div className="bg-slate-900 border border-white/10 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1.5 items-center shadow-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="flex-shrink-0 px-6 pb-6 pt-3 border-t border-white/10 bg-slate-900/30 font-sans">
                <div className="relative flex items-end gap-3 bg-slate-950 rounded-2xl border border-white/10 shadow-2xl pr-3 pl-5 py-3 focus-within:border-rose-500/50 focus-within:ring-1 focus-within:ring-rose-500/30 transition-all">
                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 resize-none outline-none text-[14px] leading-relaxed min-h-[24px] max-h-40 py-2"
                        placeholder={`Nhập yêu cầu thực thi module ${moduleLabel}...`}
                        value={input}
                        rows={1}
                        disabled={isLoading}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`
                            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg
                            ${!isLoading && input.trim()
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 hover:scale-105 active:scale-95'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                            }
                        `}
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
