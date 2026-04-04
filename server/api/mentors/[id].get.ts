import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, mentorProfile, booking } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Mentor ID is required',
    })
  }

  try {
    // Subquery to count completed and confirmed sessions for this mentor
    const sessionCountSubquery = db
      .select({
        count: sql<number>`count(*)`.as('count'),
      })
      .from(booking)
      .where(
        and(
          eq(booking.mentorId, id),
          sql`${booking.status} IN ('completed', 'confirmed')`
        )
      )
      .as('session_counts')

    // Get mentor with profile
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        bio: mentorProfile.bio,
        location: mentorProfile.location,
        experience: mentorProfile.experience,
        hourlyRate: mentorProfile.hourlyRate,
        skills: mentorProfile.skills,
        categories: mentorProfile.categories,
        languages: mentorProfile.languages,
        timezone: mentorProfile.timezone,
        rating: mentorProfile.rating,
        totalSessions: sql<number>`(SELECT count FROM ${sessionCountSubquery})`,
        isAvailable: mentorProfile.isAvailable,
        createdAt: user.createdAt,
      })
      .from(user)
      .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
      .where(
        and(
          eq(user.id, id),
          eq(user.role, 'mentor'),
          eq(user.emailVerified, true),
          eq(user.hasCompletedOnboarding, true),
          eq(user.suspended, false),
          eq(user.isAdminVerified, true)
        )
      )
      .limit(1)

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Mentor not found',
      })
    }

    // Increment profile view count (fire and forget - don't block the response)
    db.update(mentorProfile)
      .set({
        profileViews: sql`COALESCE(${mentorProfile.profileViews}, 0) + 1`
      })
      .where(eq(mentorProfile.userId, id))
      .execute()
      .catch(err => console.error('[Mentors API] Error incrementing profile views:', err))

    const mentor = result[0]

    // Parse name into first/last for UI compatibility
    const nameParts = mentor.name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    return {
      id: mentor.id,
      firstName,
      lastName,
      name: mentor.name,
      avatar: mentor.image,
      bio: mentor.bio,
      location: mentor.location,
      experience: mentor.experience,
      hourlyRate: mentor.hourlyRate ? parseFloat(mentor.hourlyRate) : null,
      skills: parseJsonArray(mentor.skills),
      categories: parseJsonArray(mentor.categories),
      languages: parseJsonArray(mentor.languages),
      timezone: mentor.timezone,
      rating: mentor.rating ? parseFloat(mentor.rating) : 0,
      totalSessions: mentor.totalSessions ? Number(mentor.totalSessions) : 0,
      isAvailable: mentor.isAvailable ?? true,
      createdAt: mentor.createdAt,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('[Mentors API] Error fetching mentor:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch mentor',
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
