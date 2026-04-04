export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  
  // Check if user is authenticated and has admin role
  if (!user.value || user.value.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin privileges required.'
    })
  }
})
