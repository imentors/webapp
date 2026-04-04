<template>
  <NuxtLayout name="admin">
    <!-- Quick Stats -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="ml-5 flex-1">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon
              :name="stat.icon"
              :class="[
                'w-8 h-8',
                stat.color === 'blue' ? 'text-teal-500' :
                stat.color === 'green' ? 'text-green-500' :
                stat.color === 'yellow' ? 'text-yellow-500' :
                'text-teal-500'
              ]"
            />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {{ stat.name }}
              </dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ stat.value }}
                </div>
                <div
                  :class="[
                    'ml-2 flex items-baseline text-sm font-semibold',
                    stat.change > 0 ? 'text-green-600' : 'text-red-600'
                  ]"
                >
                  <Icon
                    :name="stat.change > 0 ? 'heroicons:arrow-up' : 'heroicons:arrow-down'"
                    class="w-4 h-4 mr-1"
                  />
                  {{ Math.abs(stat.change) }}%
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Revenue Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Revenue Overview
        </h3>
        <div class="chart-wrapper">
          <LineChart
            :data="revenueData"
            :categories="revenueCategories"
            :height="300"
            :xFormatter="xFormatter"
            xLabel="Month"
            yLabel="Revenue"
          />
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div v-if="isLoading" class="space-y-4 animate-pulse">
          <div v-for="i in 5" :key="i" class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div v-else-if="recentActivity.length === 0" class="text-center py-8">
          <Icon name="heroicons:clock" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start space-x-3"
          >
            <div
              :class="[
                'flex-shrink-0 w-2 h-2 rounded-full mt-2',
                activity.type === 'booking' ? 'bg-teal-500' :
                activity.type === 'payment' ? 'bg-green-500' :
                activity.type === 'user' ? 'bg-teal-500' :
                'bg-yellow-500'
              ]"
            />
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ activity.description }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTime(activity.timestamp) }}
              </p>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <UButton
            to="/admin/activity"
            variant="ghost"
            size="sm"
            trailing-icon="heroicons:arrow-right"
          >
            View all activity
          </UButton>
        </div>
      </div>
    </div>

    <!-- Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Bookings -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Recent Bookings
          </h3>
        </div>
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Session
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="isLoading" v-for="i in 5" :key="i" class="animate-pulse">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </td>
              </tr>
              <tr v-else-if="recentBookings.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No recent bookings
                </td>
              </tr>
              <tr v-else v-for="booking in recentBookings" :key="booking.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ booking.title }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ booking.mentorName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge
                    :color="booking.status === 'confirmed' ? 'success' : 
                           booking.status === 'pending' ? 'warning' : 'neutral'"
                    variant="soft"
                  >
                    {{ booking.status }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${{ booking.amount }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 bg-gray-50 dark:bg-gray-900">
          <UButton
            to="/admin/sessions"
            variant="ghost"
            size="sm"
            trailing-icon="heroicons:arrow-right"
          >
            View all sessions
          </UButton>
        </div>
      </div>

      <!-- Top Mentors -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Top Mentors & Coaches
          </h3>
        </div>
        <div class="p-6">
          <div v-if="isLoading" class="space-y-4 animate-pulse">
            <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              </div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            </div>
          </div>
          <div v-else-if="topMentors.length === 0" class="text-center py-8">
            <Icon name="heroicons:academic-cap" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">No mentors yet</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="mentor in topMentors"
              :key="mentor.id"
              class="flex items-center space-x-4"
            >
              <UAvatar
                :src="mentor.avatar"
                :alt="mentor.name"
                size="md"
              />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ mentor.name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ mentor.sessions }} sessions • ${{ mentor.revenue }}
                </p>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:star" class="w-4 h-4 text-yellow-400" />
                <span class="text-sm text-gray-900 dark:text-white">{{ mentor.rating }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 bg-gray-50 dark:bg-gray-900">
          <UButton
            to="/admin/mentors"
            variant="ghost"
            size="sm"
            trailing-icon="heroicons:arrow-right"
          >
            View all mentors & coaches
          </UButton>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: false
})

interface AdminStats {
  stats: {
    totalUsers: { value: number; change: number }
    activeMentors: { value: number; change: number }
    sessionsThisMonth: { value: number; change: number }
    platformRevenue: { value: number; change: number }
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
  recentActivity: Array<{
    id: string
    type: 'user' | 'session' | 'payment' | 'system'
    icon: string
    description: string
    timestamp: Date | string
  }>
  revenueTrend: Array<{
    month: string
    revenue: number
    bookings: number
  }>
}

const adminStats = ref<AdminStats | null>(null)
const isLoading = ref(false)

// Fetch admin stats
const fetchAdminStats = async () => {
  isLoading.value = true
  try {
    const data = await $fetch<AdminStats>('/api/admin/stats')
    // Convert timestamp strings to Date objects
    data.recentActivity = data.recentActivity.map(activity => ({
      ...activity,
      timestamp: typeof activity.timestamp === 'string' ? new Date(activity.timestamp) : activity.timestamp
    }))
    adminStats.value = data
  } catch (e: any) {
    console.error('[Admin Index] Error fetching stats:', e)
  } finally {
    isLoading.value = false
  }
}

// Fetch on mount
onMounted(() => {
  fetchAdminStats()
})

// Computed stats for display
const stats = computed(() => {
  if (!adminStats.value) return []
  return [
    {
      name: 'Total Users',
      value: adminStats.value.stats.totalUsers.value.toLocaleString(),
      change: adminStats.value.stats.totalUsers.change,
      icon: 'heroicons:users',
      color: 'blue'
    },
    {
      name: 'Active Mentors & Coaches',
      value: adminStats.value.stats.activeMentors.value.toLocaleString(),
      change: adminStats.value.stats.activeMentors.change,
      icon: 'heroicons:academic-cap',
      color: 'green'
    },
    {
      name: 'Sessions This Month',
      value: adminStats.value.stats.sessionsThisMonth.value.toLocaleString(),
      change: adminStats.value.stats.sessionsThisMonth.change,
      icon: 'heroicons:calendar-days',
      color: 'yellow'
    },
    {
      name: 'Revenue',
      value: `$${adminStats.value.stats.platformRevenue.value.toLocaleString()}`,
      change: adminStats.value.stats.platformRevenue.change,
      icon: 'heroicons:currency-dollar',
      color: 'blue'
    }
  ]
})

const recentActivity = computed(() => {
  return adminStats.value?.recentActivity || []
})

const recentBookings = computed(() => {
  return adminStats.value?.recentBookings || []
})

const topMentors = computed(() => {
  return adminStats.value?.topMentors || []
})

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (minutes < 60) return `${minutes}m ago`
  return `${hours}h ago`
}

// SEO
useSeoMeta({
  title: 'Admin Dashboard - iMentorsPro',
  description: 'Admin dashboard for managing the iMentor platform'
})

// Revenue chart - now using real data from API
const revenueData = computed(() => {
  return adminStats.value?.revenueTrend || []
})

const revenueCategories = {
  revenue: {
    name: 'Revenue',
    color: '#3b82f6' // Tailwind teal-500
  },
  bookings: {
    name: 'Bookings',
    color: '#10b981' // Tailwind emerald-500
  }
}

const xFormatter = (i: number) => revenueData.value[i]?.month ?? ''
</script>
