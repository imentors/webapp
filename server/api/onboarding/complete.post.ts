import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, mentorProfile, menteeProfile, userPreferences } from '../../db/schema'
import { auth } from '../../utils/auth'

interface OnboardingData {
  profile: {
    firstName: string
    lastName: string
    bio: string
    location?: string
  }
  roleData: {
    // Mentor fields
    experience?: string
    hourlyRate?: number
    skills?: string[]
    categories?: string[]
    dateOfBirth?: string
    expertiseDocument?: string
    idDocument?: string
    roleTitle?: string
    // Mentee fields
    interests?: string[]
    goals?: string[]
  }
  preferences: {
    timezone: string
    languages: string[]
    emailNotifications: boolean
    weeklyDigest: boolean
    marketingEmails: boolean
  }
}

export default defineEventHandler(async (event) => {
  // Get current session
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody<OnboardingData>(event)
  const userId = session.user.id
  const userRole = session.user.role as 'mentor' | 'mentee' | 'admin'

  // Verify user exists in database to prevent FK violations
  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, userId)
  })

  if (!existingUser) {
    throw createError({
      statusCode: 401,
      message: 'User not found',
    })
  }

  // Age validation for mentors
  if (userRole === 'mentor' && body.roleData.dateOfBirth) {
    const dob = new Date(body.roleData.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    if (age < 18) {
      throw createError({
        statusCode: 400,
        message: 'You must be at least 18 years old to register as a mentor.',
      })
    }
  }

  try {
    // Update user name and onboarding status
    const fullName = `${body.profile.firstName} ${body.profile.lastName}`.trim()

    await db
      .update(user)
      .set({
        name: fullName,
        hasCompletedOnboarding: true,
        onboardingStep: 'complete',
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))

    // Create role-specific profile
    if (userRole === 'mentor') {
      await db
        .insert(mentorProfile)
        .values({
          userId,
          bio: body.profile.bio,
          location: body.profile.location,
          experience: body.roleData.experience,
          hourlyRate: body.roleData.hourlyRate?.toString(),
          skills: JSON.stringify(body.roleData.skills || []),
          categories: JSON.stringify(body.roleData.categories || []),
          languages: JSON.stringify(body.preferences.languages),
          timezone: body.preferences.timezone,
          dateOfBirth: body.roleData.dateOfBirth ? new Date(body.roleData.dateOfBirth) : null,
          expertiseDocument: body.roleData.expertiseDocument,
          idDocument: body.roleData.idDocument,
          roleTitle: body.roleData.roleTitle || 'mentor',
        })
        .onConflictDoUpdate({
          target: mentorProfile.userId,
          set: {
            bio: body.profile.bio,
            location: body.profile.location,
            experience: body.roleData.experience,
            hourlyRate: body.roleData.hourlyRate?.toString(),
            skills: JSON.stringify(body.roleData.skills || []),
            categories: JSON.stringify(body.roleData.categories || []),
            languages: JSON.stringify(body.preferences.languages),
            timezone: body.preferences.timezone,
            dateOfBirth: body.roleData.dateOfBirth ? new Date(body.roleData.dateOfBirth) : null,
            expertiseDocument: body.roleData.expertiseDocument,
            idDocument: body.roleData.idDocument,
            roleTitle: body.roleData.roleTitle || 'mentor',
            updatedAt: new Date(),
          },
        })
    } else if (userRole === 'mentee') {
      await db
        .insert(menteeProfile)
        .values({
          userId,
          bio: body.profile.bio,
          location: body.profile.location,
          experience: body.roleData.experience,
          interests: JSON.stringify(body.roleData.interests || []),
          goals: JSON.stringify(body.roleData.goals || []),
          languages: JSON.stringify(body.preferences.languages),
          timezone: body.preferences.timezone,
        })
        .onConflictDoUpdate({
          target: menteeProfile.userId,
          set: {
            bio: body.profile.bio,
            location: body.profile.location,
            experience: body.roleData.experience,
            interests: JSON.stringify(body.roleData.interests || []),
            goals: JSON.stringify(body.roleData.goals || []),
            languages: JSON.stringify(body.preferences.languages),
            timezone: body.preferences.timezone,
            updatedAt: new Date(),
          },
        })
    }

    // Create user preferences
    await db
      .insert(userPreferences)
      .values({
        userId,
        emailNotifications: body.preferences.emailNotifications,
        weeklyDigest: body.preferences.weeklyDigest,
        marketingEmails: body.preferences.marketingEmails,
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          emailNotifications: body.preferences.emailNotifications,
          weeklyDigest: body.preferences.weeklyDigest,
          marketingEmails: body.preferences.marketingEmails,
          updatedAt: new Date(),
        },
      })

    return { success: true }
  } catch (error: any) {
    console.error('[Onboarding] Failed to complete onboarding:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to complete onboarding',
    })
  }
})
