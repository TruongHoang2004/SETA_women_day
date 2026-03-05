import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    // Only protect /admin routes
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
        const basicAuth = req.headers.get('authorization')
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1]
            const [user, pwd] = atob(authValue).split(':')

            // Use the .env credentials
            const validUser = process.env.ADMIN_USERNAME || 'admin'
            const validPwd = process.env.ADMIN_PASSWORD || 'password123'

            if (user === validUser && pwd === validPwd) {
                return NextResponse.next()
            }
        }

        // Require Auth
        return new NextResponse('Auth Required.', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        })
    }
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
}
