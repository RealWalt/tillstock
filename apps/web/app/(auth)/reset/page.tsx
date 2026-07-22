'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    newPassword: z.string().min(8, 'La contraseña debe ser de mínimo 8 caracteres'),
    confirmNewPassword: z.string().min(8, 'La contraseña debe ser de mínimo 8 caracteres')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword']
})

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token')

    if(!token) {
        router.push(`/forgot-password`)
        return null;
    }

    const [newPassword, setNewPasword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChangePassword = async () => {
        const result = schema.safeParse({ newPassword, confirmNewPassword })

        if(!result.success) return toast.error(result.error.issues[0]?.message);

        const { error } = await authClient.resetPassword({
            newPassword,
            token: token as string
        });

        if(error) return toast.error(error.message);

        toast.success('Contraseña cambiada correctamente.');
        router.push('/login');
    }

    return (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-8">
            <div className=" bg-white shadow border w-full max-w-4xl flex overflow-hidden">
                {/*Columna Izquierda */}
                <div className="mt-16 px-10 py-10">
                    <h2 className="text-2xl font-semibold text-gray-900">Cambiar contraseña</h2>
                    <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                        Ingresa tu nueva contraseña de TillStock.
                    </p>
                </div>

                <div className="flex flex-col justify-center px-16 py-16 w-1/2 shrink-0 border-l border-gray-100">
                  <h1 className="text-2xl font-semibold text-gray-900">Ingresa tu nueva contraseña</h1>

                  <div className="mt-5 space-y-2.5">
                    <div className="space-y-2">
                        <Label>Nueva contraseña</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                onChange={(e) => setNewPasword(e.target.value)}
                                value={newPassword}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-9 pr-9"
                            />
                            <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Confirmar nueva contraseña</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-4"/>
                            <Input 
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                value={confirmNewPassword}
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                className="pl-9 pr-9"
                            />
                        </div>
                    </div>

                    <Button 
                        variant='primary'
                        onClick={handleChangePassword}
                    >
                        Cambiar contraseña
                    </Button>
                  </div>
                </div>
            </div>
        </div>
    )
}