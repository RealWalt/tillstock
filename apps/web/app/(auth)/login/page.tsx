"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import z from "zod"
import { toast } from "sonner"

const loginSchema = z.object({
email: z.string().email('Email inválido'),
password: z.string().min(1, 'La contraseña es requerida')
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password })

    if(!result.success) {
        const firstError = result.error.issues[0]?.message
        return toast.error(firstError);
    }

    const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/dashboard'
    })

    if(error) {
        return toast.error('Correo o contraseña incorrectos')
    }  
  }

  return (
    <div className="bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl flex overflow-hidden">
        
        {/* Columna izquierda */}
        <div className="hidden md:flex flex-col justify-center px-16 py-16 w-1/2 bg-gray-50 shrink-0">
          <Image src="./tillstock-logo_1.svg" alt="Tillstock" width={222} height={222} />
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900">Bienvenido a Tillstock</h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Iniciá sesión para acceder a tu panel y gestionar tu negocio de forma simple y eficiente.
            </p>
            <ul className="mt-10 space-y-5">
              <li className="flex items-center gap-3 text-gray-600 text-sm">
                <span className="text-[#0F1E3C] font-semibold">✓</span> Gestioná tu stock en tiempo real
              </li>
              <li className="flex items-center gap-3 text-gray-600 text-sm">
                <span className="text-[#0F1E3C] font-semibold">✓</span> Controlá tus ventas y compras
              </li>
              <li className="flex items-center gap-3 text-gray-600 text-sm">
                <span className="text-[#0F1E3C] font-semibold">✓</span> Reportes claros para tomar mejores decisiones
              </li>
            </ul>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col justify-center px-16 py-16 w-1/2 shrink-0 border-l border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mt-2">Ingresá tus credenciales para continuar</p>

          <div className="mt-10 space-y-5">
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="tu@correo.com" onChange={(e) => setEmail(e.target.value)} value={email} className="pl-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Recuérdame</Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button 
                onClick={handleLogin}
                className="w-full bg-[#0F1E3C] hover:bg-[#1a2e55] text-white h-11">
              Iniciar sesión
            </Button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">o continuá con</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </Button>

            <p className="text-center text-sm text-gray-500 pt-2">
              ¿No tenés una cuenta?{" "}
              <Link href="/register" className="text-[#0F1E3C] font-medium hover:underline">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}