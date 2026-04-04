export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isAuthenticated, hasCompletedOnboarding, init } = useAuth()

  if (import.meta.client) {
    await init()
  }

  // Only apply to authenticated users
  if (!isAuthenticated.value || !user.value) {
    return
  }

  // Skip onboarding check for onboarding pages and auth pages
  if (to.path.startsWith('/onboarding') || to.path.startsWith('/auth')) {
    return
  }

  // Redirect to onboarding if not completed
  if (!hasCompletedOnboarding.value) {
    // Mentees use the discovery flow for onboarding
    if (user.value?.role === 'mentee') {
      return navigateTo('/discover')
    }
    return navigateTo('/onboarding')
  }
})
