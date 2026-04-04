import { eq } from 'drizzle-orm'
import PDFDocument from 'pdfkit'
import { db } from '../../../../utils/drizzle'
import { booking, user } from '../../../../db/schema'
import { auth } from '../../../../utils/auth'
import { PassThrough } from 'stream'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (session.user.role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Payment ID is required' })
    }

    try {
        // Fetch booking with mentor and mentee info
        const bookingData = await db.query.booking.findFirst({
            where: eq(booking.id, id)
        })

        if (!bookingData) {
            throw createError({ statusCode: 404, message: 'Payment not found' })
        }

        const mentorData = await db.query.user.findFirst({
            where: eq(user.id, bookingData.mentorId)
        })

        const menteeData = await db.query.user.findFirst({
            where: eq(user.id, bookingData.menteeId)
        })

        // Create PDF
        const doc = new PDFDocument({ margin: 50 })
        const stream = new PassThrough()

        doc.pipe(stream)

        // Header
        doc.fontSize(20).text('PAYMENT RECEIPT', { align: 'center' })
        doc.moveDown()
        doc.fontSize(10).text(`Receipt Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
        doc.text(`Transaction ID: ${bookingData.stripePaymentIntentId || bookingData.id}`, { align: 'right' })
        doc.moveDown(2)

        // Company Info (Placeholder)
        doc.fontSize(12).text('iMentor Platform', { oblique: true })
        doc.fontSize(10).text('123 Mentoring Way')
        doc.text('Tech City, TC 12345')
        doc.moveDown(2)

        // Billing Info
        const startY = doc.y
        doc.fontSize(12).text('Billed To:', { underline: true })
        doc.fontSize(10).text(menteeData?.name || 'Unknown Mentee')
        doc.text(menteeData?.email || '')

        doc.y = startY
        doc.fontSize(12).text('Mentor:', 300, doc.y, { underline: true })
        doc.fontSize(10).text(mentorData?.name || 'Unknown Mentor', 300)
        doc.text(mentorData?.email || '', 300)
        doc.moveDown(3)

        // Session Details Table
        doc.x = 50
        doc.fontSize(12).text('Session Details', { underline: true })
        doc.moveDown()

        const tableTop = doc.y
        doc.fontSize(10)
        doc.text('Description', 50, tableTop)
        doc.text('Date', 250, tableTop)
        doc.text('Duration', 350, tableTop)
        doc.text('Amount', 450, tableTop, { align: 'right' })

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke()

        const itemY = tableTop + 25
        doc.text(bookingData.title || 'Mentoring Session', 50, itemY)
        doc.text(new Date(bookingData.scheduledDate).toLocaleDateString(), 250, itemY)
        doc.text(`${bookingData.duration} mins`, 350, itemY)
        doc.text(`$${parseFloat(bookingData.price || '0').toFixed(2)}`, 450, itemY, { align: 'right' })

        doc.moveTo(50, itemY + 15).lineTo(550, itemY + 15).stroke()

        // Totals
        const totalY = itemY + 40
        doc.fontSize(12).text('Total Amount:', 350, totalY)
        doc.text(`$${parseFloat(bookingData.price || '0').toFixed(2)}`, 450, totalY, { align: 'right' })

        doc.fontSize(10).text('Status:', 350, totalY + 20)
        doc.text(bookingData.paymentStatus?.toUpperCase() || 'PENDING', 450, totalY + 20, { align: 'right' })

        // Footer
        doc.moveDown(5)
        doc.fillColor('gray').fontSize(10).text('Thank you for using iMentor!', { align: 'center' })

        doc.end()

        // Set response headers
        setResponseHeaders(event, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=receipt-${bookingData.id}.pdf`
        })

        return sendStream(event, stream)
    } catch (error: any) {
        console.error('[Admin Receipt API] Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to generate receipt',
        })
    }
})
