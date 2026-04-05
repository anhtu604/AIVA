import { AlertTriangle, Clock, CheckCircle2, Search, Filter } from 'lucide-react';

export default function TrainerQuestionsPage() {
    // ── Dữ liệu Mock ───────────────────────────────────────────────────────────
    const pendingQuestions = [
        {
            id: 'Q-001',
            context: 'AIVA Care (Tư vấn ẩn danh)',
            question: 'Bệnh nhân hỏi về tương tác thuốc giữa ARV (Acriptega) và một số loại thuốc bổ gan mọc không rõ nguồn gốc. Hệ thống thiếu dữ liệu dược lý chi tiết về thuốc nam này để đưa ra câu trả lời an toàn.',
            priority: 'Cao (Rủi ro lâm sàng)',
            time: '10 phút trước',
            status: 'pending'
        },
        {
            id: 'Q-002',
            context: 'AIVA IT Support (Trợ giúp phần mềm)',
            question: 'Staff OPC hỏi cách khôi phục lại mật khẩu tài khoản hệ thống HMED nhưng tài liệu HDSD hiện tại đã cũ và mô tả quy trình khác với thực tế hệ thống hiện tại.',
            priority: 'Vừa',
            time: '45 phút trước',
            status: 'pending'
        },
        {
            id: 'Q-003',
            context: 'AIVA Communications (Truyền thông)',
            question: 'Staff Truyền thông yêu cầu tạo bài đăng mạng xã hội về sự kiện "U=U" với cách tiếp cận dành riêng cho nhóm tôn giáo bảo thủ. Hệ thống hỏi ngược lại Trainer để xác định ranh giới ngôn từ phù hợp trước khi sinh nội dung.',
            priority: 'Thấp',
            time: '2 giờ trước',
            status: 'pending'
        }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-950 p-8 overflow-y-auto">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Cơ chế Hỏi ngược (AI Fallback)</h1>
                        <p className="text-slate-400 text-sm mt-1 mb-0">Quản lý và giải đáp các câu hỏi mà AI nhận định thiếu tri thức hoặc có rủi ro.</p>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] -mr-10 -mt-10 rounded-full" />
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Chờ trả lời</p>
                    <p className="text-4xl font-extrabold text-white mt-2">12</p>
                    <p className="text-xs text-amber-500 font-bold mt-2 flex items-center gap-1.5 flex-wrap"><AlertTriangle className="w-3 h-3" /> 3 câu hỏi rủi ro cao</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -mr-10 -mt-10 rounded-full" />
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Đã cập nhật (Hôm nay)</p>
                    <p className="text-4xl font-extrabold text-white mt-2">45</p>
                    <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> AI đã học thành công</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] -mr-10 -mt-10 rounded-full" />
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Lỗ hổng tri thức</p>
                    <p className="text-4xl font-extrabold text-white mt-2">2</p>
                    <p className="text-xs text-sky-400 font-bold mt-2 flex items-center gap-1.5">Mảng "Triệu chứng lâm sàng" & "Quy trình HMED"</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-200">Danh sách cần học bổ sung</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
                        <Filter className="w-4 h-4" /> Lọc
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {pendingQuestions.map((q) => (
                    <div key={q.id} className="bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-amber-500/30 transition-colors group">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${
                                    q.priority.includes('Cao') ? 'bg-rose-500/20 text-rose-400' :
                                    q.priority === 'Vừa' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-slate-700 text-slate-300'
                                }`}>
                                    Ưu tiên: {q.priority}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> {q.time}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                {q.context}
                            </span>
                        </div>
                        <h3 className="text-[15px] font-medium text-slate-200 leading-relaxed mb-6">
                            {q.question}
                        </h3>
                        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                            <button className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
                                Gắn tài liệu bổ sung
                            </button>
                            <button className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2">
                                Soạn câu trả lời chuẩn (SOP)
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10 py-10">
                <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">Không còn câu hỏi chờ phê duyệt nào khác.</p>
            </div>
        </div>
    );
}
