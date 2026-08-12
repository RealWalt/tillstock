 import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
 });

 export const categoryTypeEnum = pgEnum('category_type', ['product', 'service'])
 export const categories = pgTable('categories', {
      id: uuid().defaultRandom().primaryKey(),
      name: text('name').notNull(),
      description: text('description'),
      type: categoryTypeEnum().notNull(),
      color: text('color').notNull().default('#F5C518'),
      isActive: boolean('is_active').notNull().default(true),
      businessId:uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at').defaultNow().notNull()
 })