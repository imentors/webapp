export default defineNuxtRouteMiddleware(async (to) => {
  const { user, init } = useAuth()
  
  // Initialize auth state
  if (import.meta.client) {
    await init()
  }
  
  // Block non-mentors from accessing mentor-only routes (like earnings)
  if (user.value?.role !== 'mentor') {
    return navigateTo('/dashboard')
  }
})
