import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

// Create the database connection
const client = postgres(process.env.NUXT_SUPABASE_DATABASE_URL!)

// Create the Drizzle instance with schema
export const db = drizzle(client, { schema })