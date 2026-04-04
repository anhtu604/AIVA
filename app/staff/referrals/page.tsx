import { getReferrals } from '@/services/database/referrals';
import ReferralQueue from '@/features/referrals/ReferralQueue';
import { AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Luôn fetch mới khi truy cập

export default async function StaffReferralsPage() {
    let referrals: Awaited<ReturnType<typeof getReferrals>> = [];
    let fetchError: string | null = null;

    try {
        referrals = await getReferrals();
    } catch (err: any) {
        fetchError = err.message ?? 'Không thể tải dữ liệu chuyển tuyến.';
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-950">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <h2 className="text-white font-bold text-lg mb-2">Lỗi tải dữ liệu</h2>
                <p className="text-slate-400 text-sm max-w-md">{fetchError}</p>
                <p className="text-slate-600 text-xs mt-3">
                    Kiểm tra cấu hình Supabase và chính sách RLS cho bảng <code className="text-slate-400">referrals</code>.
                </p>
            </div>
        );
    }

    return <ReferralQueue initialData={referrals} />;
}
