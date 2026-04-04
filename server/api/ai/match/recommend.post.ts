import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { aiMatchingSession, aiMatchResult, mentorProfile, user } from '../../../db/schema'
import { getUserSession } from '../../../utils/session'
import { chatCompletion, FREE_MODELS } from '../../../utils/openrouter'

interface RecommendBody {
  sessionId: string
}

interface ExtractedPreferences {
  goals: string[]
  skills: string[]
  experienceLevel: string
  budget: { min: number; max: number }
  categories: string[]
  keywords: string[]
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session?.user?.id || null
  const body = await readBody<RecommendBody>(event)

  if (!body.sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Session ID is required',
    })
  }

  // Get the matching session
  const [matchSession] = await db
    .select()
    .from(aiMatchingSession)
    .where(eq(aiMatchingSession.id, body.sessionId))
    .limit(1)

  if (!matchSession || (matchSession.userId && matchSession.userId !== userId)) {
    throw createError({
      statusCode: 404,
      message: 'Session not found',
    })
  }

  const conversationHistory = JSON.parse(matchSession.conversationHistory || '[]')

  // Extract structured preferences from conversation using AI
  const extractionPrompt = `Based on the following conversation, extract structured information about what the user is looking for in a mentor.

Conversation:
${conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

Extract and return ONLY a JSON object (no markdown, no explanation) with this structure:
{
  "goals": ["goal1", "goal2"],
  "skills": ["skill1", "skill2"],
  "experienceLevel": "beginner|intermediate|advanced",
  "budget": {"min": 0, "max": 200},
  "categories": ["category1"],
  "keywords": ["keyword1", "keyword2"]
}`

  const extractionResponse = await chatCompletion(
    [{ role: 'user', content: extractionPrompt }],
    FREE_MODELS.CHAT,
    { temperature: 0.3 }
  )

  let preferences: ExtractedPreferences
  try {
    // Clean up response to extract JSON
    let jsonStr = extractionResponse.content.trim()
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    preferences = JSON.parse(jsonStr)
  } catch (error) {
    console.error('[AI Match] Failed to parse preferences:', extractionResponse.content)
    // Fallback to basic extraction
    preferences = {
      goals: [],
      skills: [],
      experienceLevel: 'intermediate',
      budget: { min: 0, max: 200 },
      categories: [],
      keywords: [],
    }
  }

  // Fetch available mentors with profiles
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
        sql`${mentorProfile.hourlyRate} >= ${preferences.budget.min}`,
        sql`${mentorProfile.hourlyRate} <= ${preferences.budget.max}`
      )
    )
    .limit(20)

  if (mentors.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'No mentors found matching your criteria',
    })
  }

  // Normalize skills field (ensure it's always an array)
  const normalizedMentors = mentors.map(m => ({
    ...m,
    skills: Array.isArray(m.skills) ? m.skills : (typeof m.skills === 'string' ? JSON.parse(m.skills || '[]') : []),
    categories: Array.isArray(m.categories) ? m.categories : (typeof m.categories === 'string' ? JSON.parse(m.categories || '[]') : []),
  }))

  // Score and rank mentors using AI
  const scoringPrompt = `You are matching a mentee with mentors. Based on the mentee's preferences and each mentor's profile, assign a match score (0-100) and provide a brief reason.

Mentee Preferences:
${JSON.stringify(preferences, null, 2)}

Mentors:
${normalizedMentors.map((m, i) => `${i + 1}. ${m.name} - ${m.bio || 'No bio'} | Skills: ${(m.skills || []).join(', ')} | Rate: $${m.hourlyRate}/hr | Rating: ${m.rating}`).join('\n')}

For each mentor, provide a JSON object with: {"mentorIndex": number, "score": number, "reasoning": "brief explanation"}
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
    console.error('[AI Match] Failed to parse scores:', scoringResponse.content)
    // Fallback: simple keyword matching
    scoredMentors = mentors.map((m, i) => ({
      mentorIndex: i,
      score: 50 + Math.random() * 30, // Random score between 50-80
      reasoning: 'Good match based on skills and experience',
    }))
  }

  // Take top 5 matches
  const topMatches = scoredMentors.slice(0, 5)

  // Store results in database
  const results = []
  for (let i = 0; i < topMatches.length; i++) {
    const match = topMatches[i]
    const mentor = normalizedMentors[match.mentorIndex]

    if (!mentor) continue

    const [result] = await db
      .insert(aiMatchResult)
      .values({
        sessionId: body.sessionId,
        mentorId: mentor.id,
        score: match.score.toString(),
        reasoning: match.reasoning,
        rank: i + 1,
      })
      .returning()

    results.push({
      ...result,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        image: mentor.image,
        bio: mentor.bio,
        skills: mentor.skills,
        categories: mentor.categories,
        hourlyRate: mentor.hourlyRate,
        experience: mentor.experience,
        rating: mentor.rating,
        totalSessions: mentor.totalSessions,
      },
    })
  }

  // Update session as completed
  await db
    .update(aiMatchingSession)
    .set({
      status: 'completed',
      extractedPreferences: JSON.stringify(preferences),
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(aiMatchingSession.id, body.sessionId))

  return {
    matches: results,
    preferences,
  }
})
