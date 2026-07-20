'use client';

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/trpc";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home () {
  const router = useRouter()
  return (
    <main>
      <p className="flex flex-col text-2xl">
        <Image src='/tillstock-logo_1.svg' alt="Logo" width={244} height={244} />
        <Button onClick={async () => {
          await authClient.signOut()
          router.push('/login')
        }} 
          className='max-w-xl'
        >Cerrar sesion</Button>
      </p>
    </main>
  )
}