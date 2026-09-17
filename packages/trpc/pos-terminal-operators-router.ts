import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { requirePermission } from "./require-permission.ts";
import { db } from "@repo/db";
import { businessMembers, posTerminalOperators, posTerminals } from "@repo/db/schema";
import { and, eq, make$ReturningResponseMapper } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserBusiness } from "./get-user-business.ts";

export const posTerminalOperatorsRouter = router({
    addOperator: requirePermission('manage_pos_terminals')
    .input(z.object({
        posTerminalId: z.string(),
        businessMemberId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
        const [terminal] = await db
        .select()
        .from(posTerminals)
        .where(and(
            eq(posTerminals.id, input.posTerminalId),
            eq(posTerminals.businessId, ctx.business.id)
        ))

        if(!terminal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Caja no encontrada' })
        }

        const [member] = await db
        .select()
        .from(businessMembers)
        .where(and(
            eq(businessMembers.id, input.businessMemberId),
            eq(businessMembers.businessId, ctx.business.id)
        ))
        
        if(!member) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Empleado no encontrado' })
        }

        // TODO: validar límite de operadores según el plan del negocio (Fase 2)

        const [operator] = await db.insert(posTerminalOperators).values({
            posTerminalId: input.posTerminalId,
            businessMemberId: input.businessMemberId
        }).returning()

        return operator;
    }),

    removeOperator: requirePermission('manage_pos_terminals')
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        // Primero verificamos que el operador pertenezca a una caja de ESTE negocio
        const [operator] = await db
            .select({ id: posTerminalOperators.id })
            .from(posTerminalOperators)
            .innerJoin(posTerminals, eq(posTerminals.id, posTerminalOperators.posTerminalId))
            .where(and(
                eq(posTerminalOperators.id, input.id),
                eq(posTerminals.businessId, ctx.business.id)  // ← acá está la verificación real
            ))

        if (!operator) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Operador no encontrado' })
        }

        const [updated] = await db
            .update(posTerminalOperators)
            .set({ isActive: false, revokedAt: new Date() })
            .where(eq(posTerminalOperators.id, input.id))
            .returning()

        return updated
    }),

    listByTerminal: protectedProcedure
    .input(z.object({ posTerminalId: z.string() }))
    .query(async ({ ctx, input }) => {
        const result = await getUserBusiness(ctx.session.user.id)
        if (!result) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio' })
        }

        const [terminal] = await db
            .select()
            .from(posTerminals)
            .where(and(
                eq(posTerminals.id, input.posTerminalId),
                eq(posTerminals.businessId, result.business.id)
            ))

        if (!terminal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Caja no encontrada' })
        }

        const operators = await db
            .select({
                    id: posTerminalOperators.id,
                    businessMemberId: posTerminalOperators.businessMemberId,
                    firstName: businessMembers.firstName,
                    lastName: businessMembers.lastName,
                    imageUrl: businessMembers.imageUrl,
                    isActive: posTerminalOperators.isActive,
                })
            .from(posTerminalOperators)
            .innerJoin(businessMembers, eq(businessMembers.id, posTerminalOperators.businessMemberId))
            .where(and(
                eq(posTerminalOperators.posTerminalId, input.posTerminalId),
                eq(posTerminalOperators.isActive, true)
            ))

        return operators
    }),
})