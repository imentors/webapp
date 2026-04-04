export default defineNuxtPlugin(async () => {
  const { init } = useAuth()
  
  // Initialize authentication state on client side
  await init()
})
