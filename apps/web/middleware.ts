import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";

export async function middleware(request: NextRequest) {
    const session = await getSession(request)

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
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
    matcher: ["/dashboard/:path*", "/login"],
}
