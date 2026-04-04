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
        Welcome back
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Sign in to your account to continue
      </p>
    </div>

    <!-- Social Login -->
    <div class="space-y-4 mb-8">
      <div class="grid grid-cols-2 gap-4">
        <UButton
          label="Google"
          icon="i-simple-icons-google"
          color="neutral"
          variant="outline"
          size="lg"
          block
          :loading="socialLoading === 'google'"
          :disabled="socialLoading !== null"
          @click="handleSocialLogin('google')"
        />
        <UButton
          label="LinkedIn"
          icon="i-simple-icons-linkedin"
          color="neutral"
          variant="outline"
          size="lg"
          block
          :loading="socialLoading === 'linkedin'"
          :disabled="socialLoading !== null"
          @click="handleSocialLogin('linkedin')"
        />
      </div>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with email</span>
        </div>
      </div>
    </div>

    <UForm
      :schema="loginSchema"
      :state="loginForm"
      @submit="handleLogin"
      class="space-y-6"
    >
      <UFormField label="Email" name="email" required>
        <UInput
          v-model="loginForm.email"
          type="email"
          placeholder="Enter your email"
          icon="heroicons:envelope"
          size="lg"
          :disabled="isLoading"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput
          v-model="loginForm.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter your password"
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
              :disabled="isLoading"
            />
          </template>
        </UInput>
      </UFormField>

      <div class="flex items-center justify-end">
        <NuxtLink
          to="/auth/forgot-password"
          class="text-sm text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Forgot password?
        </NuxtLink>
      </div>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="isLoading"
        :disabled="isLoading"
        icon="heroicons:arrow-right-on-rectangle"
      >
        Sign In
      </UButton>
    </UForm>

    <div class="mt-8 text-center">
      <p class="text-gray-600 dark:text-gray-400">
        Don't have an account?
        <NuxtLink
          to="/auth/signup"
          class="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Sign up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { authClient } from '~/utils/auth-client'

definePageMeta({
  layout: 'auth'
})

const { login, user, hasCompletedOnboarding } = useAuth()
const toast = useToast()
const route = useRoute()

const isLoading = ref(false)
const showPassword = ref(false)
const socialLoading = ref<'google' | 'linkedin' | null>(null)

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const loginForm = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  isLoading.value = true
  
  try {
    const result = await login(loginForm.email, loginForm.password)
    
    if (result.success) {
      toast.add({
        title: 'Welcome back!',
        description: 'You have been successfully signed in.',
        color: 'success'
      })
      
      // Redirect based on redirect param, onboarding status and role
      const redirect = route.query.redirect as string
      
      if (redirect) {
        await navigateTo(redirect)
      } else if (!hasCompletedOnboarding.value) {
        await navigateTo('/onboarding')
      } else if (user.value?.role === 'admin') {
        await navigateTo('/admin')
      } else {
        await navigateTo('/dashboard')
      }
    } else {
      // Check for email verification error
      if (result.error?.toLowerCase().includes('verify') || result.error?.toLowerCase().includes('verification')) {
        toast.add({
          title: 'Email not verified',
          description: 'Please verify your email before signing in.',
          color: 'warning'
        })
        await navigateTo(`/auth/verify-email?email=${encodeURIComponent(loginForm.email)}`)
      } else {
        toast.add({
          title: 'Sign in failed',
          description: result.error || 'Invalid credentials. Please try again.',
          color: 'error'
        })
      }
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
  socialLoading.value = provider
  try {
    const redirect = route.query.redirect as string
    const callbackURL = redirect 
      ? `/auth/oauth-callback?redirect=${encodeURIComponent(redirect)}`
      : '/auth/oauth-callback'
      
    await authClient.signIn.social({
      provider,
      callbackURL
    })
  } catch (error) {
    socialLoading.value = null
    toast.add({
      title: 'Error',
      description: 'Failed to connect with ' + provider,
      color: 'error'
    })
  }
}
</script>
