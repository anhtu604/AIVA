import { getProfilesWithRoles, getAvailableRoles } from '@/services/database/admin';
import UserManager from '@/features/admin/UserManager';
import { AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    let profiles: Awaited<ReturnType<typeof getProfilesWithRoles>> = [];
    let roles: Awaited<ReturnType<typeof getAvailableRoles>> = [];
    let fetchError: string | null = null;

    try {
        [profiles, roles] = await Promise.all([
            getProfilesWithRoles(),
            getAvailableRoles(),
        ]);
    } catch (err: any) {
        fetchError = err.message ?? 'Không thể tải dữ liệu.';
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-950">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <h2 className="text-white font-bold text-lg mb-2">Lỗi tải dữ liệu</h2>
                <p className="text-slate-400 text-sm max-w-md text-center">{fetchError}</p>
                <p className="text-slate-600 text-xs mt-3">
                    Kiểm tra bảng <code className="text-slate-400">profiles</code>, <code className="text-slate-400">roles</code>, <code className="text-slate-400">user_roles</code> trong Supabase.
                </p>
            </div>
        );
    }

    return <UserManager initialProfiles={profiles} availableRoles={roles} />;
}
