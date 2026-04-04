import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { user, mentorProfile } from '../../../db/schema'
import { auth } from '../../../utils/auth'
import { z } from 'zod'

const updateStatusSchema = z.object({
    status: z.enum(['verified', 'suspended', 'pending'])
})

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
        throw createError({ statusCode: 400, message: 'Mentor ID is required' })
    }

    const body = await readValidatedBody(event, updateStatusSchema.parse)

    try {
        const [targetUser] = await db.select().from(user).where(eq(user.id, id)).limit(1)

        if (!targetUser || targetUser.role !== 'mentor') {
            throw createError({ statusCode: 404, message: 'Mentor not found' })
        }

        if (body.status === 'suspended') {
            await db.update(user).set({
                suspended: true,
                isAdminVerified: false
            }).where(eq(user.id, id))
            // Also set isAvailable to false in profile
            await db.update(mentorProfile).set({ isAvailable: false }).where(eq(mentorProfile.userId, id))
        } else if (body.status === 'verified') {
            await db.update(user).set({
                suspended: false,
                isAdminVerified: true,
                emailVerified: true // Force verify if admin verifies
            }).where(eq(user.id, id))
            // Also set isAvailable to true in profile
            await db.update(mentorProfile).set({ isAvailable: true }).where(eq(mentorProfile.userId, id))
        } else if (body.status === 'pending') {
            await db.update(user).set({
                suspended: false,
                isAdminVerified: false
            }).where(eq(user.id, id))
            await db.update(mentorProfile).set({ isAvailable: true }).where(eq(mentorProfile.userId, id))
        }

        return { success: true }
    } catch (error: any) {
        console.error('[Admin Mentor Update API] Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to update mentor status',
        })
    }
})
