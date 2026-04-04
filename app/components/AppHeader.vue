<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo.svg" alt="iMentorsPro" class="h-14 w-auto object-contain" />
        </NuxtLink>

        <!-- Navigation -->
        <nav v-if="user" class="hidden md:flex items-center space-x-8">
          <NuxtLink 
            to="/dashboard" 
            class="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
            active-class="text-teal-600 dark:text-teal-400"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            v-if="user?.role === 'mentee'"
            to="/mentors" 
            class="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
            active-class="text-teal-600 dark:text-teal-400"
          >
            Find Mentors & Coaches
          </NuxtLink>
          <NuxtLink 
            to="/bookings" 
            class="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
            active-class="text-teal-600 dark:text-teal-400"
          >
            My Bookings
          </NuxtLink>

          <NuxtLink 
            to="/messages" 
            class="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors relative"
            active-class="text-teal-600 dark:text-teal-400"
          >
            Messages
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </NuxtLink>
        </nav>
        <nav v-else class="hidden md:flex items-center space-x-8">
          <NuxtLink to="/discover" class="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
            Explore Mentors
          </NuxtLink>
          <a href="/#how-it-works" class="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
            How It Works
          </a>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <template v-if="user">
            <!-- Notifications -->
            <UButton
              icon="heroicons:bell"
              variant="ghost"
              color="neutral"
              size="sm"
              class="relative"
              @click="notificationsOpen = true"
            >
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </UButton>

            <!-- User Menu (Dropdown) -->
            <UDropdownMenu
              :items="userMenuItems"
              :popper="{ placement: 'bottom-end' }"
            >
              <UButton
                variant="ghost"
                color="neutral"
                class="flex items-center space-x-2"
              >
                <UAvatar
                  :src="user?.avatar"
                  :alt="`${user?.firstName} ${user?.lastName}`"
                  size="sm"
                />
                <span class="hidden sm:block text-sm font-medium">
                  {{ user?.firstName }}
                </span>
                <Icon name="heroicons:chevron-down" class="w-4 h-4" />
              </UButton>
            </UDropdownMenu>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login">
              <UButton variant="ghost" color="neutral">Log in</UButton>
            </NuxtLink>
            <NuxtLink to="/auth/signup">
              <UButton color="primary">Sign up</UButton>
            </NuxtLink>
          </template>

          <!-- Mobile Menu Button -->
          <UButton
            icon="heroicons:bars-3"
            variant="ghost"
            color="neutral"
            size="sm"
            class="md:hidden"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          />
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="isMobileMenuOpen" class="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
        <nav class="flex flex-col space-y-2">
          <NuxtLink 
            to="/dashboard" 
            class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors rounded-md"
            active-class="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
            @click="isMobileMenuOpen = false"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            v-if="user?.role === 'mentee'"
            to="/mentors" 
            class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors rounded-md"
            active-class="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
            @click="isMobileMenuOpen = false"
          >
            Find Mentors & Coaches
          </NuxtLink>
          <NuxtLink 
            to="/bookings" 
            class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors rounded-md"
            active-class="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
            @click="isMobileMenuOpen = false"
          >
            My Bookings
          </NuxtLink>


        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { navigateTo } from '#app'
import { UDropdownMenu } from '#components'
import { useNotifications } from '~/composables/useNotifications'

const { user, logout } = useAuth()
const isMobileMenuOpen = ref(false)

// Shared notifications modal state across pages
const notificationsOpen = useState<boolean>('notifications-open', () => false)

// Real notifications
const { unreadCount, fetchNotifications, markAllAsRead } = useNotifications()

onMounted(() => {
  fetchNotifications(20)
})

watch(() => notificationsOpen.value, (open) => {
  if (open) markAllAsRead()
})

// Define user menu items
const userMenuItems = [
  {
    label: 'Profile',
    icon: 'heroicons:user',
    onSelect: () => navigateTo('/profile/edit'),
  },
  {
    label: 'Sign out',
    icon: 'heroicons:arrow-right-on-rectangle',
    onSelect: () => logout(),
  },
]

// Close mobile menu when route changes
watch(() => useRoute().path, () => {
  isMobileMenuOpen.value = false
})
</script>
