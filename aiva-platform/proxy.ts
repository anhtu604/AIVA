import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Cập nhật request cookie
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Khởi tạo lại response
          response = NextResponse.next({
            request,
          })
          
          // Cập nhật cookie cho trình duyệt
          cookiesToSet.forEach(({ name, value, options }) => {
            // @ts-ignore - Ignore type error if Next.js version expects different options shape
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // QUAN TRỌNG: Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  // Logic chặn truy cập: Nếu chưa login mà vào /staff, /admin, /trainer thì về /login
  const isProtectedPath = ['/staff', '/admin', '/trainer'].some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// Cấu hình Matcher: Loại bỏ hoàn toàn các file tĩnh để tránh lỗi Edge
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}