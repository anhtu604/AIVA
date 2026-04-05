'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ConsentForm from '@/features/referrals/ConsentForm';
import AivaLogo from '@/features/brand/AivaLogo';
import { ShieldCheck, Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';

export default function PublicCarePage() {
    // ── useChat API v3 (v6) với DefaultChatTransport ──────────────────────────
    const chatInstance = useMemo(() => new Chat({
        transport: new DefaultChatTransport({ api: '/api/public/chat' }),
    }), []);

    const { messages, sendMessage, status } = useChat({ chat: chatInstance });
    
    const [input, setInput] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isLoading = status === 'streaming' || status === 'submitted';

    // Tin nhắn chào mừng cục bộ
    const [localWelcome] = useState([{
        id: 'welcome',
        role: 'assistant' as const,
        content: 'Xin chào, tôi là AI hỗ trợ từ hệ thống **AIVA**. Tôi ở đây để lắng nghe, chia sẻ và hỗ trợ bạn trong một không gian an toàn, hoàn toàn bảo mật về các vấn đề liên quan đến **HIV/AIDS**. Bạn cần tư vấn điều gì hôm nay?',
    }]);

    const allMessages = useMemo(() => {
        const sdkIds = new Set(messages.map((m: any) => m.id));
        const welcomeFiltered = localWelcome.filter(m => !sdkIds.has(m.id));
        return [...welcomeFiltered, ...messages];
    }, [messages, localWelcome]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allMessages]);

    const showToastMsg = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleReferralSuccess = () => {
        setShowModal(false);
        showToastMsg('Cảm ơn bạn! Thông tin đã được chuyển tuyến an toàn. Đội ngũ y tế sẽ sớm liên hệ.', 'success');
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput('');
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.style.height = 'auto';
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
        <div className="flex flex-col h-screen bg-slate-50 font-sans selection:bg-rose-500/30">
            {/* Header: Brand-focused */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <AivaLogo size={42} showText={true} />

                    <button
                        onClick={() => setShowModal(true)}
                        className="hidden sm:flex items-center gap-2 bg-rose-600 text-white hover:bg-rose-700 font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 text-sm"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Đăng ký dịch vụ
                    </button>
                    
                    <button
                        onClick={() => setShowModal(true)}
                        className="sm:hidden flex items-center justify-center w-12 h-12 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/20 active:scale-90"
                    >
                        <ShieldCheck className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {allMessages.map((m: any) => {
                        const isUser = m.role === 'user';
                        const text = getMessageText(m);
                        
                        return (
                            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                {!isUser && (
                                    <div className="mr-4 flex-shrink-0">
                                        <AivaLogo size={32} showText={false} glow={false} />
                                    </div>
                                )}

                                <div className={`max-w-[85%] rounded-[24px] px-6 py-4 text-[16px] leading-[1.6] shadow-sm transition-all hover:shadow-md ${
                                    isUser
                                        ? 'bg-cyan-500 text-white rounded-br-none glow-secondary'
                                        : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                                }`}>
                                    {text}
                                </div>

                                {isUser && (
                                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center ml-4 flex-shrink-0 shadow-inner">
                                        <User className="w-5 h-5 text-cyan-600" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex justify-start items-end animate-pulse">
                            <div className="mr-4 flex-shrink-0">
                                <AivaLogo size={32} showText={false} glow={false} />
                            </div>
                            <div className="bg-white border border-slate-100 rounded-[24px] rounded-bl-none px-6 py-5 shadow-sm flex gap-2 items-center">
                                <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="p-6 bg-transparent">
                <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute inset-0 bg-rose-500/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative bg-white border border-slate-200 rounded-[28px] p-2 shadow-xl shadow-slate-200/50 flex items-end gap-2 transition-all group-focus-within:border-rose-200 group-focus-within:ring-4 group-focus-within:ring-rose-500/5">
                        <textarea
                            className="flex-1 bg-transparent border-0 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none transition-all resize-none max-h-40 min-h-[56px] text-[16px] leading-relaxed"
                            placeholder="Mời bạn chia sẻ vấn đề cần hỗ trợ..."
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            rows={1}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="w-12 h-12 rounded-[20px] bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 hover:bg-rose-500 active:scale-90 disabled:opacity-30 disabled:hover:bg-rose-600 transition-all m-1"
                        >
                            <Send className="w-1.5 h-1.5 mr-0.5" /> {/* Use custom arrow or icon if needed */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                        </button>
                    </div>
                </div>
            </footer>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="relative z-10 w-full max-w-lg">
                        <ConsentForm
                            onSuccess={handleReferralSuccess}
                            onCancel={() => setShowModal(false)}
                            sessionId={messages.length > 0 ? messages[0].id : undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
