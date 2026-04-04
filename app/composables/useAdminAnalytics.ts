interface KeyMetrics {
    totalRevenue: number
    periodRevenue: number
    activeUsers: number
    mentorCount: number
    menteeCount: number
    completedSessions: number
    avgRating: string
}

interface SessionStats {
    total: number
    completionRate: number
    avgDuration: string
    cancellationRate: number
    rebookingRate: number
}

interface TopCategory {
    name: string
    sessions: number
    percentage: number
    color: string
}

interface TopMentor {
    id: string
    name: string
    avatar?: string
    sessions: number
    revenue: number
    rating: string
}

interface RevenueTrendItem {
    month: string
    revenue: number
    bookings: number
}

interface UserGrowthItem {
    month: string
    mentors: number
    mentees: number
}

interface RecentActivityItem {
    id: string
    type: string
    description: string
    timestamp: string
    count: number
}

interface AdminAnalyticsResponse {
    keyMetrics: KeyMetrics
    sessionStats: SessionStats
    topCategories: TopCategory[]
    topPerformingMentors: TopMentor[]
    revenueTrend: RevenueTrendItem[]
    userGrowthTrend: UserGrowthItem[]
    recentActivity: RecentActivityItem[]
}

export const useAdminAnalytics = () => {
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Data
    const keyMetrics = ref<KeyMetrics | null>(null)
    const sessionStats = ref<SessionStats | null>(null)
    const topCategories = ref<TopCategory[]>([])
    const topPerformingMentors = ref<TopMentor[]>([])
    const revenueTrend = ref<RevenueTrendItem[]>([])
    const userGrowthTrend = ref<UserGrowthItem[]>([])
    const recentActivity = ref<RecentActivityItem[]>([])

    // Timeframes
    const revenueTimeframe = ref('30d')
    const userGrowthTimeframe = ref('30d')

    const timeframeOptions = [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
        { label: 'Last year', value: '1y' }
    ]

    const fetchAnalytics = async (timeframe = '30d') => {
        isLoading.value = true
        error.value = null

        try {
            const params = new URLSearchParams()
            params.set('timeframe', timeframe)

            const response = await $fetch<AdminAnalyticsResponse>(`/api/admin/analytics?${params.toString()}`)

            keyMetrics.value = response.keyMetrics
            sessionStats.value = response.sessionStats
            topCategories.value = response.topCategories
            topPerformingMentors.value = response.topPerformingMentors
            revenueTrend.value = response.revenueTrend
            userGrowthTrend.value = response.userGrowthTrend
            recentActivity.value = response.recentActivity
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'Failed to fetch analytics'
            console.error('[useAdminAnalytics] Error:', e)
        } finally {
            isLoading.value = false
        }
    }

    // Computed key metrics cards
    const keyMetricsCards = computed(() => {
        if (!keyMetrics.value) return []

        return [
            {
                name: 'Total Revenue',
                value: `$${keyMetrics.value.totalRevenue.toLocaleString()}`,
                change: 23, // Would calculate from period comparison
                icon: 'heroicons:currency-dollar',
                color: 'green'
            },
            {
                name: 'Active Users',
                value: keyMetrics.value.activeUsers.toLocaleString(),
                change: 12,
                icon: 'heroicons:users',
                color: 'blue'
            },
            {
                name: 'Sessions Completed',
                value: keyMetrics.value.completedSessions.toLocaleString(),
                change: 15,
                icon: 'heroicons:calendar-days',
                color: 'blue'
            },
            {
                name: 'Avg Session Rating',
                value: keyMetrics.value.avgRating,
                change: 5,
                icon: 'heroicons:star',
                color: 'yellow'
            }
        ]
    })

    // Computed session stats list
    const sessionStatsList = computed(() => {
        if (!sessionStats.value) return []

        return [
            { label: 'Total Sessions', value: sessionStats.value.total.toLocaleString() },
            { label: 'Completion Rate', value: `${sessionStats.value.completionRate}%` },
            { label: 'Avg Duration', value: `${sessionStats.value.avgDuration}h` },
            { label: 'Cancellation Rate', value: `${sessionStats.value.cancellationRate}%` },
            { label: 'Rebooking Rate', value: `${sessionStats.value.rebookingRate}%` }
        ]
    })

    // Chart data formatters
    const revenueTrendData = computed(() => revenueTrend.value)
    const userGrowthData = computed(() => userGrowthTrend.value)

    const revenueTrendCategories = {
        revenue: { name: 'Revenue', color: '#3b82f6' },
        bookings: { name: 'Bookings', color: '#10b981' }
    }

    const userGrowthCategories = {
        mentors: { name: 'Mentors', color: '#8b5cf6' },
        mentees: { name: 'Mentees', color: '#f59e0b' }
    }

    // Watch for timeframe changes
    watch(revenueTimeframe, () => {
        fetchAnalytics(revenueTimeframe.value)
    })

    return {
        // State
        isLoading: readonly(isLoading),
        error: readonly(error),
        // Timeframes
        revenueTimeframe,
        userGrowthTimeframe,
        timeframeOptions,
        // Data
        keyMetrics: readonly(keyMetrics),
        sessionStats: readonly(sessionStats),
        topCategories: readonly(topCategories),
        topPerformingMentors: readonly(topPerformingMentors),
        revenueTrend: readonly(revenueTrend),
        userGrowthTrend: readonly(userGrowthTrend),
        recentActivity: readonly(recentActivity),
        // Computed
        keyMetricsCards,
        sessionStatsList,
        revenueTrendData,
        userGrowthData,
        revenueTrendCategories,
        userGrowthCategories,
        // Methods
        fetchAnalytics,
    }
}
