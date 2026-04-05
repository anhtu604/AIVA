import { ShieldAlert, Search, Filter, Activity, Server, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminLogsPage() {
    // ── Dữ liệu Mock ───────────────────────────────────────────────────────────
    const auditLogs = [
        {
            id: 'LOG-8842',
            timestamp: '2026-04-05 15:30:12',
            user: 'admin_tw_01@aiva.vn',
            action: 'UPDATE_ROLE',
            target: 'staff_vct_hcm@aiva.vn',
            status: 'success',
            ip: '113.161.x.x',
            risk: 'low'
        },
        {
            id: 'LOG-8843',
            timestamp: '2026-04-05 15:28:45',
            user: 'trainer_lead@aiva.vn',
            action: 'DISABLE_KNOWLEDGE_BASE',
            target: 'KB_ARV_2023_V1',
            status: 'success',
            ip: '115.79.x.x',
            risk: 'medium'
        },
        {
            id: 'LOG-8844',
            timestamp: '2026-04-05 15:15:00',
            user: 'unknown',
            action: 'FAILED_LOGIN_ATTEMPT',
            target: 'staff_opc_hn@aiva.vn',
            status: 'failed',
            ip: '103.226.x.x',
            risk: 'high'
        },
        {
            id: 'LOG-8845',
            timestamp: '2026-04-05 14:50:22',
            user: 'staff_cbo_dn@aiva.vn',
            action: 'VIEW_REFERRAL_DATA',
            target: 'REF-20260405-0019',
            status: 'success',
            ip: '14.248.x.x',
            risk: 'low'
        }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-950 p-8 overflow-y-auto">
            {/* Header */}
            <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Nhật ký Hệ thống (Audit Logs)</h1>
                        <p className="text-slate-400 text-sm mt-1 mb-0">Giám sát truy cập, phân quyền và thao tác dữ liệu nhạy cảm toàn nền tảng.</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-slate-300 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Làm mới
                </button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Tải hệ thống</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-extrabold text-white">24%</p>
                        <Server className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Cảnh báo An ninh</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-extrabold text-rose-500">1</p>
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Lượt truy vấn AI</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-extrabold text-white">1,492</p>
                        <p className="text-xs text-emerald-400 font-bold">+12% / giờ</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Ca chuyển tuyến</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-extrabold text-white">8</p>
                        <p className="text-xs text-slate-500 font-bold">Hôm nay</p>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Tìm theo ID, Tên người dùng hoặc Hành động..."
                        className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
                    />
                </div>
                <button className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
                    <Filter className="w-4 h-4" /> Lọc theo loại
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-800/50 text-xs uppercase font-bold text-slate-500 tracking-wider hidden md:table-header-group">
                            <tr>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Tài khoản thao tác</th>
                                <th className="px-6 py-4">Hành động</th>
                                <th className="px-6 py-4">Đối tượng bị ảnh hưởng</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {log.risk === 'high' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                                            <span className={`font-mono text-xs ${log.risk === 'high' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                                                {log.timestamp}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-200">{log.user}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">IP: {log.ip}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-400">{log.target}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {log.status === 'success' ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Hợp lệ
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-bold uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Cảnh báo
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    );
}
