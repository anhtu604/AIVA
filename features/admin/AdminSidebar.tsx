'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Building2,
    Users,
    Shield,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Bot,
    Dot,
    ClipboardCheck,
    ScrollText,
} from 'lucide-react';

// ─── Nav items ────────────────────────────────────────────────────────────────
const ADMIN_NAV = [
    {
        slug:  'organizations',
        label: 'Quản lý Đơn vị',
        description: 'Danh sách đơn vị / địa bàn',
        icon:  Building2,
        color: 'text-teal-400',
        bg:    'bg-teal-500/10',
        border:'border-teal-500/30',
    },
    {
        slug:  'users',
        label: 'Quản lý Tài khoản',
        description: 'Nhân viên & Phân quyền',
        icon:  Users,
        color: 'text-indigo-400',
        bg:    'bg-indigo-500/10',
        border:'border-indigo-500/30',
    },
    {
        slug:  'logs',
        label: 'Nhật ký Hệ thống',
        description: 'Audit & Bảo mật',
        icon:  ScrollText,
        color: 'text-rose-400',
        bg:    'bg-rose-500/10',
        border:'border-rose-500/30',
    },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────
interface AdminSidebarProps {
    adminName?: string | null;
    adminEmail?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const displayName = adminName ?? adminEmail?.split('@')[0] ?? 'Admin';

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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-white font-bold text-sm leading-none tracking-wide">AIVA Platform</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 truncate">Admin Console</p>
                    </div>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {!collapsed && (
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-3">
                        Quản trị
                    </p>
                )}
                {ADMIN_NAV.map((item) => {
                    const isActive = pathname === `/admin/${item.slug}` || pathname.startsWith(`/admin/${item.slug}/`);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.slug}
                            href={`/admin/${item.slug}`}
                            title={collapsed ? item.label : undefined}
                            className={`
                                flex items-center gap-3 rounded-xl px-3 py-2.5
                                transition-all duration-200 group
                                ${isActive
                                    ? `${item.bg} border ${item.border} text-white`
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                }
                                ${collapsed ? 'justify-center' : ''}
                            `}
                        >
                            <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? item.color : 'group-hover:text-slate-200'}`} />
                            {!collapsed && (
                                <div className="min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">{item.label}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate group-hover:text-slate-400 transition-colors">
                                        {item.description}
                                    </p>
                                </div>
                            )}
                            {isActive && !collapsed && (
                                <Dot className={`w-4 h-4 flex-shrink-0 ml-auto ${item.color}`} />
                            )}
                        </Link>
                    );
                })}

                {/* ── Kiểm thử section ── */}
                <div className="pt-3 mt-2 border-t border-white/5">
                    {!collapsed && (
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">
                            Kiểm thử
                        </p>
                    )}
                    {(() => {
                        const isActive = pathname === '/admin/qa-checklist' || pathname.startsWith('/admin/qa-checklist/');
                        return (
                            <Link
                                href="/admin/qa-checklist"
                                title={collapsed ? 'QA Checklist' : undefined}
                                className={`
                                    flex items-center gap-3 rounded-xl px-3 py-2.5
                                    transition-all duration-200 group
                                    ${
                                        isActive
                                            ? 'bg-amber-500/10 border border-amber-500/30 text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <ClipboardCheck className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'group-hover:text-slate-200'}`} />
                                {!collapsed && (
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium leading-none truncate">QA Checklist</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors">Kiểm thử Pilot</p>
                                    </div>
                                )}
                                {isActive && !collapsed && (
                                    <Dot className="w-4 h-4 flex-shrink-0 ml-auto text-amber-400" />
                                )}
                            </Link>
                        );
                    })()}
                </div>
            </nav>

            {/* ── User footer ── */}
            <div className="px-2 pb-4 pt-2 border-t border-white/5 space-y-1">
                {!collapsed && (
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold uppercase">
                            {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-slate-200 font-medium leading-none truncate">{displayName}</p>
                            {adminEmail && (
                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{adminEmail}</p>
                            )}
                        </div>
                    </div>
                )}
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
