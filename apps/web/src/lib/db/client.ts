import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let cached: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('[nommad:db] DATABASE_URL not set')
  const client = postgres(url, { prepare: false })
  cached = drizzle(client, { schema })
  return cached
}

export type DB = ReturnType<typeof getDb>
