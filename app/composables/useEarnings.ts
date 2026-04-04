interface EarningsSummary {
    totalEarnings: number
    availableBalance: number
    pendingBalance: number
    paidOutTotal: number
    thisMonthEarnings: number
    lastMonthEarnings: number
}

interface Earning {
    id: string
    grossAmount: string
    platformFee: string
    netAmount: string
    status: string
    availableAt: string | null
    createdAt: string
    bookingTitle: string
    bookingDate: string
    bookingDuration: number
    menteeName: string
}

interface Payout {
    id: string
    amount: string
    currency: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    periodStart: string
    periodEnd: string
    processedAt: string | null
    failureReason: string | null
    createdAt: string
    earningsCount?: number
}

interface BankAccount {
    id: string
    stripeConnectAccountId: string | null
    stripeConnectOnboarded: boolean
    bankName: string | null
    accountHolderName: string | null
    accountNumberLast4: string | null
    routingNumber: string | null
    accountType: string | null
    currency: string
    country: string
    status: 'pending' | 'verified' | 'failed'
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

interface StripeStatus {
    hasAccount: boolean
    isOnboarded: boolean
    canReceivePayouts: boolean
    chargesEnabled?: boolean
    status: string
    bankName?: string
    last4?: string
    requiresAction?: boolean
    requirements?: string[]
}

interface EarningsResponse {
    summary: EarningsSummary
    recentEarnings: Earning[]
    recentPayouts: Payout[]
    bankAccount: BankAccount | null
}

interface PayoutsResponse {
    payouts: Payout[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export const useEarnings = () => {
    // State
    const summary = ref<EarningsSummary>({
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        paidOutTotal: 0,
        thisMonthEarnings: 0,
        lastMonthEarnings: 0,
    })
    const recentEarnings = ref<Earning[]>([])
    const recentPayouts = ref<Payout[]>([])
    const bankAccount = ref<BankAccount | null>(null)
    const stripeStatus = ref<StripeStatus | null>(null)

    // Loading states
    const isLoading = ref(false)
    const isLoadingPayouts = ref(false)
    const isLoadingStripeStatus = ref(false)
    const isSavingBankAccount = ref(false)

    // Error states
    const error = ref<string | null>(null)
    const bankAccountError = ref<string | null>(null)

    // Payouts pagination
    const payouts = ref<Payout[]>([])
    const payoutsPagination = ref({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    })
    const payoutsFilter = ref<string>('all')

    /**
     * Fetch earnings summary and recent data
     */
    const fetchEarnings = async () => {
        isLoading.value = true
        error.value = null

        try {
            const response = await $fetch<EarningsResponse>('/api/earnings')
            summary.value = response.summary
            recentEarnings.value = response.recentEarnings
            recentPayouts.value = response.recentPayouts
            bankAccount.value = response.bankAccount
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'Failed to fetch earnings'
            console.error('[useEarnings] Error fetching earnings:', e)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Fetch paginated payouts
     */
    const fetchPayouts = async (page = 1) => {
        isLoadingPayouts.value = true
        error.value = null

        try {
            const params = new URLSearchParams()
            params.set('page', page.toString())
            params.set('limit', payoutsPagination.value.limit.toString())
            if (payoutsFilter.value !== 'all') {
                params.set('status', payoutsFilter.value)
            }

            const response = await $fetch<PayoutsResponse>(`/api/earnings/payouts?${params.toString()}`)
            payouts.value = response.payouts
            payoutsPagination.value = response.pagination
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'Failed to fetch payouts'
            console.error('[useEarnings] Error fetching payouts:', e)
        } finally {
            isLoadingPayouts.value = false
        }
    }

    /**
     * Check Stripe Connect account status
     */
    const checkStripeStatus = async () => {
        isLoadingStripeStatus.value = true

        try {
            stripeStatus.value = await $fetch<StripeStatus>('/api/earnings/stripe-status')
        } catch (e: any) {
            console.error('[useEarnings] Error checking Stripe status:', e)
        } finally {
            isLoadingStripeStatus.value = false
        }
    }

    /**
     * Set up bank account (stores bank details directly)
     */
    const setupBankAccount = async (data: {
        accountHolderName: string
        bankName: string
        accountNumber: string
    }): Promise<{ success: boolean; error?: string }> => {
        isSavingBankAccount.value = true
        bankAccountError.value = null

        try {
            const response = await $fetch<{
                success: boolean
                message: string
            }>('/api/earnings/bank-account', {
                method: 'POST',
                body: data,
            })

            return {
                success: true,
            }
        } catch (e: any) {
            const errorMsg = e.data?.message || e.message || 'Failed to set up bank account'
            bankAccountError.value = errorMsg
            console.error('[useEarnings] Error setting up bank account:', e)
            return {
                success: false,
                error: errorMsg,
            }
        } finally {
            isSavingBankAccount.value = false
        }
    }

    /**
     * Format currency amount
     */
    const formatCurrency = (amount: number | string, currency = 'USD'): string => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(num)
    }

    /**
     * Format date
     */
    const formatDate = (date: string | Date): string => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    /**
     * Format date range for payout period
     */
    const formatPeriod = (start: string, end: string): string => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }

    /**
     * Get status badge color (Nuxt UI compatible)
     */
    const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'error' | 'neutral' => {
        switch (status) {
            case 'completed':
            case 'paid':
            case 'verified':
                return 'success'
            case 'processing':
            case 'pending':
                return 'warning'
            case 'available':
                return 'info'
            case 'failed':
                return 'error'
            default:
                return 'neutral'
        }
    }

    /**
     * Get human-readable status label
     */
    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'pending':
                return 'Pending'
            case 'processing':
                return 'Processing'
            case 'completed':
                return 'Completed'
            case 'paid':
                return 'Paid Out'
            case 'available':
                return 'Available'
            case 'failed':
                return 'Failed'
            case 'verified':
                return 'Verified'
            default:
                return status.charAt(0).toUpperCase() + status.slice(1)
        }
    }

    // Watch for filter changes
    watch(payoutsFilter, () => {
        fetchPayouts(1)
    })

    return {
        // State
        summary,
        recentEarnings,
        recentPayouts,
        bankAccount,
        stripeStatus,
        payouts,
        payoutsPagination,
        payoutsFilter,

        // Loading states
        isLoading,
        isLoadingPayouts,
        isLoadingStripeStatus,
        isSavingBankAccount,

        // Errors
        error,
        bankAccountError,

        // Actions
        fetchEarnings,
        fetchPayouts,
        checkStripeStatus,
        setupBankAccount,

        // Formatters
        formatCurrency,
        formatDate,
        formatPeriod,
        getStatusColor,
        getStatusLabel,
    }
}
