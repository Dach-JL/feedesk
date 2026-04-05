import { withAuth } from "next-auth/middleware"

// Protect the dashboard routes
// Any user hitting /dashboard without a valid session gets redirected to /login
export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = { matcher: ["/dashboard/:path*"] }
