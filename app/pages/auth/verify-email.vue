<template>
  <div>
    <!-- Logo for mobile -->
    <div class="lg:hidden flex justify-center mb-8">
      <NuxtLink to="/" class="w-auto h-16 bg-gradient-to-br from-teal-600 to-teal-600 rounded-2xl flex items-center justify-center px-4 hover:opacity-90 transition-opacity">
        <img src="/logo.svg" alt="iMentorsPro" class="h-14 w-auto object-contain" />
      </NuxtLink>
    </div>

    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-teal-100 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon name="heroicons:envelope" class="w-10 h-10 text-teal-600 dark:text-teal-400" />
      </div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Check your email
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        We've sent a verification link to
      </p>
      <p class="text-lg font-medium text-gray-900 dark:text-white mt-2">
        {{ email }}
      </p>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
      <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
        Click the link in your email to verify your account. If you don't see it, check your spam folder.
      </p>
    </div>

    <div class="space-y-4">
      <UButton
        @click="resendEmail"
        variant="outline"
        block
        size="lg"
        :loading="isResending"
        :disabled="cooldown > 0"
        icon="heroicons:arrow-path"
      >
        {{ cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email' }}
      </UButton>

      <UButton
        :to="route.query.redirect ? `/auth/login?redirect=${encodeURIComponent(route.query.redirect as string)}` : '/auth/login'"
        variant="ghost"
        block
        size="lg"
        icon="heroicons:arrow-left"
      >
        Back to login
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const toast = useToast()
const { sendVerificationEmail } = useAuth()

const email = computed(() => route.query.email as string || '')
const isResending = ref(false)
const cooldown = ref(0)

let cooldownInterval: ReturnType<typeof setInterval> | null = null

const resendEmail = async () => {
  if (!email.value || cooldown.value > 0) return

  isResending.value = true

  const result = await sendVerificationEmail(email.value)

  if (result.success) {
    toast.add({
      title: 'Email sent',
      description: 'A new verification email has been sent.',
      color: 'success'
    })
    // Start cooldown
    cooldown.value = 60
    cooldownInterval = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0 && cooldownInterval) {
        clearInterval(cooldownInterval)
      }
    }, 1000)
  } else {
    toast.add({
      title: 'Failed to send email',
      description: result.error || 'Please try again later.',
      color: 'error'
    })
  }

  isResending.value = false
}

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>
