import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/features/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const adminName  = (user.user_metadata?.full_name as string | undefined) ?? null;
    const adminEmail = user.email ?? null;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
            <AdminSidebar adminName={adminName} adminEmail={adminEmail} />
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
