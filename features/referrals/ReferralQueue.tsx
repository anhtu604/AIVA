'use client';

import { useState, useTransition } from 'react';
import {
    Referral,
    ReferralStatus,
    updateReferralStatus,
} from '@/services/database/referrals';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Star,
    Phone,
    Calendar,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Loader2,
} from 'lucide-react';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ReferralStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    PENDING: {
        label:  'Chờ tiếp nhận',
        color:  'text-amber-400',
        bg:     'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon:   <Clock className="w-3.5 h-3.5" />,
    },
    ACCEPTED: {
        label:  'Đã tiếp nhận',
        color:  'text-sky-400',
        bg:     'bg-sky-500/10',
        border: 'border-sky-500/30',
        icon:   <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    COMPLETED: {
        label:  'Hoàn thành',
        color:  'text-emerald-400',
        bg:     'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon:   <Star className="w-3.5 h-3.5" />,
    },
    REJECTED: {
        label:  'Từ chối',
        color:  'text-rose-400',
        bg:     'bg-rose-500/10',
        border: 'border-rose-500/30',
        icon:   <XCircle className="w-3.5 h-3.5" />,
    },
};

// ─── Next-action buttons per status ──────────────────────────────────────────
const STATUS_ACTIONS: Record<ReferralStatus, { label: string; next: ReferralStatus; variant: 'accent' | 'danger' | 'success' | 'neutral' }[]> = {
    PENDING:   [
        { label: 'Tiếp nhận',  next: 'ACCEPTED',  variant: 'accent'   },
        { label: 'Từ chối',    next: 'REJECTED',  variant: 'danger'   },
    ],
    ACCEPTED:  [
        { label: 'Hoàn thành', next: 'COMPLETED', variant: 'success'  },
        { label: 'Từ chối',    next: 'REJECTED',  variant: 'danger'   },
    ],
    COMPLETED: [],
    REJECTED:  [
        { label: 'Mở lại',     next: 'PENDING',   variant: 'neutral'  },
    ],
};

const ACTION_STYLES = {
    accent:  'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20',
    danger:  'bg-rose-600/80 hover:bg-rose-500 text-white shadow-rose-600/20',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20',
    neutral: 'bg-slate-600 hover:bg-slate-500 text-white shadow-slate-600/20',
};

// ─── Single card ─────────────────────────────────────────────────────────────
function ReferralCard({ referral, onUpdate }: { referral: Referral; onUpdate: (updated: Referral) => void }) {
    const [expanded, setExpanded]   = useState(false);
    const [error, setError]        = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const cfg     = STATUS_CONFIG[referral.status];
    const actions = STATUS_ACTIONS[referral.status];
    const shortId = referral.id.split('-')[0].toUpperCase();
    const date    = new Date(referral.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const riskEntries = referral.risk_data ? Object.entries(referral.risk_data) : [];

    const handleUpdate = (next: ReferralStatus) => {
        setError(null);
        startTransition(async () => {
            try {
                const updated = await updateReferralStatus(referral.id, next);
                onUpdate(updated);
            } catch (e: any) {
                setError(e.message ?? 'Lỗi cập nhật trạng thái.');
            }
        });
    };

    return (
        <div className={`
            rounded-2xl border bg-slate-800/60 backdrop-blur-sm overflow-hidden
            transition-all duration-200
            ${cfg.border}
        `}>
            {/* Card header */}
            <div className="flex items-start gap-3 px-5 py-4">
                {/* Status badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 border ${cfg.bg} ${cfg.border} ${cfg.color} mt-0.5`}>
                    {cfg.icon}
                    {cfg.label}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-white font-mono font-bold text-sm">#{shortId}</span>
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                            <Calendar className="w-3 h-3" /> {date}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                            <Phone className="w-3 h-3" />
                            <span className="font-mono">{referral.contact_phone}</span>
                        </span>
                    </div>

                    {/* Risk preview */}
                    {riskEntries.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <p className="text-slate-400 text-xs truncate">
                                {riskEntries.slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                {riskEntries.length > 2 && ` · +${riskEntries.length - 2} mục`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Expand toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-slate-500 hover:text-slate-200 transition-colors flex-shrink-0 mt-0.5"
                    aria-label="Xem chi tiết"
                >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Expanded detail: full risk_data */}
            {expanded && riskEntries.length > 0 && (
                <div className="mx-5 mb-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                    <p className="text-slate-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Thông tin nguy cơ
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {riskEntries.map(([k, v]) => (
                            <div key={k} className="flex gap-1.5">
                                <span className="text-slate-500 truncate capitalize">{k}:</span>
                                <span className="text-slate-300 font-medium truncate">{String(v)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error bar */}
            {error && (
                <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
                </div>
            )}

            {/* Action buttons */}
            {actions.length > 0 && (
                <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
                    {isPending ? (
                        <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang cập nhật…
                        </span>
                    ) : (
                        actions.map((action) => (
                            <button
                                key={action.next}
                                onClick={() => handleUpdate(action.next)}
                                disabled={isPending}
                                className={`
                                    px-3.5 py-1.5 rounded-lg text-xs font-semibold
                                    shadow-lg transition-all duration-150 hover:scale-105
                                    ${ACTION_STYLES[action.variant]}
                                `}
                            >
                                {action.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ReferralQueueProps {
    initialData: Referral[];
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReferralQueue({ initialData }: ReferralQueueProps) {
    const [referrals, setReferrals] = useState<Referral[]>(initialData);
    const [filter, setFilter]       = useState<ReferralStatus | 'ALL'>('ALL');
    const [isRefreshing, startRefresh] = useTransition();

    const handleUpdate = (updated: Referral) => {
        setReferrals((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    };

    // Client-side refresh via server action
    const handleRefresh = () => {
        startRefresh(async () => {
            try {
                const { getReferrals } = await import('@/services/database/referrals');
                const fresh = await getReferrals();
                setReferrals(fresh);
            } catch {
                // silent – keep existing data
            }
        });
    };

    const filtered = filter === 'ALL'
        ? referrals
        : referrals.filter((r) => r.status === filter);

    const countByStatus = (s: ReferralStatus) => referrals.filter((r) => r.status === s).length;

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-white/5 bg-slate-900/50">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none">Hàng chờ Chuyển tuyến</h1>
                        <p className="text-slate-500 text-xs mt-1">
                            {referrals.length} ca · RLS tự lọc theo đơn vị của bạn
                        </p>
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

                {/* Filter pills */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {(['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'] as const).map((s) => {
                        const isActive = filter === s;
                        const count    = s === 'ALL' ? referrals.length : countByStatus(s);
                        const cfg      = s !== 'ALL' ? STATUS_CONFIG[s] : null;
                        return (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`
                                    flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all
                                    ${isActive
                                        ? cfg
                                            ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                                            : 'bg-white/10 border-white/20 text-white'
                                        : 'bg-transparent border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
                                    }
                                `}
                            >
                                {cfg?.icon}
                                {s === 'ALL' ? 'Tất cả' : cfg!.label}
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-white/5'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── List ── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <CheckCircle2 className="w-10 h-10 text-slate-700 mb-3" />
                        <p className="text-slate-500 font-medium">Không có ca nào</p>
                        <p className="text-slate-600 text-sm mt-1">
                            {filter === 'ALL' ? 'Hàng chờ trống.' : `Không có ca nào ở trạng thái "${STATUS_CONFIG[filter as ReferralStatus]?.label}".`}
                        </p>
                    </div>
                ) : (
                    filtered.map((r) => (
                        <ReferralCard key={r.id} referral={r} onUpdate={handleUpdate} />
                    ))
                )}
            </div>
        </div>
    );
}
