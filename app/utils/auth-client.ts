import { createAuthClient } from 'better-auth/vue'
import { inferAdditionalFields } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: 'string', input: true },
        hasCompletedOnboarding: { type: 'boolean', input: false },
        onboardingStep: { type: 'string', input: false },
        onboardingCompletedAt: { type: 'date', input: false },
      },
    }),
  ],
})
