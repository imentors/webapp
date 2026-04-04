<template>
  <div>
    <!-- Welcome Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {{ user?.firstName }}!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Ready to inspire and guide your mentees?
          </p>
        </div>
        
        <div class="flex items-center space-x-3">
          <UButton
            to="/earnings"
            icon="heroicons:banknotes"
            variant="outline"
            class="hidden sm:flex"
          >
            Earnings
          </UButton>
          <UButton
            to="/availability"
            icon="heroicons:clock"
            variant="outline"
            class="hidden sm:flex"
          >
            Set Availability
          </UButton>
          <UButton
            to="/profile/edit"
            icon="heroicons:pencil"
            variant="outline"
            class="hidden sm:flex"
          >
            Edit Profile
          </UButton>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="dashboardLoading" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
      <NuxtLink to="/earnings" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-pointer">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ dashboardStats?.stats?.monthlyEarnings ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">This Month</p>
          </div>
        </div>
      </NuxtLink>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:calendar-days" class="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats?.stats?.upcomingSessions ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Upcoming Sessions</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:users" class="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats?.stats?.activeMentees ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Active Mentees</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:star" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats?.stats?.averageRating?.toFixed(1) ?? '0.0' }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Upcoming Sessions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Upcoming Sessions
              </h2>
              <UButton
                to="/bookings"
                variant="ghost"
                size="sm"
                icon="heroicons:arrow-right"
              >
                View All
              </UButton>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="bookingsLoading" class="text-center py-8">
              <div class="animate-pulse space-y-4">
                <div v-for="i in 2" :key="i" class="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
            <div v-else-if="upcomingSessionsList.length === 0" class="text-center py-8">
              <Icon name="heroicons:calendar-days" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">No upcoming sessions</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="session in upcomingSessionsList"
                :key="session.id"
                class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <UAvatar
                    :src="session.mentee?.image || undefined"
                    :alt="session.mentee?.name || 'Mentee'"
                    size="md"
                  />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ session.title }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      with {{ session.mentee?.name || 'Mentee' }}
                    </p>
                    <p class="text-sm text-teal-600 dark:text-teal-400">
                      {{ formatDate(session.scheduledDate) }} at {{ formatTime(session.scheduledDate) }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <UButton
                    v-if="session.meetingLink"
                    :href="session.meetingLink"
                    target="_blank"
                    icon="heroicons:video-camera"
                    size="sm"
                    variant="outline"
                  >
                    Join
                  </UButton>
                  <UButton
                    :to="`/messages?booking=${session.id}`"
                    icon="heroicons:chat-bubble-left-right"
                    size="sm"
                    variant="ghost"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Earnings Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Earnings Overview
            </h2>
          </div>
          
          <div class="p-6">
            <div v-if="dashboardLoading" class="animate-pulse">
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div v-for="i in 3" :key="i" class="text-center">
                  <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto mb-2"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ dashboardStats?.stats?.totalEarnings ?? 0 }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ dashboardStats?.stats?.monthlyEarnings ?? 0 }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats?.stats?.totalSessions ?? 0 }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                </div>
              </div>
              
              <!-- Simple earnings visualization -->
              <div v-if="earningsChartData.length > 0" class="space-y-3">
                <div
                  v-for="month in earningsChartData"
                  :key="month.name"
                  class="flex items-center justify-between"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ month.name }}</span>
                  <div class="flex items-center space-x-2">
                    <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        class="bg-green-600 h-2 rounded-full"
                        :style="{ width: `${Math.min((month.amount / maxEarnings) * 100, 100)}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">${{ month.amount }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
                No earnings data available
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Profile Performance -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Performance
          </h3>
          
          <div v-if="dashboardLoading" class="space-y-4 animate-pulse">
            <div v-for="i in 4" :key="i" class="flex items-center justify-between">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
          </div>
          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Profile Views</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ dashboardStats?.stats?.profileViews ?? 0 }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Booking Rate</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ dashboardStats?.stats?.bookingRate ?? 0 }}%</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ dashboardStats?.stats?.responseTime ?? 'N/A' }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ dashboardStats?.stats?.completionRate ?? 0 }}%</span>
            </div>
          </div>
        </div>

        <!-- Recent Reviews -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Reviews
            </h3>
            <UButton
              variant="ghost"
              size="sm"
              icon="heroicons:arrow-right"
            >
              View All
            </UButton>
          </div>
          
          <div v-if="reviewsLoading" class="space-y-4 animate-pulse">
            <div v-for="i in 2" :key="i" class="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
          <div v-else-if="recentReviews.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            No reviews yet
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="review in recentReviews"
              :key="review.id"
              class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
            >
              <div class="flex items-center space-x-2 mb-2">
                <div class="flex items-center space-x-1">
                  <Icon
                    v-for="i in 5"
                    :key="i"
                    name="heroicons:star"
                    :class="[
                      'w-4 h-4',
                      i <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    ]"
                  />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ review.name }}</span>
              </div>
              <p v-if="review.comment" class="text-sm text-gray-600 dark:text-gray-400">
                "{{ review.comment }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          
          <div class="space-y-3">
            <UButton
              to="/availability"
              variant="outline"
              block
              icon="heroicons:clock"
            >
              Update Availability
            </UButton>
            
            <UButton
              to="/messages"
              variant="outline"
              block
              icon="heroicons:chat-bubble-left-right"
            >
              Messages
            </UButton>
            
            <UButton
              to="/bookings"
              variant="outline"
              block
              icon="heroicons:calendar-days"
            >
              Manage Sessions
            </UButton>
            
            <UButton
              to="/profile/edit"
              variant="outline"
              block
              icon="heroicons:pencil"
            >
              Edit Profile
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { stats: dashboardStats, isLoading: dashboardLoading, fetchDashboardStats } = useDashboard()
const { bookings, isLoading: bookingsLoading, fetchBookings, getUpcomingBookings } = useBookings()
const { reviews: recentReviewsList, fetchReviewsByMentor, isLoading: reviewsLoading } = useReviews()

// Fetch dashboard data on mount
onMounted(async () => {
  if (user.value?.role === 'mentor') {
    await Promise.all([
      fetchDashboardStats(),
      fetchBookings({ role: 'mentor' }),
      fetchReviewsByMentor(user.value.id, 3, 0) // Get 3 most recent reviews
    ])
  }
})

// Get upcoming sessions list (limited to 5 for dashboard)
const upcomingSessionsList = computed(() => {
  return getUpcomingBookings.value.slice(0, 5)
})

// Get earnings chart data
const earningsChartData = computed(() => {
  return dashboardStats.value?.earningsData || []
})

// Calculate max earnings for chart scaling
const maxEarnings = computed(() => {
  if (earningsChartData.value.length === 0) return 1
  return Math.max(...earningsChartData.value.map(m => m.amount), 1)
})


// Recent reviews from API
const recentReviews = computed(() => {
  return recentReviewsList.value.map(review => ({
    id: review.id,
    name: review.mentee?.name?.split(' ').map((n, i) => i === 0 ? n : n[0]).join(' ') || 'Anonymous',
    rating: review.rating,
    comment: review.comment || ''
  }))
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}
</script>
