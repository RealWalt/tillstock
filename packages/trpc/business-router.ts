import { codec, z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./init.ts";
import { db } from '@repo/db'
import { businesses, businessInvitations, businessMembers, roles } from '@repo/db/schema'
import { and, count, desc, eq, ilike, or } from "drizzle-orm"
import { TRPCError } from "@trpc/server";
import { getUserBusiness } from "./get-user-business.ts";
import { requirePermission } from "./require-permission.ts";
import { Resend } from "resend";
import { user } from "@repo/db/auth-schema";

export const businessRouter = router({
    create: protectedProcedure
    .input(z.object({
        name: z.string().min(1),
        type: z.enum(['products', 'services', 'mixed']),
        currency: z.enum(['PYG', 'USD', 'ARS', 'BRL']),
        description: z.string(),
        ruc: z.string(),
        phone: z.string(),
        logoUrl: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
        const [business] = await db.insert(businesses).values({
            ...input,
            ownerId: ctx.session.user.id
        }).returning()

        return business
    }),


    getMine: protectedProcedure
    .query(async ({ ctx }) => {
        const { user } = ctx.session;

        const [business] = await db
            .select()
            .from(businesses)
            .where(eq(businesses.ownerId, user.id)) 

        return business ?? null
    })
})

export const businessMembersRouter = router({
    getMyMembership: protectedProcedure
        .query(async ({ ctx }) => {
            const [business] = await db
            .select()
            .from(businesses)
            .where(eq(businesses.ownerId, ctx.session.user.id))

            if(business) {
                return {
                    isOwner: true,
                    business,
                    role: null,
                    permission: 'all' as const
                }
            }
            
            const [membership] = await db
            .select({
                businessId: businessMembers.businessId,
                roleId: businessMembers.roleId,
                permission: roles.permissions
            })
            .from(businessMembers)
            .innerJoin(roles, eq(roles.id, businessMembers.roleId))
            .where(eq(businessMembers.userId, ctx.session.user.id))

            if(!membership) {
                return null
            }

            return {
                isOwner: false,
                business: null,
                role: membership.roleId,
                permission: membership.permission
            }
        }),

    create: requirePermission('manage_employees')
    .input(z.object({
        email: z.email(),
        roleId: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        cedula: z.string().optional(),
        salary: z.number().optional(),
        imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const [role] = await db
        .select()
        .from(roles)
        .where(and(eq(roles.id, input.roleId), eq(roles.businessId, ctx.business.id)))

        if (!role) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'El rol no existe en este negocio' })
        }

        const [member] = await db.insert(businessMembers).values({
        ...input,
        businessId: ctx.business.id,
        userId: null,
        }).returning()

        return member
    }),

    update: requirePermission('manage_employees')
    .input(z.object({
        id: z.uuid(),
        roleId: z.uuid().optional(),
        firstName: z.string().min(1, 'El nombre es obligatorio').optional(),
        lastName: z.string().min(1, 'El apellido es obligatorio').optional(),
        cedula: z.string().min(1, 'La cédula es obligatoria').optional(),
        salary: z.number().int().optional(),
        imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const { id, ...values } = input

        if (values.roleId) {
            const [role] = await db
                .select({ id: roles.id })
                .from(roles)
                .where(and(
                    eq(roles.id, values.roleId),
                    eq(roles.businessId, ctx.business.id)
                ))

            if (!role) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Rol no encontrado' })
            }
        }

        const [member] = await db
        .update(businessMembers)
        .set(values)
        .where(and(
            eq(businessMembers.id, id),
            eq(businessMembers.businessId, ctx.business.id)
        ))
        .returning()

        if (!member) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Miembro no encontrado' })
        }

        return member
    }),

    remove: requirePermission('manage_employees')
    .input(z.object({
        memberId: z.uuid()
    }))
    .mutation(async ({ ctx, input }) => {
        const [member] = await db
        .update(businessMembers)
        .set({ isActive: false, removedAt: new Date() })
        .where(and(
            eq(businessMembers.id, input.memberId),
            eq(businessMembers.businessId, ctx.business.id)
        ))
        .returning()

        if (!member) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Miembro no encontrado' })
        }

        return member
    }),

    getById: requirePermission('manage_employees')
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
        const [member] = await db
        .select({
            id: businessMembers.id,
            userId: businessMembers.userId,
            roleId: businessMembers.roleId,
            roleName: roles.name,
            firstName: businessMembers.firstName,
            lastName: businessMembers.lastName,
            cedula: businessMembers.cedula,
            salary: businessMembers.salary,
            imageUrl: businessMembers.imageUrl,
            isActive: businessMembers.isActive,
            email: businessMembers.email,
            createdAt: businessMembers.createdAt,
        })
        .from(businessMembers)
        .innerJoin(roles, eq(roles.id, businessMembers.roleId))
        .where(and(
            eq(businessMembers.id, input.id),
            eq(businessMembers.businessId, ctx.business.id)
        ))

        if (!member) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Miembro no encontrado' })
        }

        return { ...member, businessName: ctx.business.name }
    }),

    list: protectedProcedure
    .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
        const { page, limit, search } = input;

        const searchFilter = search
            ? or(
                ilike(businessMembers.firstName, `%${search}%`),
                ilike(businessMembers.lastName, `%${search}%`)
              )
            : undefined

        const result = await getUserBusiness(ctx.session.user.id)
        if (!result) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio' })
        }
        const { business } = result

        const baseWhere = and(
            eq(businessMembers.businessId, business.id),
            searchFilter
        )

        const [totalResult] = await db
        .select({ total: count()})
        .from(businessMembers)
        .where(baseWhere)

        const total = totalResult?.total ?? 0

        const members = await db
        .select({
            id: businessMembers.id,
            userId: businessMembers.userId,
            roleId: businessMembers.roleId,
            roleName: roles.name,
            firstName: businessMembers.firstName,
            lastName: businessMembers.lastName,
            imageUrl: businessMembers.imageUrl,
            isActive: businessMembers.isActive,
            email: businessMembers.email,
            createdAt: businessMembers.createdAt,
      })
        .from(businessMembers)
        .innerJoin(roles, eq(roles.id, businessMembers.roleId))
        .where(baseWhere)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(businessMembers.createdAt))

        return {
            items: members,
            total,
            totalPages: Math.ceil(total / limit)
        }
    })
})

export const businessInvitationRouter = router({
    getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
        const [invitation] = await db
        .select({
            id: businessInvitations.id,
            status: businessInvitations.status,
            expiresAt: businessInvitations.expiresAt,
            memberEmail: businessMembers.email,
            memberFirstName: businessMembers.firstName,
            businessName: businesses.name,
            roleName: roles.name,
        })
        .from(businessInvitations)
        .innerJoin(businessMembers, eq(businessMembers.id, businessInvitations.businessMemberId))
        .innerJoin(businesses, eq(businesses.id, businessMembers.businessId))
        .innerJoin(roles, eq(roles.id, businessMembers.roleId))
        .where(eq(businessInvitations.token, input.token))

        if(!invitation) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitación no encontrada' })
        }

        if(invitation.status !== 'pending') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta invitación ya fue utilizada' })
        }

        if (new Date() > invitation.expiresAt) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta invitación expiró' })
        }

        return invitation;
    }),

    accept: protectedProcedure
    .input(z.object({ token: z.string()}))
    .mutation(async ({ ctx, input }) => {
        
        const [invitation] = await db
        .select()
        .from(businessInvitations)
        .where(eq(businessInvitations.token, input.token))

        if(!invitation || invitation.status !== 'pending') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invitación inválida o ya usada' })
        } 

        if (new Date() > invitation.expiresAt) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta invitación expiró' })
        }

        await db
        .update(user)
        .set({
            emailVerified: true
        })
        .where(eq(user.id, ctx.session?.user.id)) 

        await db
        .update(businessMembers)
        .set({ userId: ctx.session?.user.id})
        .where(eq(businessMembers.id, invitation.businessMemberId))

        await db
        .update(businessInvitations)
        .set({ status: 'accepted' })
        .where(eq(businessInvitations.id, invitation.id))

        return { success: true}
    }),
    
    send: requirePermission('manage_employees')
    .input(z.object({ businessMemberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const resend = new Resend(process.env.RESEND_API_KEY)

        const [member] = await db
        .select()
        .from(businessMembers)
        .innerJoin(roles, eq(roles.id, businessMembers.roleId))
        .where(and(
            eq(businessMembers.id, input.businessMemberId),
            eq(businessMembers.businessId, ctx.business.id)
        ))

        if(!member) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Empleado no encontrado' })
        }

        // Si ya tiene una invitación pendiente, la invalidamos (marcamos como expired) antes de crear una nueva
        await db
        .update(businessInvitations)
        .set({ status: 'expired' })
        .where(and(
            eq(businessInvitations.businessMemberId, input.businessMemberId),
            eq(businessInvitations.status, 'pending')
        ))

        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        await db.insert(businessInvitations).values({
            businessMemberId: input.businessMemberId,
            token,
            expiresAt
        })

        await resend.emails.send({
        from: 'Tillstock <onboarding@resend.dev>',
        to: member.business_members.email,
        subject: `Te invitaron a unirte a ${ctx.business.name} en Tillstock`,
        html: `
            <p>Hola${member.business_members.firstName ? ' ' + member.business_members.firstName : ''}!</p>
            <p>Te invitaron a unirte a <strong>${ctx.business.name}</strong> como <strong>${member.roles.name}</strong>.</p>
            <p><a href="${process.env.BETTER_AUTH_URL}/invite/${token}">Hacé clic acá para aceptar la invitación</a></p>
            <p>Este link expira en 7 días.</p>
        `
        })

        return { success: true }
    })
})