interface Participant {
    id: string
    name: string
    email: string
    avatar?: string
}

type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

interface AdminPayment {
    id: string
    transactionId: string
    sessionTitle: string
    sessionDate: string
    duration: number
    amount: number
    platformFee: number
    paymentMethod: string
    status: PaymentStatus
    bookingStatus: string
    createdAt: string
    confirmedAt?: string
    completedAt?: string
    cancelledAt?: string
    mentor: Participant
    mentee: Participant
}

interface PaymentSummary {
    totalRevenue: number
    monthlyRevenue: number
    platformFees: number
    pendingPayouts: number
}

interface AdminPaymentsResponse {
    payments: AdminPayment[]
    summary: PaymentSummary
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export const useAdminPayments = () => {
    const payments = ref<AdminPayment[]>([])
    const summary = ref<PaymentSummary>({
        totalRevenue: 0,
        monthlyRevenue: 0,
        platformFees: 0,
        pendingPayouts: 0
    })
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Filters
    const searchQuery = ref('')
    const selectedStatus = ref<string>('all')
    const selectedTimeframe = ref<string>('all')

    // Pagination
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalPayments = ref(0)
    const pageSize = 15

    // Modal state
    const showDetailsModal = ref(false)
    const selectedPayment = ref<AdminPayment | null>(null)

    const fetchPayments = async (page = 1) => {
        isLoading.value = true
        error.value = null

        try {
            const params = new URLSearchParams()

            if (searchQuery.value) params.set('search', searchQuery.value)
            if (selectedStatus.value && selectedStatus.value !== 'all') params.set('status', selectedStatus.value)
            if (selectedTimeframe.value && selectedTimeframe.value !== 'all') params.set('timeframe', selectedTimeframe.value)
            params.set('page', page.toString())
            params.set('limit', pageSize.toString())

            const response = await $fetch<AdminPaymentsResponse>(`/api/admin/payments?${params.toString()}`)

            payments.value = response.payments
            summary.value = response.summary
            currentPage.value = response.pagination.page
            totalPages.value = response.pagination.totalPages
            totalPayments.value = response.pagination.total
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'Failed to fetch payments'
            console.error('[useAdminPayments] Error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const viewPaymentDetails = (payment: AdminPayment) => {
        selectedPayment.value = payment
        showDetailsModal.value = true
    }

    const processRefund = async (paymentId: string) => {
        try {
            await $fetch(`/api/admin/payments/${paymentId}/refund`, { method: 'POST' })

            // Update local state
            const payment = payments.value.find(p => p.id === paymentId)
            if (payment) {
                payment.status = 'refunded'
            }

            console.log(`Payment ${paymentId} refunded`)
        } catch (e: any) {
            const msg = e.data?.message || 'Failed to process refund'
            error.value = msg
            console.error('[useAdminPayments] Error processing refund:', e)
            throw new Error(msg)
        }
    }

    const downloadReceiptPdf = async (paymentId: string, transactionId: string) => {
        try {
            const response = await $fetch(`/api/admin/payments/${paymentId}/receipt`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(response as Blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `receipt-${transactionId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (e: any) {
            console.error('[useAdminPayments] Error downloading receipt:', e)
            throw new Error(e.data?.message || 'Failed to download receipt')
        }
    }

    // Filter options
    const statusOptions = [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' }
    ]

    const timeframeOptions = [
        { label: 'All Time', value: 'all' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
        { label: 'This year', value: '1y' }
    ]

    // Computed summary cards
    const paymentSummaryCards = computed(() => [
        {
            name: 'Total Revenue',
            value: `$${summary.value.totalRevenue.toLocaleString()}`,
            icon: 'heroicons:currency-dollar',
            color: 'green'
        },
        {
            name: 'This Month',
            value: `$${summary.value.monthlyRevenue.toLocaleString()}`,
            icon: 'heroicons:calendar-days',
            color: 'blue'
        },
        {
            name: 'Platform Fees',
            value: `$${summary.value.platformFees.toLocaleString()}`,
            icon: 'heroicons:receipt-percent',
            color: 'blue'
        },
        {
            name: 'Pending Payouts',
            value: `$${summary.value.pendingPayouts.toLocaleString()}`,
            icon: 'heroicons:clock',
            color: 'yellow'
        }
    ])

    // Watch for filter changes and refetch (with debounce for search)
    let searchTimeout: ReturnType<typeof setTimeout> | null = null

    watch(searchQuery, () => {
        if (searchTimeout) clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            currentPage.value = 1
            fetchPayments(1)
        }, 300)
    })

    watch([selectedStatus, selectedTimeframe], () => {
        currentPage.value = 1
        fetchPayments(1)
    })

    // Navigation methods
    const previousPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
            fetchPayments(currentPage.value)
        }
    }

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++
            fetchPayments(currentPage.value)
        }
    }

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
            fetchPayments(page)
        }
    }

    return {
        // Data
        payments: readonly(payments),
        summary: readonly(summary),
        paymentSummaryCards,
        // State
        isLoading: readonly(isLoading),
        error: readonly(error),
        // Filters
        searchQuery,
        selectedStatus,
        selectedTimeframe,
        // Options
        statusOptions,
        timeframeOptions,
        // Pagination
        currentPage: readonly(currentPage),
        totalPages: readonly(totalPages),
        totalPayments: readonly(totalPayments),
        pageSize,
        // Modal
        showDetailsModal,
        selectedPayment,
        // Methods
        fetchPayments,
        viewPaymentDetails,
        processRefund,
        downloadReceiptPdf,
        previousPage,
        nextPage,
        goToPage,
    }
}
