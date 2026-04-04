'use client';

import { ShieldAlert, RefreshCw } from 'lucide-react';

/**
 * global-error.tsx: Bắt lỗi ở tầng root layout (bao gồm cả layout.tsx bị crash).
 * Next.js yêu cầu file này phải export <html> và <body> riêng.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="vi">
            <body className="bg-slate-950 text-white antialiased">
                <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-8 shadow-xl shadow-rose-500/5">
                        <ShieldAlert className="w-10 h-10 text-rose-400" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-extrabold tracking-tight mb-3">
                        Lỗi hệ thống nghiêm trọng
                    </h1>

                    {/* Description */}
                    <p className="text-slate-400 text-base max-w-lg mb-3">
                        Ứng dụng AIVA gặp sự cố ở tầng cốt lõi và không thể hiển thị giao diện bình thường.
                        Vui lòng thử lại hoặc liên hệ đội ngũ kỹ thuật nếu lỗi tiếp tục xảy ra.
                    </p>

                    {/* Error detail */}
                    {error?.message && (
                        <div className="text-slate-600 text-xs font-mono bg-slate-800/50 border border-white/5 rounded-lg px-4 py-2 max-w-lg truncate mb-8">
                            {error.message}
                        </div>
                    )}

                    {/* Retry button */}
                    <button
                        onClick={reset}
                        className="flex items-center gap-2.5 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Khởi động lại ứng dụng
                    </button>

                    {error?.digest && (
                        <p className="text-slate-700 text-[10px] mt-6 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    );
}
