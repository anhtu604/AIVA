'use client';

import { useState, useTransition } from 'react';
import {
    ProfileWithRoles,
    Role,
    assignRole,
    removeRole,
    getProfilesWithRoles,
} from '@/services/database/admin';
import {
    Users,
    Shield,
    Building2,
    Calendar,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    Plus,
    X,
    RefreshCw,
    Search,
} from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────
interface UserManagerProps {
    initialProfiles: ProfileWithRoles[];
    availableRoles: Role[];
}

// ─── Role badge color ─────────────────────────────────────────────────────────
function getRoleBadgeStyle(role: string): string {
    const map: Record<string, string> = {
        ADMIN:            'bg-rose-500/15 border-rose-500/30 text-rose-400',
        TRAINER:          'bg-amber-500/15 border-amber-500/30 text-amber-400',
        STAFF_CBO:        'bg-violet-500/15 border-violet-500/30 text-violet-400',
        STAFF_VCT:        'bg-sky-500/15 border-sky-500/30 text-sky-400',
        STAFF_SURVEILLANCE:'bg-orange-500/15 border-orange-500/30 text-orange-400',
        STAFF_COMMS:      'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        STAFF_IT:         'bg-pink-500/15 border-pink-500/30 text-pink-400',
    };
    return map[role] ?? 'bg-white/5 border-white/10 text-slate-400';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserManager({ initialProfiles, availableRoles }: UserManagerProps) {
    const [profiles, setProfiles] = useState<ProfileWithRoles[]>(initialProfiles);
    const [search, setSearch]     = useState('');

    // Toast state
    const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Filter
    const filtered = profiles.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.email.toLowerCase().includes(q) ||
            (p.full_name ?? '').toLowerCase().includes(q) ||
            (p.org_name ?? '').toLowerCase().includes(q) ||
            p.roles.some((r) => r.toLowerCase().includes(q))
        );
    });

    // Refresh
    const [isRefreshing, startRefresh] = useTransition();
    const handleRefresh = () => {
        startRefresh(async () => {
            try {
                const fresh = await getProfilesWithRoles();
                setProfiles(fresh);
            } catch { /* silent */ }
        });
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-white/10">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl leading-none">Quản lý Tài khoản</h1>
                            <p className="text-slate-500 text-sm mt-1">{profiles.length} người dùng · Phân quyền theo vai trò</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>

                {/* ── Search ── */}
                <div className="relative mb-6">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên, email, đơn vị, vai trò..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
                    />
                </div>

                {/* ── User Cards ── */}
                <div className="space-y-3">
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center py-16 text-center">
                            <Users className="w-10 h-10 text-slate-700 mb-3" />
                            <p className="text-slate-500 font-medium">Không có kết quả</p>
                            <p className="text-slate-600 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm.</p>
                        </div>
                    )}
                    {filtered.map((profile) => (
                        <UserRow
                            key={profile.id}
                            profile={profile}
                            availableRoles={availableRoles}
                            onUpdated={(updated) => {
                                setProfiles((prev) => prev.map((p) => p.id === updated.id ? updated : p));
                            }}
                            showToast={showToast}
                        />
                    ))}
                </div>
            </div>

            {/* ── Toast ── */}
            {toast && (
                <div className="fixed top-6 right-6 z-50">
                    <div className={`
                        flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl border text-sm font-medium
                        ${toast.type === 'success'
                            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950 border-rose-500/30 text-rose-300'
                        }
                    `}>
                        {toast.type === 'success'
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            : <AlertCircle className="w-4 h-4 text-rose-400" />
                        }
                        {toast.msg}
                    </div>
                </div>
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════════
// Single user row
// ═══════════════════════════════════════════════════════════════════════════════
function UserRow({
    profile,
    availableRoles,
    onUpdated,
    showToast,
}: {
    profile: ProfileWithRoles;
    availableRoles: Role[];
    onUpdated: (p: ProfileWithRoles) => void;
    showToast: (msg: string, type: 'success' | 'error') => void;
}) {
    const [selectedRole, setSelectedRole] = useState('');
    const [isPending, startTransition]    = useTransition();

    const displayName = profile.full_name ?? profile.email.split('@')[0];
    const date = new Date(profile.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    // Roles not yet assigned
    const unassignedRoles = availableRoles.filter((r) => !profile.roles.includes(r.name));

    const handleAssign = () => {
        if (!selectedRole) return;

        startTransition(async () => {
            try {
                await assignRole(profile.id, selectedRole);
                onUpdated({ ...profile, roles: [...profile.roles, selectedRole] });
                showToast(`Đã gán "${selectedRole}" cho ${displayName}.`, 'success');
                setSelectedRole('');
            } catch (e: any) {
                showToast(e.message ?? 'Lỗi gán quyền.', 'error');
            }
        });
    };

    const handleRemove = (roleName: string) => {
        startTransition(async () => {
            try {
                await removeRole(profile.id, roleName);
                onUpdated({ ...profile, roles: profile.roles.filter((r) => r !== roleName) });
                showToast(`Đã gỡ "${roleName}" khỏi ${displayName}.`, 'success');
            } catch (e: any) {
                showToast(e.message ?? 'Lỗi gỡ quyền.', 'error');
            }
        });
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-slate-800/40 px-5 py-4 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-start gap-4 flex-wrap">
                {/* Avatar + Info */}
                <div className="flex items-center gap-3 min-w-[200px] flex-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold uppercase">
                        {displayName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-slate-200 font-medium text-sm leading-none truncate">{displayName}</p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">{profile.email}</p>
                    </div>
                </div>

                {/* Org */}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs min-w-[140px]">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{profile.org_name ?? <span className="text-slate-600 italic">Chưa gán</span>}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Calendar className="w-3 h-3" />
                    {date}
                </div>
            </div>

            {/* ── Roles section ── */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
                <Shield className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />

                {/* Current roles */}
                {profile.roles.length === 0 && (
                    <span className="text-slate-600 text-xs italic">Chưa có vai trò</span>
                )}
                {profile.roles.map((r) => (
                    <span
                        key={r}
                        className={`
                            inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold
                            tracking-wide border ${getRoleBadgeStyle(r)}
                        `}
                    >
                        {r}
                        <button
                            onClick={() => handleRemove(r)}
                            disabled={isPending}
                            className="hover:text-white transition-colors ml-0.5"
                            title={`Gỡ ${r}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                {/* Divider */}
                <div className="h-4 w-px bg-white/10 mx-1" />

                {/* Assign new role */}
                {isPending ? (
                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang xử lý…
                    </span>
                ) : unassignedRoles.length > 0 ? (
                    <>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                        >
                            <option value="">+ Thêm vai trò</option>
                            {unassignedRoles.map((r) => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                        {selectedRole && (
                            <button
                                onClick={handleAssign}
                                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
                            >
                                <Plus className="w-3 h-3" /> Cập nhật
                            </button>
                        )}
                    </>
                ) : (
                    <span className="text-slate-600 text-xs">Đã có đầy đủ vai trò</span>
                )}
            </div>
        </div>
    );
}
