import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require authentication
        if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
          return true
        }

        // Admin routes require admin role
        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }

        // Chat routes require any authenticated user
        if (pathname.startsWith("/chat")) {
          return !!token
        }

        // API routes
        if (pathname.startsWith("/api")) {
          if (pathname.startsWith("/api/admin")) {
            return token?.role === "ADMIN"
          }
          return !!token
        }

        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/chat/:path*", "/admin/:path*", "/api/:path*"],
}