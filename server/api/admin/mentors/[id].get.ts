import { eq, sql } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { user, mentorProfile } from '../../../db/schema'
import { auth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    console.log(`[Admin Mentor Detail API] Request for ID: ${id}`)

    try {
        console.log('[Admin Mentor Detail API] Checking session...')
        const session = await auth.api.getSession({ headers: event.headers })

        if (!session?.user) {
            console.log('[Admin Mentor Detail API] Unauthorized')
            throw createError({ statusCode: 401, message: 'Unauthorized' })
        }

        if (session.user.role !== 'admin') {
            console.log('[Admin Mentor Detail API] Forbidden: Not an admin')
            throw createError({ statusCode: 403, message: 'Admin access required' })
        }

        if (!id) {
            throw createError({ statusCode: 400, message: 'Mentor ID is required' })
        }

        console.log(`[Admin Mentor Detail API] Fetching mentor ${id} from DB...`)
        const mentorData = await db.query.user.findFirst({
            where: eq(user.id, id),
            with: {
                mentorProfile: true,
            }
        })

        if (!mentorData || mentorData.role !== 'mentor') {
            console.log(`[Admin Mentor Detail API] Mentor ${id} not found or not a mentor`)
            throw createError({ statusCode: 404, message: 'Mentor not found' })
        }

        console.log(`[Admin Mentor Detail API] Fetching stats for ${id}...`)
        // Subquery for review count
        const reviewCountSubquery = sql<number>`(
            SELECT COUNT(*)::int 
            FROM "review" r 
            WHERE r.mentor_id = ${id}
        )`

        // Subquery for total revenue
        const totalRevenueSubquery = sql<string>`(
            SELECT COALESCE(SUM(CAST(b.price AS DECIMAL)), 0)::text
            FROM "booking" b
            WHERE b.mentor_id = ${id}
            AND b.status = 'completed'
        )`

        // Get computed stats - more robust query
        const statsResult = await db.select({
            reviewCount: reviewCountSubquery,
            totalRevenue: totalRevenueSubquery
        }).from(sql`(SELECT 1) as t`).limit(1)

        const stats = statsResult[0] || { reviewCount: 0, totalRevenue: '0' }

        const m = mentorData
        const p = mentorData.mentorProfile

        // Determine status
        let mentorStatus = 'pending'
        if (m.suspended) {
            mentorStatus = 'suspended'
        } else if (m.isAdminVerified) {
            mentorStatus = 'verified'
        }

        const categoriesArray = parseJsonArray(p?.categories)
        const mainCategory = categoriesArray[0] || 'Uncategorized'

        console.log(`[Admin Mentor Detail API] Success for ${id}`)
        return {
            id: m.id,
            name: m.name || 'Unknown',
            email: m.email,
            avatar: m.image || undefined,
            category: mainCategory,
            experience: p?.experience || 'Not specified',
            status: mentorStatus,
            rating: parseFloat(p?.rating || '0'),
            reviews: stats.reviewCount || 0,
            totalSessions: p?.totalSessions || 0,
            totalRevenue: parseFloat(stats.totalRevenue || '0'),
            hourlyRate: parseFloat(p?.hourlyRate || '0'),
            responseRate: 95, // Placeholder
            completionRate: 92, // Placeholder
            joinedAt: m.createdAt?.toISOString() || new Date().toISOString(),
            bio: p?.bio || '',
            skills: parseJsonArray(p?.skills),
            isAvailable: p?.isAvailable ?? true,
            location: p?.location,
            languages: parseJsonArray(p?.languages),
            dateOfBirth: p?.dateOfBirth,
            expertiseDocument: p?.expertiseDocument,
            idDocument: p?.idDocument,
            timezone: p?.timezone,
        }
    } catch (error: any) {
        console.error(`[Admin Mentor Detail API] Error for ${id}:`, error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch mentor details',
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
