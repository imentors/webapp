import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, mentorProfile, menteeProfile, userPreferences } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    // Get current session
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        })
    }

    const userId = session.user.id
    const userRole = session.user.role as 'mentor' | 'mentee' | 'admin'

    try {
        // Get base user data
        const userData = await db.query.user.findFirst({
            where: eq(user.id, userId),
        })

        if (!userData) {
            throw createError({
                statusCode: 404,
                message: 'User not found',
            })
        }

        // Parse name into first/last
        const nameParts = (userData.name || '').split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        // Get role-specific profile
        let profileData: any = null

        if (userRole === 'mentor') {
            const mentorData = await db.query.mentorProfile.findFirst({
                where: eq(mentorProfile.userId, userId),
            })

            if (mentorData) {
                profileData = {
                    bio: mentorData.bio || '',
                    location: mentorData.location || '',
                    experience: mentorData.experience || '',
                    hourlyRate: mentorData.hourlyRate ? parseFloat(mentorData.hourlyRate) : 0,
                    skills: mentorData.skills ? JSON.parse(mentorData.skills) : [],
                    categories: mentorData.categories ? JSON.parse(mentorData.categories) : [],
                    languages: mentorData.languages ? JSON.parse(mentorData.languages) : [],
                    timezone: mentorData.timezone || '',
                    dateOfBirth: mentorData.dateOfBirth || null,
                    expertiseDocument: mentorData.expertiseDocument || '',
                }
            }
        } else if (userRole === 'mentee') {
            const menteeData = await db.query.menteeProfile.findFirst({
                where: eq(menteeProfile.userId, userId),
            })

            if (menteeData) {
                profileData = {
                    bio: menteeData.bio || '',
                    location: menteeData.location || '',
                    experience: menteeData.experience || '',
                    interests: menteeData.interests ? JSON.parse(menteeData.interests) : [],
                    goals: menteeData.goals ? JSON.parse(menteeData.goals) : [],
                    languages: menteeData.languages ? JSON.parse(menteeData.languages) : [],
                    timezone: menteeData.timezone || '',
                }
            }
        }

        // Get user preferences
        const preferencesData = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, userId),
        })

        return {
            user: {
                id: userData.id,
                email: userData.email,
                firstName,
                lastName,
                role: userData.role,
                image: userData.image,
            },
            profile: profileData || {},
            preferences: preferencesData ? {
                emailNotifications: preferencesData.emailNotifications,
                weeklyDigest: preferencesData.weeklyDigest,
                marketingEmails: preferencesData.marketingEmails,
            } : {
                emailNotifications: true,
                weeklyDigest: true,
                marketingEmails: false,
            },
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('[Profile] Failed to fetch profile:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch profile',
        })
    }
})
