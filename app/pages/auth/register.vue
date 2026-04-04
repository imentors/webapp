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
        Complete your registration
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        You're joining as a <span class="font-semibold text-teal-600 dark:text-teal-400">{{ roleLabel }}</span>
      </p>
    </div>

    <!-- Social Signup -->
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
          @click="handleSocialSignup('google')"
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
          @click="handleSocialSignup('linkedin')"
        />
      </div>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or sign up with email</span>
        </div>
      </div>
    </div>

    <UForm
      :schema="signupSchema"
      :state="signupForm"
      @submit="handleSignup"
      class="space-y-6"
    >
      <UFormField label="Email" name="email" required>
        <UInput
          v-model="signupForm.email"
          type="email"
          placeholder="john@example.com"
          icon="heroicons:envelope"
          size="lg"
          :disabled="isLoading"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput
          v-model="signupForm.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Create a strong password"
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

      <UFormField label="Confirm Password" name="confirmPassword" required>
        <UInput
          v-model="signupForm.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Confirm your password"
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
              :disabled="isLoading"
            />
          </template>
        </UInput>
      </UFormField>

      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <input
            id="agreeToTerms"
            v-model="signupForm.agreeToTerms"
            type="checkbox"
            :disabled="isLoading"
            class="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label for="agreeToTerms" class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            I agree to the 
            <a href="#" class="text-teal-600 hover:text-teal-500 dark:text-teal-400">Terms of Service</a>
            and 
            <a href="#" class="text-teal-600 hover:text-teal-500 dark:text-teal-400">Privacy Policy</a>
          </label>
        </div>
      </div>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="isLoading"
        :disabled="isLoading || !signupForm.agreeToTerms"
        icon="heroicons:user-plus"
      >
        Create Account
      </UButton>
    </UForm>

    <div class="mt-8 text-center">
      <p class="text-gray-600 dark:text-gray-400">
        Already have an account?
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
import type { UserRole } from '~/types'
import { authClient } from '~/utils/auth-client'

definePageMeta({
  layout: 'auth'
})

const { signup } = useAuth()
const toast = useToast()
const route = useRoute()

// Redirect if no role is selected or invalid role
const role = route.query.role as string
if (!role || !['mentor', 'mentee'].includes(role)) {
  await navigateTo('/auth/signup')
}

const selectedRole = role as 'mentor' | 'mentee'
const roleLabel = computed(() => selectedRole === 'mentor' ? 'Mentor' : 'Mentee')

const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const socialLoading = ref<'google' | 'linkedin' | null>(null)

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['mentor', 'mentee']),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

const signupForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  role: selectedRole,
  agreeToTerms: false
})

const handleSignup = async () => {
  isLoading.value = true
  
  try {
    const result = await signup({
      email: signupForm.email,
      password: signupForm.password,
      role: signupForm.role
    })
    
    if (result.success) {
      toast.add({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
        color: 'success'
      })
      
      // Redirect to verification pending page
      const redirect = route.query.redirect as string
      const dest = redirect 
        ? `/auth/verify-email?email=${encodeURIComponent(signupForm.email)}&redirect=${encodeURIComponent(redirect)}`
        : `/auth/verify-email?email=${encodeURIComponent(signupForm.email)}`
      await navigateTo(dest)
    } else {
      toast.add({
        title: 'Registration failed',
        description: result.error || 'Failed to create account. Please try again.',
        color: 'error'
      })
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

const handleSocialSignup = async (provider: 'google' | 'linkedin') => {
  socialLoading.value = provider
  try {
    // Store the selected role in localStorage so we can retrieve it after OAuth redirect
    // (sessionStorage may not persist across OAuth redirects in all browsers)
    localStorage.setItem('pendingOAuthRole', selectedRole)
    
    const redirect = route.query.redirect as string
    const callbackURL = redirect
      ? `/auth/oauth-callback?role=${selectedRole}&redirect=${encodeURIComponent(redirect)}`
      : `/auth/oauth-callback?role=${selectedRole}`
      
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
