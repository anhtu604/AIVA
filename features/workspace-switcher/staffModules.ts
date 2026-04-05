import {
    Users,
    FlaskConical,
    HeartPulse,
    Microscope,
    BarChart2,
    Briefcase,
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
        slug:  'opc',
        label: 'OPC',
        description: 'Phòng khám Ngoại trú (ARV)',
        icon: HeartPulse,
        color: 'text-pink-400',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/30',
    },
    {
        slug:  'testing',
        label: 'Xét nghiệm Khẳng định',
        description: 'Hỗ trợ XNKĐ HIV',
        icon: Microscope,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
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
        slug:  'management',
        label: 'Quản lý',
        description: 'Lãnh đạo & Điều hành',
        icon: Briefcase,
        color: 'text-amber-600',
        bg: 'bg-amber-600/10',
        border: 'border-amber-600/30',
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
