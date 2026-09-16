"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/trpc"
import { authClient } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type InvitationViewProps = {
  token: string
}

export const InvitationView = ({ token }: InvitationViewProps) => {
  const router = useRouter()
  const [invitation] = api.businessInvitations.getByToken.useSuspenseQuery({ token })
  
  const { data: session } = authClient.useSession()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const acceptMutation = api.businessInvitations.accept.useMutation({
    onSuccess: () => {
      toast.success('¡Te uniste al equipo correctamente!')
      router.push('/dashboard')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  // Caso C: ya tiene sesión activa
  const handleAcceptDirectly = () => {
    acceptMutation.mutate({ token })
  }

  // Caso A: necesita registrarse primero
  const handleRegisterAndAccept = async () => {
    const { error: signUpError } = await authClient.signUp.email({
      name,
      email: invitation.memberEmail,
      password,
    })

    if (signUpError) {
      toast.error('Error al crear la cuenta: ' + signUpError.message)
      return
    }

    // Forzar el login, ya que signUp no garantiza sesión activa si requireEmailVerification está en true

    const { error: signInError } = await authClient.signIn.email({
      email: invitation.memberEmail,
      password
    })
    // Una vez registrado, aceptamos la invitación automáticamente
    acceptMutation.mutate({ token })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-900">
          Te invitaron a Tillstock 🎉
        </h1>
        <p className="text-gray-500 mt-2">
          Te invitaron a unirte a <strong>{invitation.businessName}</strong> como <strong>{invitation.roleName}</strong>.
        </p>

        {session ? (
          // Caso C: ya logueado
          <div className="mt-6">
            <Button
              className="w-full bg-[#0F1E3C] hover:bg-[#1a2e55] text-white h-11"
              onClick={handleAcceptDirectly}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? 'Aceptando...' : 'Aceptar invitación'}
            </Button>
          </div>
        ) : (
          // Caso A: necesita crear cuenta
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={invitation.memberEmail} disabled />
            </div>
            <div className="space-y-2">
              <Label>Tu nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button
              className="w-full bg-[#0F1E3C] hover:bg-[#1a2e55] text-white h-11"
              onClick={handleRegisterAndAccept}
              disabled={acceptMutation.isPending}
            >
              Crear cuenta y unirme
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}