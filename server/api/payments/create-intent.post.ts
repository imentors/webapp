import { auth } from '../../utils/auth'
import { createPaymentIntent } from '../../utils/stripe'

interface CreateIntentBody {
  amount: number // in dollars
  mentorId: string
  duration: number
  bookingId?: string
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody<CreateIntentBody>(event)

  // Validate request body
  if (!body.amount || !body.mentorId || !body.duration) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields: amount, mentorId, duration'
    })
  }

  try {
    // Convert dollars to cents
    const amountInCents = Math.round(body.amount * 100)

    const paymentIntent = await createPaymentIntent({
      amount: amountInCents,
      mentorId: body.mentorId,
      menteeId: session.user.id,
      bookingId: body.bookingId || `temp_${Date.now()}`,
      duration: body.duration,
    })

    if (!paymentIntent) {
      // Fallback to mock for development without Stripe keys
      console.warn('[Payments API] Stripe not configured, using mock payment')

      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 11)}`,
        amount: amountInCents,
        currency: 'usd',
        status: 'requires_payment_method',
        metadata: {
          mentorId: body.mentorId,
          menteeId: session.user.id,
          duration: body.duration.toString()
        }
      }

      return {
        success: true,
        data: mockPaymentIntent
      }
    }

    return {
      success: true,
      data: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }
    }
  } catch (error: any) {
    console.error('[Payments API] Error creating payment intent:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create payment intent'
    })
  }
})
