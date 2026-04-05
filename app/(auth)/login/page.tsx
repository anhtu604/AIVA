'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AivaLogo from '@/features/brand/AivaLogo';
import { Lock, Mail, Loader2, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            router.push('/staff');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Đã có lỗi xảy ra khi đăng nhập.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans selection:bg-rose-500/30">
            {/* Background Branding Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/5 blur-[150px] rounded-full" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center text-center mb-10 overflow-hidden">
                    <div className="transform hover:scale-105 transition-transform duration-500 mb-6">
                        <AivaLogo size={82} glow={true} />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[10px] mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                        AI System for HIV/AIDS Support
                    </p>
                </div>

                {/* Secure Login Card */}
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 opacity-50 group-focus-within:opacity-100 transition-opacity" />
                    
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Truy cập hệ thống</h2>
                        <p className="text-slate-500 text-sm font-medium italic">Chào mừng chuyên gia AIVA trở lại.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-2xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="email">
                                Danh tính (Email)
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-600 group-focus-within:text-rose-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="yourname@aiva.vn"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-slate-700 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-inner text-sm font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="password">
                                Mã bảo mật (Password)
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-600 group-focus-within:text-rose-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-slate-700 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-inner text-sm font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-black py-4.5 rounded-2xl shadow-xl shadow-rose-600/25 transition-all duration-300 flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:pointer-events-none group uppercase tracking-widest text-xs"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Xác thực & Vào Workspace</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Footer */}
                    <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-slate-600">
                             <Sparkles className="w-3.5 h-3.5" />
                             <span className="text-[9px] font-bold uppercase tracking-widest">Endorsed by AIVA Core v1.0.2</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-6">
                    <a href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-rose-500 transition-colors">Hỗ trợ kỹ thuật</a>
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <a href="/(public)/care" className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 hover:text-cyan-400 transition-colors underline underline-offset-4">AIVA Care (Public)</a>
                </div>
            </div>
        </div>
    );
}
