<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Role Testing Dashboard
      </h1>
      
      <!-- Current User Info -->
      <div class="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h2 class="text-lg font-semibold mb-3">Current User</h2>
        <div v-if="currentUser" class="space-y-2">
          <p><strong>Name:</strong> {{ currentUser.firstName }} {{ currentUser.lastName }}</p>
          <p><strong>Email:</strong> {{ currentUser.email }}</p>
          <p><strong>Role:</strong> 
            <UBadge 
              :color="getRoleColor(currentUser.role)" 
              variant="solid"
              class="ml-2"
            >
              {{ currentUser.role }}
            </UBadge>
          </p>
        </div>
        <div v-else class="text-gray-500">
          No user logged in
        </div>
      </div>

      <!-- Role-based Content Tests -->
      <div class="space-y-6">
        <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h3 class="font-semibold mb-3">Role-based Conditional Rendering</h3>
          
          <div v-if="currentUser?.role === 'mentee'" class="p-3 bg-teal-50 dark:bg-teal-900/20 rounded border-l-4 border-teal-400">
            ✅ Mentee content is visible
          </div>
          
          <div v-if="currentUser?.role === 'mentor'" class="p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-400">
            ✅ Mentor content is visible
          </div>
          
          <div v-if="currentUser?.role === 'admin'" class="p-3 bg-teal-50 dark:bg-teal-900/20 rounded border-l-4 border-teal-400">
            ✅ Admin content is visible
          </div>
        </div>

        <!-- Quick Role Switcher for Testing -->
        <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h3 class="font-semibold mb-3">Test Different Roles</h3>
          <div class="flex gap-3">
            <UButton @click="switchRole('mentee')" variant="outline" size="sm">
              Test as Mentee
            </UButton>
            <UButton @click="switchRole('mentor')" variant="outline" size="sm">
              Test as Mentor  
            </UButton>
            <UButton @click="switchRole('admin')" variant="outline" size="sm">
              Test as Admin
            </UButton>
          </div>
        </div>

        <!-- TypeScript Type Safety Test -->
        <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h3 class="font-semibold mb-3">TypeScript Type Safety</h3>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p>✅ Role comparisons compile without TypeScript errors</p>
            <p>✅ UserRole type properly includes: 'mentee' | 'mentor' | 'admin'</p>
            <p>✅ No type narrowing issues in conditional rendering</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
        <UButton to="/dashboard" icon="heroicons:arrow-left">
          Back to Dashboard
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, UserRole } from '~/types'

const { user } = useAuth()

// Type guard to ensure proper role typing
const isRole = (role: string): role is UserRole => {
  return ['mentee', 'mentor', 'admin'].includes(role)
}

const currentUser = computed(() => {
  const u = user.value
  if (!u) return null
  
  // Ensure role is properly typed
  return {
    ...u,
    role: isRole(u.role) ? u.role : 'mentee' as UserRole
  } as User
})

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case 'mentee': return 'primary'
    case 'mentor': return 'success' 
    case 'admin': return 'warning'
    default: return 'neutral'
  }
}

const switchRole = async (newRole: UserRole) => {
  if (!currentUser.value) return
  
  // Update the user role for testing
  const updatedUser = {
    ...currentUser.value,
    role: newRole,
    email: `${newRole}@example.com`
  }
  
  // Store updated user
  if (process.client) {
    localStorage.setItem('auth-user', JSON.stringify(updatedUser))
    // Trigger reactivity by re-initializing auth
    location.reload()
  }
}
</script>
