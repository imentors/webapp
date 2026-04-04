<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Earnings & Payouts
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Track your earnings, manage payouts, and set up your bank account
        </p>
      </div>

      <!-- Bank Account Setup Alert -->
      <div v-if="!isLoading && !stripeStatus?.isOnboarded" class="mb-8">
        <UAlert
          icon="heroicons:building-library-20-solid"
          color="primary"
          variant="subtle"
          title="Set Up Your Bank Account"
          description="Add your bank details to receive your earnings. Payouts are processed manually by our team."
        >
          <template #actions>
            <UButton
              color="neutral"
              variant="solid"
              @click="showBankAccountModal = true"
            >
              Set Up Bank Account
            </UButton>
          </template>
        </UAlert>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Balance
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ formatCurrency(summary.availableBalance) }}
                </p>
              </div>
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:banknotes" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Ready for payout
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ formatCurrency(summary.pendingBalance) }}
                </p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:clock" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Processing after sessions
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  This Month
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ formatCurrency(summary.thisMonthEarnings) }}
                </p>
              </div>
              <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:calendar" class="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span v-if="summary.lastMonthEarnings > 0">
                {{ summary.thisMonthEarnings >= summary.lastMonthEarnings ? '+' : '' }}{{ Math.round(((summary.thisMonthEarnings - summary.lastMonthEarnings) / summary.lastMonthEarnings) * 100) }}% vs last month
              </span>
              <span v-else>Earned this month</span>
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Paid Out
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ formatCurrency(summary.paidOutTotal) }}
                </p>
              </div>
              <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:arrow-trending-up" class="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Lifetime earnings paid
            </p>
          </div>
        </div>

        <!-- Tabs -->
        <UTabs :items="tabs" class="w-full" v-model="selectedTab" :default-value="'earnings'">
          <template #earnings>
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mt-6">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Earnings
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Your earnings from completed sessions (15% platform fee applied)
                </p>
              </div>

              <div v-if="recentEarnings.length === 0" class="p-12 text-center">
                <Icon name="heroicons:currency-dollar" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-500 dark:text-gray-400">No earnings yet</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Complete sessions to start earning
                </p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Session
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Gross
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fee
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Net
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="earning in recentEarnings" :key="earning.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td class="px-6 py-4">
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">
                            {{ earning.bookingTitle }}
                          </p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            with {{ earning.menteeName }} • {{ earning.bookingDuration }} min
                          </p>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {{ formatDate(earning.bookingDate) }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {{ formatCurrency(earning.grossAmount) }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        -{{ formatCurrency(earning.platformFee) }}
                      </td>
                      <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {{ formatCurrency(earning.netAmount) }}
                      </td>
                      <td class="px-6 py-4">
                        <UBadge :color="getStatusColor(earning.status)" variant="subtle">
                          {{ getStatusLabel(earning.status) }}
                        </UBadge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>

          <template #payouts>
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mt-6">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                      Payout History
                    </h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Weekly payouts are processed every Monday
                    </p>
                  </div>
                  <USelect
                    v-model="payoutsFilter"
                    :items="payoutStatusOptions"
                    class="w-40"
                  />
                </div>
              </div>

              <div v-if="isLoadingPayouts" class="p-8 flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>

              <div v-else-if="payouts.length === 0" class="p-12 text-center">
                <Icon name="heroicons:inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-500 dark:text-gray-400">No payouts yet</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Your first payout will appear here after your available balance is transferred
                </p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Period
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Processed
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="payout in payouts" :key="payout.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {{ formatPeriod(payout.periodStart, payout.periodEnd) }}
                      </td>
                      <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {{ formatCurrency(payout.amount) }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {{ payout.earningsCount || 0 }} session(s)
                      </td>
                      <td class="px-6 py-4">
                        <UBadge :color="getStatusColor(payout.status)" variant="subtle">
                          {{ getStatusLabel(payout.status) }}
                        </UBadge>
                        <p v-if="payout.failureReason" class="text-xs text-red-500 mt-1">
                          {{ payout.failureReason }}
                        </p>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {{ payout.processedAt ? formatDate(payout.processedAt) : '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div v-if="payoutsPagination.totalPages > 1" class="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Showing {{ (payoutsPagination.page - 1) * payoutsPagination.limit + 1 }} to {{ Math.min(payoutsPagination.page * payoutsPagination.limit, payoutsPagination.total) }} of {{ payoutsPagination.total }} payouts
                </p>
                <UPagination
                  v-model="payoutsPagination.page"
                  :page-count="payoutsPagination.limit"
                  :total="payoutsPagination.total"
                  @update:model-value="fetchPayouts"
                />
              </div>
            </div>
          </template>

          <template #bank>
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mt-6">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Bank Account
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Manage your payout destination
                </p>
              </div>

              <div class="p-6">
                <!-- Loading State -->
                <div v-if="isLoadingStripeStatus" class="flex items-center justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>

                <!-- Not Set Up -->
                <div v-else-if="!stripeStatus?.hasAccount" class="text-center py-8">
                  <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="heroicons:building-library" class="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Bank Account Set Up
                  </h3>
                  <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Add your bank account to receive payouts. Your bank details will be stored securely.
                  </p>
                  <UButton @click="showBankAccountModal = true" icon="heroicons:plus">
                    Add Bank Account
                  </UButton>
                </div>

                <!-- Bank Account Active -->
                <div v-else class="space-y-6">
                  <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:check-circle" class="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">
                          {{ stripeStatus?.bankName || 'Bank Account' }}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          •••• {{ stripeStatus?.last4 || '****' }}
                        </p>
                      </div>
                    </div>
                    <UBadge color="success" variant="subtle">
                      Verified
                    </UBadge>
                  </div>

                  <UButton
                    variant="ghost"
                    color="neutral"
                    icon="heroicons:pencil"
                    @click="showBankAccountModal = true"
                  >
                    Update Bank Details
                  </UButton>

                  <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Payout Information
                    </h4>
                    <div class="flex items-start gap-3">
                      <Icon name="heroicons:information-circle" class="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          Payouts are processed manually by our team
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          You'll receive an email when your payout is initiated
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>

      <!-- Bank Account Setup Modal -->
      <UModal v-model:open="showBankAccountModal" title="Set Up Bank Account">
        <template #body>
          <div class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Enter your US bank account details to receive payouts.
            </p>

            <UFormField label="Account Holder Name" required>
              <UInput
                v-model="bankAccountForm.accountHolderName"
                placeholder="Your legal name as it appears on the account"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Bank Name" required>
              <UInput
                v-model="bankAccountForm.bankName"
                placeholder="e.g., Chase, Bank of America"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Account Number" required>
              <UInput
                v-model="bankAccountForm.accountNumber"
                placeholder="Your account number"
                type="password"
                class="w-full"
              />
            </UFormField>

            <UAlert
              icon="heroicons:shield-check"
              color="neutral"
              title="Secure & Protected"
              description="Your bank details are encrypted and stored securely. Only masked account information is displayed after saving."
            />
          </div>
        </template>

        <template #footer="{ close }">
          <div class="w-full flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="close"
            >
              Cancel
            </UButton>
            <UButton
              @click="handleSetupBankAccount(close)"
              :loading="isSavingBankAccount"
              :disabled="!isFormValid"
            >
              Save Bank Account
            </UButton>
          </div>
        </template>
      </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'mentor-only'],
})

const {
  summary,
  recentEarnings,
  recentPayouts,
  stripeStatus,
  payouts,
  payoutsPagination,
  payoutsFilter,
  isLoading,
  isLoadingPayouts,
  isLoadingStripeStatus,
  isSavingBankAccount,
  fetchEarnings,
  fetchPayouts,
  checkStripeStatus,
  setupBankAccount,
  formatCurrency,
  formatDate,
  formatPeriod,
  getStatusColor,
  getStatusLabel,
} = useEarnings()

// Tabs
const selectedTab = ref('earnings')
const tabs = [
  { label: 'Earnings', slot: 'earnings', value: 'earnings' },
  { label: 'Payouts', slot: 'payouts', value: 'payouts' },
  { label: 'Bank Account', slot: 'bank', value: 'bank' },
]

// Payout status filter options
const payoutStatusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

// Bank account modal
const showBankAccountModal = ref(false)
const bankAccountForm = ref({
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
})

// Form validation
const isFormValid = computed(() => {
  return (
    bankAccountForm.value.accountHolderName.trim() &&
    bankAccountForm.value.bankName.trim() &&
    bankAccountForm.value.accountNumber.trim().length >= 4
  )
})

// Handle bank account setup
const handleSetupBankAccount = async (closeModal: () => void) => {
  const result = await setupBankAccount({
    accountHolderName: bankAccountForm.value.accountHolderName,
    bankName: bankAccountForm.value.bankName,
    accountNumber: bankAccountForm.value.accountNumber,
  })

  if (result.success) {
    // Reset form
    bankAccountForm.value = {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
    }
    closeModal()
    // Refresh status
    await checkStripeStatus()
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchEarnings(),
    checkStripeStatus(),
  ])
})

// Watch for tab changes
watch(selectedTab, (newTab) => {
  if (newTab === 'payouts' && payouts.value.length === 0) {
    fetchPayouts()
  }
  if (newTab === 'bank') {
    checkStripeStatus()
  }
})
</script>
