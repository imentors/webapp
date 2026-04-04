<template>
  <div>
    <!-- Welcome Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Platform overview and management tools
          </p>
        </div>
        
        <div class="flex items-center space-x-3">
          <UButton
            icon="heroicons:cog-6-tooth"
            variant="outline"
            class="hidden sm:flex"
          >
            Settings
          </UButton>
          <UButton
            icon="heroicons:document-chart-bar"
            variant="outline"
            class="hidden sm:flex"
          >
            Reports
          </UButton>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div class="ml-4 flex-1">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:users" class="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminStats?.stats?.totalUsers?.value ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:academic-cap" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminStats?.stats?.activeMentors?.value ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Active Mentors</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:calendar-days" class="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminStats?.stats?.sessionsThisMonth?.value ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Sessions This Month</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ adminStats?.stats?.platformRevenue?.value ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Platform Revenue</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Recent Activity -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Platform Activity
            </h2>
          </div>
          
          <div class="p-6">
            <div v-if="isLoading" class="space-y-4 animate-pulse">
              <div v-for="i in 5" :key="i" class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div v-else-if="recentActivityList.length === 0" class="text-center py-8">
              <Icon name="heroicons:clock" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="activity in recentActivityList"
                :key="activity.id"
                class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  getActivityColor(activity.type)
                ]">
                  <Icon
                    :name="activity.icon"
                    class="w-4 h-4 text-white"
                  />
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ activity.description }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ formatTimeAgo(activity.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Management -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                User Management
              </h2>
              <UButton
                icon="heroicons:plus"
                size="sm"
              >
                Add User
              </UButton>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="isLoading" class="space-y-4 animate-pulse">
              <div v-for="i in 5" :key="i" class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  </div>
                </div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div v-else-if="recentUsersList.length === 0" class="text-center py-8">
              <Icon name="heroicons:users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">No recent users</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="user in recentUsersList"
                :key="user.id"
                class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <UAvatar
                    :src="user.avatar"
                    :alt="user.name"
                    size="md"
                  />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ user.name }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ user.email }} • {{ user.role }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <UBadge
                    :color="user.status === 'active' ? 'success' : 'neutral'"
                    variant="soft"
                  >
                    {{ user.status }}
                  </UBadge>
                  <UDropdownMenu :items="getUserActions(user)">
                    <UButton
                      icon="heroicons:ellipsis-vertical"
                      variant="ghost"
                      size="sm"
                    />
                  </UDropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Platform Health -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Platform Health
          </h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">System Status</span>
              <UBadge color="success" variant="soft">Operational</UBadge>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Server Load</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ serverLoad }}%</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <UBadge color="success" variant="soft">Healthy</UBadge>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">API Response</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ apiResponse }}ms</span>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Stats
          </h3>
          
          <div v-if="isLoading" class="space-y-3 animate-pulse">
            <div v-for="i in 4" :key="i" class="flex items-center justify-between">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">New Signups</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ adminStats?.today?.signups ?? 0 }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Sessions Booked</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ adminStats?.today?.sessions ?? 0 }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Messages Sent</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ adminStats?.today?.messages ?? 0 }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">${{ adminStats?.today?.revenue ?? 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Admin Actions
          </h3>
          
          <div class="space-y-3">
            <UButton
              variant="outline"
              block
              icon="heroicons:users"
            >
              Manage Users
            </UButton>
            
            <UButton
              variant="outline"
              block
              icon="heroicons:document-chart-bar"
            >
              View Reports
            </UButton>
            
            <UButton
              variant="outline"
              block
              icon="heroicons:cog-6-tooth"
            >
              Platform Settings
            </UButton>
            
            <UButton
              variant="outline"
              block
              icon="heroicons:shield-check"
            >
              Security Center
            </UButton>
          </div>
        </div>

        <!-- Pending Approvals -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Approvals
            </h3>
            <UBadge color="warning" variant="soft">{{ adminStats?.pendingApprovals ?? 0 }}</UBadge>
          </div>
          
          <div v-if="isLoading" class="space-y-3 animate-pulse">
            <div v-for="i in 3" :key="i" class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div v-else class="space-y-3">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              • {{ adminStats?.pendingApprovals ?? 0 }} Mentor application{{ (adminStats?.pendingApprovals ?? 0) !== 1 ? 's' : '' }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              • 0 Profile updates
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              • 0 Dispute resolution{{ (adminStats?.pendingApprovals ?? 0) !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AdminStats {
  stats: {
    totalUsers: { value: number; change: number }
    activeMentors: { value: number; change: number }
    sessionsThisMonth: { value: number; change: number }
    platformRevenue: { value: number; change: number }
  }
  today: {
    signups: number
    sessions: number
    revenue: number
    messages: number
  }
  recentBookings: Array<{
    id: string
    title: string
    mentorName: string
    status: string
    amount: number
  }>
  topMentors: Array<{
    id: string
    name: string
    avatar?: string
    sessions: number
    revenue: number
    rating: number
  }>
  recentUsers: Array<{
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    status: string
  }>
  recentActivity: Array<{
    id: string
    type: 'user' | 'session' | 'payment' | 'system'
    icon: string
    description: string
    timestamp: Date | string
  }>
  pendingApprovals: number
}

const adminStats = ref<AdminStats | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Fetch admin stats
const fetchAdminStats = async () => {
  isLoading.value = true
  error.value = null
  try {
    const data = await $fetch<AdminStats>('/api/admin/stats')
    // Convert timestamp strings to Date objects
    data.recentActivity = data.recentActivity.map(activity => ({
      ...activity,
      timestamp: typeof activity.timestamp === 'string' ? new Date(activity.timestamp) : activity.timestamp
    }))
    adminStats.value = data
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to fetch admin stats'
    console.error('[DashboardAdmin] Error:', e)
  } finally {
    isLoading.value = false
  }
}

// Fetch on mount
onMounted(() => {
  fetchAdminStats()
})

// Computed properties for template
const recentActivityList = computed(() => {
  return adminStats.value?.recentActivity || []
})

const recentUsersList = computed(() => {
  return adminStats.value?.recentUsers || []
})

// Platform health (static for now)
const serverLoad = ref(23)
const apiResponse = ref(145)

const getActivityColor = (type: string) => {
  switch (type) {
    case 'user': return 'bg-teal-500'
    case 'session': return 'bg-green-500'
    case 'payment': return 'bg-yellow-500'
    case 'system': return 'bg-teal-500'
    default: return 'bg-gray-500'
  }
}

const getUserActions = (user: any) => {
  return [
    [{
      label: 'View Profile',
      icon: 'heroicons:eye',
      click: () => viewUserProfile(user)
    }],
    [{
      label: 'Edit User',
      icon: 'heroicons:pencil',
      click: () => editUser(user)
    }],
    [{
      label: user.status === 'active' ? 'Suspend' : 'Activate',
      icon: user.status === 'active' ? 'heroicons:pause' : 'heroicons:play',
      click: () => toggleUserStatus(user)
    }]
  ]
}

const viewUserProfile = (user: any) => {
  navigateTo(`/admin/users/${user.id}`)
}

const editUser = (user: any) => {
  navigateTo(`/admin/users/${user.id}/edit`)
}

const toggleUserStatus = (user: any) => {
  // TODO: Implement user status toggle API call
  console.log('Toggle user status:', user.id, user.status)
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}
</script>
