import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, mentorProfile, booking } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const search = (query.search as string) || ''
  const categories = query.categories ? (query.categories as string).split(',') : []
  const skills = query.skills ? (query.skills as string).split(',') : []
  const minPrice = query.minPrice ? parseFloat(query.minPrice as string) : undefined
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice as string) : undefined
  const sortBy = (query.sortBy as string) || 'rating'
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 20, 50)
  const offset = (page - 1) * limit

  try {
    // Subquery to count completed and confirmed sessions for each mentor
    const sessionCountSubquery = db
      .select({
        mentorId: booking.mentorId,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(booking)
      .where(sql`${booking.status} IN ('completed', 'confirmed')`)
      .groupBy(booking.mentorId)
      .as('session_counts')

    // Build base query - join user, mentor_profile, and session counts
    const mentorsQuery = db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        bio: mentorProfile.bio,
        experience: mentorProfile.experience,
        hourlyRate: mentorProfile.hourlyRate,
        skills: mentorProfile.skills,
        categories: mentorProfile.categories,
        languages: mentorProfile.languages,
        timezone: mentorProfile.timezone,
        rating: mentorProfile.rating,
        totalSessions: sql<number>`COALESCE(${sessionCountSubquery.count}, 0)`,
        isAvailable: mentorProfile.isAvailable,
      })
      .from(user)
      .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
      .leftJoin(sessionCountSubquery, eq(user.id, sessionCountSubquery.mentorId))
      .where(
        and(
          eq(user.role, 'mentor'),
          eq(user.emailVerified, true),
          eq(user.hasCompletedOnboarding, true),
          eq(user.suspended, false),
          eq(user.isAdminVerified, true)
        )
      )

    // Execute query
    const rawMentors = await mentorsQuery

    // Apply filters in memory (for JSON fields)
    let filteredMentors = rawMentors.map(m => ({
      ...m,
      hourlyRate: m.hourlyRate ? parseFloat(m.hourlyRate) : null,
      rating: m.rating ? parseFloat(m.rating) : 0,
      totalSessions: m.totalSessions ? Number(m.totalSessions) : 0,
      isAvailable: m.isAvailable ?? true,
      skills: parseJsonArray(m.skills),
      categories: parseJsonArray(m.categories),
      languages: parseJsonArray(m.languages),
    }))

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredMentors = filteredMentors.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        m.bio?.toLowerCase().includes(searchLower) ||
        m.skills.some(s => s.toLowerCase().includes(searchLower)) ||
        m.categories.some(c => c.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (categories.length > 0) {
      filteredMentors = filteredMentors.filter(m =>
        m.categories.some(c => categories.includes(c))
      )
    }

    // Skills filter
    if (skills.length > 0) {
      filteredMentors = filteredMentors.filter(m =>
        m.skills.some(s => skills.includes(s))
      )
    }

    // Price filter
    if (minPrice !== undefined) {
      filteredMentors = filteredMentors.filter(m =>
        m.hourlyRate !== null && m.hourlyRate >= minPrice
      )
    }
    if (maxPrice !== undefined) {
      filteredMentors = filteredMentors.filter(m =>
        m.hourlyRate !== null && m.hourlyRate <= maxPrice
      )
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filteredMentors.sort((a, b) => b.rating - a.rating)
        break
      case 'sessions':
        filteredMentors.sort((a, b) => b.totalSessions - a.totalSessions)
        break
      case 'price':
        filteredMentors.sort((a, b) => (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0))
        break
      case 'price-desc':
        filteredMentors.sort((a, b) => (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0))
        break
    }

    // Pagination
    const total = filteredMentors.length
    const paginatedMentors = filteredMentors.slice(offset, offset + limit)

    return {
      mentors: paginatedMentors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    console.error('[Mentors API] Error fetching mentors:', error)
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
