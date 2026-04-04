interface AdminSession {
    id: string
    title: string
    description: string
    date: string
    time: string
    duration: number // in hours
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    amount: number
    meetingLink?: string
    paymentId?: string
    paymentStatus?: string
    createdAt: string
    confirmedAt?: string
    completedAt?: string
    cancelledAt?: string
    mentor: {
        id: string
        name: string
        email: string
        avatar?: string
    }
    mentee: {
        id: string
        name: string
        email: string
        avatar?: string
    }
}

interface MentorOption {
    id: string
    name: string
}

interface AdminSessionsResponse {
    sessions: AdminSession[]
    mentors: MentorOption[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export const useAdminSessions = () => {
    const sessions = ref<AdminSession[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Mentors for filter
    const mentors = ref<MentorOption[]>([])

    // Filters
    const searchQuery = ref('')
    const selectedStatus = ref<string>('all')
    const selectedMentor = ref<string>('all')
    const selectedDuration = ref<string>('all')
    const dateFrom = ref('')
    const dateTo = ref('')
    const showFilters = ref(false)

    // Pagination
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalSessions = ref(0)
    const pageSize = 15

    // Modal state
    const showDetailsModal = ref(false)
    const selectedSession = ref<AdminSession | null>(null)

    const fetchSessions = async (page = 1) => {
        isLoading.value = true
        error.value = null

        try {
            const params = new URLSearchParams()

            if (searchQuery.value) params.set('search', searchQuery.value)
            if (selectedStatus.value && selectedStatus.value !== 'all') params.set('status', selectedStatus.value)
            if (selectedMentor.value && selectedMentor.value !== 'all') params.set('mentorId', selectedMentor.value)
            if (selectedDuration.value && selectedDuration.value !== 'all') params.set('duration', selectedDuration.value)
            if (dateFrom.value) params.set('dateFrom', dateFrom.value)
            if (dateTo.value) params.set('dateTo', dateTo.value)
            params.set('page', page.toString())
            params.set('limit', pageSize.toString())

            const response = await $fetch<AdminSessionsResponse>(`/api/admin/sessions?${params.toString()}`)

            sessions.value = response.sessions
            mentors.value = response.mentors
            currentPage.value = response.pagination.page
            totalPages.value = response.pagination.totalPages
            totalSessions.value = response.pagination.total
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'Failed to fetch sessions'
            console.error('[useAdminSessions] Error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const viewSessionDetails = (session: AdminSession) => {
        selectedSession.value = session
        showDetailsModal.value = true
    }

    const updateSessionStatus = async (sessionId: string, newStatus: AdminSession['status']) => {
        try {
            // TODO: Implement API call to update session status
            // await $fetch(`/api/admin/sessions/${sessionId}/status`, { method: 'PUT', body: { status: newStatus } })

            // Optimistic update
            const session = sessions.value.find(s => s.id === sessionId)
            if (session) {
                session.status = newStatus
            }

            showDetailsModal.value = false
            console.log(`Session ${sessionId} status updated to ${newStatus}`)
        } catch (e: any) {
            error.value = e.data?.message || 'Failed to update session status'
            console.error('[useAdminSessions] Error updating status:', e)
        }
    }

    // Filter options
    const statusOptions = [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
    ]

    const durationOptions = [
        { label: 'Any duration', value: 'all' },
        { label: '30 minutes', value: '0.5' },
        { label: '1 hour', value: '1' },
        { label: '1.5 hours', value: '1.5' },
        { label: '2+ hours', value: '2+' }
    ]

    const mentorOptions = computed(() => [
        { label: 'All Mentors', value: 'all' },
        ...mentors.value.map(m => ({
            label: m.name,
            value: m.id
        }))
    ])

    // Watch for filter changes and refetch (with debounce for search)
    let searchTimeout: ReturnType<typeof setTimeout> | null = null

    watch(searchQuery, () => {
        if (searchTimeout) clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            currentPage.value = 1
            fetchSessions(1)
        }, 300)
    })

    watch([selectedStatus, selectedMentor, selectedDuration, dateFrom, dateTo], () => {
        currentPage.value = 1
        fetchSessions(1)
    })

    // Navigation methods
    const previousPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
            fetchSessions(currentPage.value)
        }
    }

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++
            fetchSessions(currentPage.value)
        }
    }

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
            fetchSessions(page)
        }
    }

    return {
        // Data
        sessions: readonly(sessions),
        mentors: readonly(mentors),
        // State
        isLoading: readonly(isLoading),
        error: readonly(error),
        // Filters
        searchQuery,
        selectedStatus,
        selectedMentor,
        selectedDuration,
        dateFrom,
        dateTo,
        showFilters,
        // Options
        statusOptions,
        durationOptions,
        mentorOptions,
        // Pagination
        currentPage: readonly(currentPage),
        totalPages: readonly(totalPages),
        totalSessions: readonly(totalSessions),
        pageSize,
        // Modal
        showDetailsModal,
        selectedSession,
        // Methods
        fetchSessions,
        viewSessionDetails,
        updateSessionStatus,
        previousPage,
        nextPage,
        goToPage,
    }
}
