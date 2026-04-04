import { eq, and, ilike, desc, count, sql, gte, or } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, booking } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (session.user.role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    const query = getQuery(event)

    const search = (query.search as string) || ''
    const status = (query.status as string) || ''
    const timeframe = (query.timeframe as string) || ''
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 15, 50)
    const offset = (page - 1) * limit

    try {
        // Build base conditions - only bookings with payment info
        const baseConditions: any[] = []

        // Add payment status filter if provided
        if (status && status !== 'all') {
            baseConditions.push(eq(booking.paymentStatus, status as any))
        }

        // Add timeframe filter if provided
        if (timeframe && timeframe !== 'all') {
            const now = new Date()
            const cutoffDate = new Date()

            if (timeframe === '7d') cutoffDate.setDate(now.getDate() - 7)
            else if (timeframe === '30d') cutoffDate.setDate(now.getDate() - 30)
            else if (timeframe === '90d') cutoffDate.setDate(now.getDate() - 90)
            else if (timeframe === '1y') cutoffDate.setFullYear(now.getFullYear() - 1)

            baseConditions.push(gte(booking.createdAt, cutoffDate))
        }

        // Add search filter if provided
        if (search) {
            baseConditions.push(
                or(
                    ilike(booking.title, `%${search}%`),
                    ilike(booking.stripePaymentIntentId, `%${search}%`),
                    ilike(booking.id, `%${search}%`)
                )
            )
        }

        // Get total count for pagination
        const whereClause = baseConditions.length > 0 ? and(...baseConditions) : undefined

        const totalCountResult = await db
            .select({ count: count() })
            .from(booking)
            .where(whereClause)

        const total = totalCountResult[0]?.count || 0

        // Get payments with booking info
        const paymentsData = await db
            .select({
                id: booking.id,
                title: booking.title,
                description: booking.description,
                scheduledDate: booking.scheduledDate,
                duration: booking.duration,
                status: booking.status,
                price: booking.price,
                stripePaymentIntentId: booking.stripePaymentIntentId,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt,
                confirmedAt: booking.confirmedAt,
                completedAt: booking.completedAt,
                cancelledAt: booking.cancelledAt,
                mentorId: booking.mentorId,
                menteeId: booking.menteeId,
            })
            .from(booking)
            .where(whereClause)
            .orderBy(desc(booking.createdAt))
            .limit(limit)
            .offset(offset)

        // Get mentor and mentee info separately
        const userIds = new Set<string>()
        paymentsData.forEach(p => {
            userIds.add(p.mentorId)
            userIds.add(p.menteeId)
        })

        let usersData: { id: string; name: string | null; email: string; image: string | null }[] = []
        if (userIds.size > 0) {
            usersData = await db
                .select({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                })
                .from(user)
                .where(sql`${user.id} IN (${sql.join([...userIds].map(id => sql`${id}`), sql`, `)})`)
        }

        // Create a map for quick lookup
        const usersMap = new Map(usersData.map(u => [u.id, u]))

        // Platform fee percentage (10%)
        const PLATFORM_FEE_PERCENT = 0.10

        // Transform data to match expected format
        const payments = paymentsData.map(p => {
            const mentor = usersMap.get(p.mentorId)
            const mentee = usersMap.get(p.menteeId)
            const amount = parseFloat(p.price || '0')
            const platformFee = amount * PLATFORM_FEE_PERCENT

            return {
                id: p.id,
                transactionId: p.stripePaymentIntentId || p.id,
                sessionTitle: p.title || 'Mentoring Session',
                sessionDate: p.scheduledDate,
                duration: p.duration / 60, // Convert minutes to hours
                amount,
                platformFee: parseFloat(platformFee.toFixed(2)),
                paymentMethod: 'Card ****', // Would come from Stripe in real implementation
                status: p.paymentStatus || 'pending',
                bookingStatus: p.status,
                createdAt: p.createdAt,
                confirmedAt: p.confirmedAt,
                completedAt: p.completedAt,
                cancelledAt: p.cancelledAt,
                mentor: {
                    id: p.mentorId,
                    name: mentor?.name || 'Unknown Mentor',
                    email: mentor?.email || '',
                    avatar: mentor?.image || undefined
                },
                mentee: {
                    id: p.menteeId,
                    name: mentee?.name || 'Unknown Mentee',
                    email: mentee?.email || '',
                    avatar: mentee?.image || undefined
                }
            }
        })

        // Calculate summary stats
        const summaryResult = await db
            .select({
                totalRevenue: sql<string>`COALESCE(SUM(CAST(${booking.price} AS DECIMAL)), 0)::text`,
                completedCount: sql<number>`COUNT(*) FILTER (WHERE ${booking.paymentStatus} = 'succeeded')::int`,
                pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${booking.paymentStatus} = 'pending')::int`,
            })
            .from(booking)

        // Calculate this month's revenue
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const monthlyResult = await db
            .select({
                monthlyRevenue: sql<string>`COALESCE(SUM(CAST(${booking.price} AS DECIMAL)), 0)::text`,
            })
            .from(booking)
            .where(and(
                gte(booking.createdAt, startOfMonth),
                eq(booking.paymentStatus, 'succeeded')
            ))

        const totalRevenue = parseFloat(summaryResult[0]?.totalRevenue || '0')
        const monthlyRevenue = parseFloat(monthlyResult[0]?.monthlyRevenue || '0')
        const platformFees = totalRevenue * PLATFORM_FEE_PERCENT

        // Pending payouts = completed sessions that haven't been paid out
        const pendingPayoutsResult = await db
            .select({
                pendingAmount: sql<string>`COALESCE(SUM(CAST(${booking.price} AS DECIMAL)), 0)::text`,
            })
            .from(booking)
            .where(and(
                eq(booking.status, 'completed'),
                eq(booking.paymentStatus, 'succeeded')
            ))

        const pendingPayouts = parseFloat(pendingPayoutsResult[0]?.pendingAmount || '0') * (1 - PLATFORM_FEE_PERCENT)

        const summary = {
            totalRevenue,
            monthlyRevenue,
            platformFees: parseFloat(platformFees.toFixed(2)),
            pendingPayouts: parseFloat(pendingPayouts.toFixed(2)),
        }

        return {
            payments,
            summary,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error: any) {
        console.error('[Admin Payments API] Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch payments',
        })
    }
})
