import { trpc } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function Page () {
    
    const membership = await trpc.businessMembers.getMyMembership(  )

    if(!membership) {
        redirect('/onboarding')
    }

    return (
        <div>
            Dashboard Page
        </div>
    )
}