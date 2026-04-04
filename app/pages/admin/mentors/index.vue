<template>
  <NuxtLayout name="admin">

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="heroicons:academic-cap" class="h-8 w-8 text-teal-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Mentors & Coaches</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalMentors }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="heroicons:check-badge" class="h-8 w-8 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Verified</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ verifiedMentors }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="heroicons:clock" class="h-8 w-8 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Review</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ pendingMentors }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="heroicons:star" class="h-8 w-8 text-teal-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Rating</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ averageRating }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <UInput
              v-model="searchQuery"
              placeholder="Search mentors and coaches..."
              icon="heroicons:magnifying-glass"
              size="md"
              class="w-full"
            />
          </div>
          <div>
            <USelect
              v-model="selectedStatus"
              :items="statusOptions"
              placeholder="All Statuses"
              size="md"
              class="w-full"
            />
          </div>
          <div>
            <USelect
              v-model="selectedCategory"
              :items="categoryOptions"
              placeholder="All Categories"
              size="md"
              class="w-full"
            />
          </div>
          <div>
            <USelect
              v-model="selectedRating"
              :items="ratingOptions"
              placeholder="All Ratings"
              size="md"
              class="w-full"
            />
          </div>
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
          @click="fetchMentors()" 
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
        <span class="ml-2 text-gray-600 dark:text-gray-400">Loading mentors and coaches...</span>
      </div>
    </div>

    <!-- Mentors Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Mentors & Coaches ({{ mentors.length }})
          </h3>
          <div class="flex space-x-2">
            <UButton
              @click="exportMentors"
              variant="outline"
              icon="heroicons:arrow-down-tray"
              size="sm"
            >
              Export
            </UButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="mentors.length === 0" class="p-8 text-center">
        <Icon name="heroicons:academic-cap" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No mentors or coaches found</h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'No mentors or coaches have registered yet' }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mentor or Coach
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rating
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sessions
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Revenue
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="mentor in mentors"
              :key="mentor.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UAvatar
                    :src="mentor.avatar"
                    :alt="mentor.name"
                    size="md"
                    class="mr-3"
                  />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ mentor.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ mentor.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ mentor.category }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ mentor.experience }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getStatusColor(mentor.status)"
                  variant="soft"
                  size="sm"
                >
                  {{ mentor.status }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <Icon name="heroicons:star" class="h-4 w-4 text-yellow-400 mr-1" />
                  <span class="text-sm text-gray-900 dark:text-white">{{ mentor.rating.toFixed(1) }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 ml-1">({{ mentor.reviews }})</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ mentor.totalSessions }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${{ mentor.totalRevenue.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(mentor.joinedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <UDropdownMenu :items="getMentorActions(mentor)">
                  <UButton
                    variant="ghost"
                    color="neutral"
                    icon="heroicons:ellipsis-horizontal"
                    size="sm"
                  />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="mentors.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalMentors) }} of {{ totalMentors }} mentors & coaches
          </div>
          <div class="flex space-x-2">
            <UButton
              @click="previousPage"
              :disabled="currentPage === 1"
              variant="outline"
              size="sm"
              icon="heroicons:chevron-left"
            >
              Previous
            </UButton>
            <UButton
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              variant="outline"
              size="sm"
              icon="heroicons:chevron-right"
            >
              Next
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Confirmation Modal -->
    <UModal v-model:open="showStatusConfirmModal" :title="pendingStatus === 'verified' ? 'Verify Mentor or Coach' : 'Suspend Mentor or Coach'">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to {{ pendingStatus === 'verified' ? 'verify' : 'suspend' }} <strong>{{ selectedMentor?.name }}</strong>?
          {{ pendingStatus === 'verified' ? 'They will be able to accept bookings and appear in search results.' : 'They will no longer be able to accept new bookings.' }}
        </p>
      </template>
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton
            :color="pendingStatus === 'verified' ? 'success' : 'warning'"
            @click="handleStatusUpdate"
            :loading="isUpdating"
          >
            Confirm {{ pendingStatus === 'verified' ? 'Verification' : 'Suspension' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteConfirmModal" title="Delete Mentor or Coach">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{{ selectedMentor?.name }}</strong>? This action cannot be undone and will remove all associated data.
        </p>
      </template>
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton
            color="error"
            @click="handleDeleteMentor"
            :loading="isDeleting"
          >
            Delete Mentor or Coach
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

useSeoMeta({
  title: 'Mentor or Coach Management - Admin Dashboard',
  description: 'Manage mentor and coach profiles, verification status, and performance metrics'
})

const toast = useToast()

// Use admin mentors composable
const {
  mentors,
  isLoading,
  error,
  searchQuery,
  selectedStatus,
  selectedCategory,
  selectedRating,
  statusOptions,
  categoryOptions,
  ratingOptions,
  currentPage,
  totalPages,
  totalMentors,
  pageSize,
  verifiedMentors,
  pendingMentors,
  fetchMentors,
  updateMentorStatus,
  deleteMentor,
} = useAdminMentors()

const selectedMentor = ref<any>(null)
const showStatusConfirmModal = ref(false)
const showDeleteConfirmModal = ref(false)
const pendingStatus = ref<'verified' | 'suspended' | 'pending'>('pending')
const isUpdating = ref(false)
const isDeleting = ref(false)

// Computed
const averageRating = computed(() => {
  if (mentors.value.length === 0) return '0.0'
  const sum = mentors.value.reduce((acc, m) => acc + m.rating, 0)
  return (sum / mentors.value.length).toFixed(1)
})

// Methods
const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified': return 'success'
    case 'pending': return 'warning'
    case 'suspended': return 'error'
    default: return 'neutral'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getMentorActions = (mentor: any) => {
  const actions = [
    [{
      label: 'View Details',
      icon: 'heroicons:eye',
      onSelect: () => navigateTo(`/admin/mentors/${mentor.id}`)
    }]
  ]

  const statusActions = []
  
  // Verification action
  if (mentor.status === 'pending') {
    statusActions.push({
      label: 'Verify Mentor',
      icon: 'heroicons:check-badge',
      onSelect: () => {
        selectedMentor.value = mentor
        pendingStatus.value = 'verified'
        showStatusConfirmModal.value = true
      }
    })
  }

  // Suspension actions
  if (mentor.status === 'suspended') {
    statusActions.push({
      label: 'Unsuspend Mentor',
      icon: 'heroicons:play-circle',
      onSelect: () => {
        selectedMentor.value = mentor
        pendingStatus.value = 'verified'
        showStatusConfirmModal.value = true
      }
    })
  } else {
    statusActions.push({
      label: 'Suspend Mentor',
      icon: 'heroicons:pause-circle',
      onSelect: () => {
        selectedMentor.value = mentor
        pendingStatus.value = 'suspended'
        showStatusConfirmModal.value = true
      }
    })
  }

  if (statusActions.length > 0) {
    actions.push(statusActions)
  }

  actions.push([{
    label: 'Delete Mentor',
    icon: 'heroicons:trash',
    color: 'error' as any,
    onSelect: () => {
      selectedMentor.value = mentor
      showDeleteConfirmModal.value = true
    }
  }])

  return actions
}

const handleStatusUpdate = async () => {
  if (!selectedMentor.value) return
  isUpdating.value = true
  try {
    await updateMentorStatus(selectedMentor.value.id, pendingStatus.value)
    showStatusConfirmModal.value = false
    toast.add({
      title: 'Status Updated',
      description: `Mentor status has been updated to ${pendingStatus.value}.`,
      color: 'success'
    })
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.message || 'Failed to update status',
      color: 'error'
    })
  } finally {
    isUpdating.value = false
  }
}

const handleDeleteMentor = async () => {
  if (!selectedMentor.value) return
  isDeleting.value = true
  try {
    await deleteMentor(selectedMentor.value.id)
    showDeleteConfirmModal.value = false
    toast.add({
      title: 'Mentor Deleted',
      description: 'The mentor has been successfully deleted.',
      color: 'success'
    })
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.message || 'Failed to delete mentor',
      color: 'error'
    })
  } finally {
    isDeleting.value = false
  }
}

const exportMentors = () => {
  toast.add({
    title: 'Export Started',
    description: 'Mentor data export has been initiated',
    color: 'success'
  })
}

// Initial data fetch
onMounted(() => {
  fetchMentors()
})
</script>
