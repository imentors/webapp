<template>
  <NuxtLayout name="admin">
    <!-- Filters and Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex-1 max-w-lg">
          <UInput
            v-model="searchQuery"
            placeholder="Search sessions..."
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
            v-model="selectedMentor"
            :items="mentorOptions"
            placeholder="All Mentors"
          />
          
          <UButton
            icon="heroicons:funnel"
            variant="outline"
            @click="showFilters = !showFilters"
          >
            Filters
          </UButton>
        </div>
      </div>
      
      <!-- Advanced Filters -->
      <div v-if="showFilters" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormField label="Date From">
            <UInput
              v-model="dateFrom"
              type="date"
              placeholder="Select start date"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="Date To">
            <UInput
              v-model="dateTo"
              type="date"
              placeholder="Select end date"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="Duration">
            <USelect
              v-model="selectedDuration"
              :items="durationOptions"
              placeholder="Any duration"
              class="w-full"
            />
          </UFormField>
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
          @click="fetchSessions()" 
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
        <span class="ml-2 text-gray-600 dark:text-gray-400">Loading sessions...</span>
      </div>
    </div>

    <!-- Sessions Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Sessions ({{ totalSessions }})
          </h3>
          <div class="flex items-center space-x-2">
            <UButton
              icon="heroicons:arrow-down-tray"
              variant="outline"
              size="sm"
              @click="exportSessions"
            >
              Export
            </UButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="sessions.length === 0" class="p-8 text-center">
        <Icon name="heroicons:calendar" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions found</h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ searchQuery || selectedStatus !== 'all' || selectedMentor !== 'all' ? 'Try adjusting your filters' : 'No sessions have been booked yet' }}
        </p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Session
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Participants
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="session in sessions" :key="session.id">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ session.title }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  ID: {{ session.id.substring(0, 8) }}...
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="flex -space-x-2">
                    <UAvatar
                      :src="session.mentor.avatar"
                      :alt="session.mentor.name"
                      size="sm"
                    />
                    <UAvatar
                      :src="session.mentee.avatar"
                      :alt="session.mentee.name"
                      size="sm"
                    />
                  </div>
                  <div>
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ session.mentor.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      with {{ session.mentee.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(session.date) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ session.time }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ session.duration }}h
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getStatusColor(session.status)"
                  variant="soft"
                >
                  {{ session.status }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${{ session.amount.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <UDropdownMenu :items="getSessionActions(session)">
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
      <div v-if="sessions.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalSessions) }} of {{ totalSessions }} results
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

    <!-- Session Details Modal -->
    <UModal v-model:open="showDetailsModal" :title="selectedSession?.title">
      <template #body>
        <div v-if="selectedSession" class="space-y-6">
          <!-- Participants -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Participants</h4>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <UAvatar
                  :src="selectedSession.mentor.avatar"
                  :alt="selectedSession.mentor.name"
                  size="md"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ selectedSession.mentor.name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Mentor</p>
                </div>
              </div>
              <Icon name="heroicons:arrow-right" class="w-5 h-5 text-gray-400" />
              <div class="flex items-center space-x-3">
                <UAvatar
                  :src="selectedSession.mentee.avatar"
                  :alt="selectedSession.mentee.name"
                  size="md"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ selectedSession.mentee.name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Mentee</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Session Details -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ formatDate(selectedSession.date) }} at {{ selectedSession.time }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedSession.duration }} hours</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <UBadge :color="getStatusColor(selectedSession.status)" variant="soft">
                {{ selectedSession.status }}
              </UBadge>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
              <p class="text-sm text-gray-900 dark:text-white">${{ selectedSession.amount.toFixed(2) }}</p>
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="selectedSession.description">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <p class="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              {{ selectedSession.description }}
            </p>
          </div>
          
          <!-- Payment Info -->
          <div v-if="selectedSession.paymentId">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Information</label>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p class="text-sm text-gray-900 dark:text-white">
                Payment ID: {{ selectedSession.paymentId.substring(0, 20) }}...
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Status: {{ selectedSession.paymentStatus || 'N/A' }}
              </p>
            </div>
          </div>
        </div>
      </template>
      
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Close</UButton>
          <UButton
            v-if="selectedSession?.status === 'pending'"
            @click="updateSessionStatus(selectedSession.id, 'confirmed')"
          >
            Confirm Session
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

// Use admin sessions composable
const {
  sessions,
  isLoading,
  error,
  searchQuery,
  selectedStatus,
  selectedMentor,
  selectedDuration,
  dateFrom,
  dateTo,
  showFilters,
  statusOptions,
  durationOptions,
  mentorOptions,
  currentPage,
  totalPages,
  totalSessions,
  pageSize,
  showDetailsModal,
  selectedSession,
  fetchSessions,
  viewSessionDetails,
  updateSessionStatus,
  previousPage,
  nextPage,
} = useAdminSessions()

// Methods
const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    case 'completed': return 'primary'
    case 'cancelled': return 'error'
    default: return 'neutral'
  }
}

const getSessionActions = (session: any) => {
  const actions = [
    [{
      label: 'View Details',
      icon: 'heroicons:eye',
      onSelect: () => viewSessionDetails(session)
    }]
  ]

  if (session.status === 'pending') {
    actions.push([{
      label: 'Confirm',
      icon: 'heroicons:check',
      onSelect: () => updateSessionStatus(session.id, 'confirmed')
    }])
  }

  return actions
}

const exportSessions = () => {
  if (sessions.value.length === 0) {
    toast.add({
      title: 'No Data',
      description: 'No sessions to export',
      color: 'warning'
    })
    return
  }

  // Create CSV data
  const csvData = sessions.value.map((session: any) => ({
    ID: session.id,
    Title: session.title,
    Mentor: session.mentor.name,
    Mentee: session.mentee.name,
    Date: formatDate(session.date),
    Time: session.time,
    Duration: `${session.duration}h`,
    Status: session.status,
    Amount: `$${session.amount.toFixed(2)}`
  }))

  // Convert to CSV string
  const headers = Object.keys(csvData[0]!).join(',')
  const rows = csvData.map(row => Object.values(row!).join(',')).join('\n')
  const csv = `${headers}\n${rows}`

  // Download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sessions-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.add({
    title: 'Export Complete',
    description: `Exported ${csvData.length} sessions`,
    color: 'success'
  })
}

// Initial data fetch
onMounted(() => {
  fetchSessions()
})

// SEO
useSeoMeta({
  title: 'Session Management - Admin Dashboard',
  description: 'Manage mentoring sessions and bookings'
})
</script>
