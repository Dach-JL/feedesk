import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Protect the dashboard and student routes
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard')
    const isStudentPage = req.nextUrl.pathname.startsWith('/student')

    // If not authenticated, the `withAuth` wrapper automatically redirects to `signIn` wrapper config
    
    // Authorization rules
    if (isAuth) {
      if (isDashboardPage && token.role !== "admin") {
        return NextResponse.redirect(new URL('/student', req.url))
      }
      if (isStudentPage && token.role !== "student") {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = { matcher: ["/dashboard/:path*", "/student/:path*"] }
