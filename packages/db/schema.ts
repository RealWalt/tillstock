 import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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

 export const suppliers = pgTable('suppliers', {
   id: uuid().defaultRandom().primaryKey(),
   name: text('name').notNull(),
   contactName: text('contact_name'),
   description: text('description'),
   phone: text('phone'),
   email: text('email'),
   ruc: text('ruc'),
   isActive: boolean('is_active').notNull().default(true),
   businessId:uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
   createdAt: timestamp('created_at').defaultNow().notNull(),
   updatedAt: timestamp('updated_at').defaultNow().notNull(),
 })

 export const products = pgTable('products', {
  id: uuid().primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  sku: text('sku'),
  barcode: text('bar_code'),
  imageUrl: text('image_url'),
  stock: integer('stock').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  salePrice: integer('sale_price').notNull(),
  purchasePrice: integer('purchase_price').notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null'} ),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'set null'}),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade'}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
 })