import { eq, and, ilike, desc, count, sql, gte, lte, or } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user, booking } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (session.user.role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    const query = getQuery(event)

    const search = (query.search as string) || ''
    const status = (query.status as string) || ''
    const mentorId = (query.mentorId as string) || ''
    const duration = (query.duration as string) || ''
    const dateFrom = (query.dateFrom as string) || ''
    const dateTo = (query.dateTo as string) || ''
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 15, 50)
    const offset = (page - 1) * limit

    try {
        // Build base conditions
        const baseConditions: any[] = []

        // Add status filter if provided
        if (status && status !== 'all') {
            baseConditions.push(eq(booking.status, status as any))
        }

        // Add mentor filter if provided
        if (mentorId && mentorId !== 'all') {
            baseConditions.push(eq(booking.mentorId, mentorId))
        }

        // Add duration filter if provided
        if (duration && duration !== 'all') {
            if (duration === '2+') {
                baseConditions.push(gte(booking.duration, 120)) // 2+ hours in minutes
            } else {
                const durationMinutes = parseFloat(duration) * 60
                baseConditions.push(eq(booking.duration, durationMinutes))
            }
        }

        // Add date range filter if provided
        if (dateFrom) {
            baseConditions.push(gte(booking.scheduledDate, new Date(dateFrom)))
        }
        if (dateTo) {
            baseConditions.push(lte(booking.scheduledDate, new Date(dateTo)))
        }

        // Add search filter if provided
        if (search) {
            baseConditions.push(
                or(
                    ilike(booking.title, `%${search}%`),
                    ilike(booking.id, `%${search}%`)
                )
            )
        }

        // Get total count for pagination
        const whereClause = baseConditions.length > 0 ? and(...baseConditions) : undefined

        const totalCountResult = await db
            .select({ count: count() })
            .from(booking)
            .where(whereClause)

        const total = totalCountResult[0]?.count || 0

        // Alias for mentor and mentee users
        const mentorUser = user
        const menteeUser = user

        // Get sessions with mentor and mentee info
        const sessionsData = await db
            .select({
                id: booking.id,
                title: booking.title,
                description: booking.description,
                scheduledDate: booking.scheduledDate,
                duration: booking.duration,
                status: booking.status,
                price: booking.price,
                meetingLink: booking.meetingLink,
                stripePaymentIntentId: booking.stripePaymentIntentId,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt,
                confirmedAt: booking.confirmedAt,
                completedAt: booking.completedAt,
                cancelledAt: booking.cancelledAt,
                mentorId: booking.mentorId,
                menteeId: booking.menteeId,
            })
            .from(booking)
            .where(whereClause)
            .orderBy(desc(booking.scheduledDate))
            .limit(limit)
            .offset(offset)

        // Get mentor and mentee info separately to avoid complex joins
        const userIds = new Set<string>()
        sessionsData.forEach(s => {
            userIds.add(s.mentorId)
            userIds.add(s.menteeId)
        })

        const usersData = userIds.size > 0
            ? await db
                .select({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                })
                .from(user)
                .where(sql`${user.id} IN (${sql.join([...userIds].map(id => sql`${id}`), sql`, `)})`)
            : []

        // Create a map for quick lookup
        const usersMap = new Map(usersData.map(u => [u.id, u]))

        // Transform data to match expected format
        const sessions = sessionsData.map(s => {
            const mentor = usersMap.get(s.mentorId)
            const mentee = usersMap.get(s.menteeId)

            // Calculate time from scheduledDate
            const scheduledDate = new Date(s.scheduledDate)
            const time = scheduledDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })

            return {
                id: s.id,
                title: s.title || 'Mentoring Session',
                description: s.description || '',
                date: s.scheduledDate,
                time,
                duration: s.duration / 60, // Convert minutes to hours
                status: s.status,
                amount: parseFloat(s.price || '0'),
                meetingLink: s.meetingLink,
                paymentId: s.stripePaymentIntentId,
                paymentStatus: s.paymentStatus,
                createdAt: s.createdAt,
                confirmedAt: s.confirmedAt,
                completedAt: s.completedAt,
                cancelledAt: s.cancelledAt,
                mentor: {
                    id: s.mentorId,
                    name: mentor?.name || 'Unknown Mentor',
                    email: mentor?.email || '',
                    avatar: mentor?.image || undefined
                },
                mentee: {
                    id: s.menteeId,
                    name: mentee?.name || 'Unknown Mentee',
                    email: mentee?.email || '',
                    avatar: mentee?.image || undefined
                }
            }
        })

        // Get unique mentors for filter dropdown
        const mentorsResult = await db
            .selectDistinct({
                id: user.id,
                name: user.name
            })
            .from(user)
            .innerJoin(booking, eq(user.id, booking.mentorId))
            .orderBy(user.name)

        return {
            sessions,
            mentors: mentorsResult,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error: any) {
        console.error('[Admin Sessions API] Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch sessions',
        })
    }
})
