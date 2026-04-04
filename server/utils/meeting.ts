import * as jose from 'jose'

// JaaS (Jitsi as a Service) Configuration
// Requires: NUXT_JAAS_APP_ID, NUXT_JAAS_API_KEY, and NUXT_JAAS_KEY_ID environment variables
const JAAS_APP_ID = process.env.NUXT_JAAS_APP_ID
const JAAS_API_KEY = process.env.NUXT_JAAS_API_KEY?.replace(/\\n/g, '\n')
const JAAS_KEY_ID = process.env.NUXT_JAAS_KEY_ID // The Key ID from JaaS dashboard (different from App ID)

// Cache the imported private key
let privateKey: jose.KeyLike | null = null

/**
 * Import and cache the JaaS private key
 */
async function getPrivateKey(): Promise<jose.KeyLike | null> {
    if (privateKey) return privateKey

    if (!JAAS_API_KEY) {
        console.warn('[JaaS] Missing NUXT_JAAS_API_KEY')
        return null
    }

    try {
        privateKey = await jose.importPKCS8(JAAS_API_KEY, 'RS256')
        return privateKey
    } catch (error) {
        console.error('[JaaS] Failed to import private key:', error)
        return null
    }
}

export interface MeetingDetails {
    meetingLink: string
    mentorMeetingLink: string
    menteeMeetingLink: string
    roomName: string
    startTime: Date
    endTime: Date
    title: string
}

export interface JaaSUserContext {
    id: string
    name: string
    email?: string
    avatar?: string
    isModerator: boolean
}

/**
 * Generate a JaaS JWT token for a specific user
 * 
 * @param roomName - The unique room name for the meeting
 * @param user - User context (name, email, moderator status)
 * @param expiresInHours - How long the token should be valid (default 24 hours)
 */
export async function generateJaaSToken(
    roomName: string,
    user: JaaSUserContext,
    expiresInHours: number = 24
): Promise<string | null> {
    if (!JAAS_APP_ID) {
        console.warn('[JaaS] Missing NUXT_JAAS_APP_ID')
        return null
    }

    if (!JAAS_KEY_ID) {
        console.warn('[JaaS] Missing NUXT_JAAS_KEY_ID - get this from your JaaS API Keys page')
        return null
    }

    const key = await getPrivateKey()
    if (!key) {
        return null
    }

    const now = Math.floor(Date.now() / 1000)
    const exp = now + (expiresInHours * 60 * 60)

    try {
        // JaaS JWT payload structure
        // See: https://developer.8x8.com/jaas/docs/api-keys-jwt
        const token = await new jose.SignJWT({
            aud: 'jitsi',
            iss: 'chat',
            sub: JAAS_APP_ID,
            room: '*', // Allow access to any room under this app
            context: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email || '',
                    avatar: user.avatar || '',
                    moderator: user.isModerator ? 'true' : 'false',
                },
                features: {
                    // Disable lobby - users join directly
                    lobby: false,
                    // Allow recording (if enabled on your JaaS plan)
                    recording: true,
                    // Allow livestreaming (if enabled on your JaaS plan)
                    livestreaming: false,
                    // Allow transcription (if enabled on your JaaS plan)
                    transcription: false,
                    // Allow outbound calls (if enabled)
                    'outbound-call': false,
                },
            },
        })
            .setProtectedHeader({ 
                alg: 'RS256',
                typ: 'JWT',
                kid: `${JAAS_APP_ID}/${JAAS_KEY_ID}` // Format: appId/keyId
            })
            .setIssuedAt(now)
            .setNotBefore(now)
            .setExpirationTime(exp)
            .sign(key)

        return token
    } catch (error) {
        console.error('[JaaS] Failed to generate JWT:', error)
        return null
    }
}

/**
 * Generate a unique room name for a meeting
 */
function generateRoomName(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const segments = []

    for (let i = 0; i < 3; i++) {
        let segment = ''
        const length = i === 1 ? 4 : 3
        for (let j = 0; j < length; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        segments.push(segment)
    }

    return `imentor-${segments.join('-')}`
}

/**
 * Build a JaaS meeting URL with JWT token
 */
function buildJaaSUrl(roomName: string, jwt: string): string {
    // JaaS URL format: https://8x8.vc/{APP_ID}/{roomName}?jwt={token}
    return `https://8x8.vc/${JAAS_APP_ID}/${roomName}?jwt=${jwt}`
}

/**
 * Create meeting links for both mentor and mentee using JaaS
 * Each participant gets their own JWT with appropriate permissions
 */
export async function createJaaSMeeting(params: {
    title: string
    startTime: Date
    durationMinutes: number
    mentor: {
        id: string
        name: string
        email?: string
        avatar?: string
    }
    mentee: {
        id: string
        name: string
        email?: string
        avatar?: string
    }
}): Promise<MeetingDetails | null> {
    if (!JAAS_APP_ID || !JAAS_API_KEY) {
        console.warn('[JaaS] Missing configuration, cannot create meeting')
        return null
    }

    const roomName = generateRoomName()
    const endTime = new Date(params.startTime.getTime() + params.durationMinutes * 60 * 1000)

    // Calculate token expiry - valid from now until 2 hours after meeting end
    const hoursUntilExpiry = Math.ceil(
        (endTime.getTime() - Date.now()) / (1000 * 60 * 60)
    ) + 2

    // Generate JWT for mentor (moderator)
    const mentorToken = await generateJaaSToken(roomName, {
        id: params.mentor.id,
        name: params.mentor.name,
        email: params.mentor.email,
        avatar: params.mentor.avatar,
        isModerator: true,
    }, hoursUntilExpiry)

    // Generate JWT for mentee (moderator too - both can join directly)
    const menteeToken = await generateJaaSToken(roomName, {
        id: params.mentee.id,
        name: params.mentee.name,
        email: params.mentee.email,
        avatar: params.mentee.avatar,
        isModerator: true, // Both are moderators so no one waits in lobby
    }, hoursUntilExpiry)

    if (!mentorToken || !menteeToken) {
        console.error('[JaaS] Failed to generate meeting tokens')
        return null
    }

    const mentorMeetingLink = buildJaaSUrl(roomName, mentorToken)
    const menteeMeetingLink = buildJaaSUrl(roomName, menteeToken)

    console.log('[JaaS] Created meeting:', {
        roomName,
        title: params.title,
        startTime: params.startTime.toISOString(),
        endTime: endTime.toISOString(),
    })

    return {
        meetingLink: menteeMeetingLink, // Default link (for backward compatibility)
        mentorMeetingLink,
        menteeMeetingLink,
        roomName,
        startTime: params.startTime,
        endTime,
        title: params.title,
    }
}

/**
 * Generate a simple meeting link without user-specific JWTs
 * Falls back to public Jitsi if JaaS is not configured
 */
export async function generateMeetingLink(params?: {
    title?: string
    description?: string
    startTime?: Date
    durationMinutes?: number
    mentorEmail?: string
    menteeEmail?: string
    mentor?: {
        id: string
        name: string
        email?: string
        avatar?: string
    }
    mentee?: {
        id: string
        name: string
        email?: string
        avatar?: string
    }
}): Promise<string> {
    // If full participant details provided, use JaaS with individual tokens
    if (params?.mentor && params?.mentee && params?.startTime && params?.title) {
        const jaasMeeting = await createJaaSMeeting({
            title: params.title,
            startTime: params.startTime,
            durationMinutes: params.durationMinutes || 60,
            mentor: params.mentor,
            mentee: params.mentee,
        })

        if (jaasMeeting) {
            // Return the mentee link as default (mentor link sent separately)
            return jaasMeeting.meetingLink
        }
    }

    // Fallback: Generate a simple JaaS link with a generic token
    if (JAAS_APP_ID && JAAS_API_KEY) {
        const roomName = generateRoomName()
        const token = await generateJaaSToken(roomName, {
            id: 'guest',
            name: 'iMentor User',
            isModerator: true,
        }, 24)

        if (token) {
            return buildJaaSUrl(roomName, token)
        }
    }

    // Final fallback: Public Jitsi (not recommended, lobby issues)
    console.warn('[JaaS] Falling back to public Jitsi - lobby may be enabled')
    const roomName = generateRoomName()
    return `https://meet.jit.si/${roomName}`
}

/**
 * Format booking date for display
 */
export function formatBookingDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date)
}
