<template>
  <NuxtLayout name="admin">
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading user details...</p>
      </div>
    </div>

    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div class="flex items-center">
        <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
        <div class="ml-3">
          <h3 class="text-lg font-medium text-red-800 dark:text-red-200">Error loading user</h3>
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
      <div class="mt-4">
        <UButton to="/admin/users" variant="ghost" icon="heroicons:arrow-left">Back to Users</UButton>
      </div>
    </div>

    <div v-else-if="user" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center space-x-4">
          <UButton to="/admin/users" variant="ghost" icon="heroicons:arrow-left" />
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Details</h1>
        </div>
        <div class="flex items-center space-x-3">
          <UButton
            :color="user.status === 'active' ? 'warning' : 'success'"
            variant="soft"
            :icon="user.status === 'active' ? 'heroicons:pause' : 'heroicons:play'"
            @click="showStatusModal = true"
          >
            {{ user.status === 'active' ? 'Suspend User' : 'Activate User' }}
          </UButton>
          <UButton
            color="error"
            variant="soft"
            icon="heroicons:trash"
            @click="showDeleteModal = true"
          >
            Delete User
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-start space-x-6">
              <UAvatar
                :src="user.avatar"
                :alt="`${user.firstName} ${user.lastName}`"
                size="xl"
                class="ring-4 ring-gray-50 dark:ring-gray-700"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ user.firstName }} {{ user.lastName }}
                    </h2>
                    <p class="text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                  </div>
                  <UBadge
                    :color="user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'error'"
                    variant="soft"
                    size="lg"
                  >
                    {{ user.status }}
                  </UBadge>
                </div>

                <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="heroicons:identification" class="h-5 w-5 mr-2 text-gray-400" />
                    <span class="font-medium mr-2">Role:</span>
                    <span class="capitalize">{{ user.role }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="heroicons:calendar" class="h-5 w-5 mr-2 text-gray-400" />
                    <span class="font-medium mr-2">Joined:</span>
                    <span>{{ formatDate(user.createdAt) }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="heroicons:clock" class="h-5 w-5 mr-2 text-gray-400" />
                    <span class="font-medium mr-2">Last Active:</span>
                    <span>{{ formatDate(user.lastActive) }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="heroicons:map-pin" class="h-5 w-5 mr-2 text-gray-400" />
                    <span class="font-medium mr-2">Location:</span>
                    <span>{{ user.location || 'Not specified' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sessions</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ user.stats?.sessions || 0 }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${{ user.stats?.revenue || 0 }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
              <div class="mt-2 flex items-center">
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ user.stats?.rating || 0 }}</p>
                <Icon name="heroicons:star" class="h-6 w-6 text-yellow-400 ml-2" />
              </div>
            </div>
          </div>

          <!-- Bio / Details -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">About</h3>
            <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {{ user.bio || 'No bio provided.' }}
            </p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Info -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
            <div class="space-y-4">
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white font-mono">{{ user.id }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Status</p>
                <div class="mt-1 flex items-center">
                  <Icon name="heroicons:check-circle" class="h-4 w-4 text-green-500 mr-1" />
                  <span class="text-sm text-gray-900 dark:text-white">Verified</span>
                </div>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timezone</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ user.timezone || 'UTC' }}</p>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div class="space-y-4">
              <div v-for="i in 3" :key="i" class="flex space-x-3">
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Icon name="heroicons:calendar" class="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div>
                  <p class="text-sm text-gray-900 dark:text-white">Booked a session with Dr. Smith</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Confirmation Modal -->
    <UModal v-model:open="showStatusModal" :title="user?.status === 'active' ? 'Suspend User' : 'Activate User'">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to {{ user?.status === 'active' ? 'suspend' : 'activate' }} <strong>{{ user?.firstName }} {{ user?.lastName }}</strong>?
          {{ user?.status === 'active' ? 'They will no longer be able to log in or use the platform.' : 'They will regain access to the platform.' }}
        </p>
      </template>
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton
            :color="user?.status === 'active' ? 'warning' : 'success'"
            @click="handleStatusToggle"
            :loading="isUpdating"
          >
            Confirm {{ user?.status === 'active' ? 'Suspension' : 'Activation' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal" title="Delete User">
      <template #body>
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-gray-900 dark:text-white font-medium">This action is irreversible</p>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete <strong>{{ user?.firstName }} {{ user?.lastName }}</strong>? All their data, including sessions and history, will be removed.
            </p>
          </div>
        </div>
      </template>
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton
            color="error"
            @click="handleDelete"
            :loading="isUpdating"
          >
            Delete Permanently
          </UButton>
        </div>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AdminUser } from '~/types'

definePageMeta({
  middleware: 'admin',
  layout: false
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { getUserById, toggleUserStatus, deleteUser } = useAdminUsers()

const user = ref<AdminUser | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isUpdating = ref(false)

const showStatusModal = ref(false)
const showDeleteModal = ref(false)

const fetchUser = async () => {
  isLoading.value = true
  error.value = null
  try {
    const userId = route.params.id as string
    // In a real app, this would be a direct API call to /api/admin/users/:id
    // For now we use the composable's method which might fetch from local state or API
    const data = await getUserById(userId)
    if (!data) {
      error.value = 'User not found'
    } else {
      user.value = data
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to load user details'
  } finally {
    isLoading.value = false
  }
}

const handleStatusToggle = async () => {
  if (!user.value) return
  isUpdating.value = true
  try {
    await toggleUserStatus(user.value)
    showStatusModal.value = false
    toast.add({
      title: 'Status Updated',
      description: `User has been ${user.value.status === 'active' ? 'activated' : 'suspended'} successfully.`,
      color: 'success'
    })
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.message || 'Failed to update user status',
      color: 'error'
    })
  } finally {
    isUpdating.value = false
  }
}

const handleDelete = async () => {
  if (!user.value) return
  isUpdating.value = true
  try {
    await deleteUser(user.value.id)
    showDeleteModal.value = false
    toast.add({
      title: 'User Deleted',
      description: 'The user account has been permanently removed.',
      color: 'success'
    })
    router.push('/admin/users')
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.message || 'Failed to delete user',
      color: 'error'
    })
  } finally {
    isUpdating.value = false
  }
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d)
}

onMounted(() => {
  fetchUser()
})

useSeoMeta({
  title: computed(() => user.value ? `${user.value.firstName} ${user.value.lastName} - User Details` : 'User Details - Admin Dashboard'),
  description: 'View and manage user profile and activity'
})
</script>
