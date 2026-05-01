import { eq, desc } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { aiMatchResult, user, mentorProfile } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.sessionId as string

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Session ID is required',
    })
  }

  const results = await db
    .select({
      id: aiMatchResult.id,
      score: aiMatchResult.score,
      reasoning: aiMatchResult.reasoning,
      rank: aiMatchResult.rank,
      mentor: {
        id: user.id,
        name: user.name,
        image: user.image,
        bio: mentorProfile.bio,
        skills: mentorProfile.skills,
        categories: mentorProfile.categories,
        hourlyRate: mentorProfile.hourlyRate,
        experience: mentorProfile.experience,
        rating: mentorProfile.rating,
        totalSessions: mentorProfile.totalSessions,
      }
    })
    .from(aiMatchResult)
    .innerJoin(user, eq(aiMatchResult.mentorId, user.id))
    .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
    .where(eq(aiMatchResult.sessionId, sessionId))
    .orderBy(aiMatchResult.rank)

  // Normalize JSON fields
  const normalizedResults = results.map(r => ({
    ...r,
    mentor: {
      ...r.mentor,
      skills: Array.isArray(r.mentor.skills) ? r.mentor.skills : (typeof r.mentor.skills === 'string' ? JSON.parse(r.mentor.skills || '[]') : []),
      categories: Array.isArray(r.mentor.categories) ? r.mentor.categories : (typeof r.mentor.categories === 'string' ? JSON.parse(r.mentor.categories || '[]') : []),
    }
  }))

  return {
    matches: normalizedResults
  }
})
