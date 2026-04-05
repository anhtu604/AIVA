import Link from "next/link";
import AivaLogo from "@/features/brand/AivaLogo";
import { ArrowRight, ShieldCheck, HeartHandshake, ShieldAlert, FileText, ChevronRight, Sparkles } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <AivaLogo size={32} showText={true} glow={false} />
                    <nav className="flex items-center gap-4">
                        <Link 
                            href="/login" 
                            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            Nhân viên
                        </Link>
                        <Link
                            href="/care"
                            className="text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-rose-600/20"
                        >
                            AIVA Care
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col">
                <section className="relative overflow-hidden pt-28 pb-36">
                    {/* Background decoration */}
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-rose-600/10 blur-[150px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-cyan-600/8 blur-[150px] rounded-full pointer-events-none" />
                    
                    <div className="container mx-auto px-6 flex flex-col items-center text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-slate-300 mb-10 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            AI System for HIV/AIDS Support
                        </div>

                        {/* Logo Hero - Central Brand Element */}
                        <div className="mb-10 transform hover:scale-105 transition-transform duration-500">
                            <AivaLogo size={100} showText={true} glow={true} />
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mb-6 leading-tight">
                            Đồng hành cùng bạn trong công tác <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400">
                                Phòng chống HIV/AIDS
                            </span>
                        </h1>
                        
                        <p className="text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed">
                            AIVA ứng dụng trí tuệ nhân tạo để hỗ trợ cộng đồng tư vấn ẩn danh, đồng thời giúp nhân viên y tế tối ưu quy trình tiếp cận, xét nghiệm và điều trị.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <Link
                                href="/care"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-rose-600 text-white font-bold hover:bg-rose-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-rose-600/25 text-sm uppercase tracking-wider"
                            >
                                <HeartHandshake className="w-5 h-5" />
                                Truy cập AIVA Care
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                            
                            <Link
                                href="/login"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 text-slate-200 font-bold border border-white/10 hover:bg-white/10 transition-all text-sm"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Dành cho Nhân viên
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-slate-900/50 border-t border-white/5">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-3">Nền tảng toàn diện</h2>
                            <p className="text-slate-500 font-medium">Ba trụ cột cốt lõi của hệ thống AIVA</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {/* Feature 1 */}
                            <div className="p-8 rounded-3xl bg-slate-950/50 border border-white/5 hover:border-rose-500/30 transition-all group hover:shadow-2xl hover:shadow-rose-500/5">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-primary">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-3">
                                    Tư vấn Ẩn danh
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    Đảm bảo riêng tư 100%. Chatbot AI hỗ trợ đánh giá nguy cơ và cung cấp thông tin y tế hoàn toàn bảo mật.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-8 rounded-3xl bg-slate-950/50 border border-white/5 hover:border-cyan-500/30 transition-all group hover:shadow-2xl hover:shadow-cyan-500/5">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-secondary">
                                    <HeartHandshake className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-3">
                                    Chuyển tuyến Nhanh chóng
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    Kết nối liền mạch từ tư vấn cộng đồng đến cơ sở y tế (CBO, VCT, OPC) với quy trình đồng thuận rõ ràng.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-8 rounded-3xl bg-slate-950/50 border border-white/5 hover:border-purple-500/30 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-3">
                                    Hỗ trợ Nghiệp vụ
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    Không gian làm việc chuyên biệt cho từng module: CBO, VCT, Giám sát và Truyền thông.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-slate-950 py-10 mt-auto">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AivaLogo size={24} showText={false} glow={false} />
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} AIVA Platform
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/care" className="text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest">
                            AIVA Care
                        </Link>
                        <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                            Staff Login <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
