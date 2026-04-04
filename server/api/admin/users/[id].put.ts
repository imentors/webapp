import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { user } from '../../../db/schema'
import { auth } from '../../../utils/auth'
import { z } from 'zod'

const updateStatusSchema = z.object({
    status: z.enum(['active', 'suspended'])
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
        throw createError({ statusCode: 400, message: 'User ID is required' })
    }

    const body = await readBody(event)
    const { status } = updateStatusSchema.parse(body)

    try {
        const updatedUser = await db
            .update(user)
            .set({
                suspended: status === 'suspended',
                updatedAt: new Date()
            })
            .where(eq(user.id, id))
            .returning()

        if (updatedUser.length === 0) {
            throw createError({ statusCode: 404, message: 'User not found' })
        }

        return { success: true, user: updatedUser[0] }
    } catch (error: any) {
        console.error('[Admin User Update API] Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to update user status',
        })
    }
})
