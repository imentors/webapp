<template>
  <NuxtLayout name="admin">
    <!-- Filters and Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex-1 max-w-lg">
          <UInput
            v-model="searchQuery"
            placeholder="Search users..."
            icon="heroicons:magnifying-glass"
          />
        </div>
        
        <div class="flex items-center space-x-4">
          <USelect
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="All Status"
          />
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Users ({{ totalUsers }})
        </h3>
      </div>
      
        <!-- Error Display -->
        <div v-if="error" class="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading users</h3>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                  {{ error }}
                </div>
              </div>
            </div>
            <button 
              @click="fetchUsers(1)" 
              class="ml-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      
      <div class="overflow-x-auto">
        <table v-if="!isLoading && users.length > 0" class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Active
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UAvatar
                    :src="user.avatar"
                    :alt="`${user.firstName} ${user.lastName}`"
                    size="md"
                  />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.firstName }} {{ user.lastName }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'error'"
                  variant="soft"
                >
                  {{ user.status }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(user.lastActive) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <UDropdownMenu :items="getUserActions(user)">
                  <UButton
                    variant="ghost"
                    icon="heroicons:ellipsis-horizontal"
                  />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="!isLoading && users.length === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">No users found</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Get started by adding some mentees to the platform.</p>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="users.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalUsers) }} of {{ totalUsers }} users
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

    <!-- Create User Modal -->
    <UModal v-model:open="showCreateModal" title="Add New User">
      <template #body>
        <form @submit.prevent="createUser" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="First Name" required>
              <UInput v-model="newUser.firstName" placeholder="John" />
            </UFormField>
            <UFormField label="Last Name" required>
              <UInput v-model="newUser.lastName" placeholder="Doe" />
            </UFormField>
          </div>
          
          <UFormField label="Email" required>
            <UInput v-model="newUser.email" type="email" placeholder="john@example.com" />
          </UFormField>
          
          <UFormField label="Role" required>
            <USelect
              v-model="newUser.role"
              :items="[
                { label: 'Mentee', value: 'mentee' },
                { label: 'Mentor', value: 'mentor' },
                { label: 'Admin', value: 'admin' }
              ]"
            />
          </UFormField>
          
          <UFormField label="Password" required>
            <UInput v-model="newUserPassword" type="password" placeholder="••••••••" />
          </UFormField>
        </form>
      </template>
      
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton @click="createUser" :loading="isCreatingValue">Create User</UButton>
        </div>
      </template>
    </UModal>

    <!-- Status Confirmation Modal -->
    <UModal v-model:open="showStatusConfirmModal" :title="selectedUser?.status === 'active' ? 'Suspend User' : 'Activate User'">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to {{ selectedUser?.status === 'active' ? 'suspend' : 'activate' }} <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong>?
          {{ selectedUser?.status === 'active' ? 'They will no longer be able to log in or use the platform.' : 'They will regain access to the platform.' }}
        </p>
      </template>
      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton
            :color="selectedUser?.status === 'active' ? 'warning' : 'success'"
            @click="handleStatusToggle"
            :loading="isUpdating"
          >
            Confirm {{ selectedUser?.status === 'active' ? 'Suspension' : 'Activation' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteConfirmModal" title="Delete User">
      <template #body>
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-gray-900 dark:text-white font-medium">This action is irreversible</p>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong>? All their data will be removed.
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

    <!-- User Details Modal (Keep for quick view if needed, but the request asked for a detail page) -->
    <!-- I will keep it but maybe the "View Details" should go to the page -->
    <UModal v-model:open="showDetailsModal" :title="`${selectedUser?.firstName} ${selectedUser?.lastName}`">
      <template #body>
        <div v-if="selectedUser" class="space-y-6">
          <div class="flex items-center space-x-4">
            <UAvatar
              :src="selectedUser.avatar"
              :alt="`${selectedUser.firstName} ${selectedUser.lastName}`"
              size="xl"
            />
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ selectedUser.firstName }} {{ selectedUser.lastName }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400">{{ selectedUser.email }}</p>
              <div class="flex items-center space-x-2 mt-2">
                <UBadge :color="selectedUser.role === 'mentor' ? 'primary' : 'success'" variant="soft">
                  {{ selectedUser.role }}
                </UBadge>
                <UBadge :color="selectedUser.status === 'active' ? 'success' : selectedUser.status === 'pending' ? 'warning' : 'error'" variant="soft">
                  {{ selectedUser.status }}
                </UBadge>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Joined</label>
              <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(selectedUser.createdAt) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Active</label>
              <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(selectedUser.lastActive) }}</p>
            </div>
          </div>
          
          <div v-if="selectedUser.role === 'mentor'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mentor Stats</label>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedUser.stats?.sessions || 0 }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedUser.stats?.rating || 0 }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ selectedUser.stats?.revenue || 0 }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AdminUser, UserRole } from '~/types'

definePageMeta({
  middleware: 'admin',
  layout: false
})

// Use admin users composable
const {
  users,
  isLoading,
  error,
  searchQuery,
  selectedStatus,
  currentPage,
  totalPages,
  totalUsers,
  pageSize,
  filteredUsers,
  fetchUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  previousPage,
  nextPage
} = useAdminUsers()

// Local state for modals
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const showStatusConfirmModal = ref(false)
const showDeleteConfirmModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const newUserPassword = ref('')
const isCreating = ref(false)
const isUpdating = ref(false)

// For template binding, create a computed that returns the value
const isCreatingValue = computed(() => isCreating.value)

const newUser = reactive<{ firstName: string; lastName: string; email: string; role: UserRole }>({
  firstName: '',
  lastName: '',
  email: '',
  role: 'mentee'
})

// Options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' }
]

// Computed
const paginatedUsers = computed(() => {
  return users.value
})

// Methods
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const getUserActions = (user: AdminUser) => [
  [{
    label: 'View Details',
    icon: 'heroicons:eye',
    onSelect: () => {
      navigateTo(`/admin/users/${user.id}`)
    }
  }],
  [{
    label: user.status === 'active' ? 'Suspend' : 'Activate',
    icon: user.status === 'active' ? 'heroicons:pause' : 'heroicons:play',
    onSelect: () => {
      selectedUser.value = user
      showStatusConfirmModal.value = true
    }
  }],
  [{
    label: 'Delete',
    icon: 'heroicons:trash',
    onSelect: () => {
      selectedUser.value = user
      showDeleteConfirmModal.value = true
    }
  }]
]

const handleStatusToggle = async () => {
  if (!selectedUser.value) return
  isUpdating.value = true
  try {
    await toggleUserStatus(selectedUser.value)
    showStatusConfirmModal.value = false
  } finally {
    isUpdating.value = false
  }
}

const handleDelete = async () => {
  if (!selectedUser.value) return
  isUpdating.value = true
  try {
    await deleteUser(selectedUser.value.id)
    showDeleteConfirmModal.value = false
  } finally {
    isUpdating.value = false
  }
}

const createUser = async () => {
  isCreating.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // This would be an actual API call
    // const user = await $fetch('/api/admin/users', { method: 'POST', body: { ...newUser, password: newUserPassword } })
    
    // Reset form
    Object.assign(newUser, {
      firstName: '',
      lastName: '',
      email: '',
      role: 'mentee'
    })
    newUserPassword.value = ''
    
    showCreateModal.value = false
    
    // Refetch users to get updated list
    await fetchUsers(currentPage.value)
  } finally {
    isCreating.value = false
  }
}

// Initial fetch
onMounted(() => {
  fetchUsers(1)
})

// SEO
useSeoMeta({
  title: 'User Management - Admin Dashboard',
  description: 'Manage users, mentors, and mentees'
})
</script>
