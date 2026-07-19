'use client';

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/trpc";
import { useRouter } from "next/navigation";

export default function Home () {
  const router = useRouter()
  return (
    <main>
      <p className="flex flex-col text-2xl">
        TillStock 
        <Button onClick={async () => {
          await authClient.signOut()
          router.push('/login')
        }}>Cerrar sesion</Button>
      </p>
    </main>
  )
}