import { getOrganizations } from '@/services/database/admin';
import { Building2, MapPin, AlertCircle, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrganizationsPage() {
    let organizations: Awaited<ReturnType<typeof getOrganizations>> = [];
    let fetchError: string | null = null;

    try {
        organizations = await getOrganizations();
    } catch (err: any) {
        fetchError = err.message ?? 'Không thể tải dữ liệu.';
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-950">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <h2 className="text-white font-bold text-lg mb-2">Lỗi tải dữ liệu</h2>
                <p className="text-slate-400 text-sm max-w-md text-center">{fetchError}</p>
            </div>
        );
    }

    // Group by level for stats
    const levelCounts: Record<string, number> = {};
    organizations.forEach((o) => {
        levelCounts[o.level] = (levelCounts[o.level] ?? 0) + 1;
    });

    return (
        <div className="h-full overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-white/10">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* ── Header ── */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl leading-none">Quản lý Đơn vị</h1>
                        <p className="text-slate-500 text-sm mt-1">{organizations.length} đơn vị / địa bàn đã đăng ký</p>
                    </div>
                </div>

                {/* ── Level Stats ── */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    {Object.entries(levelCounts).map(([level, count]) => (
                        <div key={level} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-300 font-semibold">{level}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{count}</span>
                        </div>
                    ))}
                </div>

                {/* ── Table ── */}
                <div className="rounded-2xl border border-white/5 bg-slate-800/40 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-800/60">
                                    <th className="text-left px-5 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">Tên đơn vị</th>
                                    <th className="text-left px-5 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">Cấp</th>
                                    <th className="text-left px-5 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">Tỉnh / TP</th>
                                    <th className="text-left px-5 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">Quận / Huyện</th>
                                    <th className="text-left px-5 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {organizations.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                                            Chưa có đơn vị nào. Hãy INSERT dữ liệu vào bảng <code className="text-slate-400">organizations</code>.
                                        </td>
                                    </tr>
                                )}
                                {organizations.map((org) => (
                                    <tr key={org.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                                                </div>
                                                <span className="text-slate-200 font-medium">{org.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide bg-white/5 border border-white/10 text-slate-300">
                                                {org.level}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400">
                                            {org.province ? (
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{org.province}</span>
                                            ) : (
                                                <span className="text-slate-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400">{org.district ?? <span className="text-slate-600">—</span>}</td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{org.id.split('-')[0]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
