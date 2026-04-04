import Stripe from 'stripe'

// Initialize Stripe with secret key from environment
const stripeSecretKey = process.env.NUXT_STRIPE_SECRET_KEY

if (!stripeSecretKey) {
    console.warn('[Stripe] NUXT_STRIPE_SECRET_KEY not set - payments will fail')
}

export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' })
    : null

/**
 * Create a PaymentIntent for a booking
 */
export async function createPaymentIntent(params: {
    amount: number // in cents
    mentorId: string
    menteeId: string
    bookingId: string
    duration: number
}): Promise<Stripe.PaymentIntent | null> {
    if (!stripe) {
        console.error('[Stripe] Stripe not initialized')
        return null
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: params.amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                mentorId: params.mentorId,
                menteeId: params.menteeId,
                bookingId: params.bookingId,
                duration: params.duration.toString(),
            },
        })

        return paymentIntent
    } catch (error) {
        console.error('[Stripe] Failed to create PaymentIntent:', error)
        throw error
    }
}

/**
 * Retrieve a PaymentIntent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    if (!stripe) return null

    try {
        return await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (error) {
        console.error('[Stripe] Failed to retrieve PaymentIntent:', error)
        return null
    }
}

/**
 * Check if a PaymentIntent is successful
 */
export function isPaymentSuccessful(paymentIntent: Stripe.PaymentIntent): boolean {
    return paymentIntent.status === 'succeeded'
}

// ==================== Stripe Connect Functions ====================

/**
 * Create a Stripe Connect account for a mentor
 */
export async function createStripeConnectAccount(params: {
    email: string
    country?: string
}): Promise<Stripe.Account | null> {
    if (!stripe) {
        console.error('[Stripe] Stripe not initialized')
        return null
    }

    try {
        const account = await stripe.accounts.create({
            type: 'express',
            country: params.country || 'US',
            email: params.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
            settings: {
                payouts: {
                    schedule: {
                        interval: 'weekly',
                        weekly_anchor: 'monday',
                    },
                },
            },
        })

        return account
    } catch (error) {
        console.error('[Stripe] Failed to create Connect account:', error)
        return null
    }
}

/**
 * Create an onboarding link for Stripe Connect
 */
export async function createStripeConnectOnboardingLink(
    accountId: string,
    urls: { refreshUrl: string; returnUrl: string }
): Promise<Stripe.AccountLink | null> {
    if (!stripe) return null

    try {
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: urls.refreshUrl,
            return_url: urls.returnUrl,
            type: 'account_onboarding',
        })

        return accountLink
    } catch (error) {
        console.error('[Stripe] Failed to create onboarding link:', error)
        return null
    }
}

/**
 * Get Stripe Connect account status
 */
export async function getStripeConnectAccountStatus(accountId: string): Promise<{
    chargesEnabled: boolean
    payoutsEnabled: boolean
    requiresAction: boolean
    requirements: string[]
    bankName?: string
    last4?: string
} | null> {
    if (!stripe) return null

    try {
        const account = await stripe.accounts.retrieve(accountId)

        // Get bank account details if available
        let bankName: string | undefined
        let last4: string | undefined

        if (account.external_accounts?.data?.length) {
            const bankAccount = account.external_accounts.data[0] as Stripe.BankAccount
            bankName = bankAccount.bank_name || undefined
            last4 = bankAccount.last4 || undefined
        }

        return {
            chargesEnabled: account.charges_enabled ?? false,
            payoutsEnabled: account.payouts_enabled ?? false,
            requiresAction: (account.requirements?.currently_due?.length ?? 0) > 0,
            requirements: account.requirements?.currently_due || [],
            bankName,
            last4,
        }
    } catch (error) {
        console.error('[Stripe] Failed to get account status:', error)
        return null
    }
}

/**
 * Create a login link for Stripe Connect dashboard
 */
export async function createStripeConnectDashboardLink(accountId: string): Promise<Stripe.LoginLink | null> {
    if (!stripe) return null

    try {
        const loginLink = await stripe.accounts.createLoginLink(accountId)
        return loginLink
    } catch (error) {
        console.error('[Stripe] Failed to create dashboard link:', error)
        return null
    }
}

/**
 * Create a transfer to a Connect account
 */
export async function createTransferToMentor(params: {
    amount: number // in cents
    destinationAccountId: string
    description?: string
    metadata?: Record<string, string>
}): Promise<Stripe.Transfer | null> {
    if (!stripe) return null

    try {
        const transfer = await stripe.transfers.create({
            amount: params.amount,
            currency: 'usd',
            destination: params.destinationAccountId,
            description: params.description,
            metadata: params.metadata,
        })

        return transfer
    } catch (error) {
        console.error('[Stripe] Failed to create transfer:', error)
        return null
    }
}

/**
 * Platform fee percentage (15%)
 */
export const PLATFORM_FEE_PERCENTAGE = 0.15

/**
 * Calculate platform fee and mentor earnings
 */
export function calculateEarnings(grossAmount: number): {
    grossAmount: number
    platformFee: number
    netAmount: number
} {
    const platformFee = Math.round(grossAmount * PLATFORM_FEE_PERCENTAGE * 100) / 100
    const netAmount = Math.round((grossAmount - platformFee) * 100) / 100

    return {
        grossAmount,
        platformFee,
        netAmount,
    }
}
