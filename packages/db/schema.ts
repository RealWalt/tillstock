 import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

 export const businessTypeEnum = pgEnum('business_type', ['products', 'services', 'mixed'])
 export const currencyEnum = pgEnum('currency', ['PYG', 'USD', 'ARS', 'BRL'])

 export const businesses = pgTable('businesses', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    type: businessTypeEnum('type').notNull(),
    description: text('description'),
    ruc: text('ruc'),
    phone: text('phone'),
    currency: currencyEnum('currency').notNull().default('PYG'),
    logoUrl: text('logo_url'),
    ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade'}),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
 })

