interface AdminMentor {
    id: string
    name: string
    email: string
    avatar?: string
    category: string
    experience: string
    status: 'verified' | 'pending' | 'suspended'
    rating: number
    reviews: number
    totalSessions: number
    totalRevenue: number
    hourlyRate: number
    responseRate: number
    completionRate: number
    joinedAt: string
    bio: string
    skills: string[]
    isAvailable: boolean
    location?: string
    timezone?: string
    languages: string[]
}

interface CategoryOption {
    id: string
    name: string
}

interface AdminMentorsResponse {
    mentors: AdminMentor[]
    categories: CategoryOption[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export const useAdminMentors = () => {
    const mentors = useState<AdminMentor[]>('admin-mentors-list', () => [])
    const isLoading = useState<boolean>('admin-mentors-loading', () => false)
    const error = useState<string | null>('admin-mentors-error', () => null)

    // Categories for filter
    const categories = useState<CategoryOption[]>('admin-mentors-categories', () => [])

    // Filters
    const searchQuery = useState<string>('admin-mentors-search', () => '')
    const selectedStatus = useState<string>('admin-mentors-status', () => 'all')
    const selectedCategory = useState<string>('admin-mentors-category', () => 'all')
    const selectedRating = useState<string>('admin-mentors-rating', () => 'all')

    // Pagination
    const currentPage = useState<number>('admin-mentors-page', () => 1)
    const totalPages = useState<number>('admin-mentors-total-pages', () => 1)
    const totalMentors = useState<number>('admin-mentors-total-count', () => 0)
    const pageSize = 10

    // Modal state (kept for compatibility but will be used less)
    const showMentorModal = ref(false)
    const selectedMentor = ref<AdminMentor | null>(null)

    const fetchMentors = async (page = 1) => {
        isLoading.value = true
        error.value = null

        try {
            const params = new URLSearchParams()

            if (searchQuery.value) params.set('search', searchQuery.value)
            params.set('page', page.toString())
            params.set('limit', pageSize.toString())

            const headers = useRequestHeaders(['cookie']) as Record<string, string>
            const response = await $fetch<AdminMentorsResponse>(`/api/admin/mentors?${params.toString()}`, { headers })

            mentors.value = response.mentors
            categories.value = response.categories
            currentPage.value = response.pagination.page
            totalPages.value = response.pagination.totalPages
            totalMentors.value = response.pagination.total
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'Failed to fetch mentors'
            console.error('[useAdminMentors] Error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const getMentorById = async (id: string): Promise<AdminMentor | null> => {
        try {
            // Always fetch from API to ensure full details
            const response = await $fetch<any>(`/api/admin/mentors/${id}`)
            if (!response) {
                throw createError({
                    statusCode: 404,
                    message: 'Mentor not found'
                })
            }
            return response
        } catch (e: any) {
            console.error('[useAdminMentors] Error fetching mentor:', e)
            throw createError({
                statusCode: e.statusCode || 500,
                message: e.data?.message || e.message || 'Failed to fetch mentor details'
            })
        }
    }

    const viewMentorDetails = (mentor: AdminMentor) => {
        selectedMentor.value = mentor
        showMentorModal.value = true
    }

    const updateMentorStatus = async (mentorId: string, newStatus: AdminMentor['status']) => {
        try {
            const headers = useRequestHeaders(['cookie']) as Record<string, string>
            await $fetch(`/api/admin/mentors/${mentorId}`, {
                method: 'PUT',
                body: { status: newStatus },
                headers
            })

            // Refetch to ensure list is in sync
            await fetchMentors(currentPage.value)

            showMentorModal.value = false
            return true
        } catch (e: any) {
            error.value = e.data?.message || 'Failed to update mentor status'
            console.error('[useAdminMentors] Error updating status:', e)
            throw e
        }
    }

    const toggleMentorStatus = async (mentor: AdminMentor) => {
        const newStatus = mentor.status === 'verified' ? 'suspended' : 'verified'
        await updateMentorStatus(mentor.id, newStatus)
    }

    const deleteMentor = async (mentorId: string) => {
        try {
            const headers = useRequestHeaders(['cookie']) as Record<string, string>
            await $fetch(`/api/admin/mentors/${mentorId}`, {
                method: 'DELETE',
                headers
            })

            // Refetch to ensure list is in sync
            await fetchMentors(currentPage.value)

            return true
        } catch (e: any) {
            error.value = e.data?.message || 'Failed to delete mentor'
            console.error('[useAdminMentors] Error deleting mentor:', e)
            throw e
        }
    }

    // Computed properties
    const verifiedMentors = computed(() => mentors.value.filter(m => m.status === 'verified').length)
    const pendingMentors = computed(() => mentors.value.filter(m => m.status === 'pending').length)

    const categoryOptions = computed(() => [
        { label: 'All Categories', value: 'all' },
        ...categories.value.map(cat => ({
            label: cat.name,
            value: cat.name
        }))
    ])

    // Filter options
    const statusOptions = [
        { label: 'All Statuses', value: 'all' },
        { label: 'Verified', value: 'verified' },
        { label: 'Pending Review', value: 'pending' },
        { label: 'Suspended', value: 'suspended' }
    ]

    const ratingOptions = [
        { label: 'All Ratings', value: 'all' },
        { label: '4.5+ Stars', value: '4.5' },
        { label: '4.0+ Stars', value: '4.0' },
        { label: '3.5+ Stars', value: '3.5' },
        { label: 'Below 3.5', value: 'below-3.5' }
    ]

    // Watch for filter changes and refetch (with debounce for search)
    let searchTimeout: ReturnType<typeof setTimeout> | null = null

    watch(searchQuery, () => {
        if (searchTimeout) clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            currentPage.value = 1
            fetchMentors(1)
        }, 300)
    })

    watch([selectedStatus, selectedCategory, selectedRating], () => {
        currentPage.value = 1
        fetchMentors(1)
    })

    // Navigation methods
    const previousPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
            fetchMentors(currentPage.value)
        }
    }

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++
            fetchMentors(currentPage.value)
        }
    }

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
            fetchMentors(page)
        }
    }

    return {
        // Data
        mentors: readonly(mentors),
        categories: readonly(categories),
        // State
        isLoading: readonly(isLoading),
        error: readonly(error),
        // Filters
        searchQuery,
        selectedStatus,
        selectedCategory,
        selectedRating,
        // Options
        statusOptions,
        categoryOptions,
        ratingOptions,
        // Pagination
        currentPage: readonly(currentPage),
        totalPages: readonly(totalPages),
        totalMentors: readonly(totalMentors),
        pageSize,
        // Modal
        showMentorModal,
        selectedMentor,
        // Computed
        verifiedMentors,
        pendingMentors,
        // Methods
        fetchMentors,
        getMentorById,
        viewMentorDetails,
        updateMentorStatus,
        toggleMentorStatus,
        deleteMentor,
        previousPage,
        nextPage,
        goToPage,
    }
}
