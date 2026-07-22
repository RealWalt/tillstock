'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EmailVerifiedPage () {
    const router = useRouter();

    return (
        <div className="fixed inset-0 bg-gray-50 p-8 flex items-center justify-center">
            <div className="bg-white space-y-3 flex flex-col items-center rounded-2xl shadow-sm border border-gray-100 p-12 max-w-xl w-full text-center">
                <Image src="./tillstock-logo_1.svg" width={288} height={288} alt="Tillstock Logo" />
                <div className="bg-[#0F1E3C] p-4 rounded-full flex items-center gap-3">
                        <CheckCircle2 className="h-10 w-10 text-green-500 animate-pulse" />
                        <p className="text-white font-bold">Correo electrónico verificado correctamente.</p>
                </div>
                <Button onClick={() => router.push(`/dashboard`)} variant='outline'>
                    <ArrowLeft className="h-8 w-8" />
                    Ir al dashboard
                </Button>
            </div>
        </div>
    )
}