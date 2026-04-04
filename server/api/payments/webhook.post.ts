import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { booking, user, mentorEarning } from '../../db/schema'
import { notifyUser } from '../../utils/notifications'
import { createPaymentSuccessEmail, createPaymentFailedEmail } from '../../email-templates'
import { calculateEarnings } from '../../utils/stripe'
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const stripeSecretKey = config.stripeSecretKey
    const webhookSecret = config.stripeWebhookSecret

    if (!stripeSecretKey || !webhookSecret) {
        console.warn('[Payment Webhook] Stripe not configured')
        return { received: true }
    }

    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-02-24.acacia'
    })

    const body = await readRawBody(event)
    const signature = getHeader(event, 'stripe-signature')

    if (!body || !signature) {
        throw createError({ statusCode: 400, message: 'Missing body or signature' })
    }

    try {
        const stripeEvent = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        )

        console.log('[Payment Webhook] Received event:', stripeEvent.type)

        // Handle payment intent succeeded
        if (stripeEvent.type === 'payment_intent.succeeded') {
            const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent

            // Get booking associated with this payment
            const bookingResult = await db.query.booking.findFirst({
                where: eq(booking.stripePaymentIntentId, paymentIntent.id)
            })

            if (bookingResult) {
                // Get mentor and mentee details
                const mentorUser = await db.query.user.findFirst({
                    where: eq(user.id, bookingResult.mentorId),
                    columns: { name: true, email: true }
                })

                const menteeUser = await db.query.user.findFirst({
                    where: eq(user.id, bookingResult.menteeId),
                    columns: { name: true, email: true }
                })

                const amount = paymentIntent.amount / 100

                // Prepare booking details for notifications
                const bookingDetails = {
                    mentorName: mentorUser?.name || 'Mentor',
                    menteeName: menteeUser?.name || 'Mentee',
                    sessionTitle: bookingResult.title,
                    scheduledDate: bookingResult.scheduledDate,
                    duration: bookingResult.duration,
                    price: amount.toFixed(2),
                    bookingId: bookingResult.id
                }

                // Prepare email content
                const paymentEmail = createPaymentSuccessEmail(bookingDetails)

                // Send in-app and email notifications
                await Promise.all([
                    notifyUser(bookingResult.menteeId, {
                        inApp: {
                            userId: bookingResult.menteeId,
                            type: 'info',
                            title: 'Payment Successful',
                            message: `Payment of $${amount.toFixed(2)} for "${bookingResult.title}" was successful!`,
                            actionUrl: `/bookings?id=${bookingResult.id}`
                        },
                        email: paymentEmail
                    }),
                    notifyUser(bookingResult.mentorId, {
                        inApp: {
                            userId: bookingResult.mentorId,
                            type: 'info',
                            title: 'Payment Received',
                            message: `You received $${amount.toFixed(2)} for "${bookingResult.title}"`,
                            actionUrl: `/bookings?id=${bookingResult.id}`
                        }
                        // Mentors don't need payment receipt email
                    })
                ])

                // Create mentor earning record (pending until session completed)
                const earnings = calculateEarnings(amount)
                await db.insert(mentorEarning).values({
                    mentorId: bookingResult.mentorId,
                    bookingId: bookingResult.id,
                    grossAmount: earnings.grossAmount.toFixed(2),
                    platformFee: earnings.platformFee.toFixed(2),
                    netAmount: earnings.netAmount.toFixed(2),
                    status: 'pending', // Will become 'available' when session completes
                })

                console.log('[Payment Webhook] Payment succeeded, notifications sent, earning record created')
            }
        }

        // Handle payment intent failed
        if (stripeEvent.type === 'payment_intent.payment_failed') {
            const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent

            // Get booking associated with this payment
            const bookingResult = await db.query.booking.findFirst({
                where: eq(booking.stripePaymentIntentId, paymentIntent.id)
            })

            if (bookingResult) {
                // Get mentee details
                const menteeUser = await db.query.user.findFirst({
                    where: eq(user.id, bookingResult.menteeId),
                    columns: { name: true, email: true }
                })

                // Prepare email content
                const failedEmail = createPaymentFailedEmail({
                    menteeName: menteeUser?.name || 'User',
                    sessionTitle: bookingResult.title
                })

                // Send in-app and email notification
                await notifyUser(bookingResult.menteeId, {
                    inApp: {
                        userId: bookingResult.menteeId,
                        type: 'error',
                        title: 'Payment Failed',
                        message: `Payment for "${bookingResult.title}" failed. Please try again.`,
                        actionUrl: `/bookings?id=${bookingResult.id}`
                    },
                    email: failedEmail
                })

                console.log('[Payment Webhook] Payment failed, notifications sent')
            }
        }

        return { received: true }
    } catch (error: any) {
        console.error('[Payment Webhook] Error processing webhook:', error)
        throw createError({ statusCode: 400, message: 'Webhook error' })
    }
})
