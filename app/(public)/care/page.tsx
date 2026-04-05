'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ConsentForm from '@/features/referrals/ConsentForm';
import { ShieldCheck, Send, User, Bot, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PublicCarePage() {
    const chatInstance = useMemo(() => new Chat({
        transport: new DefaultChatTransport({ api: '/api/public/chat' }),
    }), []);

    const { messages, sendMessage, status } = useChat({ chat: chatInstance });
    
    const [input, setInput] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isLoading = status === 'streaming' || status === 'submitted';

    const [localWelcome] = useState([{
        id: 'welcome',
        role: 'assistant' as const,
        content: 'Xin chào, tôi là trợ lý AI từ hệ thống AIVA. Tôi ở đây để lắng nghe và hỗ trợ bạn trong một không gian an toàn, hoàn toàn bảo mật. Bạn cần tư vấn điều gì hôm nay?',
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
        <div className="flex flex-col h-screen bg-white font-sans selection:bg-rose-500/20">
            {/* Clean Header — Minimal, warm, trustworthy */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="w-px h-6 bg-slate-100" />
                        <div className="flex items-center gap-2.5">
                            {/* Brand icon */}
                            <img src="/brand/logo-icon.png" alt="AIVA" width={28} height={28} className="flex-shrink-0" />
                            <div>
                                <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">AIVA Care</h1>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Đang trực tuyến</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-4 py-2 rounded-xl transition-all text-xs uppercase tracking-wider"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="hidden sm:inline">Kết nối chuyên gia</span>
                    </button>
                </div>
            </header>

            {/* Chat Area — Clean, spacious, accessible */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50 px-4 py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    {allMessages.map((m: any) => {
                        const isUser = m.role === 'user';
                        const text = getMessageText(m);
                        
                        return (
                            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end`}>
                                {!isUser && (
                                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mr-3 flex-shrink-0">
                                        <Bot className="w-4 h-4 text-rose-500" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
                                    isUser
                                        ? 'bg-slate-800 text-white rounded-br-sm'
                                        : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100 shadow-sm'
                                }`}>
                                    {text}
                                </div>

                                {isUser && (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ml-3 flex-shrink-0">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex justify-start items-end">
                            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <Bot className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-4 border border-slate-100 shadow-sm flex gap-1.5 items-center">
                                <div className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input — Simple floating bar */}
            <footer className="bg-white border-t border-slate-100 px-4 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-3 bg-slate-50 rounded-2xl p-2 border border-slate-200 focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200/50 transition-all">
                        <textarea
                            className="flex-1 bg-transparent border-0 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none resize-none max-h-32 min-h-[44px] text-[15px] leading-relaxed"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            rows={1}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 active:scale-90 disabled:opacity-30 transition-all flex-shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-center text-[11px] text-slate-400 mt-3">
                        Thông tin được bảo mật hoàn toàn · Không lưu trữ dữ liệu cá nhân
                    </p>
                </div>
            </footer>

            {/* Toast */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
                    <div className={`rounded-xl px-5 py-3 shadow-lg flex items-center gap-3 border text-sm font-bold ${
                        toast.type === 'success'
                            ? 'bg-white border-emerald-100 text-emerald-700'
                            : 'bg-white border-rose-100 text-rose-700'
                    }`}>
                        {toast.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Consent Form Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
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
