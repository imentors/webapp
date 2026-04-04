<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Role-based Dashboard Redirect -->
    <div v-if="currentUser && currentUser.role === 'mentor'">
      <DashboardMentor />
    </div>
    
    <div v-else-if="currentUser && currentUser.role === 'admin'">
      <DashboardAdmin />
    </div>
    
    <div v-else>
      <!-- Mentee Dashboard -->
      <!-- Welcome Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {{ currentUser?.firstName }}!
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Ready to learn and grow?
            </p>
          </div>
          
          <div class="hidden sm:flex items-center">
            <UButton
              to="/profile/edit"
              icon="heroicons:pencil"
              variant="outline"
            >
              Edit Profile
            </UButton>
          </div>
        </div>
      </div>

    <!-- Stats Cards -->
    <div v-if="dashboardLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div class="ml-4 flex-1">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:check-circle" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats?.stats?.completedSessions ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Completed Sessions</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats?.stats?.unreadMessages ?? 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Unread Messages</p>
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
              <UButton
                to="/mentors"
                class="mt-4"
                v-if="currentUser && currentUser.role === 'mentee'"
              >
                Book a Session
              </UButton>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="session in upcomingSessionsList"
                :key="session.id"
                class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <UAvatar
                    :src="session.mentor?.image || undefined"
                    :alt="session.mentor?.name || 'Mentor or Coach'"
                    size="md"
                  />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ session.title }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      with {{ session.mentor?.name || 'Mentor or Coach' }}
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
                    :to="`/messages?mentor=${session.mentorId}`"
                    icon="heroicons:chat-bubble-left-right"
                    size="sm"
                    variant="ghost"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          
          <div class="p-6">
            <div v-if="bookingsLoading" class="space-y-4">
              <div v-for="i in 3" :key="i" class="flex items-start space-x-3 animate-pulse">
                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  activity.type === 'session' ? 'bg-teal-100 dark:bg-teal-900/20' : 
                  activity.type === 'message' ? 'bg-green-100 dark:bg-green-900/20' : 
                  'bg-teal-100 dark:bg-teal-900/20'
                ]">
                  <Icon
                    :name="activity.icon"
                    :class="[
                      'w-4 h-4',
                      activity.type === 'session' ? 'text-teal-600 dark:text-teal-400' :
                      activity.type === 'message' ? 'text-green-600 dark:text-green-400' :
                      'text-teal-600 dark:text-teal-400'
                    ]"
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
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Profile Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="text-center">
            <UAvatar
              :src="currentUser?.avatar || undefined"
              :alt="`${currentUser?.firstName} ${currentUser?.lastName}`"
              size="xl"
              class="mx-auto mb-4"
            />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ currentUser?.firstName }} {{ currentUser?.lastName }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 capitalize mb-4">
              {{ currentUser?.role }}
            </p>
            
            <div v-if="currentUser && currentUser.role === 'mentor' && dashboardStats?.stats" class="mb-4">
              <div class="flex items-center justify-center space-x-1 mb-2">
                <Icon
                  v-for="i in 5"
                  :key="i"
                  name="heroicons:star"
                  :class="[
                    'w-4 h-4',
                    i <= (dashboardStats.stats.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  ]"
                />
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ dashboardStats.stats.averageRating || 0 }}/5 • {{ dashboardStats.stats.totalSessions || 0 }} sessions
              </p>
            </div>
            
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

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          
          <div class="space-y-3">
            <UButton
              v-if="currentUser && currentUser.role === 'mentee'"
              to="/mentors"
              variant="outline"
              block
              icon="heroicons:magnifying-glass"
            >
              Find Mentors
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
              View Sessions
            </UButton>
            
            <UButton
              v-if="currentUser && currentUser.role === 'mentor'"
              to="/availability"
              variant="outline"
              block
              icon="heroicons:clock"
            >
              Set Availability
            </UButton>
          </div>
        </div>

        <!-- Tips Card -->
        <div class="bg-gradient-to-br from-teal-50 to-teal-50 dark:from-teal-900/20 dark:to-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800 p-6">
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="heroicons:light-bulb" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white mb-2">
                {{ (currentUser && currentUser.role === 'mentor') ? 'Mentor or Coach Tip' : 'Learning Tip' }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ (currentUser && currentUser.role === 'mentor') 
                  ? 'Set clear expectations at the start of each session to maximize impact.'
                  : 'Come prepared with specific questions to make the most of your mentoring sessions.'
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Notifications Modal -->
    <UModal v-model:open="notificationsOpen" title="Notifications">
      <template #body>
        <div v-if="notifications.length === 0" class="text-center py-12">
          <Icon name="heroicons:bell-slash" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer"
            @click="onClickNotification(notification)"
          >
            <Icon
              :name="notification.icon || 'heroicons:information-circle'"
              :class="[
                'w-5 h-5 mt-0.5',
                notification.type === 'warning' ? 'text-yellow-500' : 
                notification.type === 'error' ? 'text-red-500' : 'text-teal-500'
              ]"
            />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ notification.title }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ notification.message }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {{ formatTimeAgo(notification.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { User, UserRole } from '~/types'
import { navigateTo } from '#app'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
  middleware: ['auth', 'onboarding']
})

const { user: currentUser } = useAuth()
const { stats: dashboardStats, isLoading: dashboardLoading, fetchDashboardStats } = useDashboard()
const { bookings, isLoading: bookingsLoading, fetchBookings, getUpcomingBookings } = useBookings()
const { fetchRecentActivity } = useDashboard()

// Fetch dashboard data on mount
onMounted(async () => {
  if (currentUser.value && currentUser.value.role === 'mentee') {
    await Promise.all([
      fetchDashboardStats(),
      fetchBookings({ role: 'mentee' })
    ])
  }
})

// Get upcoming sessions list (limited to 5 for dashboard)
const upcomingSessionsList = computed(() => {
  return getUpcomingBookings.value.slice(0, 5)
})

// Generate recent activity from bookings
const recentActivity = computed(() => {
  const activities: Array<{
    id: string
    type: 'session' | 'message' | 'booking'
    icon: string
    description: string
    timestamp: Date
  }> = []

  bookings.value.forEach(booking => {
    // Booking created/confirmed
    activities.push({
      id: `${booking.id}-created`,
      type: 'booking',
      icon: 'heroicons:calendar-days',
      description: `Session "${booking.title}" ${booking.status === 'confirmed' ? 'confirmed' : 'booked'}`,
      timestamp: booking.createdAt,
    })

    // Session completed
    if (booking.status === 'completed') {
      activities.push({
        id: `${booking.id}-completed`,
        type: 'session',
        icon: 'heroicons:check-circle',
        description: `Completed session "${booking.title}"`,
        timestamp: booking.scheduledDate,
      })
    }
  })

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)
})

// Notifications (keeping existing mock for now)
const notificationsOpen = useState<boolean>('notifications-open', () => false)
const { notifications, fetchNotifications, markAllAsRead } = useNotifications()

onMounted(() => {
  fetchNotifications(20)
})

watch(() => notificationsOpen.value, (open) => {
  if (open) markAllAsRead()
})

const onClickNotification = (n: any) => {
  if (n?.actionUrl) navigateTo(n.actionUrl)
  notificationsOpen.value = false
}

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
