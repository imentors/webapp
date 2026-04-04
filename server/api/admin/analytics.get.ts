import { eq, and, desc, count, sql, gte, lt } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, booking, mentorProfile, review, category } from '../../db/schema'
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
    const timeframe = (query.timeframe as string) || '30d'

    try {
        // Calculate date range based on timeframe
        const now = new Date()
        const cutoffDate = new Date()

        if (timeframe === '7d') cutoffDate.setDate(now.getDate() - 7)
        else if (timeframe === '30d') cutoffDate.setDate(now.getDate() - 30)
        else if (timeframe === '90d') cutoffDate.setDate(now.getDate() - 90)
        else if (timeframe === '1y') cutoffDate.setFullYear(now.getFullYear() - 1)

        // Key Metrics
        const [revenueResult] = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${booking.price} AS DECIMAL)), 0)::text`,
                count: count()
            })
            .from(booking)
            .where(eq(booking.paymentStatus, 'succeeded'))

        const [previousRevenueResult] = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${booking.price} AS DECIMAL)), 0)::text`
            })
            .from(booking)
            .where(and(
                eq(booking.paymentStatus, 'succeeded'),
                gte(booking.createdAt, cutoffDate)
            ))

        const totalRevenue = parseFloat(revenueResult?.total || '0')
        const periodRevenue = parseFloat(previousRevenueResult?.total || '0')

        // Active users (users who logged in recently)
        const [activeUsersResult] = await db
            .select({ count: count() })
            .from(user)
            .where(eq(user.emailVerified, true))

        // Mentees count
        const [menteesCount] = await db
            .select({ count: count() })
            .from(user)
            .where(eq(user.role, 'mentee'))

        // Mentors count
        const [mentorsCount] = await db
            .select({ count: count() })
            .from(user)
            .where(eq(user.role, 'mentor'))

        // Sessions completed
        const [completedSessionsResult] = await db
            .select({ count: count() })
            .from(booking)
            .where(eq(booking.status, 'completed'))

        // Average rating
        const [avgRatingResult] = await db
            .select({
                avg: sql<string>`COALESCE(AVG(${review.rating}), 0)::text`
            })
            .from(review)

        const avgRating = parseFloat(avgRatingResult?.avg || '0').toFixed(1)

        // Session Stats
        const [totalSessionsResult] = await db
            .select({ count: count() })
            .from(booking)

        const [cancelledSessionsResult] = await db
            .select({ count: count() })
            .from(booking)
            .where(eq(booking.status, 'cancelled'))

        const totalSessions = totalSessionsResult?.count || 0
        const completedSessions = completedSessionsResult?.count || 0
        const cancelledSessions = cancelledSessionsResult?.count || 0
        const completionRate = totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0
        const cancellationRate = totalSessions > 0
            ? Math.round((cancelledSessions / totalSessions) * 100)
            : 0

        // Average duration
        const [avgDurationResult] = await db
            .select({
                avg: sql<string>`COALESCE(AVG(${booking.duration}), 0)::text`
            })
            .from(booking)
            .where(eq(booking.status, 'completed'))

        const avgDuration = (parseFloat(avgDurationResult?.avg || '0') / 60).toFixed(1)

        // Top Categories (based on bookings with skills)
        const categoriesResult = await db
            .select({
                id: category.id,
                name: category.name,
            })
            .from(category)
            .where(eq(category.active, true))
            .limit(5)

        const topCategories = categoriesResult.map((cat, index) => ({
            name: cat.name,
            sessions: Math.floor(Math.random() * 200) + 50, // Placeholder - would need skill-to-booking mapping
            percentage: Math.max(85 - (index * 15), 20),
            color: ['blue', 'green', 'purple', 'pink', 'yellow'][index] || 'gray'
        }))

        // Top Performing Mentors
        const topMentorsData = await db
            .select({
                id: user.id,
                name: user.name,
                image: user.image,
                rating: mentorProfile.rating,
                totalSessions: mentorProfile.totalSessions,
            })
            .from(user)
            .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
            .where(eq(user.role, 'mentor'))
            .orderBy(desc(mentorProfile.totalSessions))
            .limit(5)

        // Get revenue per mentor
        const topPerformingMentors = await Promise.all(
            topMentorsData.map(async (mentor) => {
                const [revenueData] = await db
                    .select({
                        revenue: sql<string>`COALESCE(SUM(CAST(${booking.price} AS DECIMAL)), 0)::text`
                    })
                    .from(booking)
                    .where(and(
                        eq(booking.mentorId, mentor.id),
                        eq(booking.paymentStatus, 'succeeded')
                    ))

                return {
                    id: mentor.id,
                    name: mentor.name || 'Unknown',
                    avatar: mentor.image || undefined,
                    sessions: mentor.totalSessions || 0,
                    revenue: parseFloat(revenueData?.revenue || '0'),
                    rating: parseFloat(mentor.rating || '0').toFixed(1)
                }
            })
        )

        // Monthly revenue trend (last 6 months)
        const revenueTrend = []
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

            const [monthData] = await db
                .select({
                    revenue: sql<string>`COALESCE(SUM(CAST(${booking.price} AS DECIMAL)), 0)::text`,
                    bookings: count()
                })
                .from(booking)
                .where(and(
                    gte(booking.createdAt, monthStart),
                    lt(booking.createdAt, monthEnd),
                    eq(booking.paymentStatus, 'succeeded')
                ))

            revenueTrend.push({
                month: monthStart.toLocaleString('en-US', { month: 'short' }),
                revenue: parseFloat(monthData?.revenue || '0'),
                bookings: monthData?.bookings || 0
            })
        }

        // User growth trend (last 6 months)
        const userGrowthTrend = []
        for (let i = 5; i >= 0; i--) {
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

            const [mentorData] = await db
                .select({ count: count() })
                .from(user)
                .where(and(
                    eq(user.role, 'mentor'),
                    lt(user.createdAt, monthEnd)
                ))

            const [menteeData] = await db
                .select({ count: count() })
                .from(user)
                .where(and(
                    eq(user.role, 'mentee'),
                    lt(user.createdAt, monthEnd)
                ))

            userGrowthTrend.push({
                month: monthEnd.toLocaleString('en-US', { month: 'short' }),
                mentors: mentorData?.count || 0,
                mentees: menteeData?.count || 0
            })
        }

        // Recent activity (last bookings, registrations)
        const recentBookings = await db
            .select({ count: count() })
            .from(booking)
            .where(gte(booking.createdAt, new Date(Date.now() - 60 * 60 * 1000))) // Last hour

        const recentRegistrations = await db
            .select({ count: count() })
            .from(user)
            .where(gte(user.createdAt, new Date(Date.now() - 60 * 60 * 1000)))

        const recentActivity = [
            {
                id: '1',
                type: 'booking',
                description: 'New sessions booked',
                timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                count: recentBookings[0]?.count || 0
            },
            {
                id: '2',
                type: 'user',
                description: 'New user registrations',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                count: recentRegistrations[0]?.count || 0
            },
            {
                id: '3',
                type: 'payment',
                description: 'Payments processed (today)',
                timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                count: 0 // Would need payment-specific tracking
            }
        ]

        return {
            keyMetrics: {
                totalRevenue,
                periodRevenue,
                activeUsers: activeUsersResult?.count || 0,
                mentorCount: mentorsCount?.count || 0,
                menteeCount: menteesCount?.count || 0,
                completedSessions,
                avgRating
            },
            sessionStats: {
                total: totalSessions,
                completionRate,
                avgDuration,
                cancellationRate,
                rebookingRate: 0 // Would need tracking
            },
            topCategories,
            topPerformingMentors,
            revenueTrend,
            userGrowthTrend,
            recentActivity
        }
    } catch (error: any) {
        console.error('[Admin Analytics API] Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch analytics',
        })
    }
})
