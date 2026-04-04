export type UserRole = 'mentor' | 'mentee' | 'admin'
export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface AdminUser extends User {
  status: 'active' | 'pending' | 'suspended'
  lastActive: Date
  stats?: {
    sessions?: number
    rating?: number
    revenue?: number
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface MentorProfile extends User {
  role: 'mentor'
  bio: string
  skills: string[]
  categories: string[]
  hourlyRate: number
  experience: string
  availability: TimeSlot[]
  rating: number
  totalSessions: number
  languages: string[]
  timezone: string
  dateOfBirth?: Date
  expertiseDocument?: string
}

export interface MenteeProfile extends User {
  role: 'mentee'
  bio?: string
  interests: string[]
  goals: string[]
  experience: string
}

export interface TimeSlot {
  id: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  isAvailable: boolean
}

export interface AdminSession {
  id: string
  title: string
  mentor: {
    name: string
    avatar: string
  }
  mentee: {
    name: string
    avatar: string
  }
  date: Date
  time: string
  duration: number // hours
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  amount: number
  description?: string
  paymentId?: string
  createdAt: Date
}

export interface Session {
  id: string
  mentorId: string
  menteeId: string
  title: string
  description: string
  scheduledAt: Date
  duration: number // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  meetingLink?: string
  notes?: string
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  isRead: boolean
  sessionId?: string
}

export interface Conversation {
  id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  hasCompletedOnboarding: boolean
}

export interface BookingRequest {
  mentorId: string
  date: string
  time: string
  duration: number
  title: string
  description?: string
  menteeId?: string
  status?: 'pending' | 'confirmed' | 'cancelled'
  price?: number
  paymentIntentId?: string
}

export interface Booking {
  id: string
  mentorId: string
  menteeId: string
  title: string
  description: string
  scheduledDate: Date
  duration: number // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  price: number
  meetingLink?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  mentor?: { id: string; name: string; image?: string | null; email?: string; role?: string }
  mentee?: { id: string; name: string; image?: string | null; email?: string; role?: string }
  paymentIntentId?: string
  paymentStatus?: 'pending' | 'succeeded' | 'failed' | 'refunded'
}

export interface AvailabilitySlot {
  id: string
  mentorId: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
  isAvailable: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'availability' | 'blocked'
  status?: string
  mentorId?: string
  menteeId?: string
}

// Payout Types
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type BankAccountStatus = 'pending' | 'verified' | 'failed'
export type EarningStatus = 'pending' | 'available' | 'paid'

export interface MentorBankAccount {
  id: string
  mentorId: string
  stripeConnectAccountId?: string
  stripeConnectOnboarded: boolean
  bankName?: string
  accountHolderName?: string
  accountNumberLast4?: string
  routingNumber?: string
  accountType?: string
  currency: string
  country: string
  status: BankAccountStatus
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MentorEarning {
  id: string
  mentorId: string
  bookingId: string
  grossAmount: number
  platformFee: number
  netAmount: number
  payoutId?: string
  status: EarningStatus
  availableAt?: Date
  createdAt: Date
  updatedAt: Date
  booking?: Booking
}

export interface MentorPayout {
  id: string
  mentorId: string
  amount: number
  currency: string
  status: PayoutStatus
  stripeTransferId?: string
  stripePayoutId?: string
  bankAccountId?: string
  periodStart: Date
  periodEnd: Date
  processedAt?: Date
  failureReason?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  earningsCount?: number
}

export interface EarningsSummary {
  totalEarnings: number
  availableBalance: number
  pendingBalance: number
  paidOutTotal: number
  thisMonthEarnings: number
  lastMonthEarnings: number
}
