// Export all email templates from a central location
export { createWaitlistConfirmationEmail } from './waitlist-confirmation'
export { createEmailVerificationEmail } from './email-verification'
export { createPasswordResetEmail } from './password-reset'

// Booking and payment email templates
export {
  createNewBookingMentorEmail,
  createNewBookingMenteeEmail,
  createBookingConfirmedMentorEmail,
  createBookingConfirmedMenteeEmail,
  createSessionCompletedMenteeEmail,
  createSessionCompletedMentorEmail,
  createBookingCancelledMentorEmail,
  createBookingCancelledMenteeEmail,
  createPaymentSuccessEmail,
  createPaymentFailedEmail,
  createPaymentRefundedEmail,
} from './booking'

// Review email template
export { createReviewReceivedEmail } from './review'

// Contact email template
export { createContactUsEmail } from './contact'
