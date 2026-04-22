import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  // lazy — don't crash at import time in dev/build
  console.warn('[nommad] DATABASE_URL not set')
}

// Server-side only — never import in client components
const client = postgres(process.env.DATABASE_URL ?? '', { prepare: false })

export const db = drizzle(client, { schema })
export type DB = typeof db
