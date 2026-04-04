import { authClient } from '~/utils/auth-client'
import type { UserRole } from '~/types'

// Extended user type with Better Auth fields
interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  role: UserRole
  hasCompletedOnboarding: boolean
  onboardingStep: string
  onboardingCompletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  // Computed properties for convenience
  firstName?: string
  lastName?: string
  avatar?: string | null
}

export const useAuth = () => {
  // Use cookie for persistent user data
  const userCookie = useCookie<AuthUser | null>('auth_user', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  // Use useState for global reactive state
  const user = useState<AuthUser | null>('auth_user_state', () => userCookie.value)

  // Sync state to cookie when it changes
  watch(user, (newUser) => {
    userCookie.value = newUser
  }, { deep: true })

  const isAuthenticated = computed(() => !!user.value)
  const isLoading = useState<boolean>('auth_loading', () => false)
  const initialized = useState<boolean>('auth_initialized', () => false)

  // Computed helpers
  const hasCompletedOnboarding = computed(() => user.value?.hasCompletedOnboarding ?? false)
  const currentOnboardingStep = computed(() => user.value?.onboardingStep ?? 'verification')
  const userRole = computed(() => user.value?.role ?? 'mentee')
  
  // Parse firstName and lastName from name, and alias image as avatar
  const enrichedUser = computed(() => {
    if (!user.value) return null
    const nameParts = (user.value.name || '').split(' ')
    return {
      ...user.value,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      avatar: user.value.image
    }
  })

  // Initialize auth state
  const init = async (forceRefresh = false) => {
    if (initialized.value && !forceRefresh) return

    if (user.value && !forceRefresh) {
      initialized.value = true
      return
    }

    try {
      isLoading.value = true
      const { data, error } = await authClient.getSession()

      if (error) {
        user.value = null
      } else {
        user.value = data?.user as AuthUser | null
      }
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
      initialized.value = true
    }
  }

  // Login with email/password
  const login = async (email: string, password: string) => {
    isLoading.value = true

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      })

      if (signInError) {
        return { success: false, error: signInError.message }
      }

      // Get full session data
      const { data: sessionData, error: sessionError } = await authClient.getSession()

      if (sessionError) {
        return { success: false, error: sessionError.message }
      }

      user.value = sessionData?.user as AuthUser | null
      return { success: true, user: user.value }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      isLoading.value = false
    }
  }

  // Signup with email/password
  const signup = async (userData: {
    email: string
    password: string
    role: UserRole
    firstName?: string
    lastName?: string
  }) => {
    isLoading.value = true

    try {
      const name = [userData.firstName, userData.lastName].filter(Boolean).join(' ') || userData.email.split('@')[0] || 'User'

      const { error } = await authClient.signUp.email({
        email: userData.email,
        password: userData.password,
        name,
        callbackURL: '/auth/verify-callback',
        // @ts-ignore - role is an additional field
        role: userData.role,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // User needs to verify email before logging in
      return {
        success: true,
        requiresVerification: true,
        email: userData.email
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    } finally {
      isLoading.value = false
    }
  }


  // Logout
  const logout = async () => {
    try {
      await authClient.signOut()
    } catch {
      // Clear user state regardless
    }
    user.value = null
    return navigateTo('/auth/login')
  }

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    isLoading.value = true

    try {
      // Use type assertion since forgetPassword may not be in the type definition
      const { error } = await (authClient as any).forgetPassword({
        email,
        redirectTo: '/auth/reset-password',
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send reset email' }
    } finally {
      isLoading.value = false
    }
  }

  // Reset password with token
  const resetPassword = async (token: string, newPassword: string) => {
    isLoading.value = true

    try {
      const { error } = await authClient.resetPassword({
        token,
        newPassword,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reset password' }
    } finally {
      isLoading.value = false
    }
  }

  // Send verification email
  const sendVerificationEmail = async (email: string) => {
    isLoading.value = true

    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: '/auth/verify-callback',
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send verification email' }
    } finally {
      isLoading.value = false
    }
  }

  // Refresh session (useful after onboarding completion)
  const refreshSession = async () => {
    try {
      const { data, error } = await authClient.getSession()
      if (!error && data?.user) {
        user.value = data.user as AuthUser
      }
    } catch {
      // Ignore errors
    }
  }

  // Sign in with social provider (Google, LinkedIn)
  const signInWithSocial = async (provider: 'google' | 'linkedin', callbackURL = '/auth/oauth-callback') => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to sign in with ' + provider }
    }
  }

  return {
    user: enrichedUser,
    authUser: user,
    isAuthenticated,
    isLoading,
    hasCompletedOnboarding,
    currentOnboardingStep,
    userRole,
    init,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    sendVerificationEmail,
    refreshSession,
    signInWithSocial,
  }
}
