export default defineNuxtRouteMiddleware(async (to) => {
  const { user, init } = useAuth()
  
  // Initialize auth state
  if (import.meta.client) {
    await init()
  }
  
  // Block mentors from accessing mentee-only routes (like browsing/booking mentors)
  if (user.value?.role === 'mentor') {
    return navigateTo('/dashboard')
  }
})
