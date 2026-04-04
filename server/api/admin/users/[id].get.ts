import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { user, menteeProfile, mentorProfile } from '../../../db/schema'
import { auth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (session.user.role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'User ID is required' })
    }

    try {
        const userData = await db.query.user.findFirst({
            where: eq(user.id, id),
            with: {
                menteeProfile: true,
                mentorProfile: true,
            }
        })

        if (!userData) {
            throw createError({ statusCode: 404, message: 'User not found' })
        }

        // Determine status
        const status = userData.suspended ? 'suspended' : (userData.emailVerified ? 'active' : 'pending')

        const nameParts = userData.name?.split(' ') || ['', '']
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        const profile = userData.role === 'mentor' ? userData.mentorProfile : userData.menteeProfile

        return {
            id: userData.id,
            firstName,
            lastName,
            email: userData.email,
            role: userData.role,
            avatar: userData.image || undefined,
            status,
            suspended: userData.suspended,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastActive: userData.updatedAt,
            bio: profile?.bio,
            location: profile?.location,
            experience: profile?.experience,
            interests: parseJsonArray(profile?.interests),
            goals: userData.role === 'mentee' ? parseJsonArray((profile as any)?.goals) : [],
            languages: parseJsonArray(profile?.languages),
            timezone: profile?.timezone,
            stats: {
                sessions: 0, // Would fetch from sessions table
                rating: 0,
                revenue: 0
            }
        }
    } catch (error: any) {
        console.error('[Admin User Detail API] Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch user details',
        })
    }
})

function parseJsonArray(value: any): string[] {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}
