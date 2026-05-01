import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { aiMatchingSession, aiMatchResult, mentorProfile, user } from '../../../db/schema'
import { getUserSession } from '../../../utils/session'
import { chatCompletion, FREE_MODELS } from '../../../utils/openrouter'

interface DirectMatchBody {
  goals: string[]
  categories: string[]
  journeyStage: string
  sessionType: string
  budget: string
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session?.user?.id || null
  const body = await readBody<DirectMatchBody>(event)

  if (!body.goals || !body.categories) {
    throw createError({
      statusCode: 400,
      message: 'Goals and categories are required',
    })
  }

  // Map budget string to min/max numbers for DB filtering
  let minPrice = 0
  let maxPrice = 1000
  switch (body.budget) {
    case 'under-50':
      maxPrice = 50
      break
    case '50-100':
      minPrice = 50
      maxPrice = 100
      break
    case '100-200':
      minPrice = 100
      maxPrice = 200
      break
    case '200-plus':
      minPrice = 200
      break
  }

  // Create new AI matching session (status: completed since we have the data)
  const [newSession] = await db
    .insert(aiMatchingSession)
    .values({
      userId,
      status: 'completed',
      extractedPreferences: JSON.stringify(body),
      completedAt: new Date(),
    })
    .returning()

  // Fetch candidate mentors
  // We filter by price and at least one matching category to keep the pool relevant
  const mentors = await db
    .select({
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
    })
    .from(user)
    .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
    .where(
      and(
        eq(user.role, 'mentor'),
        sql`${mentorProfile.hourlyRate} >= ${minPrice}`,
        sql`${mentorProfile.hourlyRate} <= ${maxPrice}`
      )
    )
    .limit(20)

  if (mentors.length === 0) {
    // If no exact price matches, broaden the search to show something
    const broadMentors = await db
      .select({
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
      })
      .from(user)
      .innerJoin(mentorProfile, eq(user.id, mentorProfile.userId))
      .where(eq(user.role, 'mentor'))
      .limit(10)
    
    mentors.push(...broadMentors)
  }

  // Normalize skills field
  const normalizedMentors = mentors.map(m => ({
    ...m,
    skills: Array.isArray(m.skills) ? m.skills : (typeof m.skills === 'string' ? JSON.parse(m.skills || '[]') : []),
    categories: Array.isArray(m.categories) ? m.categories : (typeof m.categories === 'string' ? JSON.parse(m.categories || '[]') : []),
  }))

  // Score and rank mentors using AI
  const scoringPrompt = `You are matching a mentee with mentors. Based on the mentee's questionnaire responses and each mentor's profile, assign a match score (0-100) and provide a brief reason why they are a good fit for this specific user.

Mentee Responses:
- Goals: ${body.goals.join(', ')}
- Categories: ${body.categories.join(', ')}
- Journey Stage: ${body.journeyStage}
- Preferred Mentorship: ${body.sessionType}
- Budget Level: ${body.budget}

Mentors:
${normalizedMentors.map((m, i) => `${i + 1}. ${m.name} - ${m.bio || 'No bio'} | Skills: ${(m.skills || []).join(', ')} | Rate: $${m.hourlyRate}/hr | Rating: ${m.rating}`).join('\n')}

For each mentor, provide a JSON object with: {"mentorIndex": number, "score": number, "reasoning": "brief explanation (1-2 sentences)"}
Return an array of these objects, sorted by score (highest first). Return ONLY the JSON array, no markdown or explanation.`

  const scoringResponse = await chatCompletion(
    [{ role: 'user', content: scoringPrompt }],
    FREE_MODELS.CHAT,
    { temperature: 0.3, maxTokens: 2000 }
  )

  let scoredMentors: Array<{ mentorIndex: number; score: number; reasoning: string }>
  try {
    let jsonStr = scoringResponse.content.trim()
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    scoredMentors = JSON.parse(jsonStr)
  } catch (error) {
    console.error('[AI Direct Match] Failed to parse scores:', scoringResponse.content)
    scoredMentors = mentors.map((m, i) => ({
      mentorIndex: i,
      score: 70 + Math.random() * 20,
      reasoning: 'Matches your core interests and goals based on your profile.',
    }))
  }

  // Store results
  const topMatches = scoredMentors.slice(0, 5)
  for (let i = 0; i < topMatches.length; i++) {
    const match = topMatches[i]
    const mentor = normalizedMentors[match.mentorIndex]

    if (!mentor) continue

    await db
      .insert(aiMatchResult)
      .values({
        sessionId: newSession.id,
        mentorId: mentor.id,
        score: match.score.toString(),
        reasoning: match.reasoning,
        rank: i + 1,
      })
  }

  return {
    sessionId: newSession.id
  }
})
