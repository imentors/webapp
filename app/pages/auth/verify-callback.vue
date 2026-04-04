<template>
  <div>
    <div class="text-center">
      <div v-if="isVerifying" class="space-y-6">
        <div class="w-20 h-20 bg-teal-100 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mx-auto">
          <Icon name="heroicons:arrow-path" class="w-10 h-10 text-teal-600 dark:text-teal-400 animate-spin" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Verifying your email...
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Please wait while we verify your account.
        </p>
      </div>

      <div v-else-if="isSuccess" class="space-y-6">
        <div class="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto">
          <Icon name="heroicons:check-circle" class="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Email verified!
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Your account has been verified. Redirecting you...
        </p>
      </div>

      <div v-else class="space-y-6">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto">
          <Icon name="heroicons:x-circle" class="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Verification failed
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ errorMessage }}
        </p>
        <UButton
          to="/auth/login"
          size="lg"
          icon="heroicons:arrow-left"
        >
          Back to login
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const { init, user, hasCompletedOnboarding } = useAuth()
const route = useRoute()
const toast = useToast()

const isVerifying = ref(true)
const isSuccess = ref(false)
const errorMessage = ref('The verification link may have expired or is invalid.')

onMounted(async () => {
  // Better Auth handles the verification automatically via the callback URL
  // We just need to check if the user is now logged in
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Refresh session to get updated user data
  await init(true)
  
  isVerifying.value = false
  
  if (user.value?.emailVerified) {
    isSuccess.value = true
    
    // Redirect after a short delay
    setTimeout(async () => {
      try {
        const redirect = route.query.redirect as string
        
        if (redirect) {
          await navigateTo(redirect)
        } else if (!hasCompletedOnboarding.value) {
          if (user.value?.role === 'mentor') {
            await navigateTo('/onboarding')
          } else if (user.value?.role === 'mentee') {
            await navigateTo('/discover')
          } else if (user.value?.role === 'admin') {
            await navigateTo('/admin')
          } else {
            await navigateTo('/dashboard')
          }
        } else if (user.value?.role === 'admin') {
          await navigateTo('/admin')
        } else {
          await navigateTo('/dashboard')
        }
      } catch (error) {
        console.error('Redirect failed:', error)
        // Fallback redirect
        await navigateTo('/dashboard')
      }
    }, 1500)
  } else {
    isSuccess.value = false
    toast.add({
      title: 'Verification failed',
      description: 'We could not verify your email. Please try again or contact support.',
      color: 'error'
    })
  }
})
</script>
