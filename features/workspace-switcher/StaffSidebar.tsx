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
    LayoutDashboard,
    Settings,
    ShieldAlert,
    History
} from 'lucide-react';
import { STAFF_MODULES } from './staffModules';

interface StaffSidebarProps {
    staffName?: string | null;
    staffEmail?: string | null;
}

export default function StaffSidebar({ staffName, staffEmail }: StaffSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const displayName = staffName ?? staffEmail?.split('@')[0] ?? 'Staff Account';

    return (
        <aside
            className={`
                relative h-full flex flex-col
                bg-slate-950 border-r border-white/10
                transition-all duration-300 ease-in-out z-30
                ${collapsed ? 'w-[72px]' : 'w-68'}
            `}
        >
            {/* Enterprise Header */}
            <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/5 bg-slate-900/20 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/20 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                        <p className="text-white font-bold text-sm tracking-tight leading-none uppercase">AIVA Platform</p>
                        <p className="text-slate-500 text-[10px] mt-1.5 font-bold uppercase tracking-[0.1em]">Enterprise Suite</p>
                    </div>
                )}
            </div>

            {/* Navigation Grid (Data Dense) */}
            <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-none">
                {/* Section: Workspace */}
                <div className="space-y-1">
                    {!collapsed && (
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-3">
                            Làm việc
                        </p>
                    )}
                    {STAFF_MODULES.map((mod) => {
                        const isActive = pathname === `/staff/${mod.slug}` || pathname.startsWith(`/staff/${mod.slug}/`);
                        const Icon = mod.icon;
                        return (
                            <Link
                                key={mod.slug}
                                href={`/staff/${mod.slug}`}
                                title={collapsed ? mod.label : undefined}
                                className={`
                                    flex items-center gap-3 rounded-xl px-3 py-2.5
                                    transition-all duration-200 group relative
                                    ${isActive
                                        ? `bg-white/5 border border-white/10 text-white`
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? mod.color : 'group-hover:text-slate-200'}`} />
                                {!collapsed && (
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-semibold leading-none truncate">{mod.label}</p>
                                    </div>
                                )}
                                {isActive && (
                                    <div className="absolute right-0 h-4 w-1 bg-indigo-500 rounded-l-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Section: Management (Data Dense) */}
                <div className="space-y-1">
                    {!collapsed && (
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-3">
                            Quản trị viên
                        </p>
                    )}
                    
                    {/* Referrals List */}
                    {(() => {
                        const isActive = pathname === '/staff/referrals' || pathname.startsWith('/staff/referrals/');
                        return (
                            <Link
                                href="/staff/referrals"
                                title={collapsed ? 'Danh sách chuyển tuyến' : undefined}
                                className={`
                                    flex items-center gap-3 rounded-xl px-3 py-2.5
                                    transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <ClipboardList className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-indigo-400' : 'group-hover:text-slate-200'}`} />
                                {!collapsed && <span className="text-[13px] font-semibold">Hàng chờ chuyển tuyến</span>}
                            </Link>
                        );
                    })()}

                    {/* Placeholder Management Items for "Enterprise" feel */}
                    {!collapsed && (
                        <>
                            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 cursor-not-allowed opacity-50">
                                <History className="w-[18px] h-[18px]" />
                                <span className="text-[13px] font-semibold">Lịch sử hệ thống</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 cursor-not-allowed opacity-50">
                                <Settings className="w-[18px] h-[18px]" />
                                <span className="text-[13px] font-semibold">Cấu hình tham số</span>
                            </div>
                        </>
                    )}
                </div>
            </nav>

            {/* Enterprise Footer */}
            <div className="px-3 pb-6 pt-3 border-t border-white/5 bg-slate-900/10">
                {/* Account Identity */}
                {!collapsed && (
                    <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/5 mb-3 group hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-lg shadow-indigo-600/20">
                            {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] text-slate-200 font-bold leading-none truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-600 mt-1.5 font-medium truncate uppercase tracking-wider">{staffEmail ? 'Enterprise Staff' : 'System Admin'}</p>
                        </div>
                    </div>
                )}

                {/* Sign Out Action */}
                <form action="/api/auth/signout" method="POST">
                    <button
                        type="submit"
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-slate-500 hover:text-white hover:bg-rose-500 transition-all duration-300
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        {!collapsed && <span className="text-[13px] font-bold">Đăng xuất hệ thống</span>}
                    </button>
                </form>
            </div>

            {/* Structured Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 w-6 h-12 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all shadow-2xl z-40 group"
                aria-label={collapsed ? 'Mở rộng' : 'Thu gọn'}
            >
                {collapsed ? <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />}
            </button>
        </aside>
    );
}
