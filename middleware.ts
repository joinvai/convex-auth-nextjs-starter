import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/protected'
];

// Define public routes that should redirect authenticated users
const publicRoutes = [
    '/auth/signin',
    '/auth/signup'
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Routes that should be excluded from middleware processing
    const excludedRoutes = ['/auth/callback', '/api', '/_next', '/favicon.ico'];

    // Skip middleware for excluded routes
    if (excludedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Get authentication indicators from cookies
    // Convex Auth typically uses multiple cookies for session management
    const convexAuthCookies = [
        'convex-auth-token',
        '__convex_auth_token',
        'convex_auth_token'
    ];

    const hasAuthCookie = convexAuthCookies.some(cookieName =>
        request.cookies.get(cookieName)?.value
    );

    // For protected routes, redirect to home with redirect parameter if not authenticated
    if (isProtectedRoute && !hasAuthCookie) {
        const signInUrl = new URL('/', request.url);
        signInUrl.searchParams.set('redirect', pathname);
        signInUrl.searchParams.set('reason', 'auth_required');

        const response = NextResponse.redirect(signInUrl);

        // Add headers to help with debugging
        response.headers.set('X-Middleware-Redirect', 'auth_required');
        response.headers.set('X-Protected-Route', pathname);

        return response;
    }

    // For public auth routes, redirect authenticated users to dashboard or specified redirect
    if (isPublicRoute && hasAuthCookie) {
        const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard';
        const dashboardUrl = new URL(redirectUrl, request.url);

        const response = NextResponse.redirect(dashboardUrl);
        response.headers.set('X-Middleware-Redirect', 'already_authenticated');

        return response;
    }

    // Add authentication status header for debugging
    const response = NextResponse.next();
    response.headers.set('X-Auth-Status', hasAuthCookie ? 'authenticated' : 'unauthenticated');
    response.headers.set('X-Route-Type', isProtectedRoute ? 'protected' : 'public');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};