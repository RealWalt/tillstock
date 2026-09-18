 import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { email } from "zod";

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

  export const services = pgTable('services', {
    id: uuid().primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    price: integer('price').notNull(),
    duration: integer('duration').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null'} ),
    businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade'}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
  })

  export const roles = pgTable('roles', {
    id: uuid().defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    permissions: text('permissions').array().notNull().default([]),
    isActive: boolean('is_active').default(true).notNull(),
    businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  })

  export const businessMembers = pgTable('business_members', {
    id: uuid().primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade'}),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'restrict'}),
    email: text('email').notNull(),
    pin: text('pin'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    cedula: text('cedula'),
    salary: integer('salary'),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    removedAt: timestamp('removed_at'),
  })

  export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'expired'])
  export const businessInvitations = pgTable('business_invitations', {
    id: uuid().defaultRandom().primaryKey(),
    businessMemberId: uuid('business_member_id').notNull().references(() => businessMembers.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    status: invitationStatusEnum('status').notNull().default('pending'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  })

  export const posTerminalStatusEnum = pgEnum('pos_terminal_status', ['pending', 'active', 'revoked'])

  export const posTerminals = pgTable('pos_terminals', {
    id: uuid().defaultRandom().primaryKey(),
    keyId: text('key_id').unique(),
    name: text('name').notNull(),
    status: posTerminalStatusEnum('status').notNull().default('pending'),
    businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
    activatedAt: timestamp('activated_at'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    removedAt: timestamp('removed_at'),
  })

  export const posTerminalOperators = pgTable('pos_termianl_operators', {
    id: uuid().primaryKey().defaultRandom(),
    posTerminalId: uuid('pos_terminal_id').notNull().references(() => posTerminals.id, { onDelete: 'cascade' }),
    businessMemberId: uuid('business_member_id').notNull().references(() => businessMembers.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').notNull().default(true), // mismo nombre que en businessMembers
    createdAt: timestamp('created_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'), // cuándo se le quitó el acceso, para historial
  })

  export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'transfer'])

  export const sales = pgTable('sales', {
    id: uuid().defaultRandom().primaryKey(),
    posTerminalId: uuid('pos_terminal_id').notNull().references(() => posTerminals.id),
    businessMemberId: uuid('business_member_id').notNull().references(() => businessMembers.id),
    businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
    total: integer('total').notNull(),
    amountPaid: integer('amount_paid'),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  })

  export const saleItemTypeEnum = pgEnum('sale_item_type', ['product', 'service'])

  export const saleItems = pgTable('sale_items', {
    id: uuid().defaultRandom().primaryKey(),
    saleId: uuid('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
    type: saleItemTypeEnum('type').notNull(),
    itemId: uuid('item_id').notNull(), // productId o serviceId, según type
    name: text('name').notNull(),        // snapshot
    unitPrice: integer('unit_price').notNull(), // snapshot
    quantity: integer('quantity').notNull().default(1),
    subtotal: integer('subtotal').notNull(),
  })