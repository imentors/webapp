<template>
  <NuxtLayout name="admin">
    <div class="space-y-6">

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:banknotes" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Available</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(totalAvailable) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:clock" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Pending</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(totalPending) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:users" class="w-6 h-6 text-teal-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Ready for Payout</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ mentorsReadyForPayout }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Pending Setup</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ mentorsPendingSetup }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <UTabs :items="tabs" v-model="selectedTab" :default-value="'pending'">
        <!-- Pending Payouts Tab -->
        <template #pending>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Mentors with Available Balance
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Process payouts for mentors who have completed sessions
              </p>
            </div>

            <div v-if="isLoading" class="p-8 flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div v-else-if="pendingMentors.length === 0" class="p-12 text-center">
              <Icon name="heroicons:check-circle" class="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">All payouts are up to date!</p>
              <p class="text-sm text-gray-400 mt-1">No mentors have available balances to pay out.</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Mentor
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Available
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Pending
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Sessions
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Bank Status
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="mentor in pendingMentors" :key="mentor.mentorId" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-6 py-4">
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ mentor.mentorName }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ mentor.mentorEmail }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="font-semibold text-green-600 dark:text-green-400">
                        {{ formatCurrency(mentor.availableBalance) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {{ formatCurrency(mentor.pendingBalance) }}
                    </td>
                    <td class="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {{ mentor.earningsCount }}
                    </td>
                    <td class="px-6 py-4">
                      <div v-if="mentor.isOnboarded" class="flex items-center gap-2">
                        <UBadge color="success" variant="subtle">Verified</UBadge>
                        <span v-if="mentor.bankName" class="text-xs text-gray-500">
                          {{ mentor.bankName }} •••• {{ mentor.last4 }}
                        </span>
                      </div>
                      <div v-else-if="mentor.hasBankAccount">
                        <UBadge color="warning" variant="subtle">Pending Verification</UBadge>
                      </div>
                      <div v-else>
                        <UBadge color="error" variant="subtle">Not Set Up</UBadge>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <UButton
                        v-if="mentor.isOnboarded && mentor.availableBalance > 0"
                        size="sm"
                        @click="processPayout(mentor)"
                        :loading="processingMentorId === mentor.mentorId"
                      >
                        Process Payout
                      </UButton>
                      <span v-else-if="!mentor.isOnboarded" class="text-sm text-gray-400">
                        Bank not verified
                      </span>
                      <span v-else class="text-sm text-gray-400">
                        No available balance
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- Payout History Tab -->
        <template #history>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Payout History
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    All processed payouts
                  </p>
                </div>
                <USelect
                  v-model="historyFilter"
                  :items="historyFilterOptions"
                  class="w-40"
                />
              </div>
            </div>

            <div v-if="isLoadingHistory" class="p-8 flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div v-else-if="payoutHistory.length === 0" class="p-12 text-center">
              <Icon name="heroicons:inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">No payout history yet</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Mentor
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Amount
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Sessions
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Transfer ID
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="payout in payoutHistory" :key="payout.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDate(payout.createdAt) }}
                    </td>
                    <td class="px-6 py-4">
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ payout.mentorName }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ payout.mentorEmail }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {{ formatCurrency(payout.amount) }}
                    </td>
                    <td class="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {{ payout.earningsCount }}
                    </td>
                    <td class="px-6 py-4">
                      <UBadge :color="getStatusColor(payout.status)" variant="subtle">
                        {{ payout.status }}
                      </UBadge>
                      <p v-if="payout.failureReason" class="text-xs text-red-500 mt-1">
                        {{ payout.failureReason }}
                      </p>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {{ payout.stripeTransferId || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="historyPagination.totalPages > 1" class="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Page {{ historyPagination.page }} of {{ historyPagination.totalPages }}
              </p>
              <UPagination
                v-model="historyPagination.page"
                :page-count="historyPagination.limit"
                :total="historyPagination.total"
                @update:model-value="fetchHistory"
              />
            </div>
          </div>
        </template>
      </UTabs>

      <!-- Confirmation Modal -->
      <UModal v-model:open="showConfirmModal" title="Confirm Payout">
        <template #body>
          <div v-if="selectedMentor" class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              You are about to process a manual payout for:
            </p>

            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-500 dark:text-gray-400">Mentor:</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ selectedMentor.mentorName }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 dark:text-gray-400">Amount:</span>
                <span class="font-bold text-green-600 dark:text-green-400">{{ formatCurrency(selectedMentor.availableBalance) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 dark:text-gray-400">Sessions:</span>
                <span class="text-gray-900 dark:text-white">{{ selectedMentor.earningsCount }}</span>
              </div>
            </div>

            <!-- Bank Details for Manual Transfer -->
            <div v-if="selectedMentor.bankName" class="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 space-y-2">
              <h4 class="text-sm font-medium text-teal-900 dark:text-teal-100 mb-2">Bank Details for Transfer</h4>
              <div class="flex justify-between items-center">
                <span class="text-teal-700 dark:text-teal-300">Bank:</span>
                <span class="font-medium text-teal-900 dark:text-teal-100">{{ selectedMentor.bankName }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-teal-700 dark:text-teal-300">Account:</span>
                <span class="font-medium text-teal-900 dark:text-teal-100">•••• {{ selectedMentor.last4 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-teal-700 dark:text-teal-300">Account Holder:</span>
                <span class="font-medium text-teal-900 dark:text-teal-100">{{ selectedMentor.accountHolderName }}</span>
              </div>
            </div>

            <UFormField label="Notes (optional)">
              <UTextarea v-model="payoutNotes" placeholder="Add any notes about this payout..." class="w-full" />
            </UFormField>

            <UAlert
              icon="heroicons:exclamation-triangle"
              color="warning"
              title="Manual Transfer Required"
              description="After marking as processed, you must manually transfer the funds to the mentor's bank account using your banking system."
            />
          </div>
        </template>

        <template #footer="{ close }">
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="close"
            >
              Cancel
            </UButton>
            <UButton
              @click="confirmPayout"
              :loading="isProcessing"
            >
              Mark as Processed
            </UButton>
          </div>
        </template>
      </UModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false,
})

interface PendingMentor {
  mentorId: string
  mentorName: string
  mentorEmail: string
  availableBalance: number
  pendingBalance: number
  earningsCount: number
  hasBankAccount: boolean
  isOnboarded: boolean
  bankName?: string
  last4?: string
  accountHolderName?: string
}

interface PayoutHistoryItem {
  id: string
  amount: string
  status: string
  stripeTransferId?: string
  createdAt: string
  mentorName: string
  mentorEmail: string
  earningsCount: number
  failureReason?: string
}

// State
const pendingMentors = ref<PendingMentor[]>([])
const payoutHistory = ref<PayoutHistoryItem[]>([])
const isLoading = ref(false)
const isLoadingHistory = ref(false)
const isProcessing = ref(false)
const processingMentorId = ref<string | null>(null)
const selectedTab = ref('pending')
const showConfirmModal = ref(false)
const selectedMentor = ref<PendingMentor | null>(null)
const payoutNotes = ref('')

const historyFilter = ref('all')
const historyFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed', value: 'failed' },
]

const historyPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

const tabs = [
  { label: 'Pending Payouts', slot: 'pending', value: 'pending' },
  { label: 'Payout History', slot: 'history', value: 'history' },
]

// Computed
const totalAvailable = computed(() =>
  pendingMentors.value.reduce((sum, m) => sum + m.availableBalance, 0)
)

const totalPending = computed(() =>
  pendingMentors.value.reduce((sum, m) => sum + m.pendingBalance, 0)
)

const mentorsReadyForPayout = computed(() =>
  pendingMentors.value.filter((m) => m.isOnboarded && m.availableBalance > 0).length
)

const mentorsPendingSetup = computed(() =>
  pendingMentors.value.filter((m) => !m.isOnboarded && (m.availableBalance > 0 || m.pendingBalance > 0)).length
)

// Methods
const fetchPending = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<{ mentors: PendingMentor[] }>('/api/admin/payouts/pending')
    pendingMentors.value = response.mentors
  } catch (e: any) {
    console.error('Failed to fetch pending payouts:', e)
  } finally {
    isLoading.value = false
  }
}

const fetchHistory = async (page = 1) => {
  isLoadingHistory.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', historyPagination.value.limit.toString())
    if (historyFilter.value !== 'all') {
      params.set('status', historyFilter.value)
    }

    const response = await $fetch<{
      payouts: PayoutHistoryItem[]
      pagination: typeof historyPagination.value
    }>(`/api/admin/payouts?${params.toString()}`)

    payoutHistory.value = response.payouts
    historyPagination.value = response.pagination
  } catch (e: any) {
    console.error('Failed to fetch payout history:', e)
  } finally {
    isLoadingHistory.value = false
  }
}

const refresh = () => {
  fetchPending()
  if (selectedTab.value === 1) {
    fetchHistory()
  }
}

const processPayout = (mentor: PendingMentor) => {
  selectedMentor.value = mentor
  payoutNotes.value = ''
  showConfirmModal.value = true
}

const confirmPayout = async () => {
  if (!selectedMentor.value) return

  isProcessing.value = true
  processingMentorId.value = selectedMentor.value.mentorId

  try {
    await $fetch('/api/admin/payouts/process', {
      method: 'POST',
      body: {
        mentorId: selectedMentor.value.mentorId,
        notes: payoutNotes.value || undefined,
      },
    })

    // Refresh data
    await fetchPending()
    showConfirmModal.value = false

    // Show success toast
    const toast = useToast()
    toast.add({
      title: 'Payout Processed',
      description: `Successfully paid out ${formatCurrency(selectedMentor.value.availableBalance)} to ${selectedMentor.value.mentorName}`,
      color: 'success',
    })
  } catch (e: any) {
    const toast = useToast()
    toast.add({
      title: 'Payout Failed',
      description: e.data?.message || e.message || 'Failed to process payout',
      color: 'error',
    })
  } finally {
    isProcessing.value = false
    processingMentorId.value = null
  }
}

const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'processing':
      return 'warning'
    case 'failed':
      return 'error'
    default:
      return 'neutral'
  }
}

// Watch for tab changes
watch(selectedTab, (tab) => {
  if (tab === 'history' && payoutHistory.value.length === 0) {
    fetchHistory()
  }
})

watch(historyFilter, () => {
  fetchHistory(1)
})

// Initial fetch
onMounted(() => {
  fetchPending()
})
</script>
