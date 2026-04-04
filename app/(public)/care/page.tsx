'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ConsentForm from '@/features/referrals/ConsentForm';
import { ShieldCheck, Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: lấy text thuần từ một mảng parts của UIMessage
// UIMessage v3 không có `.content` mà có `.parts` (array of TextUIPart, etc.)
// ─────────────────────────────────────────────────────────────────────────────
function getTextFromMessage(message: { parts?: any[] }): string {
    if (!message.parts) return '';
    return message.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text ?? '')
        .join('');
}

export default function PublicCarePage() {
    // ── useChat API mới (ai-sdk v3): dùng Chat class + transport ──────────────────
    // Chat class nhận messages pre-seeded, useChat nhận chat instance
    const chatInstance = useMemo(() => new Chat({
        transport: new DefaultChatTransport({ api: '/api/public/chat' }),
        messages: [
            {
                id: 'welcome',
                role: 'assistant' as const,
                parts: [{ type: 'text' as const, text: 'Xin chào, tôi là AIVA Care. Tôi ở đây để lắng nghe, chia sẻ và hỗ trợ bạn trong một không gian an toàn, hoàn toàn bảo mật và không phán xét. Bạn đang gặp vấn đề gì về sức khỏe cần tư vấn?' }],
            }
        ]
    }), []);

    const { messages, sendMessage, status } = useChat({ chat: chatInstance });

    // Quản lý input thủ công vì useChat v3 không còn trả về input/handleInputChange
    const [input, setInput] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isLoading = status === 'streaming' || status === 'submitted';

    // Auto-scroll xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const showToastMsg = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleReferralSuccess = () => {
        setShowModal(false);
        showToastMsg('Cảm ơn bạn! Thông tin đã được chuyển tuyến an toàn. Chuyên gia sẽ sớm liên hệ với bạn.', 'success');
    };

    // Gửi tin nhắn theo API mới của @ai-sdk/react v3
    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        setInput('');
        await sendMessage({ text: trimmed });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans selection:bg-indigo-500/30">
            {/* Header / Navbar */}
            <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">AIVA Care</h1>
                            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Trợ lý hỗ trợ (Public)
                            </p>
                        </div>
                    </div>

                    {/* Desktop referral button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 px-4 py-2 rounded-full font-medium transition-colors text-sm"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Kết nối dịch vụ / Chuyển tuyến
                    </button>
                    {/* Mobile referral button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="sm:hidden flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full border border-indigo-200 transition-colors"
                        aria-label="Chuyển tuyến"
                    >
                        <ShieldCheck className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map(m => {
                        const msg = m as any;
                        const text = getTextFromMessage(msg);
                        const isUser = msg.role === 'user';
                        return (
                            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end`}>
                                {!isUser && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0 shadow-sm border border-indigo-200">
                                        <Bot className="w-4 h-4 text-indigo-600" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                                    isUser
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                                }`}>
                                    {text}
                                </div>

                                {isUser && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center ml-3 flex-shrink-0 border border-slate-300">
                                        <User className="w-4 h-4 text-slate-600" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex justify-start items-end">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0 border border-indigo-200">
                                <Bot className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="bg-white border-t border-slate-200 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="relative flex items-end gap-2">
                        <textarea
                            className="w-full bg-slate-100 border-0 rounded-2xl px-5 py-4 pr-14 text-slate-800 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none shadow-inner max-h-32 min-h-[56px] text-[15px]"
                            placeholder="Nhập tin nhắn để được tư vấn..."
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                // Auto-resize height
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
                            className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-xs flex items-center justify-center w-full gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Cần hỗ trợ chuyên sâu? Đăng ký kết nối dịch vụ
                        </button>
                    </div>
                </div>
            </footer>

            {/* Floating Toast Notification */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
                    <div className={`rounded-xl px-5 py-3 shadow-lg flex items-center gap-3 border ${
                        toast.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        {toast.type === 'success' ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Consent Form Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-lg">
                        <ConsentForm
                            onSuccess={handleReferralSuccess}
                            onCancel={() => setShowModal(false)}
                            sessionId={messages.length > 1 ? messages[1].id : undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
