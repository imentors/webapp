import { eq, and, ilike, desc, count, sql } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, menteeProfile } from '../../db/schema'
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
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 10, 50)
  const offset = (page - 1) * limit

  try {
    // Build base conditions for mentees only
    const baseConditions = [eq(user.role, 'mentee')]

    // Add status filter if provided
    if (status && status !== 'all') {
      if (status === 'active') {
        baseConditions.push(and(eq(user.emailVerified, true), eq(user.suspended, false)))
      } else if (status === 'pending') {
        baseConditions.push(eq(user.emailVerified, false))
      } else if (status === 'suspended') {
        baseConditions.push(eq(user.suspended, true))
      }
    }

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: count() })
      .from(user)
      .where(and(...baseConditions))

    // Apply search filter if provided
    if (search) {
      baseConditions.push(
        sql`(${user.name} ilike ${'%' + search + '%'} OR ${user.email} ilike ${'%' + search + '%'})`
      )
    }

    const totalCountResult = await totalCountQuery
    const total = totalCountResult[0]?.count || 0

    // Get mentees with their profiles
    const menteesQuery = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        bio: menteeProfile.bio,
        location: menteeProfile.location,
        experience: menteeProfile.experience,
        interests: menteeProfile.interests,
        goals: menteeProfile.goals,
        languages: menteeProfile.languages,
        timezone: menteeProfile.timezone,
        suspended: user.suspended,
      })
      .from(user)
      .leftJoin(menteeProfile, eq(user.id, menteeProfile.userId))
      .where(and(...baseConditions))
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset)

    const rawMentees = await menteesQuery

    // Transform data to match expected format
    const mentees = rawMentees.map(m => {
      // Parse name into firstName and lastName
      const nameParts = m.name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      return {
        id: m.id,
        firstName,
        lastName,
        email: m.email,
        role: 'mentee' as const,
        avatar: m.image || undefined,
        status: m.suspended ? 'suspended' : (m.emailVerified ? 'active' : 'pending'),
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        lastActive: m.updatedAt, // Using updatedAt as lastActive for now
        // Additional profile data
        bio: m.bio,
        location: m.location,
        experience: m.experience,
        interests: parseJsonArray(m.interests),
        goals: parseJsonArray(m.goals),
        languages: parseJsonArray(m.languages),
        timezone: m.timezone,
      }
    })

    return {
      users: mentees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    console.error('[Admin Users API] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch mentees',
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
