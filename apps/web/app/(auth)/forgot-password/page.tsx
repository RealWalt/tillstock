'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    email: z.string().email('Email inválido')
});

export default function ForgotPasswordPage () {
    const [email, setEmail] = useState('');

    const handleSubmit = async () => {
        const result = schema.safeParse({ email })

        if(!result.success) {
            return toast.error(result.error.issues[0]?.message)
        }

        const { error } = await authClient.requestPasswordReset({
            email,
            redirectTo: '/reset'
        })

        if(error) return toast.error('Algo salió mal, intentalo de nuevo.')
        
        toast.success('Si ese email está registrado, recibirás un enlace en tu correo.')    
    
    }

    return(
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-8">
            <div className=" bg-white shadow border w-full max-w-4xl flex overflow-hidden">
                {/*Columna izquierda (Reutilizada) */}
                <div className="hidden md:flex flex-col justify-center px-16 py-16 w-1/2 bg-gray-50 shrink-0">
                    <Image src="./tillstock-logo_1.svg" alt="Tillstock" width={222} height={222} />
                    <div className="mt-16">
                        <h2 className="text-2xl font-semibold text-gray-900">Olvidé mi contraseña</h2>
                        <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                            Ingresa tu correo electrónico vinculada a tu cuenta de Tillstock.
                        </p>
                        <ul className="mt-10 space-y-5">
                        <li className="flex items-center gap-3 text-gray-600 text-sm">
                            Si el correo es el correcto, se enviara un enlace único.
                        </li>
                        <li className="flex items-center gap-3 text-gray-600 text-sm">
                            Ingresa al enlace y cambia tu contraseña.
                        </li>
                        </ul>
                    </div>
                </div>

                {/*Columna derecha */}

                <div className="flex flex-col justify-center px-16 py-16 w-1/2 shrink-0 border-l border-gray-100">
                  <h1 className="text-2xl font-semibold text-gray-900">Ingresa tu correo electrónico</h1>

                  <div className="mt-10 space-y-2.5">
                    <Input
                        placeholder="Ej: juanvaldezco@correo.com"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />

                    <Button 
                        variant='primary' 
                        className='w-full'
                        onClick={handleSubmit}
                    >
                        Enviar enlace
                    </Button>
                  </div>
                </div>
            </div>
        </div>
    )
}