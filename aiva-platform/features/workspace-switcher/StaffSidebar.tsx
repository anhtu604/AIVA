'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    LogOut,
    Bot,
    Dot,
    ClipboardList,
} from 'lucide-react';
import { STAFF_MODULES } from './staffModules';

// ─── Props ────────────────────────────────────────────────────────────────────
interface StaffSidebarProps {
    staffName?: string | null;
    staffEmail?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StaffSidebar({ staffName, staffEmail }: StaffSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const displayName = staffName ?? staffEmail?.split('@')[0] ?? 'Staff';

    return (
        <aside
            className={`
                relative h-full flex flex-col
                bg-slate-900 border-r border-white/5
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-[68px]' : 'w-64'}
            `}
        >
            {/* ── Brand ── */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-white font-bold text-sm leading-none tracking-wide">AIVA Platform</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 truncate">Staff Workspace</p>
                    </div>
                )}
            </div>

            {/* ── Module Navigation ── */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {!collapsed && (
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-3">
                        Modules
                    </p>
                )}
                {STAFF_MODULES.map((mod) => {
                    const isActive = pathname === `/staff/${mod.slug}` || pathname.startsWith(`/staff/${mod.slug}/`);
                    const Icon = mod.icon;
                    return (
                        <Link
                            key={mod.slug}
                            href={`/staff/${mod.slug}`}
                            title={collapsed ? `${mod.label} – ${mod.description}` : undefined}
                            className={`
                                flex items-center gap-3 rounded-xl px-3 py-2.5
                                transition-all duration-200 group
                                ${isActive
                                    ? `${mod.bg} border ${mod.border} text-white`
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                }
                                ${collapsed ? 'justify-center' : ''}
                            `}
                        >
                            <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? mod.color : 'group-hover:text-slate-200'}`} />
                            {!collapsed && (
                                <div className="min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">{mod.label}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate group-hover:text-slate-400 transition-colors">
                                        {mod.description}
                                    </p>
                                </div>
                            )}
                            {isActive && !collapsed && (
                                <Dot className={`w-4 h-4 flex-shrink-0 ml-auto ${mod.color}`} />
                            )}
                        </Link>
                    );
                })}

                {/* ── Quản lý ── */}
                <div className="pt-3 mt-2 border-t border-white/5">
                    {!collapsed && (
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">
                            Quản lý
                        </p>
                    )}
                    {(() => {
                        const isActive = pathname === '/staff/referrals' || pathname.startsWith('/staff/referrals/');
                        return (
                            <Link
                                href="/staff/referrals"
                                title={collapsed ? 'Danh sách chuyển tuyến' : undefined}
                                className={`
                                    flex items-center gap-3 rounded-xl px-3 py-2.5
                                    transition-all duration-200 group
                                    ${
                                        isActive
                                            ? 'bg-indigo-500/10 border border-indigo-500/30 text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <ClipboardList className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-slate-200'}`} />
                                {!collapsed && (
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium leading-none truncate">Danh sách chuyển tuyến</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors">Hàng chờ tiếp nhận</p>
                                    </div>
                                )}
                                {isActive && !collapsed && (
                                    <Dot className="w-4 h-4 flex-shrink-0 ml-auto text-indigo-400" />
                                )}
                            </Link>
                        );
                    })()}
                </div>
            </nav>

            {/* ── User footer ── */}
            <div className={`px-2 pb-4 pt-2 border-t border-white/5 space-y-1`}>
                {/* Staff identity */}
                {!collapsed && (
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold uppercase">
                            {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-slate-200 font-medium leading-none truncate">{displayName}</p>
                            {staffEmail && (
                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{staffEmail}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Logout */}
                <form action="/api/auth/signout" method="POST">
                    <button
                        type="submit"
                        title="Đăng xuất"
                        className={`
                            w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                            text-slate-400 hover:text-rose-400 hover:bg-rose-500/10
                            transition-colors duration-200 text-sm
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                </form>
            </div>

            {/* ── Collapse toggle ── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors shadow-lg z-10"
                aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </aside>
    );
}
