'use client';
import { ExternalLink, ServerCrash } from 'lucide-react';

export default function QuestionsPage() {
    return (
        <div className="h-full flex flex-col pt-10 px-8 items-center justify-center text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
                <ServerCrash className="w-10 h-10 text-rose-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Huấn Luyện AI Chuyển Đổi</h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Module Fine-tuning và Review QA đã được tích hợp vào công cụ Annotation & Hit Testing của <strong>Dify AI</strong>. Vui lòng đăng nhập vào Dify Backend để tiếp tục công việc huấn luyện.
            </p>
            <a 
                href={process.env.NEXT_PUBLIC_DIFY_URL || "https://cloud.dify.ai"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20"
            >
                Mở Dify Workspace <ExternalLink className="w-5 h-5" />
            </a>
        </div>
    );
}
