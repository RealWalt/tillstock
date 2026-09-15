import { db } from "@repo/db"
import { businesses, businessMembers } from "@repo/db/schema"
import { and, eq } from "drizzle-orm"

export type UserBusinessResult = {
    business: typeof businesses.$inferSelect
    isOwner: boolean
}

export async function getUserBusiness(userId: string): Promise<UserBusinessResult | null> {
    const [owned] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, userId))

    if (owned) {
        return { business: owned, isOwner: true }
    }

    const [membership] = await db
        .select({ business: businesses })
        .from(businessMembers)
        .innerJoin(businesses, eq(businesses.id, businessMembers.businessId))
        .where(and(
            eq(businessMembers.userId, userId),
            eq(businessMembers.isActive, true)
        ))

    if (membership) {
        return { business: membership.business, isOwner: false }
    }

    return null
}
