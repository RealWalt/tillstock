import { OnboardingWizard } from "./onboarding-wizard";
import { trpc } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
    const business = await trpc.business.getMine()

    if (business) {
        redirect('/dashboard')
    }

    return <OnboardingWizard />
}