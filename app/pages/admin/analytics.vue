<template>
  <NuxtLayout name="admin">
    <!-- Error Display -->
    <div v-if="error" class="mb-6 px-6 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading analytics</h3>
            <div class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</div>
          </div>
        </div>
        <button @click="fetchAnalytics()" class="ml-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm">
          Retry
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <span class="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
    </div>

    <template v-else>
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="metric in keyMetricsCards"
          :key="metric.name"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon
                :name="metric.icon"
                :class="['w-8 h-8', `text-${metric.color}-500`]"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {{ metric.name }}
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ metric.value }}
                  </div>
                  <div
                    :class="[
                      'ml-2 flex items-baseline text-sm font-semibold',
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    ]"
                  >
                    <Icon
                      :name="metric.change > 0 ? 'heroicons:arrow-up' : 'heroicons:arrow-down'"
                      class="w-4 h-4 mr-1"
                    />
                    {{ Math.abs(metric.change) }}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Revenue Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Revenue Trends
            </h3>
            <USelect
              v-model="revenueTimeframe"
              :items="timeframeOptions"
              size="sm"
            />
          </div>
          <div class="chart-wrapper">
            <LineChart
              v-if="revenueTrendData.length > 0"
              :data="revenueTrendData"
              :categories="revenueTrendCategories"
              :height="320"
              :xFormatter="revenueXFormatter"
              xLabel="Month"
              yLabel="Revenue"
            />
            <div v-else class="h-80 flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          </div>
        </div>

        <!-- User Growth Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              User Growth
            </h3>
            <USelect
              v-model="userGrowthTimeframe"
              :items="timeframeOptions"
              size="sm"
            />
          </div>
          <div class="chart-wrapper">
            <LineChart
              v-if="userGrowthData.length > 0"
              :data="userGrowthData"
              :categories="userGrowthCategories"
              :height="320"
              :xFormatter="userGrowthXFormatter"
              xLabel="Month"
              yLabel="Users"
            />
            <div v-else class="h-80 flex items-center justify-center text-gray-500">
              No user growth data available
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Session Analytics -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Session Analytics
          </h3>
          <div class="space-y-4">
            <div
              v-for="stat in sessionStatsList"
              :key="stat.label"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ stat.label }}</span>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ stat.value }}</span>
            </div>
          </div>
        </div>

        <!-- Top Categories -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Popular Categories
          </h3>
          <div class="space-y-3">
            <div
              v-for="category in topCategories"
              :key="category.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    'w-3 h-3 rounded-full',
                    `bg-${category.color}-500`
                  ]"
                />
                <span class="text-sm text-gray-900 dark:text-white">{{ category.name }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ category.sessions }}</span>
                <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    :class="[
                      'h-2 rounded-full',
                      `bg-${category.color}-500`
                    ]"
                    :style="{ width: `${category.percentage}%` }"
                  />
                </div>
              </div>
            </div>
            <div v-if="topCategories.length === 0" class="text-sm text-gray-500 text-center py-4">
              No category data available
            </div>
          </div>
        </div>

        <!-- Mentor Performance -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Mentor Performance
          </h3>
          <div class="space-y-4">
            <div
              v-for="mentor in topPerformingMentors"
              :key="mentor.id"
              class="flex items-center space-x-3"
            >
              <UAvatar
                :src="mentor.avatar"
                :alt="mentor.name"
                size="sm"
              />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ mentor.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ mentor.sessions }} sessions • ${{ mentor.revenue.toLocaleString() }}
                </p>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:star" class="w-4 h-4 text-yellow-400" />
                <span class="text-sm text-gray-900 dark:text-white">{{ mentor.rating }}</span>
              </div>
            </div>
            <div v-if="topPerformingMentors.length === 0" class="text-sm text-gray-500 text-center py-4">
              No mentor data available
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Platform Activity
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
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
              <span class="text-xs text-gray-400 dark:text-gray-500">
                {{ activity.count }}
              </span>
            </div>
            <div v-if="recentActivity.length === 0" class="text-sm text-gray-500 text-center py-4">
              No recent activity
            </div>
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: false
})

// Use admin analytics composable
const {
  isLoading,
  error,
  revenueTimeframe,
  userGrowthTimeframe,
  timeframeOptions,
  topCategories,
  topPerformingMentors,
  recentActivity,
  keyMetricsCards,
  sessionStatsList,
  revenueTrendData,
  userGrowthData,
  revenueTrendCategories,
  userGrowthCategories,
  fetchAnalytics,
} = useAdminAnalytics()

// Chart formatters
const revenueXFormatter = (i: number) => revenueTrendData.value[i]?.month ?? ''
const userGrowthXFormatter = (i: number) => userGrowthData.value[i]?.month ?? ''

// Methods
const formatTime = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (minutes < 60) return `${minutes}m ago`
  return `${hours}h ago`
}

// Initial data fetch
onMounted(() => {
  fetchAnalytics()
})

// SEO
useSeoMeta({
  title: 'Analytics - Admin Dashboard',
  description: 'Platform analytics and insights'
})
</script>
