import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckEmailPage() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-[#0F1E3C] p-4 rounded-full">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Revisá tu correo</h1>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed">
          Te mandamos un link de verificación. Hacé clic en el link para activar tu cuenta.
        </p>
        <p className="text-gray-400 text-xs mt-6">
          ¿No te llegó? Revisá tu carpeta de spam.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}