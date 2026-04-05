'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient as createSsrClient } from '@/lib/supabase/server';

// Lazy-init admin client để tránh crash khi build (env vars chưa sẵn sàng)
let _supabaseAdmin: ReturnType<typeof createAdminClient> | null = null;

function getSupabaseAdmin() {
    if (!_supabaseAdmin) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        _supabaseAdmin = createAdminClient(url, key);
    }
    return _supabaseAdmin;
}

export interface ReferralPayload {
    sessionId?: string;
    targetOrgId: string;
    phone: string;
    consentGiven: boolean;
    riskData?: Record<string, any>;
}

export async function createReferral(payload: ReferralPayload) {
    if (!payload.consentGiven) {
        throw new Error("Người dùng chưa đồng ý chia sẻ thông tin (Consent is required).");
    }

    if (!payload.phone || !payload.targetOrgId) {
        throw new Error("Thiếu thông tin liên hệ hoặc thiếu thông tin Đơn vị tiếp nhận.");
    }

    // Insert dữ liệu
    const { data, error } = await getSupabaseAdmin()
        .from('referrals')
        .insert({
            session_id: payload.sessionId || null,
            target_organization_id: payload.targetOrgId,
            contact_phone: payload.phone,
            consent_given: payload.consentGiven,
            risk_data: payload.riskData || {},
            status: 'PENDING',
            created_at: new Date().toISOString()
        } as any)
        .select()
        .single();
    
    if (error) {
        console.error("Database Error inserting referral:", error);
        throw new Error("Không thể lưu phiếu chuyển tuyến: " + error.message);
    }

    return { success: true, data };
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';

export interface Referral {
    id: string;
    session_id: string | null;
    target_organization_id: string;
    contact_phone: string;
    consent_given: boolean;
    risk_data: Record<string, any>;
    status: ReferralStatus;
    created_at: string;
}

/**
 * Lấy danh sách các Referral cho đơn vị đang đăng nhập.
 * RLS của Supabase tự lọc dựa trên user session – không cần truyền org_id thủ công.
 */
export async function getReferrals(): Promise<Referral[]> {
    const supabase = await createSsrClient();

    const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getReferrals] DB error:', error);
        throw new Error('Không thể tải danh sách chuyển tuyến: ' + error.message);
    }

    return (data ?? []) as Referral[];
}

/**
 * Cập nhật trạng thái một Referral.
 * RLS đảm bảo staff chỉ cập nhật được các ca thuộc đơn vị của mình.
 */
export async function updateReferralStatus(
    id: string,
    status: ReferralStatus
): Promise<Referral> {
    if (!id) throw new Error('Thiếu ID của phiếu chuyển tuyến.');

    const supabase = await createSsrClient();

    const { data, error } = await supabase
        .from('referrals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[updateReferralStatus] DB error:', error);
        throw new Error('Không thể cập nhật trạng thái: ' + error.message);
    }

    return data as Referral;
}
