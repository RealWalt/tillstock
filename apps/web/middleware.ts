import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";

export async function middleware(request: NextRequest) {
    const session = await getSession(request)

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                        request.nextUrl.pathname.startsWith('/register') || 
                        request.nextUrl.pathname.startsWith('/check-email') || 
                        request.nextUrl.pathname.startsWith('/email-verified') ||
                        request.nextUrl.pathname.startsWith('forgot-password') 


    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

    if(isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if(isAuthRoute && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/check-email", "/email-verified"],
}
