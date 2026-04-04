import { eq, and, ilike, desc, count, sql, gte, or } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, mentorProfile, booking, review, category } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (session.user.role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    const query = getQuery(event)

    const search = (query.search as string) || ''
    const status = (query.status as string) || ''
    const categoryFilter = (query.category as string) || ''
    const rating = (query.rating as string) || ''
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 10, 50)
    const offset = (page - 1) * limit

    try {
        // Build base conditions for mentors only
        const baseConditions = [eq(user.role, 'mentor')]

        // Add status filter if provided
        if (status && status !== 'all') {
            if (status === 'verified') {
                baseConditions.push(eq(user.isAdminVerified, true))
            } else if (status === 'pending') {
                baseConditions.push(eq(user.isAdminVerified, false))
            } else if (status === 'suspended') {
                // For now, we don't have a suspended field, so we'll use isAvailable = false
                baseConditions.push(eq(mentorProfile.isAvailable, false))
            }
        }

        // Add search filter if provided  
        if (search) {
            baseConditions.push(
                sql`(${user.name} ilike ${'%' + search + '%'} OR ${user.email} ilike ${'%' + search + '%'})`
            )
        }

        // Add rating filter if provided
        if (rating && rating !== 'all') {
            if (rating === 'below-3.5') {
                baseConditions.push(sql`CAST(${mentorProfile.rating} AS DECIMAL) < 3.5`)
            } else {
                const minRating = parseFloat(rating)
                if (!isNaN(minRating)) {
                    baseConditions.push(sql`CAST(${mentorProfile.rating} AS DECIMAL) >= ${minRating}`)
                }
            }
        }

        // Get total count for pagination
        const totalCountResult = await db
            .select({ count: count() })
            .from(user)
            .leftJoin(mentorProfile, eq(user.id, mentorProfile.userId))
            .where(and(...baseConditions))

        const total = totalCountResult[0]?.count || 0

        // Subquery for review count
        const reviewCountSubquery = sql<number>`(
      SELECT COUNT(*)::int 
      FROM "review" r 
      WHERE r.mentor_id = ${user.id}
    )`

        // Subquery for total revenue
        const totalRevenueSubquery = sql<string>`(
      SELECT COALESCE(SUM(CAST(b.price AS DECIMAL)), 0)::text
      FROM "booking" b
      WHERE b.mentor_id = ${user.id}
      AND b.status = 'completed'
    )`

        // Get mentors with their profiles
        const mentorsQuery = db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: user.emailVerified,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
                isAdminVerified: user.isAdminVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                // Profile data
                bio: mentorProfile.bio,
                location: mentorProfile.location,
                experience: mentorProfile.experience,
                hourlyRate: mentorProfile.hourlyRate,
                skills: mentorProfile.skills,
                categories: mentorProfile.categories,
                languages: mentorProfile.languages,
                timezone: mentorProfile.timezone,
                rating: mentorProfile.rating,
                totalSessions: mentorProfile.totalSessions,
                isAvailable: mentorProfile.isAvailable,
                // Computed fields
                reviewCount: reviewCountSubquery,
                totalRevenue: totalRevenueSubquery,
            })
            .from(user)
            .leftJoin(mentorProfile, eq(user.id, mentorProfile.userId))
            .where(and(...baseConditions))
            .orderBy(desc(user.createdAt))
            .limit(limit)
            .offset(offset)

        const rawMentors = await mentorsQuery

        // Transform data to match expected format
        const mentors = rawMentors.map(m => {
            // Determine status based on verification and onboarding
            let mentorStatus = 'pending'
            if (m.isAvailable === false) {
                mentorStatus = 'suspended'
            } else if (m.isAdminVerified) {
                mentorStatus = 'verified'
            }

            // Parse categories to get main category name
            const categoriesArray = parseJsonArray(m.categories)
            const mainCategory = categoriesArray[0] || 'Uncategorized'

            return {
                id: m.id,
                name: m.name || 'Unknown',
                email: m.email,
                avatar: m.image || undefined,
                category: mainCategory,
                experience: m.experience || 'Not specified',
                status: mentorStatus,
                rating: parseFloat(m.rating || '0'),
                reviews: m.reviewCount || 0,
                totalSessions: m.totalSessions || 0,
                totalRevenue: parseFloat(m.totalRevenue || '0'),
                hourlyRate: parseFloat(m.hourlyRate || '0'),
                responseRate: 95, // Placeholder - would need tracking
                completionRate: 92, // Placeholder - would need tracking
                joinedAt: m.createdAt?.toISOString() || new Date().toISOString(),
                bio: m.bio || '',
                skills: parseJsonArray(m.skills),
                isAvailable: m.isAvailable ?? true,
                location: m.location,
                timezone: m.timezone,
                languages: parseJsonArray(m.languages),
            }
        })

        // Also fetch categories for filter options
        const categoriesResult = await db
            .select({
                id: category.id,
                name: category.name,
            })
            .from(category)
            .where(eq(category.active, true))
            .orderBy(category.name)

        return {
            mentors,
            categories: categoriesResult,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error: any) {
        console.error('[Admin Mentors API] Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch mentors',
        })
    }
})

function parseJsonArray(value: string | null): string[] {
    if (!value) return []
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}
