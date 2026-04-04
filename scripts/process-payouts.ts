/**
 * Manual Payout Processing Script (CLI Tool)
 * 
 * This script is for manual batch processing of mentor payouts from the command line.
 * For most cases, use the Admin Dashboard at /admin/payouts to process payouts individually.
 * 
 * Usage: 
 *   npx tsx scripts/process-payouts.ts           # Process all eligible payouts
 *   npx tsx scripts/process-payouts.ts --dry-run # Preview without processing
 * 
 * Note: The admin dashboard provides a better UX for manual payout processing.
 */

import { eq, and, sql, lte } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../server/db/schema'
import Stripe from 'stripe'

// Configuration
const MINIMUM_PAYOUT_AMOUNT = 10 // Minimum $10 for payout
const DRY_RUN = process.argv.includes('--dry-run')

// Initialize database
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error('❌ DATABASE_URL not set')
    process.exit(1)
}

const client = postgres(connectionString)
const db = drizzle(client, { schema })

// Initialize Stripe
const stripeSecretKey = process.env.NUXT_STRIPE_SECRET_KEY
if (!stripeSecretKey) {
    console.error('❌ NUXT_STRIPE_SECRET_KEY not set')
    process.exit(1)
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-11-20.acacia' as any,
})

interface MentorPayout {
    mentorId: string
    mentorName: string
    mentorEmail: string
    stripeConnectAccountId: string
    totalAmount: number
    earningIds: string[]
}

async function getAvailablePayouts(): Promise<MentorPayout[]> {
    console.log('\n📊 Fetching available earnings for payout...')

    // Get all mentors with available earnings and verified bank accounts
    const result = await db
        .select({
            mentorId: schema.mentorEarning.mentorId,
            mentorName: schema.user.name,
            mentorEmail: schema.user.email,
            stripeConnectAccountId: schema.mentorBankAccount.stripeConnectAccountId,
            earningId: schema.mentorEarning.id,
            netAmount: schema.mentorEarning.netAmount,
        })
        .from(schema.mentorEarning)
        .innerJoin(schema.user, eq(schema.mentorEarning.mentorId, schema.user.id))
        .innerJoin(schema.mentorBankAccount, eq(schema.mentorEarning.mentorId, schema.mentorBankAccount.mentorId))
        .where(
            and(
                eq(schema.mentorEarning.status, 'available'),
                eq(schema.mentorBankAccount.stripeConnectOnboarded, true),
                sql`${schema.mentorEarning.payoutId} IS NULL`
            )
        )

    // Group by mentor
    const mentorPayouts = new Map<string, MentorPayout>()

    for (const row of result) {
        if (!row.stripeConnectAccountId) continue

        const existing = mentorPayouts.get(row.mentorId)
        const amount = parseFloat(row.netAmount || '0')

        if (existing) {
            existing.totalAmount += amount
            existing.earningIds.push(row.earningId)
        } else {
            mentorPayouts.set(row.mentorId, {
                mentorId: row.mentorId,
                mentorName: row.mentorName,
                mentorEmail: row.mentorEmail,
                stripeConnectAccountId: row.stripeConnectAccountId,
                totalAmount: amount,
                earningIds: [row.earningId],
            })
        }
    }

    // Filter out mentors below minimum payout
    const eligiblePayouts = Array.from(mentorPayouts.values()).filter(
        (p) => p.totalAmount >= MINIMUM_PAYOUT_AMOUNT
    )

    console.log(`✅ Found ${eligiblePayouts.length} mentors eligible for payout`)
    return eligiblePayouts
}

async function processPayout(payout: MentorPayout): Promise<boolean> {
    const amountInCents = Math.round(payout.totalAmount * 100)

    console.log(`\n💰 Processing payout for ${payout.mentorName} (${payout.mentorEmail})`)
    console.log(`   Amount: $${payout.totalAmount.toFixed(2)} (${payout.earningIds.length} sessions)`)

    if (DRY_RUN) {
        console.log('   [DRY RUN] Skipping actual transfer')
        return true
    }

    try {
        // Calculate payout period (last 7 days)
        const periodEnd = new Date()
        const periodStart = new Date()
        periodStart.setDate(periodStart.getDate() - 7)

        // Create payout record first
        const [payoutRecord] = await db
            .insert(schema.mentorPayout)
            .values({
                mentorId: payout.mentorId,
                amount: payout.totalAmount.toFixed(2),
                currency: 'usd',
                status: 'processing',
                periodStart,
                periodEnd,
            })
            .returning()

        // Create Stripe transfer
        const transfer = await stripe.transfers.create({
            amount: amountInCents,
            currency: 'usd',
            destination: payout.stripeConnectAccountId,
            description: `Weekly payout for ${payout.earningIds.length} sessions`,
            metadata: {
                mentorId: payout.mentorId,
                payoutId: payoutRecord.id,
                earningCount: payout.earningIds.length.toString(),
            },
        })

        // Update payout record with transfer ID
        await db
            .update(schema.mentorPayout)
            .set({
                stripeTransferId: transfer.id,
                status: 'completed',
                processedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(schema.mentorPayout.id, payoutRecord.id))

        // Update earnings to mark as paid
        await db
            .update(schema.mentorEarning)
            .set({
                status: 'paid',
                payoutId: payoutRecord.id,
                updatedAt: new Date(),
            })
            .where(sql`${schema.mentorEarning.id} IN (${sql.join(payout.earningIds.map(id => sql`${id}`), sql`, `)})`)

        console.log(`   ✅ Transfer successful: ${transfer.id}`)
        return true
    } catch (error: any) {
        console.error(`   ❌ Transfer failed: ${error.message}`)

        // If there's a payout record, mark it as failed
        // Note: In production, you'd want to implement proper error recovery
        return false
    }
}

async function main() {
    console.log('🚀 Starting weekly payout processing...')
    console.log(`   Date: ${new Date().toISOString()}`)
    console.log(`   Dry run: ${DRY_RUN}`)
    console.log(`   Minimum payout: $${MINIMUM_PAYOUT_AMOUNT}`)

    try {
        const payouts = await getAvailablePayouts()

        if (payouts.length === 0) {
            console.log('\n✨ No payouts to process')
            return
        }

        let successCount = 0
        let failCount = 0

        for (const payout of payouts) {
            const success = await processPayout(payout)
            if (success) {
                successCount++
            } else {
                failCount++
            }
        }

        console.log('\n📈 Payout Summary:')
        console.log(`   Total processed: ${payouts.length}`)
        console.log(`   Successful: ${successCount}`)
        console.log(`   Failed: ${failCount}`)
        console.log(`   Total amount: $${payouts.reduce((sum, p) => sum + p.totalAmount, 0).toFixed(2)}`)
    } catch (error) {
        console.error('\n❌ Payout processing failed:', error)
        process.exit(1)
    } finally {
        await client.end()
    }

    console.log('\n✅ Payout processing complete')
}

main()
