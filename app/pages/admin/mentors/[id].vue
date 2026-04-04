<template>
  <NuxtLayout name="admin">
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading mentor details...</p>
      </div>
    </div>

    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div class="flex items-center">
        <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
        <div class="ml-3">
          <h3 class="text-lg font-medium text-red-800 dark:text-red-200">Error loading mentor</h3>
          <p class="text-sm text-red-700 dark:text-red-300">{{ error?.message || error }}</p>
        </div>
      </div>
      <div class="mt-4">
        <UButton to="/admin/mentors" variant="ghost" icon="heroicons:arrow-left">Back to Mentors</UButton>
      </div>
    </div>

    <div v-else-if="mentor" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center space-x-4">
          <UButton to="/admin/mentors" variant="ghost" icon="heroicons:arrow-left" />
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mentor Details</h1>
        </div>
        <div class="flex items-center space-x-3">
          <UButton
            v-if="mentor.status === 'pending'"
            color="success"
            variant="soft"
            icon="heroicons:check-badge"
            @click="confirmStatusChange('verified')"
          >
            Verify Mentor
          </UButton>
          <UButton
            v-if="mentor.status !== 'suspended'"
            color="warning"
            variant="soft"
            icon="heroicons:pause-circle"
            @click="confirmStatusChange('suspended')"
          >
            Suspend Mentor
          </UButton>
          <UButton
            v-else
            color="success"
            variant="soft"
            icon="heroicons:play-circle"
            @click="confirmStatusChange('verified')"
          >
            Unsuspend Mentor
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-start space-x-6">
              <UAvatar
                :src="mentor.avatar"
                :alt="mentor.name"
                size="xl"
                class="ring-4 ring-gray-50 dark:ring-gray-700"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ mentor.name }}
                    </h2>
                    <p class="text-gray-500 dark:text-gray-400">{{ mentor.email }}</p>
                  </div>
                  <UBadge
                    :color="getStatusColor(mentor.status)"
                    variant="soft"
                    size="lg"
                  >
                    {{ mentor.status }}
                  </UBadge>
                </div>

                <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="heroicons:tag" class="h-5 w-5 mr-2 text-gray-400" />
                    <span class="font-medium mr-2">Category:</span>
                    <span>{{ mentor.category }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="heroicons:briefcase" class="h-5 w-5 mr-2 text-gray-400" />
                    <span class="font-medium mr-2">Experience:</span>
                    <span>{{ mentor.experience }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="heroicons:currency-dollar" class="h-5 w-5 mr-2 text-gray-400" />
                    <span class="font-medium mr-2">Hourly Rate:</span>
                    <span>${{ mentor.hourlyRate }}/hr</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="heroicons:calendar" class="h-5 w-5 mr-2 text-gray-400" />
                    <span class="font-medium mr-2">Joined:</span>
                    <span>{{ formatDate(mentor.joinedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sessions</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ mentor.totalSessions }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${{ mentor.totalRevenue.toLocaleString() }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</p>
              <div class="mt-2 flex items-center">
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ mentor.rating.toFixed(1) }}</p>
                <Icon name="heroicons:star" class="h-6 w-6 text-yellow-400 ml-2" />
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Reviews</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ mentor.reviews }}</p>
            </div>
          </div>

          <!-- Bio & Skills -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">About</h3>
              <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {{ mentor.bio || 'No bio provided.' }}
              </p>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Skills</h3>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="skill in (mentor.skills || [])"
                  :key="skill"
                  variant="soft"
                  color="primary"
                >
                  {{ skill }}
                </UBadge>
                <p v-if="!mentor.skills || mentor.skills.length === 0" class="text-sm text-gray-500">No skills listed.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Account Info -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
            <div class="space-y-4">
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mentor ID</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white font-mono">{{ mentor.id }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ mentor.location || 'Not specified' }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timezone</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ mentor.timezone || 'UTC' }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Languages</p>
                <div class="mt-1 flex flex-wrap gap-1">
                  <UBadge v-for="lang in (mentor.languages || [])" :key="lang" size="sm" variant="outline">
                    {{ lang }}
                  </UBadge>
                  <span v-if="!mentor.languages || mentor.languages.length === 0" class="text-sm text-gray-900 dark:text-white">Not specified</span>
                </div>
              </div>
              <div v-if="mentor.dateOfBirth">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date of Birth</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(mentor.dateOfBirth) }}</p>
              </div>
              <div v-if="mentor.expertiseDocument">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expertise Document</p>
                <p class="mt-1 text-sm">
                  <a :href="mentor.expertiseDocument" target="_blank" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center">
                    <Icon name="heroicons:document-text" class="h-4 w-4 mr-1" />
                    View Document
                  </a>
                </p>
              </div>
              <div v-if="mentor.idDocument">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Document</p>
                <p class="mt-1 text-sm">
                  <a :href="mentor.idDocument" target="_blank" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center">
                    <Icon name="heroicons:identification" class="h-4 w-4 mr-1" />
                    View ID Document
                  </a>
                </p>
              </div>
            </div>
          </div>

          <!-- Performance Metrics -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-500 dark:text-gray-400">Response Rate</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ mentor.responseRate }}%</span>
                </div>
                <UProgress :value="mentor.responseRate" color="primary" size="sm" />
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-500 dark:text-gray-400">Completion Rate</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ mentor.completionRate }}%</span>
                </div>
                <UProgress :value="mentor.completionRate" color="success" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Confirmation Modal -->
    <UModal v-model:open="showStatusModal" :title="pendingStatus === 'verified' ? 'Verify Mentor' : 'Suspend Mentor'">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to {{ pendingStatus === 'verified' ? 'verify' : 'suspend' }} <strong>{{ mentor?.name }}</strong>?
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
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: false
})

const route = useRoute()
const toast = useToast()
const { getMentorById, updateMentorStatus } = useAdminMentors()

const { data: mentor, pending: isLoading, error, refresh: fetchMentor } = useAsyncData(
  `admin-mentor-${route.params.id}`,
  () => getMentorById(route.params.id as string),
  {
    lazy: true,
    server: false,
    watch: [() => route.params.id]
  }
)

const isUpdating = ref(false)

const showStatusModal = ref(false)
const pendingStatus = ref<'verified' | 'suspended' | 'pending'>('pending')

const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified': return 'success'
    case 'pending': return 'warning'
    case 'suspended': return 'error'
    default: return 'neutral'
  }
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const confirmStatusChange = (status: 'verified' | 'suspended') => {
  pendingStatus.value = status
  showStatusModal.value = true
}

const handleStatusUpdate = async () => {
  if (!mentor.value) return
  isUpdating.value = true
  try {
    await updateMentorStatus(mentor.value.id, pendingStatus.value)
    // Update local state
    mentor.value.status = pendingStatus.value
    showStatusModal.value = false
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

useSeoMeta({
  title: computed(() => mentor.value ? `${mentor.value.name} - Mentor Details` : 'Mentor Details - Admin Dashboard'),
  description: 'View and manage mentor profile and performance'
})
</script>
