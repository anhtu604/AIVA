import Link from "next/link";
import { ArrowRight, ShieldCheck, HeartHandshake, ShieldAlert, FileText, ChevronRight } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HeartHandshake className="w-6 h-6 text-sky-500" />
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            AIVA
                        </span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link 
                            href="/login" 
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/care"
                            className="text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-full transition-all active:scale-95"
                        >
                            AIVA Care
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col">
                <section className="relative overflow-hidden pt-24 pb-32">
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-500/20 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="container mx-auto px-6 flex flex-col items-center text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 mb-8">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                            </span>
                            Nền tảng trợ lý ảo AI Y tế
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mb-6">
                            Đồng hành cùng bạn trong công tác <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                                Phòng chống HIV/AIDS
                            </span>
                        </h1>
                        
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
                            AIVA ứng dụng trí tuệ nhân tạo để hỗ trợ cộng đồng tư vấn ẩn danh, đồng thời giúp nhân viên y tế tối ưu quy trình tiếp cận, xét nghiệm và điều trị.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <Link
                                href="/care"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
                            >
                                <HeartHandshake className="w-5 h-5" />
                                Truy cập AIVA Care
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                            
                            <Link
                                href="/login"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Dành cho Nhân viên
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Feature 1 */}
                            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-sky-500/30 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                    Tư vấn Ẩn danh
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Đảm bảo riêng tư 100%. Chatbot AI hỗ trợ đánh giá nguy cơ và cung cấp thông tin y tế hoàn toàn bảo mật.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <HeartHandshake className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                    Chuyển tuyến Nhanh chóng
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Kết nối liền mạch từ tư vấn cộng đồng đến cơ sở y tế (CBO, VCT, OPC) với quy trình đồng thuận rõ ràng.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                    Hỗ trợ Nghiệp vụ
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Không gian làm việc chuyên biệt (Workspace) cho từng module: CBO, VCT, Giám sát và Truyền thông.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 mt-auto">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        &copy; {new Date().getFullYear()} AIVA Platform. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/admin/qa-checklist" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                            QA Testing
                        </Link>
                        <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                            Staff Login <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
