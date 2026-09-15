import { codec, z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from '@repo/db'
import { businesses, businessMembers, roles } from '@repo/db/schema'
import { and, count, desc, eq, ilike, or } from "drizzle-orm"
import { TRPCError } from "@trpc/server";
import { user } from "@repo/db/auth-schema";
import { getUserBusiness } from "./get-user-business.ts";
import { requirePermission } from "./require-permission.ts";

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

const employeeFields = {
    firstName: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().min(1, 'El apellido es obligatorio'),
    cedula: z.string().min(1, 'La cédula es obligatoria'),
    salary: z.number().int().optional(),
    imageUrl: z.string().optional(),
}

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
            userId: z.string().min(1, 'El ID de usuario es obligatorio'),
            roleId: z.uuid(),
            ...employeeFields
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, roleId, ...values } = input

            const [existingUser] = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.id, userId))

        if (!existingUser) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'El usuario no existe' })
        }

        const [role] = await db
            .select({ id: roles.id })
            .from(roles)
            .where(and(
                eq(roles.id, roleId),
                eq(roles.businessId, ctx.business.id)
            ))

        if (!role) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Rol no encontrado' })
        }

        const [member] = await db.insert(businessMembers).values({
            ...values,
            userId,
            roleId,
            businessId: ctx.business.id,
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
            firstName: businessMembers.firstName,
            lastName: businessMembers.lastName,
            cedula: businessMembers.cedula,
            salary: businessMembers.salary,
            imageUrl: businessMembers.imageUrl,
            isActive: businessMembers.isActive,
            userEmail: user.email,
            createdAt: businessMembers.createdAt,
        })
        .from(businessMembers)
        .innerJoin(user, eq(user.id, businessMembers.userId))
        .where(and(
            eq(businessMembers.id, input.id),
            eq(businessMembers.businessId, ctx.business.id)
        ))

        if (!member) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Miembro no encontrado' })
        }

        return member
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
        .innerJoin(user, eq(user.id, businessMembers.userId))
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
            userEmail: user.email,
            createdAt: businessMembers.createdAt,
      })
        .from(businessMembers)
        .innerJoin(roles, eq(roles.id, businessMembers.roleId))
        .innerJoin(user, eq(user.id, businessMembers.userId))
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