import { eq, and, or, gte, lte, sql, count, sum, distinct } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { booking, user, mentorProfile } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const userId = session.user.id
    const userRole = session.user.role

    try {
        if (userRole === 'mentor') {
            // Mentor dashboard stats
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            // Get all bookings for this mentor
            const allBookings = await db
                .select({
                    id: booking.id,
                    status: booking.status,
                    price: booking.price,
                    scheduledDate: booking.scheduledDate,
                    completedAt: booking.completedAt,
                    menteeId: booking.menteeId,
                })
                .from(booking)
                .where(eq(booking.mentorId, userId))

            // Calculate stats
            const upcomingSessions = allBookings.filter(
                b => b.scheduledDate > now && (b.status === 'confirmed' || b.status === 'pending')
            ).length

            const completedSessions = allBookings.filter(b => b.status === 'completed').length
            const totalSessions = completedSessions

            // Calculate earnings
            const totalEarnings = allBookings
                .filter(b => b.status === 'completed' && b.price)
                .reduce((sum, b) => sum + parseFloat(b.price || '0'), 0)

            const monthlyEarnings = allBookings
                .filter(b => 
                    b.status === 'completed' && 
                    b.price && 
                    b.completedAt && 
                    new Date(b.completedAt) >= startOfMonth
                )
                .reduce((sum, b) => sum + parseFloat(b.price || '0'), 0)

            // Count active mentees (unique mentees with confirmed/upcoming bookings)
            const activeMenteeIds = new Set(
                allBookings
                    .filter(b => 
                        b.scheduledDate > now && 
                        (b.status === 'confirmed' || b.status === 'pending')
                    )
                    .map(b => b.menteeId)
            )
            const activeMentees = activeMenteeIds.size

            // Get mentor profile for rating and profile views
            const mentorProfileData = await db
                .select({
                    rating: mentorProfile.rating,
                    totalSessions: mentorProfile.totalSessions,
                    profileViews: mentorProfile.profileViews,
                })
                .from(mentorProfile)
                .where(eq(mentorProfile.userId, userId))
                .limit(1)

            const averageRating = mentorProfileData[0]?.rating 
                ? parseFloat(mentorProfileData[0].rating) 
                : 0
            
            const profileViews = mentorProfileData[0]?.profileViews ?? 0

            // Calculate profile performance metrics (simplified - can be enhanced later)
            const totalBookings = allBookings.length
            const confirmedBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length
            const bookingRate = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0
            const completionRate = confirmedBookings > 0 
                ? Math.round((completedSessions / confirmedBookings) * 100) 
                : 0

            // Get earnings data for last 6 months
            const earningsData = []
            for (let i = 5; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
                
                const monthEarnings = allBookings
                    .filter(b => 
                        b.status === 'completed' && 
                        b.price && 
                        b.completedAt && 
                        new Date(b.completedAt) >= monthDate &&
                        new Date(b.completedAt) < nextMonthDate
                    )
                    .reduce((sum, b) => sum + parseFloat(b.price || '0'), 0)

                earningsData.push({
                    name: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                    amount: Math.round(monthEarnings),
                })
            }

            return {
                role: 'mentor',
                stats: {
                    monthlyEarnings: Math.round(monthlyEarnings),
                    upcomingSessions,
                    activeMentees,
                    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                    totalEarnings: Math.round(totalEarnings),
                    totalSessions,
                    profileViews,
                    bookingRate,
                    responseTime: '2h', // Placeholder - would need message tracking
                    completionRate,
                },
                earningsData,
            }
        } else {
            // Mentee dashboard stats
            const now = new Date()

            // Get all bookings for this mentee
            const allBookings = await db
                .select({
                    id: booking.id,
                    status: booking.status,
                    scheduledDate: booking.scheduledDate,
                    completedAt: booking.completedAt,
                })
                .from(booking)
                .where(eq(booking.menteeId, userId))

            // Calculate stats
            const upcomingSessions = allBookings.filter(
                b => b.scheduledDate > now && (b.status === 'confirmed' || b.status === 'pending')
            ).length

            const completedSessions = allBookings.filter(b => b.status === 'completed').length

            // Unread messages placeholder (would need messages table)
            const unreadMessages = 0

            return {
                role: 'mentee',
                stats: {
                    upcomingSessions,
                    completedSessions,
                    unreadMessages,
                },
            }
        }
    } catch (error: any) {
        console.error('[Dashboard Stats API] Error:', error)
        throw createError({ statusCode: 500, message: 'Failed to fetch dashboard stats' })
    }
})















