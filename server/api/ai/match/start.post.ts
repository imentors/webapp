import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { aiMatchingSession } from '../../../db/schema'
import { getUserSession } from '../../../utils/session'
import { chatCompletion, FREE_MODELS } from '../../../utils/openrouter'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session?.user?.id || null

  // Create new AI matching session
  const [newSession] = await db
    .insert(aiMatchingSession)
    .values({
      userId,
      status: 'in_progress',
      conversationHistory: JSON.stringify([]),
    })
    .returning()

  // Generate initial AI greeting
  const systemPrompt = `You are an AI assistant helping users find the perfect mentor. Your goal is to understand their career goals, learning needs, and preferences through a friendly conversation.

Ask 3-4 targeted questions to understand:
1. Their career goals and what they want to achieve
2. Specific skills or areas they want to learn
3. Their experience level and background
4. Budget and time commitment preferences

Be conversational, friendly, and concise. Ask one question at a time.`

  const aiResponse = await chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Hi, I want to find a mentor.' },
    ],
    FREE_MODELS.CHAT
  )

  // Store the initial conversation
  const conversationHistory = [
    { role: 'user', content: 'Hi, I want to find a mentor.', timestamp: new Date().toISOString() },
    { role: 'assistant', content: aiResponse.content, timestamp: new Date().toISOString() },
  ]

  await db
    .update(aiMatchingSession)
    .set({
      conversationHistory: JSON.stringify(conversationHistory),
      updatedAt: new Date(),
    })
    .where(eq(aiMatchingSession.id, newSession.id))

  return {
    sessionId: newSession.id,
    message: aiResponse.content,
  }
})
