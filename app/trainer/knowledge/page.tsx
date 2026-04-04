'use client';

import { useState } from 'react';
import { BrainCircuit, FileText, Users, Send, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function KnowledgeIngestionPage() {
    const [title, setTitle] = useState('');
    const [targetRole, setTargetRole] = useState('AIVA Care Public');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const targetRoles = [
        "AIVA Care Public",
        "Staff CBO",
        "Staff VCT",
        "Admin",
        "Developer"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim()) {
            setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ tiêu đề và nội dung tài liệu.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/trainer/knowledge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    targetRole
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Server responded with an error');
            }

            setMessage({ type: 'success', text: `Nạp tri thức thành công! Đã tạo ${data.chunksCount} đoạn vector và lưu trữ an toàn.` });
            setTitle('');
            setContent('');
            
        } catch (error: any) {
            console.error('Submission error:', error);
            setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra trong quá trình gọi API.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
            {/* Background Decorations */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-1/4 -right-24 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                
                {/* Header Section */}
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-white/10 backdrop-blur-sm">
                        <BrainCircuit className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300">
                        Nạp Tri Thức AIVA
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
                        Chuyển đổi tài liệu văn bản thành không gian vector, trang bị kiến thức chuyên sâu cho trợ lý AI.
                    </p>
                </div>

                {/* Main Form Container */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/5 transition-all duration-300 hover:shadow-indigo-500/10">
                    
                    {/* Top Decorative Bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
                        
                        {/* Status Message */}
                        {message && (
                            <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-300 ${
                                message.type === 'error' 
                                    ? 'bg-red-500/10 text-red-300 border-red-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            }`}>
                                {message.type === 'error' ? (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                )}
                                <p>{message.text}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Title Field */}
                            <div className="space-y-2 group">
                                <label htmlFor="title" className="flex items-center text-sm font-medium text-slate-300 group-focus-within:text-indigo-300 transition-colors">
                                    <FileText className="w-4 h-4 mr-2 opacity-70" />
                                    Tiêu đề tài liệu
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-slate-100 placeholder-slate-500 outline-none hover:border-white/20"
                                    placeholder="Vd: Quy trình tư vấn VCT 2026..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            {/* Role Field */}
                            <div className="space-y-2 group">
                                <label htmlFor="targetRole" className="flex items-center text-sm font-medium text-slate-300 group-focus-within:text-indigo-300 transition-colors">
                                    <Users className="w-4 h-4 mr-2 opacity-70" />
                                    Vai trò (Target Role)
                                </label>
                                <div className="relative">
                                    <select
                                        id="targetRole"
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-slate-100 appearance-none outline-none hover:border-white/20 cursor-pointer"
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        disabled={loading}
                                    >
                                        {targetRoles.map((role) => (
                                            <option key={role} value={role} className="bg-slate-800 text-white">
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Field */}
                        <div className="space-y-2 group">
                            <div className="flex items-center justify-between">
                                <label htmlFor="content" className="flex items-center text-sm font-medium text-slate-300 group-focus-within:text-indigo-300 transition-colors">
                                    <Sparkles className="w-4 h-4 mr-2 opacity-70" />
                                    Nội dung tri thức
                                </label>
                                <span className="text-xs text-slate-500">Hỗ trợ Markdown / Text thuần</span>
                            </div>
                            <div className="relative rounded-xl overflow-hidden shadow-sm border border-white/10 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all hover:border-white/20 bg-black/20">
                                <div className="absolute left-0 inset-y-0 w-8 flex flex-col items-center py-3 border-r border-white/5 text-xs text-slate-600 bg-black/40 font-mono select-none">
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <div key={i} className="h-[24px] leading-[24px]">{i + 1}</div>
                                    ))}
                                </div>
                                <textarea
                                    id="content"
                                    rows={15}
                                    className="w-full pl-12 pr-4 py-3 bg-transparent border-0 focus:ring-0 text-slate-300 font-mono text-sm leading-[24px] resize-y outline-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                    placeholder="Dán nội dung tài liệu chuyên ngành vào đây..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    disabled={loading}
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center items-center py-4 px-6 rounded-xl text-base font-bold text-white overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] ${
                                    loading ? 'cursor-not-allowed opacity-90' : 'hover:-translate-y-0.5'
                                }`}
                            >
                                {/* Button Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 ${loading ? '' : 'bg-[length:200%_auto] group-hover:bg-[right_center] transition-[background-position] duration-500'}`} />
                                
                                <span className="relative flex items-center gap-3">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-white/90" />
                                            <span>Đang tạo Vector & Lưu trữ...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 text-indigo-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            <span>Xử lý & Nạp Tri Thức</span>
                                        </>
                                    )}
                                </span>
                            </button>
                            <p className="text-center text-xs text-slate-500 mt-4">
                                Bằng cách nhấp vào "Nạp Tri Thức", AI sẽ tự động chia nhỏ và tạo Embeddings theo chuẩn <strong>@google/text-embedding-004</strong>.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
