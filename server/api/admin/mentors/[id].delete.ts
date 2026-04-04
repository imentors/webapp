import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { user } from '../../../db/schema'
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
        throw createError({ statusCode: 400, message: 'Mentor ID is required' })
    }

    try {
        // Deleting the user will cascade to mentorProfile if schema is correct
        const deletedUser = await db
            .delete(user)
            .where(eq(user.id, id))
            .returning()

        if (deletedUser.length === 0) {
            throw createError({ statusCode: 404, message: 'Mentor not found' })
        }

        return { success: true, message: 'Mentor deleted successfully' }
    } catch (error: any) {
        console.error('[Admin Mentor Delete API] Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to delete mentor',
        })
    }
})
