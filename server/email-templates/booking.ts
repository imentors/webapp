interface BookingDetails {
  mentorName: string
  menteeName: string
  sessionTitle: string
  scheduledDate: Date
  duration: number
  price: string
  bookingId: string
  meetingLink?: string
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getBaseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          ${content}
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                © ${new Date().getFullYear()} iMentorsPro. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Email sent to mentor when a new booking is created (pending payment)
 */
export function createNewBookingMentorEmail(details: BookingDetails) {
  const subject = `New Booking Request: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">📅</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          New Booking Request
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.mentorName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          <strong>${details.menteeName}</strong> has requested a mentoring session with you. The session is pending payment confirmation.
        </p>
        
        <!-- Session Details -->
        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #18181b;">Session Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Time:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${formatTime(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Duration:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Price:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">$${details.price}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          You'll receive another notification once the payment is confirmed and the session is scheduled.
        </p>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Email sent to mentee when they create a booking (pending payment)
 */
export function createNewBookingMenteeEmail(details: BookingDetails) {
  const subject = `Complete Your Booking: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">📅</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Complete Your Booking
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.menteeName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Your booking with <strong>${details.mentorName}</strong> has been created! Please complete the payment to confirm your session.
        </p>
        
        <!-- Session Details -->
        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #18181b;">Session Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Mentor:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.mentorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Time:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${formatTime(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Duration:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Total:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 600;">$${details.price}</td>
            </tr>
          </table>
        </div>
        
        <!-- Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Complete Payment
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          Note: Your booking will be held for 30 minutes. Please complete payment to secure your session.
        </p>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Email sent to mentor when booking is confirmed (payment successful)
 */
export function createBookingConfirmedMentorEmail(details: BookingDetails) {
  const subject = `Session Confirmed: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">✅</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Session Confirmed!
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.mentorName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Great news! <strong>${details.menteeName}</strong> has completed payment and your session is now confirmed.
        </p>
        
        <!-- Session Details -->
        <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #a7f3d0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #065f46;">Confirmed Session</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Mentee:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.menteeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Time:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${formatTime(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Duration:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Earnings:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 600;">$${details.price}</td>
            </tr>
          </table>
        </div>
        
        ${details.meetingLink ? `
        <!-- Meeting Link -->
        <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #bae6fd;">
          <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #0369a1;">Meeting Link</h3>
          <a href="${details.meetingLink}" style="color: #0284c7; font-size: 14px; word-break: break-all;">${details.meetingLink}</a>
        </div>
        ` : ''}
        
        <!-- Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                View Booking Details
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Email sent to mentee when booking is confirmed (payment successful)
 */
export function createBookingConfirmedMenteeEmail(details: BookingDetails) {
  const subject = `Payment Confirmed: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">✅</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Booking Confirmed!
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.menteeName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Your payment was successful! Your session with <strong>${details.mentorName}</strong> is now confirmed.
        </p>
        
        <!-- Session Details -->
        <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #a7f3d0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #065f46;">Confirmed Session</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Mentor:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.mentorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Time:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${formatTime(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Duration:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Total Paid:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 600;">$${details.price}</td>
            </tr>
          </table>
        </div>
        
        ${details.meetingLink ? `
        <!-- Meeting Link -->
        <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #bae6fd;">
          <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #0369a1;">Join Your Session</h3>
          <p style="margin: 0 0 10px; font-size: 14px; color: #0284c7;">Click the button below or use this link to join your session:</p>
          <a href="${details.meetingLink}" style="color: #0284c7; font-size: 14px; word-break: break-all;">${details.meetingLink}</a>
        </div>
        
        <!-- Meeting Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 10px 0 20px;">
              <a href="${details.meetingLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Join Meeting
              </a>
            </td>
          </tr>
        </table>
        ` : ''}
        
        <!-- View Booking Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 10px 0;">
              <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                View Booking Details
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          Add this session to your calendar to receive reminders. We look forward to a great session!
        </p>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Email sent to mentee when session is completed
 */
export function createSessionCompletedMenteeEmail(details: BookingDetails) {
  const subject = `Session Completed: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">🎉</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Session Completed!
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.menteeName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Your session with <strong>${details.mentorName}</strong> has been marked as completed. We hope you had a great learning experience!
        </p>
        
        <!-- Session Summary -->
        <div style="background-color: #faf5ff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e9d5ff;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #6b21a8;">Session Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #7c3aed; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #6b21a8; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7c3aed; font-size: 14px;">Mentor:</td>
              <td style="padding: 8px 0; color: #6b21a8; font-size: 14px; text-align: right; font-weight: 500;">${details.mentorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7c3aed; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #6b21a8; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7c3aed; font-size: 14px;">Duration:</td>
              <td style="padding: 8px 0; color: #6b21a8; font-size: 14px; text-align: right; font-weight: 500;">${details.duration} minutes</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Your feedback helps mentors improve and helps other mentees find great mentors. Please take a moment to leave a review!
        </p>
        
        <!-- Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/${details.bookingId}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Leave a Review
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Email sent to mentor when session is completed
 */
export function createSessionCompletedMentorEmail(details: BookingDetails) {
  const subject = `Session Completed: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">🎉</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Session Completed!
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.mentorName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Your session with <strong>${details.menteeName}</strong> has been successfully completed. Great job!
        </p>
        
        <!-- Session Summary -->
        <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #a7f3d0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #065f46;">Session Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Mentee:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.menteeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Duration:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 500;">${details.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857; font-size: 14px;">Earned:</td>
              <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right; font-weight: 600;">$${details.price}</td>
            </tr>
          </table>
        </div>
        
        <!-- Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                View Dashboard
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          Thank you for sharing your knowledge and expertise!
        </p>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Email sent to mentor when booking is cancelled
 */
export function createBookingCancelledMentorEmail(details: BookingDetails, cancelledBy: 'mentor' | 'mentee') {
  const subject = `Booking Cancelled: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">❌</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Booking Cancelled
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.mentorName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          ${cancelledBy === 'mentee' 
            ? `<strong>${details.menteeName}</strong> has cancelled their booking with you.`
            : `You have cancelled your session with <strong>${details.menteeName}</strong>.`
          }
        </p>
        
        <!-- Cancelled Session Details -->
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #fcd34d;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #92400e;">Cancelled Session</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #b45309; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #b45309; font-size: 14px;">Originally Scheduled:</td>
              <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #b45309; font-size: 14px;">Time:</td>
              <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 500;">${formatTime(details.scheduledDate)}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          Your availability slot is now open for new bookings.
        </p>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Email sent to mentee when booking is cancelled
 */
export function createBookingCancelledMenteeEmail(details: BookingDetails, cancelledBy: 'mentor' | 'mentee') {
  const subject = `Booking Cancelled: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">❌</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Booking Cancelled
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.menteeName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          ${cancelledBy === 'mentor' 
            ? `<strong>${details.mentorName}</strong> has cancelled your scheduled session.`
            : `Your booking with <strong>${details.mentorName}</strong> has been cancelled.`
          }
        </p>
        
        <!-- Cancelled Session Details -->
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #fcd34d;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #92400e;">Cancelled Session</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #b45309; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #b45309; font-size: 14px;">Mentor:</td>
              <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 500;">${details.mentorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #b45309; font-size: 14px;">Originally Scheduled:</td>
              <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(details.scheduledDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #b45309; font-size: 14px;">Time:</td>
              <td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; font-weight: 500;">${formatTime(details.scheduledDate)}</td>
            </tr>
          </table>
        </div>
        
        <!-- Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mentors" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Browse Mentors
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          We hope to see you back soon! Browse our mentors to find your perfect match.
        </p>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Payment success email to mentee
 */
export function createPaymentSuccessEmail(details: BookingDetails) {
  const subject = `Payment Successful - Receipt for ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">💳</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Payment Successful
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.menteeName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Thank you for your payment! Here's your receipt for the mentoring session.
        </p>
        
        <!-- Receipt -->
        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #18181b;">Payment Receipt</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Transaction ID:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.bookingId.substring(0, 8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(new Date())}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 15px 0 8px; border-top: 1px solid #e4e4e7;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Service:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">Mentoring Session</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Description:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Mentor:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.mentorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Duration:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.duration} minutes</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 15px 0 8px; border-top: 1px solid #e4e4e7;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #18181b; font-size: 16px; font-weight: 600;">Total Paid:</td>
              <td style="padding: 8px 0; color: #10b981; font-size: 16px; text-align: right; font-weight: 700;">$${details.price}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          This email serves as your payment receipt. Please keep it for your records.
        </p>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Payment failed email to mentee
 */
export function createPaymentFailedEmail(details: Partial<BookingDetails> & { menteeName: string; sessionTitle: string }) {
  const subject = `Payment Failed - Action Required`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">⚠️</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Payment Failed
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.menteeName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Unfortunately, we couldn't process your payment for <strong>${details.sessionTitle}</strong>. This could be due to:
        </p>
        
        <ul style="margin: 0 0 20px; padding-left: 20px; color: #3f3f46; font-size: 15px; line-height: 1.8;">
          <li>Insufficient funds</li>
          <li>Card declined by your bank</li>
          <li>Expired card details</li>
          <li>Network issues during processing</li>
        </ul>
        
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Please try again with a different payment method or contact your bank for more information.
        </p>
        
        <!-- Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Retry Payment
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          If you continue to experience issues, please contact our support team.
        </p>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}

/**
 * Refund notification email to mentee
 */
export function createPaymentRefundedEmail(details: BookingDetails) {
  const subject = `Refund Processed: ${details.sessionTitle}`
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">💰</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
          Refund Processed
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 20px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Hi ${details.menteeName},
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          We've processed a refund for your mentoring session <strong>${details.sessionTitle}</strong> with <strong>${details.mentorName}</strong>.
        </p>
        
        <!-- Refund Details -->
        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #18181b;">Refund Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Booking ID:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.bookingId.substring(0, 8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Refund Date:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${formatDate(new Date())}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 15px 0 8px; border-top: 1px solid #e4e4e7;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Session:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Mentor:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 500;">${details.mentorName}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 15px 0 8px; border-top: 1px solid #e4e4e7;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #18181b; font-size: 16px; font-weight: 600;">Refund Amount:</td>
              <td style="padding: 8px 0; color: #10b981; font-size: 16px; text-align: right; font-weight: 700;">$${details.price}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          The funds should appear in your account within 5-10 business days, depending on your bank's processing times.
        </p>
        
        <!-- Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mentors" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Browse Other Mentors
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `

  return { subject, htmlContent: getBaseEmailTemplate(content) }
}
