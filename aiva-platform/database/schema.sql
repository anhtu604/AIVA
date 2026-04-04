-- Kích hoạt extension tạo UUID
create extension if not exists "uuid-ossp";

-- 1. ORGANIZATIONS (Đơn vị / Địa bàn)
create table public.organizations (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    level text not null check (level in ('TW', 'TINH', 'HUYEN', 'CBO', 'OPC', 'CSYT')),
    parent_id uuid references public.organizations(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROFILES (Tài khoản người dùng nội bộ)
create table public.profiles (
    id uuid references auth.users not null primary key,
    full_name text,
    organization_id uuid references public.organizations(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ROLES (Danh mục vai trò - ĐÃ BỔ SUNG FULL CẤU TRÚC)
create table public.roles (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique check (name in (
        'ADMIN', 'TRAINER', 
        'STAFF_CBO', 'STAFF_VCT', 'STAFF_OPC', 'STAFF_XNKD', 
        'STAFF_SURVEILLANCE', 'STAFF_MANAGEMENT', 'STAFF_COMMS', 'STAFF_IT'
    ))
);

-- 4. USER_ROLES (1 user có nhiều role)
create table public.user_roles (
    user_id uuid references public.profiles(id) on delete cascade not null,
    role_id uuid references public.roles(id) on delete cascade not null,
    primary key (user_id, role_id)
);

-- 5. REFERRALS (Luồng chuyển ca có xin Consent)
create table public.referrals (
    id uuid default uuid_generate_v4() primary key,
    session_id text not null,
    target_organization_id uuid references public.organizations(id),
    status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED')),
    consent_given boolean not null default false,
    risk_data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BẬT BẢO MẬT RLS (Sẽ viết policy ở GĐ3)
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.referrals enable row level security;
