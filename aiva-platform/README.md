# 🛡️ AIVA Platform

> **AI for HIV/AIDS Virtual Assistant** — Hệ thống trợ lý AI hỗ trợ phòng chống HIV/AIDS, kết nối cộng đồng với dịch vụ y tế.

AIVA là một nền tảng serverless sử dụng AI để hỗ trợ toàn bộ chuỗi nghiệp vụ phòng chống HIV/AIDS: từ tư vấn ẩn danh cho cộng đồng, hỗ trợ nghiệp vụ cho nhân viên y tế, đến quản trị hệ thống và kiểm soát chất lượng.

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        AIVA Platform                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│   │  Public   │  │  Staff   │  │ Trainer  │  │  Admin   │      │
│   │  (Care)   │  │Workspace │  │ (RAG/QA) │  │ Console  │      │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│        │              │              │              │            │
│   ┌────▼──────────────▼──────────────▼──────────────▼────┐      │
│   │              Next.js 16 App Router                    │      │
│   │         (Serverless Functions + RSC)                  │      │
│   └────┬──────────────┬──────────────┬───────────────────┘      │
│        │              │              │                           │
│   ┌────▼────┐   ┌─────▼─────┐  ┌────▼─────┐                   │
│   │Vercel AI│   │ Supabase  │  │ Supabase │                   │
│   │  SDK    │   │   Auth    │  │ Database │                   │
│   │(stream) │   │  (RLS)    │  │ (pgvec)  │                   │
│   └────┬────┘   └───────────┘  └──────────┘                   │
│        │                                                        │
│   ┌────▼────────────────┐                                      │
│   │  LLM Provider       │                                      │
│   │  (Gemma 4 31B-IT)   │                                      │
│   └─────────────────────┘                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS 4 |
| **AI SDK** | Vercel AI SDK (`ai` v6 + `@ai-sdk/react` v3) |
| **LLM** | Gemma 4 31B-IT (via OpenAI-compatible API) |
| **Embeddings** | Google `text-embedding-004` (`@ai-sdk/google`) |
| **Auth** | Supabase Auth + SSR (`@supabase/ssr`) |
| **Database** | Supabase PostgreSQL + pgvector |
| **Security** | Row Level Security (RLS) + Middleware route protection |
| **Deploy** | Vercel (Serverless) |

---

## 🧩 Workspaces

### 1. 🟢 Public Care `/care`
- Chat ẩn danh với AI tư vấn sức khỏe (không cần đăng nhập)
- Consent flow + Chuyển tuyến (Referral) sang cơ sở y tế
- Streaming real-time qua `useChat` + `DefaultChatTransport`

### 2. 🔵 Staff Workspace `/staff/[module]`
- **5 module chuyên biệt**: CBO, VCT, Surveillance, Communications, IT Support
- Mỗi module có System Prompt riêng — AI trả lời đúng ngữ cảnh nghiệp vụ
- Sidebar collapse/expand, dynamic route switching
- **Hàng chờ Referral** (`/staff/referrals`): xem, tiếp nhận, hoàn thành ca chuyển tuyến

### 3. 🟡 Trainer `/trainer/knowledge`
- Nạp tri thức (RAG Ingestion): Upload tài liệu → Chunking → Embedding → Supabase pgvector
- QA Bot kiểm định chất lượng nội dung

### 4. 🔴 Admin Console `/admin`
- **Quản lý Đơn vị** (`/admin/organizations`): Xem danh sách đơn vị/địa bàn
- **Quản lý Tài khoản** (`/admin/users`): Phân quyền staff (ADMIN, TRAINER, STAFF_CBO, STAFF_VCT...)
- **QA Checklist** (`/admin/qa-checklist`): 28 kịch bản test trước go-live

---

## ⚙️ Thiết lập môi trường

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình biến môi trường

Tạo file `.env.local` ở gốc dự án:

```env
# ─── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# ─── LLM Provider (Gemma via OpenAI-compatible) ───────────
GEMMA_API_KEY=sk-your-gemma-api-key

# ─── Google AI (Embeddings) ───────────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key

# ─── App URL (cho redirect sau logout) ────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Biến | Bắt buộc | Mô tả |
|------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL của Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key cho client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key cho server-side admin operations |
| `GEMMA_API_KEY` | ✅ | API key cho Gemma 4 LLM |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ⚡ | Cần cho RAG Embedding (text-embedding-004) |
| `NEXT_PUBLIC_SITE_URL` | ⚡ | URL ứng dụng (default: localhost:3000) |

### 3. Cấu trúc Database (Supabase)

Cần tạo các bảng sau trong Supabase:

| Bảng | Mô tả |
|------|-------|
| `profiles` | Hồ sơ user (id, email, full_name, org_id) |
| `organizations` | Đơn vị/địa bàn (name, level, province, district) |
| `roles` | Vai trò hệ thống (ADMIN, TRAINER, STAFF_CBO...) |
| `user_roles` | Bảng nối user ↔ role (user_id, role_id) |
| `referrals` | Phiếu chuyển tuyến (contact_phone, risk_data, status) |
| `knowledge_documents` | Tài liệu tri thức RAG |
| `knowledge_embeddings` | Vector embeddings (pgvector) |

> ⚠️ **Quan trọng**: Cần bật Row Level Security (RLS) trên tất cả các bảng và thiết lập policies phù hợp.

---

## 🚀 Chạy dự án

### Development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

---

## 🌐 Deploy lên Vercel

### Cách 1: Vercel CLI

```bash
npx vercel
```

### Cách 2: GitHub Integration

1. Push code lên GitHub repository
2. Truy cập [vercel.com/new](https://vercel.com/new) → Import repository
3. Thêm **Environment Variables** (tất cả biến trong `.env.local`)
4. Bấm **Deploy**

### Cấu hình bổ sung

File `vercel.json` đã được cấu hình sẵn với:
- Security headers (X-Frame-Options, X-Content-Type-Options, HSTS...)
- CORS headers cho API routes

---

## 📁 Cấu trúc thư mục

```
aiva-platform/
├── app/
│   ├── (auth)/                  # Login / Register pages
│   ├── (public)/care/           # Public chat (AIVA Care)
│   ├── admin/                   # Admin Console
│   │   ├── organizations/       # Quản lý đơn vị
│   │   ├── users/               # Quản lý tài khoản & phân quyền
│   │   └── qa-checklist/        # Checklist kiểm thử
│   ├── staff/                   # Staff Workspace
│   │   ├── [module]/            # Dynamic module chat (CBO, VCT, ...)
│   │   └── referrals/           # Hàng chờ chuyển tuyến
│   ├── trainer/knowledge/       # RAG Knowledge Ingestion
│   ├── api/
│   │   ├── auth/signout/        # Sign out endpoint
│   │   ├── public/chat/         # Public chat API (no auth)
│   │   ├── staff/chat/          # Staff chat API (auth required)
│   │   └── trainer/knowledge/   # Knowledge upload API
│   ├── error.tsx                # Error boundary
│   └── global-error.tsx         # Root error boundary
├── features/
│   ├── admin/                   # AdminSidebar, UserManager
│   ├── referrals/               # ConsentForm, ReferralQueue
│   └── workspace-switcher/      # StaffSidebar, ChatArea, staffModules
├── services/
│   ├── ai/
│   │   ├── adapter/             # LLM provider (Gemma)
│   │   ├── orchestrator/        # AI voice generation
│   │   └── prompts/             # System prompts per module
│   ├── database/
│   │   ├── admin.ts             # Admin CRUD (orgs, users, roles)
│   │   ├── referrals.ts         # Referral create/read/update
│   │   └── organizations.ts     # Public org listing
│   └── retrieval/
│       └── ingest.ts            # RAG chunking + embedding
├── lib/supabase/                # Supabase client (SSR + browser)
├── middleware.ts                 # Route protection
└── vercel.json                  # Vercel deploy config
```

---

## 🧪 Kiểm thử

Truy cập `/admin/qa-checklist` để xem **28 kịch bản test** bao gồm:
- 🔐 Row Level Security (RLS)
- 💚 Consent & Referral Flow
- 🤖 AI Safety & Prompt Injection
- 🏢 Admin Console
- 📊 Knowledge Ingestion (RAG)
- 📱 UX / Responsive

---

## 📜 License

Private — AIVA Platform © 2026

---

<p align="center">
  <strong>Built with ❤️ for HIV/AIDS prevention in Vietnam</strong>
</p>
