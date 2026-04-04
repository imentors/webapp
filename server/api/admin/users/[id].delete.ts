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
        throw createError({ statusCode: 400, message: 'User ID is required' })
    }

    try {
        // Better Auth handles cascade deletes if configured, 
        // but Drizzle schema also has onDelete: 'cascade' for profiles
        const deletedUser = await db
            .delete(user)
            .where(eq(user.id, id))
            .returning()

        if (deletedUser.length === 0) {
            throw createError({ statusCode: 404, message: 'User not found' })
        }

        return { success: true, message: 'User deleted successfully' }
    } catch (error: any) {
        console.error('[Admin User Delete API] Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to delete user',
        })
    }
})
