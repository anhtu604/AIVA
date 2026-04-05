'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AivaLogo from '@/features/brand/AivaLogo';
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
            {/* Enterprise Header with Brand Logo */}
            <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/5 bg-slate-900/20 ${collapsed ? 'justify-center' : ''}`}>
                <AivaLogo size={32} showText={!collapsed} glow={true} />
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
                        const activeColor = mod.slug === 'trinh-tu-nhap-lieu' ? 'text-rose-500' : 'text-cyan-400';
                        
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
                                <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? activeColor : 'group-hover:text-slate-200'}`} />
                                {!collapsed && (
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-semibold leading-none truncate">{mod.label}</p>
                                    </div>
                                )}
                                {isActive && (
                                    <div className={`absolute right-0 h-4 w-1 ${mod.slug === 'trinh-tu-nhap-lieu' ? 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.5)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'} rounded-l-full`} />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Section: Management */}
                <div className="space-y-1">
                    {!collapsed && (
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-3">
                            Quản trị viên
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
                                    ${isActive
                                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <ClipboardList className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-rose-400' : 'group-hover:text-slate-200'}`} />
                                {!collapsed && <span className="text-[13px] font-semibold">Hàng chờ chuyển tuyến</span>}
                            </Link>
                        );
                    })()}
                </div>
            </nav>

            {/* Enterprise Footer */}
            <div className="px-3 pb-6 pt-3 border-t border-white/5 bg-slate-900/10">
                {/* Account Identity */}
                {!collapsed && (
                    <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/5 mb-3 group hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-lg shadow-rose-600/20 uppercase">
                            {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] text-slate-200 font-bold leading-none truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-600 mt-1.5 font-medium truncate uppercase tracking-wider">AIVA Enterprise</p>
                        </div>
                    </div>
                )}

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

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 w-6 h-12 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all shadow-2xl z-40 group"
            >
                {collapsed ? <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />}
            </button>
        </aside>
    );
}
