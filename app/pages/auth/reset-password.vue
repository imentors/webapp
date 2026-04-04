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
        Set new password
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Enter your new password below
      </p>
    </div>

    <UForm
      :schema="resetSchema"
      :state="resetForm"
      @submit="handleReset"
      class="space-y-6"
    >
      <UFormField label="New Password" name="password" required>
        <UInput
          v-model="resetForm.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter new password"
          icon="heroicons:lock-closed"
          size="lg"
          :disabled="isLoading"
          class="w-full"
        >
          <template #trailing>
            <UButton
              :icon="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField label="Confirm Password" name="confirmPassword" required>
        <UInput
          v-model="resetForm.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Confirm new password"
          icon="heroicons:lock-closed"
          size="lg"
          :disabled="isLoading"
          class="w-full"
        >
          <template #trailing>
            <UButton
              :icon="showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="isLoading"
        :disabled="isLoading"
        icon="heroicons:check"
      >
        Reset Password
      </UButton>
    </UForm>

    <div class="mt-8 text-center">
      <NuxtLink
        to="/auth/login"
        class="text-sm text-teal-600 hover:text-teal-500 dark:text-teal-400"
      >
        Back to login
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const toast = useToast()
const { resetPassword } = useAuth()

const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const token = computed(() => route.query.token as string || '')

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

const resetForm = reactive({
  password: '',
  confirmPassword: ''
})

const handleReset = async () => {
  if (!token.value) {
    toast.add({
      title: 'Invalid link',
      description: 'The reset link is invalid or has expired.',
      color: 'error'
    })
    return
  }

  isLoading.value = true

  const result = await resetPassword(token.value, resetForm.password)

  if (result.success) {
    toast.add({
      title: 'Password reset successful',
      description: 'You can now log in with your new password.',
      color: 'success'
    })
    await navigateTo('/auth/login')
  } else {
    toast.add({
      title: 'Reset failed',
      description: result.error || 'The reset link may have expired.',
      color: 'error'
    })
  }

  isLoading.value = false
}

onMounted(() => {
  if (!token.value) {
    toast.add({
      title: 'Invalid link',
      description: 'No reset token found. Please request a new password reset.',
      color: 'error'
    })
  }
})
</script>
