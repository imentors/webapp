import { eq } from 'drizzle-orm'
import { db } from '../../../../utils/drizzle'
import { booking, user } from '../../../../db/schema'
import { auth } from '../../../../utils/auth'
import { createPaymentRefundedEmail } from '../../../../email-templates'
import { sendEmail } from '../../../../utils/email'
import { stripe } from '../../../../utils/stripe'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (session.user.role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Payment ID is required' })
    }

    try {
        // Check if booking exists and is in a refundable state
        const existingBooking = await db.query.booking.findFirst({
            where: eq(booking.id, id),
            with: {
                mentee: true,
                mentor: true
            }
        })

        if (!existingBooking) {
            throw createError({ statusCode: 404, message: 'Payment not found' })
        }

        if (existingBooking.paymentStatus !== 'succeeded') {
            throw createError({ statusCode: 400, message: 'Only successful payments can be refunded' })
        }

        // Process actual Stripe refund if we have a payment intent ID
        if (existingBooking.stripePaymentIntentId && stripe) {
            try {
                await stripe.refunds.create({
                    payment_intent: existingBooking.stripePaymentIntentId,
                })
            } catch (stripeError: any) {
                console.error('[Admin Refund API] Stripe Refund Error:', stripeError)
                // If it's already refunded in Stripe, we can continue to update our DB
                if (!stripeError.message?.includes('has already been refunded')) {
                    throw createError({
                        statusCode: 400,
                        message: `Stripe refund failed: ${stripeError.message}`
                    })
                }
            }
        }

        // Update payment status to refunded
        await db.update(booking)
            .set({
                paymentStatus: 'refunded',
                status: 'cancelled', // Also cancel the session if it was refunded
                cancelledAt: new Date()
            })
            .where(eq(booking.id, id))

        // Send refund email to mentee
        if (existingBooking.mentee?.email) {
            const { subject, htmlContent } = createPaymentRefundedEmail({
                mentorName: existingBooking.mentor?.name || 'Your Mentor',
                menteeName: existingBooking.mentee?.name || 'there',
                sessionTitle: existingBooking.title,
                scheduledDate: existingBooking.scheduledDate,
                duration: existingBooking.duration,
                price: existingBooking.price.toString(),
                bookingId: existingBooking.id
            })

            await sendEmail({
                to: existingBooking.mentee.email,
                subject,
                htmlContent
            })
        }

        return {
            success: true,
            message: 'Payment refunded successfully and mentee notified'
        }
    } catch (error: any) {
        console.error('[Admin Refund API] Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to process refund',
        })
    }
})
