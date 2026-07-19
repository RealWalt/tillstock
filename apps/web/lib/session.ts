import { NextRequest } from "next/server";
import { auth } from "./auth";

export async function getSession(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    return session;
}