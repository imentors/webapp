import { defineEventHandler, readBody, createError } from 'h3'
import { sendEmail } from '../utils/email'
import { createContactUsEmail } from '../email-templates'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, subject, message } = body

  if (!name || !email || !subject || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  try {
    const emailData = createContactUsEmail(name, email, subject, message)
    
    await sendEmail({
      to: 'townsmeet@gmail.com',
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Contact form error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send message',
    })
  }
})
