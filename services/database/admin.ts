'use server';

import { createClient } from '@/lib/supabase/server';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Organization {
    id: string;
    name: string;
    level: string;       // OPC | CSYT | CBO | ...
    province?: string;
    district?: string;
    created_at: string;
}

export interface Role {
    id: string;
    name: string;        // ADMIN | TRAINER | STAFF_CBO | STAFF_VCT | ...
    description?: string;
}

export interface ProfileWithRoles {
    id: string;
    email: string;
    full_name: string | null;
    org_id: string | null;
    org_name: string | null;
    roles: string[];           // Array of role names
    created_at: string;
}

// ─── Hàm 1: Lấy danh sách đơn vị ────────────────────────────────────────────
export async function getOrganizations(): Promise<Organization[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

    if (error) {
        console.error('[admin/getOrganizations]', error);
        throw new Error('Không thể tải danh sách đơn vị: ' + error.message);
    }

    return (data ?? []) as Organization[];
}

// ─── Hàm 2: Lấy danh sách user + roles ───────────────────────────────────────
export async function getProfilesWithRoles(): Promise<ProfileWithRoles[]> {
    const supabase = await createClient();

    // Lấy profiles kèm join organizations (lấy tên đơn vị)
    const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            full_name,
            org_id,
            created_at,
            organizations ( name )
        `)
        .order('created_at', { ascending: false });

    if (profileErr) {
        console.error('[admin/getProfilesWithRoles] profiles:', profileErr);
        throw new Error('Không thể tải danh sách tài khoản: ' + profileErr.message);
    }

    // Lấy tất cả user_roles join roles
    const { data: userRoles, error: urErr } = await supabase
        .from('user_roles')
        .select(`
            user_id,
            roles ( name )
        `);

    if (urErr) {
        console.error('[admin/getProfilesWithRoles] user_roles:', urErr);
        // Không throw—chỉ trả roles trống
    }

    // Group roles by user_id
    const rolesMap = new Map<string, string[]>();
    if (userRoles) {
        for (const ur of userRoles as any[]) {
            const userId = ur.user_id as string;
            const roleName = (ur.roles as any)?.name as string | undefined;
            if (roleName) {
                const existing = rolesMap.get(userId) ?? [];
                existing.push(roleName);
                rolesMap.set(userId, existing);
            }
        }
    }

    return (profiles ?? []).map((p: any) => ({
        id:         p.id,
        email:      p.email ?? '',
        full_name:  p.full_name ?? null,
        org_id:     p.org_id ?? null,
        org_name:   (p.organizations as any)?.name ?? null,
        roles:      rolesMap.get(p.id) ?? [],
        created_at: p.created_at,
    }));
}

// ─── Hàm 3: Danh sách roles khả dụng ─────────────────────────────────────────
export async function getAvailableRoles(): Promise<Role[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

    if (error) {
        console.error('[admin/getAvailableRoles]', error);
        throw new Error('Không thể tải danh sách vai trò: ' + error.message);
    }

    return (data ?? []) as Role[];
}

// ─── Hàm 4: Gán vai trò cho user ─────────────────────────────────────────────
export async function assignRole(userId: string, roleName: string): Promise<void> {
    if (!userId || !roleName) {
        throw new Error('Thiếu userId hoặc roleName.');
    }

    const supabase = await createClient();

    // 1. Tìm role_id từ bảng roles
    const { data: role, error: roleErr } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

    if (roleErr || !role) {
        throw new Error(`Không tìm thấy vai trò "${roleName}": ${roleErr?.message ?? 'unknown'}`);
    }

    // 2. Kiểm tra đã tồn tại chưa để tránh duplicate
    const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', role.id)
        .maybeSingle();

    if (existing) {
        // Đã có rồi — không cần insert lại
        return;
    }

    // 3. Insert
    const { error: insertErr } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: role.id });

    if (insertErr) {
        console.error('[admin/assignRole] insert:', insertErr);
        throw new Error('Không thể gán vai trò: ' + insertErr.message);
    }
}

// ─── Hàm 5: Xóa vai trò khỏi user ───────────────────────────────────────────
export async function removeRole(userId: string, roleName: string): Promise<void> {
    if (!userId || !roleName) {
        throw new Error('Thiếu userId hoặc roleName.');
    }

    const supabase = await createClient();

    // Tìm role_id
    const { data: role, error: roleErr } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

    if (roleErr || !role) {
        throw new Error(`Không tìm thấy vai trò "${roleName}".`);
    }

    const { error: delErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', role.id);

    if (delErr) {
        console.error('[admin/removeRole]', delErr);
        throw new Error('Không thể xoá vai trò: ' + delErr.message);
    }
}
