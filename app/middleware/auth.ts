export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, init } = useAuth()
  
  // Initialize auth state
  if (import.meta.client) {
    await init()
  }
  
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
})
