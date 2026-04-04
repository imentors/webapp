import { eq, and } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, mentorProfile, category, skill } from '../../db/schema'

export default defineEventHandler(async () => {
  try {
    // Get active categories from category table
    const categories = await db
      .select({
        name: category.name,
      })
      .from(category)
      .where(eq(category.active, true))
      .orderBy(category.name)

    // Get active skills from skill table
    const skills = await db
      .select({
        name: skill.name,
      })
      .from(skill)
      .where(eq(skill.active, true))
      .orderBy(skill.name)

    // Get price range from mentor profiles
    const mentors = await db
      .select({
        hourlyRate: mentorProfile.hourlyRate,
      })
      .from(user)
      .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
      .where(
        and(
          eq(user.role, 'mentor'),
          eq(user.emailVerified, true),
          eq(user.hasCompletedOnboarding, true),
          eq(user.suspended, false),
          eq(user.isAdminVerified, true)
        )
      )

    let minPrice = Infinity
    let maxPrice = 0

    for (const mentor of mentors) {
      if (mentor.hourlyRate) {
        const rate = parseFloat(mentor.hourlyRate)
        if (rate < minPrice) minPrice = rate
        if (rate > maxPrice) maxPrice = rate
      }
    }

    return {
      categories: categories.map(c => c.name),
      skills: skills.map(s => s.name),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice,
      },
    }
  } catch (error: any) {
    console.error('[Mentors API] Error fetching filters:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch filters',
    })
  }
})
