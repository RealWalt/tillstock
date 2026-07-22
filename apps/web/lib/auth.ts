import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@repo/db'
import { user, session, account, verification } from '@repo/db/auth-schema'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user,
            session,
            account,
            verification,
        },
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            
            await resend.emails.send({
                from: 'Tillstock <onboarding@resend.dev>',
                to: user.email,
                subject: 'Verificá tu cuenta de Tillstock',
                html: `<p>Hola ${user.name}! <a href="${url}">Hacé clic acá para verificar tu cuenta</a></p>`
            })
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    }
})