import {
    Users,
    FlaskConical,
    BarChart2,
    Megaphone,
    Headphones,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Module config (shared between server & client) ──────────────────────────
export interface StaffModuleConfig {
    slug:        string;
    label:       string;
    description: string;
    icon:        LucideIcon;
    color:       string;
    bg:          string;
    border:      string;
}

export const STAFF_MODULES: StaffModuleConfig[] = [
    {
        slug:  'cbo',
        label: 'CBO',
        description: 'Cộng đồng dựa vào tổ chức',
        icon: Users,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
    },
    {
        slug:  'vct',
        label: 'VCT',
        description: 'Tư vấn & Xét nghiệm tự nguyện',
        icon: FlaskConical,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
    },
    {
        slug:  'surveillance',
        label: 'Surveillance',
        description: 'Giám sát dịch tễ',
        icon: BarChart2,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
    },
    {
        slug:  'comms',
        label: 'Communications',
        description: 'Truyền thông sức khỏe',
        icon: Megaphone,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
    },
    {
        slug:  'it-support',
        label: 'IT Support',
        description: 'Hỗ trợ kỹ thuật',
        icon: Headphones,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
    },
];
