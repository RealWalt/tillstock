import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { requirePermission } from "./require-permission.ts";
import { db } from "@repo/db";
import { posTerminals } from "@repo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserBusiness } from "./get-user-business.ts";

export const posTerminalRouter = router({
    create: requirePermission('manage_pos_terminals')
    .input(z.object({
        name: z.string().min(1, 'El nombre es obligatorio')
    }))
    .mutation(async ({ ctx, input }) => {
        const [terminal] = await db.insert(posTerminals)
        .values({
            ...input,
            businessId: ctx.business.id
        }).returning()

        return terminal;
    }),

    generateKey: requirePermission('manage_pos_terminals')
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const [terminal] = await db
        .select()
        .from(posTerminals)
        .where(and(
            eq(posTerminals.id, input.id),
            eq(posTerminals.businessId, ctx.business.id)
        ))

        if (!terminal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Caja no encontrada' })
        }

        if(terminal.status !== 'pending') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta caja ya tiene una key activa o revocada' })
        }

        const keyId = `TILL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

        const [updated] = await db
        .update(posTerminals)
        .set({ keyId })
        .where(eq(posTerminals.id, input.id))
        .returning()

        return updated
    }),

    list: protectedProcedure
    .query(async ({ ctx }) => {
        const result = await getUserBusiness(ctx.session.user.id)
        if(!result) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio' })
        }

        const { business } = result;

        const terminals = await db
        .select()
        .from(posTerminals)
        .where(and(
            eq(posTerminals.businessId, business.id),
            eq(posTerminals.isActive, true)
        ))
        .orderBy(desc(posTerminals.createdAt))

        return terminals
    }),

    getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
        const result = await getUserBusiness(ctx.session.user.id)
        if(!result) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio' })
        }

        const { business } = result;

        const [terminal] = await db
        .select()
        .from(posTerminals)
        .where(and(
            eq(posTerminals.id, input.id),
            eq(posTerminals.businessId, business.id)
        ))

        if (!terminal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Caja no encontrada' })
        }

        return terminal
    }),

    update: requirePermission('manage_pos_terminals')
    .input(z.object({
        id: z.uuid(),
        name: z.string().min(1, 'El nombre es obligatorio'),
    }))
    .mutation(async ({ ctx, input }) => {
        const { id, ...values } = input

        const [terminal] = await db
        .update(posTerminals)
        .set(values)
        .where(and(
            eq(posTerminals.id, id),
            eq(posTerminals.businessId, ctx.business.id)
        ))
        .returning()

        if (!terminal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Caja no encontrada' })
        }

        return terminal
    }),

    delete: requirePermission('manage_pos_terminals')
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
        const [terminal] = await db
        .update(posTerminals)
        .set({ isActive: false, removedAt: new Date() })
        .where(and(
            eq(posTerminals.id, input.id),
            eq(posTerminals.businessId, ctx.business.id)
        ))
        .returning()

        if (!terminal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Caja no encontrada' })
        }

        return terminal
    }),

    activate: protectedProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(async ({ input }) => {
        const [terminal] = await db
        .select()
        .from(posTerminals)
        .where(eq(posTerminals.keyId, input.keyId))

        if(!terminal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Key inválida' })
        }

        if(terminal.status !== 'pending') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta caja ya fue activada anteriormente' })
        }

        const [activated] = await db
            .update(posTerminals)
            .set({ status: 'active', activatedAt: new Date() })
            .where(eq(posTerminals.id, terminal.id))
            .returning()

        return activated;
    }),

    resetKey: requirePermission('manage_pos_terminals')
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {

        const newKeyId = `TILL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

        const [updated] = await db
        .update(posTerminals)
        .set({
            keyId: newKeyId,
            status: "pending",
            activatedAt: null
        })
        .where(and(
            eq(posTerminals.businessId, ctx.business.id),
            eq(posTerminals.id, input.id)
        ))
        .returning()

        if(!updated) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Caja no encontrada' })
        }

        return updated;
    })
})