import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StaffSidebar from '@/features/workspace-switcher/StaffSidebar';

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
    // ── Auth guard (server-side) ───────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // ── Lấy tên Staff từ metadata hoặc email ──────────────────────────────────
    const staffName  = (user.user_metadata?.full_name as string | undefined) ?? null;
    const staffEmail = user.email ?? null;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
            {/* ── Sidebar (Server Component truyền props xuống Client Component) ── */}
            <StaffSidebar staffName={staffName} staffEmail={staffEmail} />

            {/* ── Main content area ── */}
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
