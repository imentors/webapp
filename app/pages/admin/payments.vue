<template>
  <NuxtLayout name="admin">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="card in paymentSummaryCards"
        :key="card.name"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon
              :name="card.icon"
              :class="['w-8 h-8', `text-${card.color}-500`]"
            />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {{ card.name }}
              </dt>
              <dd class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ card.value }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex-1 max-w-lg">
          <UInput
            v-model="searchQuery"
            placeholder="Search payments..."
            icon="heroicons:magnifying-glass"
          />
        </div>
        
        <div class="flex items-center space-x-4">
          <USelect
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="All Status"
          />
          
          <USelect
            v-model="selectedTimeframe"
            :items="timeframeOptions"
            placeholder="All Time"
          />
          
          <UButton
            icon="heroicons:arrow-down-tray"
            variant="outline"
            @click="exportPayments"
          >
            Export
          </UButton>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mb-6 px-6 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div class="mt-2 text-sm text-red-700 dark:text-red-300">
              {{ error }}
            </div>
          </div>
        </div>
        <button 
          @click="fetchPayments()" 
          class="ml-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span class="ml-2 text-gray-600 dark:text-gray-400">Loading payments...</span>
      </div>
    </div>

    <!-- Payments Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Payment Transactions ({{ totalPayments }})
        </h3>
      </div>

      <!-- Empty State -->
      <div v-if="payments.length === 0" class="p-8 text-center">
        <Icon name="heroicons:currency-dollar" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No payments found</h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ searchQuery || selectedStatus !== 'all' || selectedTimeframe !== 'all' ? 'Try adjusting your filters' : 'No payments have been processed yet' }}
        </p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaction
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Session
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Participants
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="payment in payments" :key="payment.id">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ payment.transactionId.substring(0, 15) }}...
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ payment.paymentMethod }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ payment.sessionTitle }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(payment.sessionDate) }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="flex -space-x-2">
                    <UAvatar
                      :src="payment.mentor.avatar"
                      :alt="payment.mentor.name"
                      size="sm"
                    />
                    <UAvatar
                      :src="payment.mentee.avatar"
                      :alt="payment.mentee.name"
                      size="sm"
                    />
                  </div>
                  <div>
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ payment.mentor.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ payment.mentee.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  ${{ payment.amount.toFixed(2) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  Fee: ${{ payment.platformFee.toFixed(2) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getPaymentStatusColor(payment.status)"
                  variant="soft"
                >
                  {{ payment.status }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(payment.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <UDropdownMenu :items="getPaymentActions(payment)">
                  <UButton
                    variant="ghost"
                    icon="heroicons:ellipsis-horizontal"
                  />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="payments.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalPayments) }} of {{ totalPayments }} results
          </div>
          <div class="flex items-center space-x-2">
            <UButton
              variant="ghost"
              icon="heroicons:chevron-left"
              :disabled="currentPage === 1"
              @click="previousPage"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <UButton
              variant="ghost"
              icon="heroicons:chevron-right"
              :disabled="currentPage >= totalPages"
              @click="nextPage"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Details Modal -->
    <UModal v-model:open="showDetailsModal" :title="`Payment ${selectedPayment?.transactionId?.substring(0, 15)}...`">
      <template #body>
        <div v-if="selectedPayment" class="space-y-6">
          <!-- Transaction Info -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Transaction Details</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                <p class="font-medium text-gray-900 dark:text-white">{{ selectedPayment.transactionId }}</p>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Payment Method:</span>
                <p class="font-medium text-gray-900 dark:text-white">{{ selectedPayment.paymentMethod }}</p>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Amount:</span>
                <p class="font-medium text-gray-900 dark:text-white">${{ selectedPayment.amount.toFixed(2) }}</p>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Platform Fee:</span>
                <p class="font-medium text-gray-900 dark:text-white">${{ selectedPayment.platformFee.toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <!-- Session Info -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Session Information</h4>
            <div class="space-y-2 text-sm">
              <p><span class="text-gray-600 dark:text-gray-400">Title:</span> {{ selectedPayment.sessionTitle }}</p>
              <p><span class="text-gray-600 dark:text-gray-400">Date:</span> {{ formatDate(selectedPayment.sessionDate) }}</p>
              <p><span class="text-gray-600 dark:text-gray-400">Duration:</span> {{ selectedPayment.duration }}h</p>
            </div>
          </div>

          <!-- Participants -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Participants</h4>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <UAvatar
                  :src="selectedPayment.mentor.avatar"
                  :alt="selectedPayment.mentor.name"
                  size="md"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ selectedPayment.mentor.name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Mentor</p>
                </div>
              </div>
              <Icon name="heroicons:arrow-right" class="w-5 h-5 text-gray-400" />
              <div class="flex items-center space-x-3">
                <UAvatar
                  :src="selectedPayment.mentee.avatar"
                  :alt="selectedPayment.mentee.name"
                  size="md"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ selectedPayment.mentee.name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Mentee</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Status</h4>
            <UBadge :color="getPaymentStatusColor(selectedPayment.status)" variant="soft" size="lg">
              {{ selectedPayment.status }}
            </UBadge>
          </div>
        </div>
      </template>
      
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Close</UButton>
          <UButton
            v-if="selectedPayment?.status === 'succeeded'"
            color="error"
            variant="outline"
            @click="confirmRefund"
          >
            Process Refund
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Refund Confirmation Modal -->
    <UModal v-model:open="showRefundModal" title="Confirm Refund">
      <template #body>
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-gray-900 dark:text-white font-medium">Are you sure you want to process a refund?</p>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              This will refund <strong>${{ selectedPayment?.amount.toFixed(2) }}</strong> for the session "<strong>{{ selectedPayment?.sessionTitle }}</strong>". This action cannot be undone.
            </p>
          </div>
        </div>
      </template>
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton
            color="error"
            @click="executeRefund"
            :loading="isRefunding"
          >
            Confirm Refund
          </UButton>
        </div>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: false
})

const toast = useToast()

// Use admin payments composable
const {
  payments,
  paymentSummaryCards,
  isLoading,
  error,
  searchQuery,
  selectedStatus,
  selectedTimeframe,
  statusOptions,
  timeframeOptions,
  currentPage,
  totalPages,
  totalPayments,
  pageSize,
  showDetailsModal,
  selectedPayment,
  fetchPayments,
  viewPaymentDetails,
  processRefund,
  downloadReceiptPdf,
  previousPage,
  nextPage,
} = useAdminPayments()

const showRefundModal = ref(false)
const isRefunding = ref(false)

// Methods
const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d)
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'succeeded': return 'success'
    case 'pending': return 'warning'
    case 'failed': return 'error'
    case 'refunded': return 'neutral'
    default: return 'neutral'
  }
}

const getPaymentActions = (payment: any) => [
  [{
    label: 'View Details',
    icon: 'heroicons:eye',
    onSelect: () => viewPaymentDetails(payment)
  }],
  [{
    label: 'Download Receipt',
    icon: 'heroicons:arrow-down-tray',
    onSelect: () => downloadReceipt(payment)
  }],
  ...(payment.status === 'succeeded' ? [[{
    label: 'Process Refund',
    icon: 'heroicons:arrow-uturn-left',
    onSelect: () => handleProcessRefund(payment.id)
  }]] : [])
]

const downloadReceipt = async (payment: any) => {
  try {
    await downloadReceiptPdf(payment.id, payment.transactionId)
    toast.add({
      title: 'Receipt Downloaded',
      description: 'Payment receipt has been downloaded',
      color: 'success'
    })
  } catch (e: any) {
    toast.add({
      title: 'Download Failed',
      description: e.message || 'Failed to download receipt',
      color: 'error'
    })
  }
}

const handleProcessRefund = (paymentId: string) => {
  const payment = payments.value.find(p => p.id === paymentId)
  if (payment) {
    selectedPayment.value = payment
    showRefundModal.value = true
  }
}

const confirmRefund = () => {
  showRefundModal.value = true
}

const executeRefund = async () => {
  if (!selectedPayment.value) return
  
  isRefunding.value = true
  try {
    await processRefund(selectedPayment.value.id)
    showRefundModal.value = false
    showDetailsModal.value = false
    toast.add({
      title: 'Refund Successful',
      description: 'The payment has been refunded successfully',
      color: 'success'
    })
  } catch (e: any) {
    toast.add({
      title: 'Refund Failed',
      description: e.message || 'Failed to process refund',
      color: 'error'
    })
  } finally {
    isRefunding.value = false
  }
}

const exportPayments = () => {
  if (payments.value.length === 0) {
    toast.add({
      title: 'No Data',
      description: 'No payments to export for the current filters',
      color: 'warning'
    })
    return
  }

  const csvData = payments.value.map((payment: any) => ({
    'Transaction ID': payment.transactionId,
    'Session': payment.sessionTitle,
    'Mentor': payment.mentor.name,
    'Mentee': payment.mentee.name,
    'Amount': `$${payment.amount.toFixed(2)}`,
    'Platform Fee': `$${payment.platformFee.toFixed(2)}`,
    'Payment Method': payment.paymentMethod,
    'Status': payment.status,
    'Date': formatDate(payment.createdAt)
  }))

  const headers = [
    'Transaction ID',
    'Session',
    'Mentor',
    'Mentee',
    'Amount',
    'Platform Fee',
    'Payment Method',
    'Status',
    'Date'
  ]

  const headerLine = headers.join(',')
  const rows = csvData
    .map(row => headers.map(h => (row as Record<string, string>)[h]).join(','))
    .join('\n')
  const csv = `${headerLine}\n${rows}`

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.add({
    title: 'Export Complete',
    description: `Exported ${csvData.length} payments`,
    color: 'success'
  })
}

// Initial data fetch
onMounted(() => {
  fetchPayments()
})

// SEO
useSeoMeta({
  title: 'Payment Management - Admin Dashboard',
  description: 'Track payments and revenue'
})
</script>
