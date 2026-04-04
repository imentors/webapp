import { pgTable, text, timestamp, boolean, integer, decimal, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userRoleEnum = pgEnum('user_role', ['mentor', 'mentee', 'admin'])
export const onboardingStepEnum = pgEnum('onboarding_step', ['verification', 'profile', 'role_setup', 'preferences', 'complete'])
export const notificationTypeEnum = pgEnum('notification_type', ['info', 'warning', 'error'])
export const aiMatchStatusEnum = pgEnum('ai_match_status', ['in_progress', 'completed', 'abandoned'])
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'processing', 'completed', 'failed'])
export const bankAccountStatusEnum = pgEnum('bank_account_status', ['pending', 'verified', 'failed'])

// ==================== Better Auth Tables ====================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // iMentor specific fields
  role: userRoleEnum('role').notNull().default('mentee'),
  hasCompletedOnboarding: boolean('has_completed_onboarding').notNull().default(false),
  onboardingStep: onboardingStepEnum('onboarding_step').notNull().default('verification'),
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  suspended: boolean('suspended').notNull().default(false),
  isAdminVerified: boolean('is_admin_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})


// ==================== iMentor Profile Tables ====================

export const mentorProfile = pgTable('mentor_profile', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  location: text('location'),
  experience: text('experience'), // '0-2 years', '3-5 years', etc.
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  skills: text('skills'), // JSON array as text
  categories: text('categories'), // JSON array as text
  languages: text('languages'), // JSON array as text
  timezone: text('timezone'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalSessions: integer('total_sessions').default(0),
  profileViews: integer('profile_views').default(0),
  isAvailable: boolean('is_available').default(true),
  dateOfBirth: timestamp('date_of_birth'),
  expertiseDocument: text('expertise_document'),
  idDocument: text('id_document'), // Passport, National ID, Driver's License, etc.
  roleTitle: text('role_title').notNull().default('mentor'), // 'mentor' or 'coach'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const menteeProfile = pgTable('mentee_profile', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  location: text('location'),
  experience: text('experience'), // '0-2 years', '3-5 years', etc.
  interests: text('interests'), // JSON array as text
  goals: text('goals'), // JSON array as text
  languages: text('languages'), // JSON array as text
  timezone: text('timezone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  emailNotifications: boolean('email_notifications').default(true),
  weeklyDigest: boolean('weekly_digest').default(true),
  marketingEmails: boolean('marketing_emails').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== Waitlist (existing) ====================

export const waitlist = pgTable('waitlist', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})


// ==================== Availability Tables ====================

export const availabilitySlot = pgTable('availability_slot', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  mentorId: text('mentor_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: text('start_time').notNull(), // HH:MM format
  endTime: text('end_time').notNull(), // HH:MM format
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})


// ==================== Booking Tables ====================

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',      // Payment pending
  'confirmed',    // Payment successful, session scheduled
  'completed',    // Session completed
  'cancelled'     // Cancelled before confirmation (no refund after confirmation)
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded'
])

export const booking = pgTable('booking', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  mentorId: text('mentor_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  menteeId: text('mentee_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  scheduledDate: timestamp('scheduled_date').notNull(),
  duration: integer('duration').notNull(), // minutes
  status: bookingStatusEnum('status').notNull().default('pending'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  meetingLink: text('meeting_link'), // Auto-generated on confirmation
  notes: text('notes'),
  // Payment tracking
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
})

// ==================== Review Tables ====================

export const review = pgTable('review', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text('booking_id')
    .notNull()
    .unique()
    .references(() => booking.id, { onDelete: 'cascade' }),
  mentorId: text('mentor_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  menteeId: text('mentee_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})


// ==================== Content Management Tables ====================

export const category = pgTable('category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull().default('heroicons:folder'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const skill = pgTable('skill', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  categoryId: text('category_id').references(() => category.id, { onDelete: 'cascade' }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})


// ==================== Chat Tables ====================

export const conversation = pgTable('conversation', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const conversationParticipant = pgTable('conversation_participant', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  lastReadAt: timestamp('last_read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const message = pgTable('message', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),
  senderId: text('sender_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').notNull().default(false), // Optional, can rely on lastReadAt
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== Notification Tables ====================

export const notification = pgTable('notification', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull().default('info'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  icon: text('icon'),
  actionUrl: text('action_url'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== AI Matching Tables ====================

export const aiMatchingSession = pgTable('ai_matching_session', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' }),
  status: aiMatchStatusEnum('status').notNull().default('in_progress'),
  conversationHistory: text('conversation_history').notNull().default('[]'), // JSON array of messages
  extractedPreferences: text('extracted_preferences'), // JSON object of structured preferences
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
})

export const aiMatchResult = pgTable('ai_match_result', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id')
    .notNull()
    .references(() => aiMatchingSession.id, { onDelete: 'cascade' }),
  mentorId: text('mentor_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  score: decimal('score', { precision: 5, scale: 2 }).notNull(), // 0-100
  reasoning: text('reasoning').notNull(), // AI-generated explanation
  rank: integer('rank').notNull(), // 1, 2, 3, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const aiMatchFeedback = pgTable('ai_match_feedback', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  resultId: text('result_id')
    .notNull()
    .references(() => aiMatchResult.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' }),
  helpful: boolean('helpful'), // true/false/null
  selectedMentor: boolean('selected_mentor').notNull().default(false), // Did they book this mentor?
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ==================== Payout Tables ====================

export const mentorBankAccount = pgTable('mentor_bank_account', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  mentorId: text('mentor_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Stripe Connect account ID
  stripeConnectAccountId: text('stripe_connect_account_id'),
  stripeConnectOnboarded: boolean('stripe_connect_onboarded').notNull().default(false),
  // Bank account details (masked for display)
  bankName: text('bank_name'),
  accountHolderName: text('account_holder_name'),
  accountNumberLast4: text('account_number_last4'),
  routingNumber: text('routing_number'),
  accountType: text('account_type'), // 'checking' or 'savings'
  currency: text('currency').notNull().default('usd'),
  country: text('country').notNull().default('US'),
  status: bankAccountStatusEnum('status').notNull().default('pending'),
  isDefault: boolean('is_default').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const mentorEarning = pgTable('mentor_earning', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  mentorId: text('mentor_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  bookingId: text('booking_id')
    .notNull()
    .references(() => booking.id, { onDelete: 'cascade' }),
  grossAmount: decimal('gross_amount', { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(), // Platform's cut (e.g., 15%)
  netAmount: decimal('net_amount', { precision: 10, scale: 2 }).notNull(), // Amount mentor receives
  payoutId: text('payout_id')
    .references(() => mentorPayout.id, { onDelete: 'set null' }), // null until included in a payout
  status: text('status').notNull().default('pending'), // 'pending', 'available', 'paid'
  availableAt: timestamp('available_at'), // When funds become available for payout (after session completion)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const mentorPayout = pgTable('mentor_payout', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  mentorId: text('mentor_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('usd'),
  status: payoutStatusEnum('status').notNull().default('pending'),
  stripeTransferId: text('stripe_transfer_id'),
  stripePayoutId: text('stripe_payout_id'),
  bankAccountId: text('bank_account_id')
    .references(() => mentorBankAccount.id, { onDelete: 'set null' }),
  periodStart: timestamp('period_start').notNull(), // Start of the payout period
  periodEnd: timestamp('period_end').notNull(), // End of the payout period
  processedAt: timestamp('processed_at'),
  failureReason: text('failure_reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== Relations ====================

export const userRelations = relations(user, ({ one, many }) => ({
  mentorProfile: one(mentorProfile, {
    fields: [user.id],
    references: [mentorProfile.userId],
  }),
  menteeProfile: one(menteeProfile, {
    fields: [user.id],
    references: [menteeProfile.userId],
  }),
  userPreferences: one(userPreferences, {
    fields: [user.id],
    references: [userPreferences.userId],
  }),
  sessions: many(session),
  accounts: many(account),
  availabilitySlots: many(availabilitySlot),
  bookingsAsMentor: many(booking, { relationName: 'mentor' }),
  bookingsAsMentee: many(booking, { relationName: 'mentee' }),
  reviewsAsMentor: many(review, { relationName: 'mentor' }),
  reviewsAsMentee: many(review, { relationName: 'mentee' }),
  conversationParticipants: many(conversationParticipant),
  messages: many(message),
  notifications: many(notification),
  aiMatchingSessions: many(aiMatchingSession),
  aiMatchFeedbacks: many(aiMatchFeedback),
  // Payout relations
  bankAccount: one(mentorBankAccount, {
    fields: [user.id],
    references: [mentorBankAccount.mentorId],
  }),
  earnings: many(mentorEarning),
  payouts: many(mentorPayout),
}))

export const mentorProfileRelations = relations(mentorProfile, ({ one }) => ({
  user: one(user, {
    fields: [mentorProfile.userId],
    references: [user.id],
  }),
}))

export const menteeProfileRelations = relations(menteeProfile, ({ one }) => ({
  user: one(user, {
    fields: [menteeProfile.userId],
    references: [user.id],
  }),
}))

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const bookingRelations = relations(booking, ({ one, many }) => ({
  mentor: one(user, {
    fields: [booking.mentorId],
    references: [user.id],
    relationName: 'mentor',
  }),
  mentee: one(user, {
    fields: [booking.menteeId],
    references: [user.id],
    relationName: 'mentee',
  }),
  review: one(review),
}))

export const reviewRelations = relations(review, ({ one }) => ({
  booking: one(booking, {
    fields: [review.bookingId],
    references: [booking.id],
  }),
  mentor: one(user, {
    fields: [review.mentorId],
    references: [user.id],
    relationName: 'mentor',
  }),
  mentee: one(user, {
    fields: [review.menteeId],
    references: [user.id],
    relationName: 'mentee',
  }),
}))

export const conversationRelations = relations(conversation, ({ many }) => ({
  participants: many(conversationParticipant),
  messages: many(message),
}))

export const conversationParticipantRelations = relations(conversationParticipant, ({ one }) => ({
  conversation: one(conversation, {
    fields: [conversationParticipant.conversationId],
    references: [conversation.id],
  }),
  user: one(user, {
    fields: [conversationParticipant.userId],
    references: [user.id],
  }),
}))

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}))

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}))

export const aiMatchingSessionRelations = relations(aiMatchingSession, ({ one, many }) => ({
  user: one(user, {
    fields: [aiMatchingSession.userId],
    references: [user.id],
  }),
  results: many(aiMatchResult),
}))

export const aiMatchResultRelations = relations(aiMatchResult, ({ one, many }) => ({
  session: one(aiMatchingSession, {
    fields: [aiMatchResult.sessionId],
    references: [aiMatchingSession.id],
  }),
  mentor: one(user, {
    fields: [aiMatchResult.mentorId],
    references: [user.id],
  }),
  feedbacks: many(aiMatchFeedback),
}))

export const aiMatchFeedbackRelations = relations(aiMatchFeedback, ({ one }) => ({
  result: one(aiMatchResult, {
    fields: [aiMatchFeedback.resultId],
    references: [aiMatchResult.id],
  }),
  user: one(user, {
    fields: [aiMatchFeedback.userId],
    references: [user.id],
  }),
}))

// Payout Relations
export const mentorBankAccountRelations = relations(mentorBankAccount, ({ one, many }) => ({
  mentor: one(user, {
    fields: [mentorBankAccount.mentorId],
    references: [user.id],
  }),
  payouts: many(mentorPayout),
}))

export const mentorEarningRelations = relations(mentorEarning, ({ one }) => ({
  mentor: one(user, {
    fields: [mentorEarning.mentorId],
    references: [user.id],
  }),
  booking: one(booking, {
    fields: [mentorEarning.bookingId],
    references: [booking.id],
  }),
  payout: one(mentorPayout, {
    fields: [mentorEarning.payoutId],
    references: [mentorPayout.id],
  }),
}))

export const mentorPayoutRelations = relations(mentorPayout, ({ one, many }) => ({
  mentor: one(user, {
    fields: [mentorPayout.mentorId],
    references: [user.id],
  }),
  bankAccount: one(mentorBankAccount, {
    fields: [mentorPayout.bankAccountId],
    references: [mentorBankAccount.id],
  }),
  earnings: many(mentorEarning),
}))