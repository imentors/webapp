<template>
  <div>
    <!-- Logo for mobile -->
    <div class="lg:hidden flex justify-center mb-8">
      <NuxtLink to="/" class="w-auto h-16 bg-gradient-to-br from-teal-600 to-teal-600 rounded-2xl flex items-center justify-center px-4 hover:opacity-90 transition-opacity">
        <img src="/logo.svg" alt="iMentorsPro" class="h-14 w-auto object-contain" />
      </NuxtLink>
    </div>

    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Reset your password
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Enter your email address and we'll send you a link to reset your password
      </p>
    </div>

    <div v-if="!emailSent">
      <UForm
        :schema="forgotPasswordSchema"
        :state="forgotPasswordForm"
        @submit="handleForgotPassword"
        class="space-y-6"
      >
        <UFormField label="Email" name="email" required>
          <UInput
            v-model="forgotPasswordForm.email"
            type="email"
            placeholder="Enter your email address"
            icon="heroicons:envelope"
            size="lg"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          size="lg"
          block
          :loading="isLoading"
          :disabled="isLoading"
          icon="heroicons:paper-airplane"
        >
          Send Reset Link
        </UButton>
      </UForm>
    </div>

    <div v-else class="text-center">
      <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="heroicons:check" class="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Check your email
      </h3>
      
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        We've sent a password reset link to <strong>{{ forgotPasswordForm.email }}</strong>
      </p>

      <UButton
        @click="emailSent = false"
        variant="outline"
        size="lg"
        icon="heroicons:arrow-left"
      >
        Back to form
      </UButton>
    </div>

    <div class="mt-8 text-center">
      <p class="text-gray-600 dark:text-gray-400">
        Remember your password?
        <NuxtLink
          to="/auth/login"
          class="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth'
})

const { requestPasswordReset } = useAuth()
const toast = useToast()

const isLoading = ref(false)
const emailSent = ref(false)

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

const forgotPasswordForm = reactive({
  email: ''
})

const handleForgotPassword = async () => {
  isLoading.value = true
  
  try {
    const result = await requestPasswordReset(forgotPasswordForm.email)
    
    if (result.success) {
      emailSent.value = true
      toast.add({
        title: 'Reset link sent',
        description: 'Check your email for password reset instructions.',
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Error',
        description: result.error || 'Failed to send reset link. Please try again.',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to send reset link. Please try again.',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>
