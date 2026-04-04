import type { Booking } from '~/types'

interface DashboardStats {
    role: 'mentor' | 'mentee'
    stats: {
        // Mentee stats
        upcomingSessions?: number
        completedSessions?: number
        unreadMessages?: number
        // Mentor stats
        monthlyEarnings?: number
        activeMentees?: number
        averageRating?: number
        totalEarnings?: number
        totalSessions?: number
        profileViews?: number
        bookingRate?: number
        responseTime?: string
        completionRate?: number
    }
    earningsData?: Array<{ name: string; amount: number }>
}

export const useDashboard = () => {
    const stats = ref<DashboardStats | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const fetchDashboardStats = async () => {
        isLoading.value = true
        error.value = null
        try {
            const data = await $fetch<DashboardStats>('/api/dashboard/stats')
            stats.value = data
        } catch (e: any) {
            error.value = e.data?.message || 'Failed to fetch dashboard stats'
            console.error('[useDashboard] Error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const fetchRecentActivity = async (bookings: Booking[]) => {
        // Generate activity feed from bookings
        const activities = bookings
            .map(booking => {
                const activities: Array<{
                    id: string
                    type: 'session' | 'message' | 'booking'
                    icon: string
                    description: string
                    timestamp: Date
                }> = []

                // Booking created
                activities.push({
                    id: `${booking.id}-created`,
                    type: 'booking',
                    icon: 'heroicons:calendar-days',
                    description: `Session "${booking.title}" ${booking.status === 'confirmed' ? 'confirmed' : 'booked'}`,
                    timestamp: booking.createdAt,
                })

                // Session completed
                if (booking.status === 'completed') {
                    activities.push({
                        id: `${booking.id}-completed`,
                        type: 'session',
                        icon: 'heroicons:check-circle',
                        description: `Completed session "${booking.title}"`,
                        timestamp: booking.scheduledDate,
                    })
                }

                return activities
            })
            .flat()
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10) // Get last 10 activities

        return activities
    }

    return {
        stats: readonly(stats),
        isLoading: readonly(isLoading),
        error: readonly(error),
        fetchDashboardStats,
        fetchRecentActivity,
    }
}















