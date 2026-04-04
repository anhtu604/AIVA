import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Tạo response ban đầu
  let supabaseResponse = NextResponse.next({
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
          // Update cookie cho request hiện tại (để supabase client có thể đọc ngay)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Tạo response mới với request đã update cookie
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Đặt cookie cho response trả về trình duyệt
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Gọi getUser() ĐỂ REFRESH TOKEN THEO TÀI LIỆU SUPABASE
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const protectedRoutes = ['/staff', '/trainer', '/admin']
  const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// KHÔNG CHẠY MIDDLEWARE CHO CÁC FILE TĨNH (TRÁNH LỖI VÀ TỐI ƯU HIỆU SUẤT)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
