import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TrainerSidebar from '@/features/trainer/TrainerSidebar';

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const trainerName  = (user.user_metadata?.full_name as string | undefined) ?? null;
    const trainerEmail = user.email ?? null;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
            <TrainerSidebar trainerName={trainerName} trainerEmail={trainerEmail} />
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
