import { eq, and } from 'drizzle-orm'
import { message, conversation, conversationParticipant } from '~~/server/db/schema'
import { z } from 'zod'

// Patterns to detect personal contact information
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
const PHONE_PATTERN = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{0,4}/g
// Also catch obfuscated attempts like "email me at john dot smith at gmail dot com"
const OBFUSCATED_EMAIL_PATTERN = /\b[a-zA-Z0-9._%+-]+\s*(?:\[at\]|at|\(at\)|\{at\})\s*[a-zA-Z0-9.-]+\s*(?:\[dot\]|dot|\(dot\)|\{dot\})\s*[a-zA-Z]{2,}\b/gi

function containsContactInfo(text: string): { blocked: boolean; reason: string } {
    // Remove common false positives (like prices, dates, times)
    const cleanedText = text
        .replace(/\$\d+/g, '') // Remove prices
        .replace(/\d{1,2}:\d{2}/g, '') // Remove times
        .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '') // Remove dates

    if (EMAIL_PATTERN.test(cleanedText)) {
        return { blocked: true, reason: 'Sharing email addresses is not allowed. Please keep communication within the platform.' }
    }

    if (OBFUSCATED_EMAIL_PATTERN.test(cleanedText)) {
        return { blocked: true, reason: 'Sharing email addresses is not allowed. Please keep communication within the platform.' }
    }

    // Check for phone numbers (at least 7 digits in sequence, accounting for separators)
    const phoneMatches = cleanedText.match(PHONE_PATTERN)
    if (phoneMatches) {
        for (const match of phoneMatches) {
            // Count actual digits
            const digitCount = (match.match(/\d/g) || []).length
            if (digitCount >= 7) {
                return { blocked: true, reason: 'Sharing phone numbers is not allowed. Please keep communication within the platform.' }
            }
        }
    }

    return { blocked: false, reason: '' }
}

const sendMessageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty'),
})

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event)
    const userId = session.user.id
    const conversationId = getRouterParam(event, 'id')
    const body = await readValidatedBody(event, sendMessageSchema.parse)

    if (!conversationId) {
        throw createError({
            statusCode: 400,
            message: 'Conversation ID is required',
        })
    }

    // Verify user is a participant
    const [participant] = await db
        .select()
        .from(conversationParticipant)
        .where(
            and(
                eq(conversationParticipant.conversationId, conversationId),
                eq(conversationParticipant.userId, userId)
            )
        )
        .limit(1)

    if (!participant) {
        throw createError({
            statusCode: 403,
            message: 'You are not a participant in this conversation',
        })
    }

    // Check for personal contact information
    const contactCheck = containsContactInfo(body.content)
    if (contactCheck.blocked) {
        throw createError({
            statusCode: 400,
            message: contactCheck.reason,
        })
    }

    // Create message
    const [newMessage] = await db
        .insert(message)
        .values({
            conversationId,
            senderId: userId,
            content: body.content,
        })
        .returning()

    // Update conversation updated_at
    await db
        .update(conversation)
        .set({ updatedAt: new Date() })
        .where(eq(conversation.id, conversationId))

    return newMessage
})
