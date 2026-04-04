import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { aiMatchingSession } from '../../../db/schema'
import { getUserSession } from '../../../utils/session'
import { chatCompletion, FREE_MODELS } from '../../../utils/openrouter'

interface MessageBody {
  sessionId: string
  message: string
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session?.user?.id || null
  const body = await readBody<MessageBody>(event)

  if (!body.sessionId || !body.message) {
    throw createError({
      statusCode: 400,
      message: 'Session ID and message are required',
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

  // Parse conversation history
  const conversationHistory = JSON.parse(matchSession.conversationHistory || '[]')

  // Add user message
  conversationHistory.push({
    role: 'user',
    content: body.message,
    timestamp: new Date().toISOString(),
  })

  // Build messages for AI
  const systemPrompt = `You are an AI assistant helping users find the perfect mentor. Your goal is to understand their career goals, learning needs, and preferences through a friendly conversation.

Ask 3-4 targeted questions to understand:
1. Their career goals and what they want to achieve
2. Specific skills or areas they want to learn
3. Their experience level and background
4. Budget and time commitment preferences

Be conversational, friendly, and concise. Ask one question at a time. After gathering enough information (3-4 exchanges), let the user know you're ready to find matches and ask if they'd like to see recommendations.`

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ]

  // Get AI response
  const aiResponse = await chatCompletion(messages, FREE_MODELS.CHAT)

  // Add AI response to history
  conversationHistory.push({
    role: 'assistant',
    content: aiResponse.content,
    timestamp: new Date().toISOString(),
  })

  // Update session
  await db
    .update(aiMatchingSession)
    .set({
      conversationHistory: JSON.stringify(conversationHistory),
      updatedAt: new Date(),
    })
    .where(eq(aiMatchingSession.id, body.sessionId))

  // Check if we should extract preferences and generate matches
  const shouldGenerateMatches = conversationHistory.length >= 8 ||
    aiResponse.content.toLowerCase().includes('ready to find') ||
    aiResponse.content.toLowerCase().includes('show you some matches')

  return {
    message: aiResponse.content,
    shouldGenerateMatches,
    conversationLength: conversationHistory.length,
  }
})
