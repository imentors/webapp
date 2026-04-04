import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, mentorProfile, menteeProfile, userPreferences } from '../../db/schema'
import { auth } from '../../utils/auth'

interface ProfileUpdateData {
    firstName: string
    lastName: string
    bio?: string
    location?: string
    // Mentor-specific
    hourlyRate?: number
    experience?: string
    skills?: string[]
    categories?: string[]
    dateOfBirth?: string
    expertiseDocument?: string
    // Mentee-specific
    interests?: string[]
    goals?: string[]
    // Shared
    languages?: string[]
    timezone?: string
    // Preferences
    emailNotifications?: boolean
    weeklyDigest?: boolean
    marketingEmails?: boolean
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

    const body = await readBody<ProfileUpdateData>(event)
    const userId = session.user.id
    const userRole = session.user.role as 'mentor' | 'mentee' | 'admin'

    // Validate required fields
    if (!body.firstName?.trim() || !body.lastName?.trim()) {
        throw createError({
            statusCode: 400,
            message: 'First name and last name are required',
        })
    }

    try {
        // Update user name
        const fullName = `${body.firstName.trim()} ${body.lastName.trim()}`

        await db
            .update(user)
            .set({
                name: fullName,
                updatedAt: new Date(),
            })
            .where(eq(user.id, userId))

        // Update role-specific profile
        if (userRole === 'mentor') {
            await db
                .insert(mentorProfile)
                .values({
                    userId,
                    bio: body.bio || null,
                    location: body.location || null,
                    experience: body.experience || null,
                    hourlyRate: body.hourlyRate?.toString() || null,
                    skills: body.skills ? JSON.stringify(body.skills) : null,
                    categories: body.categories ? JSON.stringify(body.categories) : null,
                    languages: body.languages ? JSON.stringify(body.languages) : null,
                    timezone: body.timezone || null,
                    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
                    expertiseDocument: body.expertiseDocument || null,
                })
                .onConflictDoUpdate({
                    target: mentorProfile.userId,
                    set: {
                        bio: body.bio || null,
                        location: body.location || null,
                        experience: body.experience || null,
                        hourlyRate: body.hourlyRate?.toString() || null,
                        skills: body.skills ? JSON.stringify(body.skills) : null,
                        categories: body.categories ? JSON.stringify(body.categories) : null,
                        languages: body.languages ? JSON.stringify(body.languages) : null,
                        timezone: body.timezone || null,
                        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
                        expertiseDocument: body.expertiseDocument || null,
                        updatedAt: new Date(),
                    },
                })
        } else if (userRole === 'mentee') {
            await db
                .insert(menteeProfile)
                .values({
                    userId,
                    bio: body.bio || null,
                    location: body.location || null,
                    experience: body.experience || null,
                    interests: body.interests ? JSON.stringify(body.interests) : null,
                    goals: body.goals ? JSON.stringify(body.goals) : null,
                    languages: body.languages ? JSON.stringify(body.languages) : null,
                    timezone: body.timezone || null,
                })
                .onConflictDoUpdate({
                    target: menteeProfile.userId,
                    set: {
                        bio: body.bio || null,
                        location: body.location || null,
                        experience: body.experience || null,
                        interests: body.interests ? JSON.stringify(body.interests) : null,
                        goals: body.goals ? JSON.stringify(body.goals) : null,
                        languages: body.languages ? JSON.stringify(body.languages) : null,
                        timezone: body.timezone || null,
                        updatedAt: new Date(),
                    },
                })
        }

        // Update user preferences if provided
        if (
            body.emailNotifications !== undefined ||
            body.weeklyDigest !== undefined ||
            body.marketingEmails !== undefined
        ) {
            await db
                .insert(userPreferences)
                .values({
                    userId,
                    emailNotifications: body.emailNotifications ?? true,
                    weeklyDigest: body.weeklyDigest ?? true,
                    marketingEmails: body.marketingEmails ?? false,
                })
                .onConflictDoUpdate({
                    target: userPreferences.userId,
                    set: {
                        emailNotifications: body.emailNotifications ?? true,
                        weeklyDigest: body.weeklyDigest ?? true,
                        marketingEmails: body.marketingEmails ?? false,
                        updatedAt: new Date(),
                    },
                })
        }

        return { success: true }
    } catch (error: any) {
        console.error('[Profile] Failed to update profile:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to update profile',
        })
    }
})
