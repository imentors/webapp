import { eq, and, gte, lt, count, sql, desc } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, booking, mentorProfile } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (session.user.role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    try {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        // Total users
        const totalUsersResult = await db
            .select({ count: count() })
            .from(user)
        const totalUsers = totalUsersResult[0]?.count || 0

        // Total users last month (for percentage change)
        const totalUsersLastMonthResult = await db
            .select({ count: count() })
            .from(user)
            .where(lt(user.createdAt, startOfMonth))
        const totalUsersLastMonth = totalUsersLastMonthResult[0]?.count || 0
        const usersChange = totalUsersLastMonth > 0
            ? Math.round(((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100)
            : 0

        // Active mentors (verified, onboarded)
        const activeMentorsResult = await db
            .select({ count: count() })
            .from(user)
            .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
            .where(
                and(
                    eq(user.role, 'mentor'),
                    eq(user.emailVerified, true),
                    eq(user.hasCompletedOnboarding, true)
                )
            )
        const activeMentors = activeMentorsResult[0]?.count || 0

        // Active mentors last month
        const activeMentorsLastMonthResult = await db
            .select({ count: count() })
            .from(user)
            .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
            .where(
                and(
                    eq(user.role, 'mentor'),
                    eq(user.emailVerified, true),
                    eq(user.hasCompletedOnboarding, true),
                    lt(user.createdAt, startOfMonth)
                )
            )
        const activeMentorsLastMonth = activeMentorsLastMonthResult[0]?.count || 0
        const mentorsChange = activeMentorsLastMonth > 0
            ? Math.round(((activeMentors - activeMentorsLastMonth) / activeMentorsLastMonth) * 100)
            : 0

        // Sessions this month
        const sessionsThisMonthResult = await db
            .select({ count: count() })
            .from(booking)
            .where(
                and(
                    gte(booking.createdAt, startOfMonth),
                    sql`${booking.status} IN ('confirmed', 'completed')`
                )
            )
        const sessionsThisMonth = sessionsThisMonthResult[0]?.count || 0

        // Sessions last month
        const sessionsLastMonthResult = await db
            .select({ count: count() })
            .from(booking)
            .where(
                and(
                    gte(booking.createdAt, startOfLastMonth),
                    lt(booking.createdAt, startOfMonth),
                    sql`${booking.status} IN ('confirmed', 'completed')`
                )
            )
        const sessionsLastMonth = sessionsLastMonthResult[0]?.count || 0
        const sessionsChange = sessionsLastMonth > 0
            ? Math.round(((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100)
            : 0

        // Platform revenue (from successful payments)
        const revenueResult = await db
            .select({
                total: sql<number>`COALESCE(SUM(${booking.price}::numeric), 0)::float`
            })
            .from(booking)
            .where(eq(booking.paymentStatus, 'succeeded'))
        const platformRevenue = parseFloat(revenueResult[0]?.total?.toString() || '0')

        // Revenue last month
        const revenueLastMonthResult = await db
            .select({
                total: sql<number>`COALESCE(SUM(${booking.price}::numeric), 0)::float`
            })
            .from(booking)
            .where(
                and(
                    eq(booking.paymentStatus, 'succeeded'),
                    gte(booking.createdAt, startOfLastMonth),
                    lt(booking.createdAt, startOfMonth)
                )
            )
        const revenueLastMonth = parseFloat(revenueLastMonthResult[0]?.total?.toString() || '0')
        const revenueChange = revenueLastMonth > 0
            ? Math.round(((platformRevenue - revenueLastMonth) / revenueLastMonth) * 100)
            : 0

        // Today's stats
        const todaySignupsResult = await db
            .select({ count: count() })
            .from(user)
            .where(gte(user.createdAt, startOfToday))
        const todaySignups = todaySignupsResult[0]?.count || 0

        const todaySessionsResult = await db
            .select({ count: count() })
            .from(booking)
            .where(gte(booking.createdAt, startOfToday))
        const todaySessions = todaySessionsResult[0]?.count || 0

        const todayRevenueResult = await db
            .select({
                total: sql<number>`COALESCE(SUM(${booking.price}::numeric), 0)::float`
            })
            .from(booking)
            .where(
                and(
                    eq(booking.status, 'completed'),
                    gte(booking.completedAt!, startOfToday)
                )
            )
        const todayRevenue = parseFloat(todayRevenueResult[0]?.total?.toString() || '0')

        // Recent bookings (last 10)
        const recentBookings = await db
            .select({
                id: booking.id,
                title: booking.title,
                status: booking.status,
                price: booking.price,
                createdAt: booking.createdAt,
                mentorName: user.name,
            })
            .from(booking)
            .leftJoin(user, eq(booking.mentorId, user.id))
            .orderBy(desc(booking.createdAt))
            .limit(10)

        // Top mentors (by revenue) - use subquery for better performance
        const mentorRevenues = await db
            .select({
                mentorId: booking.mentorId,
                revenue: sql<number>`COALESCE(SUM(${booking.price}::numeric), 0)::float`
            })
            .from(booking)
            .where(eq(booking.status, 'completed'))
            .groupBy(booking.mentorId)

        const revenueMap = new Map(
            mentorRevenues.map(mr => [mr.mentorId, parseFloat(mr.revenue?.toString() || '0')])
        )

        // Get all active mentors
        const allMentors = await db
            .select({
                id: user.id,
                name: user.name,
                image: user.image,
                rating: mentorProfile.rating,
                totalSessions: mentorProfile.totalSessions,
            })
            .from(user)
            .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
            .where(
                and(
                    eq(user.role, 'mentor'),
                    eq(user.emailVerified, true),
                    eq(user.hasCompletedOnboarding, true)
                )
            )

        // Add revenue to each mentor and sort
        const topMentors = allMentors
            .map(mentor => ({
                ...mentor,
                revenue: revenueMap.get(mentor.id) || 0
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // Recent users (last 10)
        const recentUsers = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt,
            })
            .from(user)
            .orderBy(desc(user.createdAt))
            .limit(10)

        // Recent activity (from bookings and new users)
        const recentActivity: Array<{
            id: string
            type: 'user' | 'session' | 'payment' | 'system'
            icon: string
            description: string
            timestamp: Date
        }> = []

        // Add recent bookings as activity
        recentBookings.slice(0, 5).forEach(booking => {
            recentActivity.push({
                id: `booking-${booking.id}`,
                type: booking.status === 'completed' ? 'payment' : 'session',
                icon: booking.status === 'completed' ? 'heroicons:currency-dollar' : 'heroicons:calendar-days',
                description: booking.status === 'completed'
                    ? `Session completed: ${booking.title}`
                    : `New session booked: ${booking.title}`,
                timestamp: booking.createdAt,
            })
        })

        // Add recent users as activity
        recentUsers.slice(0, 3).forEach(user => {
            recentActivity.push({
                id: `user-${user.id}`,
                type: 'user',
                icon: 'heroicons:user-plus',
                description: `New ${user.role} ${user.name} joined the platform`,
                timestamp: user.createdAt,
            })
        })

        // Sort by timestamp and limit
        recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        recentActivity.splice(10)

        // Pending approvals (mentors not verified or not onboarded)
        const pendingApprovalsResult = await db
            .select({ count: count() })
            .from(user)
            .where(
                and(
                    eq(user.role, 'mentor'),
                    sql`(${user.emailVerified} = false OR ${user.hasCompletedOnboarding} = false)`
                )
            )
        const pendingApprovals = pendingApprovalsResult[0]?.count || 0

        return {
            stats: {
                totalUsers: {
                    value: totalUsers,
                    change: usersChange,
                },
                activeMentors: {
                    value: activeMentors,
                    change: mentorsChange,
                },
                sessionsThisMonth: {
                    value: sessionsThisMonth,
                    change: sessionsChange,
                },
                platformRevenue: {
                    value: Math.round(platformRevenue),
                    change: revenueChange,
                },
            },
            today: {
                signups: todaySignups,
                sessions: todaySessions,
                revenue: Math.round(todayRevenue),
                messages: 0, // Placeholder - would need messages table
            },
            recentBookings: recentBookings.map(b => ({
                id: b.id,
                title: b.title,
                mentorName: b.mentorName || 'Unknown',
                status: b.status,
                amount: parseFloat(b.price || '0'),
            })),
            topMentors: topMentors.map(m => ({
                id: m.id,
                name: m.name,
                avatar: m.image || undefined,
                sessions: m.totalSessions || 0,
                revenue: Math.round(parseFloat(m.revenue?.toString() || '0')),
                rating: parseFloat(m.rating || '0'),
            })),
            recentUsers: recentUsers.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                avatar: u.image || undefined,
                role: u.role,
                status: u.role === 'mentor' && !u.emailVerified ? 'pending' : 'active',
            })),
            recentActivity,
            pendingApprovals,
            // Revenue trend for last 6 months
            revenueTrend: await getRevenueTrend(now),
        }
    } catch (error: any) {
        console.error('[Admin Stats API] Error:', error)
        throw createError({ statusCode: 500, message: 'Failed to fetch admin stats' })
    }
})

// Helper function to get revenue trend for last 6 months
async function getRevenueTrend(now: Date) {
    const trend = []
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

        const [monthData] = await db
            .select({
                revenue: sql<number>`COALESCE(SUM(${booking.price}::numeric), 0)::float`,
                bookings: count()
            })
            .from(booking)
            .where(and(
                gte(booking.createdAt, monthStart),
                lt(booking.createdAt, monthEnd),
                eq(booking.paymentStatus, 'succeeded')
            ))

        trend.push({
            month: monthStart.toLocaleString('en-US', { month: 'short' }),
            revenue: Math.round(parseFloat(monthData?.revenue?.toString() || '0')),
            bookings: monthData?.bookings || 0
        })
    }
    return trend
}

