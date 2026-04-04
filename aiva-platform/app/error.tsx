'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 text-center bg-slate-950">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/5">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>

            {/* Title */}
            <h2 className="text-white font-bold text-2xl mb-2">Đã xảy ra lỗi</h2>

            {/* Description */}
            <p className="text-slate-400 text-sm max-w-md mb-2">
                Trang bạn đang truy cập gặp sự cố không mong muốn. Đội ngũ kỹ thuật AIVA đã ghi nhận lỗi này.
            </p>

            {/* Error detail (dev-friendly) */}
            {error?.message && (
                <p className="text-slate-600 text-xs font-mono bg-slate-800/50 border border-white/5 rounded-lg px-4 py-2 max-w-lg truncate mb-6">
                    {error.message}
                </p>
            )}

            {/* Retry button */}
            <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            >
                <RefreshCw className="w-4 h-4" />
                Thử lại
            </button>

            {/* Digest for support */}
            {error?.digest && (
                <p className="text-slate-700 text-[10px] mt-4 font-mono">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    );
}
