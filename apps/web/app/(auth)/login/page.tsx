'use client';

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Page () {

    return (
        <div>
            <h1>Iniciar sesion con Google</h1>
            <Button variant='outline' onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard'})}> 
                Iniciar sesion
            </Button>
        </div>
    )
}