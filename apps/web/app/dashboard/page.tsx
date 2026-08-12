import { trpc } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function Page () {
    
    const business = await trpc.business.getMine()

    if(!business) {
        redirect('/onboarding')
    }

    return (
        <div>
            Dashboard Page
        </div>
    )
}