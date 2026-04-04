/**
 * Admin User Creation Script
 * 
 * Usage: pnpm admin:create <email> <password> [name]
 * 
 * Example: pnpm admin:create admin@imentor.com SecurePass123 "Admin User"
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'
import * as schema from '../server/db/schema'

const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: pnpm admin:create <email> <password> [name]')
  console.error('Example: pnpm admin:create admin@imentor.com SecurePass123 "Admin User"')
  process.exit(1)
}

const [email, password, name = 'Admin'] = args

async function createAdmin() {
  const databaseUrl = process.env.NUXT_SUPABASE_DATABASE_URL
  
  if (!databaseUrl) {
    console.error('Error: NUXT_SUPABASE_DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const client = postgres(databaseUrl)
  const db = drizzle(client, { schema })

  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      console.error(`Error: User with email ${email} already exists`)
      await client.end()
      process.exit(1)
    }

    // Hash password using Better Auth's method
    const hashedPassword = await hashPassword(password)

    // Generate user ID
    const userId = crypto.randomUUID()

    // Create user
    await db.insert(schema.user).values({
      id: userId,
      name,
      email,
      emailVerified: true, // Admin is pre-verified
      role: 'admin',
      hasCompletedOnboarding: true, // Admin skips onboarding
      onboardingStep: 'complete',
      onboardingCompletedAt: new Date(),
    })

    // Create account with password
    await db.insert(schema.account).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hashedPassword,
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${email}`)
    console.log(`   Name: ${name}`)
    console.log(`   Role: admin`)
    console.log('')
    console.log('You can now log in at /auth/login')

    await client.end()
    process.exit(0)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error creating admin user:', message)
    await client.end()
    process.exit(1)
  }
}

createAdmin()
