-- 1. Bổ sung trường contact_phone bị thiếu vào bảng referrals
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- 2. Đảm bảo RLS đã được bật
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 3. Tạo Policy cho SELECT
-- Điều kiện: user đó là ADMIN hoặc có organization_id bằng với target_organization_id của phiếu.
DROP POLICY IF EXISTS "Cho phép xem Referral cùng tổ chức hoặc Admin" ON public.referrals;
CREATE POLICY "Cho phép xem Referral cùng tổ chức hoặc Admin" 
ON public.referrals
FOR SELECT
TO authenticated
USING (
    -- Kiểm tra nếu user là admin
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        JOIN public.roles r ON ur.role_id = r.id 
        WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
    )
    OR
    -- Kiểm tra organization_id của user hiện tại
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.organization_id = target_organization_id
    )
);

-- 4. Tạo Policy cho UPDATE
DROP POLICY IF EXISTS "Cho phép cập nhật Referral cùng tổ chức hoặc Admin" ON public.referrals;
CREATE POLICY "Cho phép cập nhật Referral cùng tổ chức hoặc Admin" 
ON public.referrals
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        JOIN public.roles r ON ur.role_id = r.id 
        WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.organization_id = target_organization_id
    )
);
