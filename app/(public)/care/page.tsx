'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ConsentForm from '@/features/referrals/ConsentForm';
import { ShieldCheck, Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';

export default function PublicCarePage() {
    // ── useChat API v3 (v6) với DefaultChatTransport ──────────────────────────
    const chatInstance = useMemo(() => new Chat({
        transport: new DefaultChatTransport({ api: '/api/public/chat' }),
    }), []);

    const { messages, sendMessage, status } = useChat({ chat: chatInstance });
    
    // Quản lý input thủ công (spec của v3 không có input/handleInputChange)
    const [input, setInput] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isLoading = status === 'streaming' || status === 'submitted';

    // Tin nhắn chào mừng cục bộ (Local only, not sent to server)
    const [localWelcome] = useState([{
        id: 'welcome',
        role: 'assistant' as const,
        content: 'Xin chào, tôi là AIVA Care. Tôi ở đây để lắng nghe, chia sẻ và hỗ trợ bạn trong một không gian an toàn, hoàn toàn bảo mật và không phán xét. Bạn đang gặp vấn đề gì về sức khỏe cần tư vấn?',
    }]);

    // Gộp tin nhắn chào mừng và tin nhắn từ SDK
    const allMessages = useMemo(() => {
        const sdkIds = new Set(messages.map((m: any) => m.id));
        const welcomeFiltered = localWelcome.filter(m => !sdkIds.has(m.id));
        return [...welcomeFiltered, ...messages];
    }, [messages, localWelcome]);

    // Auto-scroll xuống cuối
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allMessages]);

    const showToastMsg = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleReferralSuccess = () => {
        setShowModal(false);
        showToastMsg('Cảm ơn bạn! Thông tin đã được chuyển tuyến an toàn. Chuyên gia sẽ sớm liên hệ với bạn.', 'success');
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput('');
        
        // Reset height của textarea
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

    // Helper: Lấy text từ message (v3 có thể có content hoặc parts)
    const getMessageText = (m: any) => {
        if (typeof m.content === 'string') return m.content;
        if (Array.isArray(m.parts)) {
            return m.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text || '')
                .join('');
        }
        return '';
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans selection:bg-indigo-500/30">
            {/* Header: Clean & Airy */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group transition-transform hover:scale-105 duration-300">
                            <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">AIVA Care</h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Trực tiếp hỗ trợ</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-sm"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Kết nối chuyên gia
                    </button>
                    
                    <button
                        onClick={() => setShowModal(true)}
                        className="sm:hidden flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-90"
                    >
                        <ShieldCheck className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Chat Area: Focus and Whitespace */}
            <main className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {allMessages.map((m: any) => {
                        const isUser = m.role === 'user';
                        const text = getMessageText(m);
                        
                        return (
                            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                {!isUser && (
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                                        <Bot className="w-5 h-5 text-indigo-500" />
                                    </div>
                                )}

                                <div className={`max-w-[85%] rounded-[24px] px-6 py-4 text-[16px] leading-[1.6] shadow-sm transition-all hover:shadow-md ${
                                    isUser
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                                }`}>
                                    {text}
                                </div>

                                {isUser && (
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center ml-4 flex-shrink-0 shadow-inner">
                                        <User className="w-5 h-5 text-indigo-600" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Typing Indicator */}
                    {isLoading && (
                        <div className="flex justify-start items-end animate-pulse">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                                <Bot className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div className="bg-white border border-slate-100 rounded-[24px] rounded-bl-none px-6 py-5 shadow-sm flex gap-2 items-center">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area: Floating Bar style */}
            <footer className="p-6 bg-transparent">
                <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative bg-white border border-slate-200 rounded-[28px] p-2 shadow-xl shadow-slate-200/50 flex items-end gap-2 transition-all group-focus-within:border-indigo-200 group-focus-within:ring-4 group-focus-within:ring-indigo-500/5">
                        <textarea
                            className="flex-1 bg-transparent border-0 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none transition-all resize-none max-h-40 min-h-[56px] text-[16px] leading-relaxed"
                            placeholder="Mời bạn chia sẻ vấn đề cần tư vấn..."
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
                            className="w-12 h-12 rounded-[20px] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-90 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all m-1"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Đăng ký kết nối dịch vụ chuyên sâu
                        </button>
                    </div>
                </div>
            </footer>

            {/* Post-login/Action Toast */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4 border ${
                        toast.type === 'success'
                            ? 'bg-white border-emerald-100 text-emerald-800'
                            : 'bg-white border-rose-100 text-rose-800'
                    }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                            {toast.type === 'success' ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        <span className="text-sm font-bold tracking-tight">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Consent Form Modal: Clean style */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-lg animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
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
