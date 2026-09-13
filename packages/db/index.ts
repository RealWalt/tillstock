import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

export const db = drizzle(process.env.DATABASE_URL!)

export * from "./schema"
export * from "./auth-schema"
export * from "./permissions"
export * from "./default_roles"