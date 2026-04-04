<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        My Bookings
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Manage your upcoming and past mentoring sessions
      </p>
    </div>

    <!-- Tabs -->
    <div class="mb-8">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          {{ tab.name }}
          <span
            v-if="tab.count > 0"
            :class="[
              'ml-2 py-0.5 px-2 rounded-full text-xs',
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Upcoming Bookings -->
    <div v-else-if="activeTab === 'upcoming'">
      <div v-if="upcomingBookings.length === 0" class="text-center py-12">
        <Icon name="heroicons:calendar-days" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No upcoming sessions
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ user?.role === 'mentor' ? 'Your upcoming sessions with mentees will appear here' : 'Book a session with a mentor to get started' }}
        </p>
        <UButton v-if="user?.role === 'mentee'" to="/mentors" icon="heroicons:plus">
          Browse Mentors
        </UButton>
      </div>
      
      <div v-else class="space-y-6">
        <BookingCard
          v-for="booking in upcomingBookings"
          :key="booking.id"
          :booking="booking"
          @reschedule="handleReschedule"
          @cancel="handleCancel"
          @join="handleJoin"
          @chat="handleChat"
          @complete="handleComplete"
        />
      </div>
    </div>

    <!-- Pending Bookings -->
    <div v-else-if="activeTab === 'pending'">
      <div v-if="pendingBookings.length === 0" class="text-center py-12">
        <Icon name="heroicons:clock" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No pending bookings
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          All your bookings have been confirmed or completed
        </p>
      </div>
      
      <div v-else class="space-y-6">
        <BookingCard
          v-for="booking in pendingBookings"
          :key="booking.id"
          :booking="booking"
          @cancel="handleCancel"
        />
      </div>
    </div>

    <!-- Past Bookings -->
    <div v-else-if="activeTab === 'past'">
      <div v-if="pastBookings.length === 0" class="text-center py-12">
        <Icon name="heroicons:archive-box" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No past sessions
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Your completed sessions will appear here
        </p>
      </div>
      
      <div v-else class="space-y-6">
        <BookingCard
          v-for="booking in pastBookings"
          :key="booking.id"
          :booking="booking"
          @review="handleReview"
          @book-again="handleBookAgain"
          @complete="handleComplete"
        />
      </div>
    </div>

    <!-- Reschedule Modal -->
    <UModal
      v-model:open="showRescheduleModal"
      :title="selectedBooking ? `Reschedule ${selectedBooking.title || ''}` : 'Reschedule Session'"
      :description="selectedBooking ? `Current: ${formatDate(selectedBooking.scheduledDate) || ''}` : undefined"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <BookingCalendar
          v-if="selectedBooking?.mentor"
          :mentor="selectedBooking.mentor as any"
          v-model="rescheduleSelection"
        />
      </template>

      <template #footer="{ close }">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          @click="showRescheduleModal = false"
        />
        <UButton
          label="Reschedule"
          @click="confirmReschedule"
          :disabled="!rescheduleSelection.date || !rescheduleSelection.timeSlot"
          :loading="isRescheduling"
        />
      </template>
    </UModal>

    <!-- Review Modal -->
    <UModal
      v-model:open="showReviewModal"
      :title="selectedBooking ? `Review Session with ${selectedBooking.mentor?.firstName || ''}` : 'Review Session'"
      :description="selectedBooking ? `Session: ${selectedBooking.title || ''}` : undefined"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Rating" required>
            <div class="flex items-center space-x-1">
              <button
                v-for="i in 5"
                :key="i"
                @click="reviewForm.rating = i"
                class="p-1"
              >
                <Icon
                  name="heroicons:star"
                  :class="[
                    'w-6 h-6 transition-colors',
                    i <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                  ]"
                />
              </button>
            </div>
          </UFormField>
          
          <UFormField label="Review">
            <UTextarea
              v-model="reviewForm.comment"
              placeholder="Share your experience with this session..."
              :rows="4"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      
      <template #footer="{ close }">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          @click="showReviewModal = false"
        />
        <UButton
          label="Submit Review"
          @click="submitReview"
          :disabled="reviewForm.rating === 0"
          :loading="isSubmittingReview"
        />
      </template>
    </UModal>
    <!-- Cancel Confirmation Modal -->
    <UModal
      v-model:open="showCancelModal"
      title="Cancel Session"
      description="Are you sure you want to cancel this session?"
      :ui="{ footer: 'justify-end' }"
    >
      <template #footer="{ close }">
        <UButton
          label="No, Keep It"
          color="neutral"
          variant="ghost"
          @click="showCancelModal = false"
        />
        <UButton
          label="Yes, Cancel Session"
          color="error"
          @click="confirmCancel"
          :loading="isCancelling"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Booking, AvailabilitySlot } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const {
  fetchBookings,
  getUpcomingBookings,
  getPastBookings,
  getPendingBookings,

  cancelBooking,
  rescheduleBooking,
  completeBooking,
  isLoading
} = useBookings()

const { user } = useAuth()
const { getMentorProfile, fetchMentors } = useMentors()
const { createReview, fetchReviewByBooking, hasReview } = useReviews()
const toast = useToast()

const activeTab = ref('upcoming')
const showRescheduleModal = ref(false)
const showReviewModal = ref(false)
const showCancelModal = ref(false)
const selectedBooking = ref<Booking | null>(null)
const bookingToCancel = ref<Booking | null>(null)
const isRescheduling = ref(false)
const isSubmittingReview = ref(false)
const isCancelling = ref(false)
const isCompleting = ref(false)

const rescheduleSelection = ref<{
  date: Date | null
  timeSlot: AvailabilitySlot | null
  duration: number
}>({
  date: null,
  timeSlot: null,
  duration: 60
})

const reviewForm = reactive({
  rating: 0,
  comment: ''
})

const tabs = computed(() => [
  {
    id: 'upcoming',
    name: 'Upcoming',
    count: getUpcomingBookings.value.length
  },
  {
    id: 'pending',
    name: 'Pending',
    count: getPendingBookings.value.length
  },
  {
    id: 'past',
    name: 'Past',
    count: getPastBookings.value.length
  }
])

const enrichBookingMentor = (booking: Booking): Booking => {
  let mentor = booking.mentor || getMentorProfile(booking.mentorId)
  
  // If mentor object exists but missing firstName/lastName (from API), derive them from name
  if (mentor && (!('firstName' in mentor) || !('lastName' in mentor)) && 'name' in mentor) {
    const m = mentor as any
    const nameParts = m.name.split(' ')
    mentor = {
      ...m,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      role: 'mentor', // Ensure role is present
      // Add other required fields with defaults if missing
      bio: m.bio || '',
      skills: m.skills || [],
      categories: m.categories || [],
      hourlyRate: m.hourlyRate || 0,
      experience: m.experience || '',
      availability: [],
      rating: m.rating || 0,
      totalSessions: m.totalSessions || 0,
      languages: m.languages || [],
      timezone: m.timezone || '',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any // Cast to any to satisfy the strict MentorProfile type for now
  }
  
  return {
    ...booking,
    mentor: mentor as any
  }
}

const upcomingBookings = computed(() => {
  return getUpcomingBookings.value.map(enrichBookingMentor)
})

const pendingBookings = computed(() => {
  return getPendingBookings.value.map(enrichBookingMentor)
})

const pastBookings = computed(() => {
  return getPastBookings.value.map(enrichBookingMentor)
})

const handleReschedule = (booking: Booking) => {
  // Note: Rescheduling is not supported after confirmation
  toast.add({
    title: 'Rescheduling Not Available',
    description: 'Confirmed bookings cannot be rescheduled. Please cancel and create a new booking.',
    color: 'warning'
  })
}

const handleCancel = (booking: Booking) => {
  // Check if booking is confirmed - cannot cancel confirmed bookings
  if (booking.status === 'confirmed') {
    toast.add({
      title: 'Cannot Cancel',
      description: 'Confirmed bookings cannot be cancelled. No refunds are available after confirmation.',
      color: 'error'
    })
    return
  }
  
  bookingToCancel.value = booking
  showCancelModal.value = true
}

const confirmCancel = async () => {
  if (!bookingToCancel.value) return
  
  isCancelling.value = true
  try {
    await cancelBooking(bookingToCancel.value.id)
    toast.add({
      title: 'Session Cancelled',
      description: 'Your pending session has been cancelled.',
      color: 'success'
    })
    showCancelModal.value = false
    bookingToCancel.value = null
  } catch (error: any) {
    toast.add({
      title: 'Cancellation Failed',
      description: error.data?.message || 'Unable to cancel session. Please try again.',
      color: 'error'
    })
  } finally {
    isCancelling.value = false
  }
}

const handleJoin = (booking: Booking) => {
  if (booking.meetingLink) {
    window.open(booking.meetingLink, '_blank')
  } else {
    toast.add({
      title: 'Meeting Link Not Available',
      description: 'The meeting link will be provided closer to the session time.',
      color: 'warning'
    })
  }
}

const handleComplete = async (booking: Booking) => {
  isCompleting.value = true
  try {
    await completeBooking(booking.id)
    toast.add({
      title: 'Session Completed',
      description: 'The session has been marked as completed successfully.',
      color: 'success'
    })
    await fetchBookings()
  } catch (error: any) {
    toast.add({
      title: 'Completion Failed',
      description: error.data?.message || 'Unable to complete session. Please try again.',
      color: 'error'
    })
  } finally {
    isCompleting.value = false
  }
}

const handleReview = async (booking: Booking) => {
  selectedBooking.value = booking
  
  // Check if review already exists
  try {
    const existingReview = await fetchReviewByBooking(booking.id)
    if (existingReview) {
      toast.add({
        title: 'Already Reviewed',
        description: 'You have already reviewed this session.',
        color: 'info'
      })
      return
    }
  } catch (error) {
    // If error, continue to show review modal
  }
  
  reviewForm.rating = 0
  reviewForm.comment = ''
  showReviewModal.value = true
}

const handleBookAgain = (booking: Booking) => {
  navigateTo(`/mentors/${booking.mentorId}`)
}

const handleChat = (booking: Booking) => {
  // Determine the other participant ID based on current user role
  // For mentee, it's the mentor. For mentor, it's the mentee (but booking usually has mentorId)
  // Ideally booking should have menteeId too, but for now we assume user is mentee or we use what we have.
  // Actually, let's look at how sessions.vue did it:
  // participantId: user.value?.role === 'mentee' ? booking.mentorId : booking.menteeId
  
  const participantId = user.value?.role === 'mentee' ? booking.mentorId : booking.menteeId
  
  if (participantId) {
    navigateTo(`/messages?user=${participantId}`)
  }
}

const confirmReschedule = async () => {
  if (!selectedBooking.value || !rescheduleSelection.value.date || !rescheduleSelection.value.timeSlot) return
  
  isRescheduling.value = true
  try {
    const newDate = new Date(rescheduleSelection.value.date)
    const [hours, minutes] = rescheduleSelection.value.timeSlot.startTime.split(':')
    newDate.setHours(parseInt(hours || '0'), parseInt(minutes || '0'))
    
    await rescheduleBooking(selectedBooking.value.id, newDate)
    
    toast.add({
      title: 'Session Rescheduled',
      description: 'Your session has been rescheduled successfully.',
      color: 'success'
    })
    
    showRescheduleModal.value = false
  } catch (error) {
    toast.add({
      title: 'Reschedule Failed',
      description: 'Unable to reschedule session. Please try again.',
      color: 'error'
    })
  } finally {
    isRescheduling.value = false
  }
}

const submitReview = async () => {
  if (!selectedBooking.value || reviewForm.rating === 0) return
  
  isSubmittingReview.value = true
  try {
    await createReview({
      bookingId: selectedBooking.value.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment || undefined,
    })
    
    toast.add({
      title: 'Review Submitted',
      description: 'Thank you for your feedback!',
      color: 'success'
    })
    
    // Refresh bookings to update review status
    await fetchBookings()
    
    showReviewModal.value = false
    reviewForm.rating = 0
    reviewForm.comment = ''
  } catch (error: any) {
    toast.add({
      title: 'Review Failed',
      description: error.data?.message || 'Unable to submit review. Please try again.',
      color: 'error'
    })
  } finally {
    isSubmittingReview.value = false
  }
}

const formatDate = (date: Date | undefined) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

// Fetch bookings and mentors on mount
onMounted(async () => {
  await fetchBookings()
  await fetchMentors()
})

// SEO
useSeoMeta({
  title: 'My Bookings - iMentor',
  description: 'Manage your mentoring sessions and bookings'
})
</script>
