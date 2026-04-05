'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Library,
    MessageSquareWarning,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sparkles,
    GraduationCap
} from 'lucide-react';
import AivaLogo from '@/features/brand/AivaLogo';

// ─── Nav items ────────────────────────────────────────────────────────────────
const TRAINER_NAV = [
    {
        slug:  'knowledge',
        label: 'Kho tri thức',
        description: 'Tài liệu & Prompt mẫu',
        icon:  Library,
        color: 'text-emerald-400',
        bg:    'bg-emerald-500/10',
        border:'border-emerald-500/30',
    },
    {
        slug:  'questions',
        label: 'Cơ chế Hỏi ngược',
        description: 'Câu hỏi chờ Trainer',
        icon:  MessageSquareWarning,
        color: 'text-amber-400',
        bg:    'bg-amber-500/10',
        border:'border-amber-500/30',
    },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────
interface TrainerSidebarProps {
    trainerName?: string | null;
    trainerEmail?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TrainerSidebar({ trainerName, trainerEmail }: TrainerSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const displayName = trainerName ?? trainerEmail?.split('@')[0] ?? 'Trainer';

    return (
        <aside
            className={`
                relative h-full flex flex-col
                bg-slate-900 border-r border-white/5
                transition-all duration-300 ease-in-out z-30
                ${collapsed ? 'w-[72px]' : 'w-68'}
            `}
        >
            {/* ── Brand ── */}
            <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/5 bg-slate-800/50 ${collapsed ? 'justify-center' : ''}`}>
                <AivaLogo size={32} variant={collapsed ? 'icon' : 'full'} />
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-none">
                <div className="space-y-1">
                    {!collapsed && (
                        <div className="flex items-center justify-between px-3 mb-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                Trainer Workspace
                            </p>
                            <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                Core
                            </span>
                        </div>
                    )}
                    {TRAINER_NAV.map((item) => {
                        const isActive = pathname === `/trainer/${item.slug}` || pathname.startsWith(`/trainer/${item.slug}/`);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.slug}
                                href={`/trainer/${item.slug}`}
                                title={collapsed ? item.label : undefined}
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
                                <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? item.color : 'group-hover:text-slate-200'}`} />
                                {!collapsed && (
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-semibold leading-none truncate">{item.label}</p>
                                        <p className="text-[11px] text-slate-500 mt-1 truncate group-hover:text-slate-400 transition-colors">
                                            {item.description}
                                        </p>
                                    </div>
                                )}
                                {isActive && (
                                    <div className={`absolute right-0 h-4 w-1 bg-gradient-to-b from-transparent via-white to-transparent rounded-l-full`} />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* ── User footer ── */}
            <div className="px-3 pb-6 pt-3 border-t border-white/5 bg-slate-900/10">
                {!collapsed && (
                    <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/5 mb-3 group hover:bg-white/10 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-emerald-600/20">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] text-slate-200 font-bold leading-none truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-500 mt-1.5 font-medium truncate uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                AI Trainer
                            </p>
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

            {/* ── Collapse toggle ── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 w-6 h-12 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all shadow-2xl z-40 group"
            >
                {collapsed ? <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />}
            </button>
        </aside>
    );
}
