<template>
  <!-- Loading State -->
  <div v-if="isLoadingMentor" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="animate-pulse">
      <div class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div class="flex flex-col lg:flex-row lg:space-x-8">
          <div class="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto lg:mx-0 mb-6 lg:mb-0"></div>
          <div class="flex-1 space-y-4">
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="mentor" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back Button -->
    <UButton
      @click="$router.back()"
      variant="ghost"
      icon="heroicons:arrow-left"
      class="mb-6"
    >
      Back to Mentors & Coaches
    </UButton>

    <!-- Mentor Profile Header -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
      <div class="p-8">
        <div class="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
          <!-- Avatar and Basic Info -->
          <div class="flex-shrink-0 text-center lg:text-left mb-6 lg:mb-0">
            <UAvatar
              :src="mentor.avatar"
              :alt="`${mentor.firstName} ${mentor.lastName}`"
              size="2xl"
              class="mx-auto lg:mx-0 mb-4"
            />
            
            <div class="flex items-center justify-center lg:justify-start space-x-1 mb-2">
              <Icon
                v-for="i in 5"
                :key="i"
                name="heroicons:star"
                :class="[
                  'w-5 h-5',
                  i <= mentor.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                ]"
              />
              <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                {{ mentor.rating }}/5
              </span>
            </div>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ mentor.totalSessions }} sessions completed
            </p>

            <div class="text-center lg:text-left">
              <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ${{ mentor.hourlyRate }}/hr
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ mentor.experience }} experience
              </p>
            </div>
          </div>

          <!-- Main Info -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ mentor.firstName }} {{ mentor.lastName }}
            </h1>
            
            <div class="flex flex-wrap gap-2 mb-4">
              <UBadge
                v-for="category in mentor.categories"
                :key="category"
                variant="soft"
                color="primary"
              >
                {{ category }}
              </UBadge>
            </div>

            <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {{ mentor.bio }}
            </p>

            <!-- Quick Info -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:globe-alt" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ mentor.timezone }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ mentor.languages.join(', ') }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:clock" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">Usually responds in 2-4 hours</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
              <UButton
                size="lg"
                icon="heroicons:calendar-days"
                @click="handleBookClick"
              >
                Book Session
              </UButton>
              
              <UButton
                variant="outline"
                size="lg"
                icon="heroicons:chat-bubble-left-right"
                @click="sendMessage"
              >
                Send Message
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skills & Expertise -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Skills & Expertise
      </h2>
      
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="skill in mentor.skills"
          :key="skill"
          variant="soft"
          color="secondary"
          size="md"
        >
          {{ skill }}
        </UBadge>
      </div>
    </div>

    <!-- Availability Preview -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Availability This Week
        </h2>
        <UButton
          v-if="mentorSlots.length > 0"
          variant="ghost"
          size="sm"
          @click="handleBookClick"
        >
          View Full Calendar
        </UButton>
      </div>
      
      <!-- Empty State -->
      <div v-if="mentorSlots.length === 0" class="text-center py-8">
        <Icon name="heroicons:calendar" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">
          This mentor or coach hasn't set their availability yet.
        </p>
      </div>

      <!-- Availability Grid -->
      <div v-else class="grid grid-cols-7 gap-2">
        <div
          v-for="(day, index) in weekDays"
          :key="day"
          class="text-center"
        >
          <p class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {{ day }}
          </p>
          <div class="space-y-1">
            <div
              v-for="slot in getAvailableSlots(index)"
              :key="slot"
              class="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded"
            >
              {{ slot }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Recent Reviews
      </h2>
      
      <div v-if="reviewsLoading" class="space-y-6 animate-pulse">
        <div v-for="i in 3" :key="i" class="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="reviews.length === 0" class="text-center py-8">
        <Icon name="heroicons:star" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">No reviews yet</p>
      </div>
      <div v-else class="space-y-6">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0"
        >
          <div class="flex items-start space-x-4">
            <UAvatar
              :src="review.mentee?.image || undefined"
              :alt="review.mentee?.name || 'Mentee'"
              size="md"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ review.mentee?.name || 'Anonymous' }}
                </h4>
                <div class="flex items-center space-x-1">
                  <Icon
                    v-for="i in 5"
                    :key="i"
                    name="heroicons:star"
                    :class="[
                      'w-4 h-4',
                      i <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    ]"
                  />
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(review.createdAt) }}
                </span>
              </div>
              <p v-if="review.comment" class="text-gray-600 dark:text-gray-400">
                {{ review.comment }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Booking Modal -->
    <UModal
      v-model:open="showBookingModal"
      :title="`Book a Session with ${mentor.firstName}`"
      :description="`$${mentor.hourlyRate}/hour • ${mentor.experience} experience`"
    >
      <template #body>
        <BookingModal
          v-if="mentor"
          ref="bookingModalRef"
          :mentor="mentor"
          @booking-confirmed="handleBookingConfirmed"
          @close="showBookingModal = false"
        />
      </template>

      <template #footer="{ close }">
        <div
          v-if="bookingModalApi"
          :class="[
            'flex w-full',
            bookingModalApi.currentStep > 1 ? 'justify-between' : 'justify-end',
          ]"
        >
          <UButton
            v-if="bookingModalApi.currentStep > 1"
            @click="bookingModalApi.previousStep()"
            variant="outline"
            icon="heroicons:arrow-left"
          >
            Back
          </UButton>
          <div class="flex space-x-3">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              @click="close"
            />
            
            <UButton
              v-if="bookingModalApi.currentStep < 4"
              @click="bookingModalApi.nextStep()"
              :disabled="!bookingModalApi.canProceed"
              :loading="bookingModalApi.isBooking"
              icon="heroicons:arrow-right"
              trailing
            >
              {{ bookingModalApi.currentStep === 3 ? 'Proceed to Payment' : 'Continue' }}
            </UButton>
            
            <UButton
              v-else
              @click="bookingModalApi?.processPayment()"
              :loading="bookingModalApi.isBooking || bookingModalApi?.isProcessingPayment"
              icon="heroicons:credit-card"
            >
              Complete Payment
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Login Modal -->
    <UModal v-model:open="showLoginModal">
      <template #content>
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="heroicons:user-circle" class="w-8 h-8 text-white" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to Book
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              You need an account to book a session with {{ mentor.firstName }}
            </p>
          </div>

          <div class="space-y-3">
            <UButton
              @click="goToLogin"
              size="lg"
              class="w-full justify-center"
            >
              <Icon name="heroicons:arrow-right-end-on-rectangle" class="w-5 h-5 mr-2" />
              Sign In
            </UButton>
            
            <UButton
              @click="goToSignup"
              variant="outline"
              size="lg"
              class="w-full justify-center"
            >
              Create an Account
            </UButton>
          </div>

          <p class="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            It only takes a minute to get started
          </p>
        </div>
      </template>
    </UModal>
  </div>

  <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Mentor or Coach Not Found
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        The mentor or coach you're looking for doesn't exist or has been removed.
      </p>
      <UButton to="/mentors" icon="heroicons:arrow-left">
        Back to Mentors & Coaches
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MentorProfile } from '~/types'

interface BookingModalExposedLocal {
  currentStep: number;
  previousStep: () => void;
  nextStep: () => void;
  canProceed: boolean;
  confirmBooking: () => Promise<void>;
  isBooking: boolean;
  processPayment: () => void;
  isProcessingPayment: boolean;
}

const { user } = useAuth()
const route = useRoute()
const toast = useToast()
const { getMentorById } = useMentors()
const { slots: mentorSlots, fetchAvailability } = useAvailability()
const { reviews, fetchReviewsByMentor, isLoading: reviewsLoading } = useReviews()

const mentorId = route.params.id as string
const mentor = ref<MentorProfile | null>(null)
const isLoadingMentor = ref(true)
const showLoginModal = ref(false)

// Fetch mentor, availability, and reviews on mount
onMounted(async () => {
  isLoadingMentor.value = true
  try {
    const [mentorData] = await Promise.all([
      getMentorById(mentorId),
      fetchAvailability(mentorId).catch(err => {
        console.error('[Mentor Detail] Error fetching availability:', err)
        return null
      }),
      fetchReviewsByMentor(mentorId, 10, 0).catch(err => {
        console.error('[Mentor Detail] Error fetching reviews:', err)
        return null
      })
    ])
    mentor.value = mentorData
  } catch (err) {
    console.error('[Mentor Detail] Error loading mentor data:', err)
  } finally {
    isLoadingMentor.value = false
  }
})

const showBookingModal = ref(false)

const handleBookClick = () => {
  if (!user.value) {
    showLoginModal.value = true
  } else {
    showBookingModal.value = true
  }
}

const goToLogin = () => {
  navigateTo(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

const goToSignup = () => {
  navigateTo(`/auth/register?role=mentee&redirect=${encodeURIComponent(route.fullPath)}`)
}
const isBooking = ref(false)

const bookingModalRef = ref<BookingModalExposedLocal | null>(null)

const bookingModalApi = computed(() => bookingModalRef.value)

const bookingForm = reactive({
  title: '',
  description: '',
  date: '',
  time: '',
  duration: 60
})

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const availableTimeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

const durationOptions = [
  { label: '30 minutes', value: 30 },
  { label: '60 minutes', value: 60 },
  { label: '90 minutes', value: 90 }
]


const getAvailableSlots = (dayIndex: number) => {
  // Get actual availability from the mentor's slots
  const daySlots = mentorSlots.value.filter(slot => slot.dayOfWeek === dayIndex && slot.isAvailable)
  
  return daySlots.map(slot => {
    const [hours, minutes] = slot.startTime.split(':')
    const hour = parseInt(hours || '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  })
}

const sendMessage = () => {
  if (!user.value) {
    showLoginModal.value = true
  } else {
    navigateTo(`/messages?mentor=${mentor.value?.id}`)
  }
}

const handleBookingConfirmed = (booking: any) => {
  // Navigate to bookings page to show the new booking
  navigateTo('/bookings')
}

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj)
}

// SEO
useSeoMeta({
  title: () => mentor.value ? `${mentor.value.firstName} ${mentor.value.lastName} - Mentor or Coach Profile` : 'Mentor or Coach Profile',
  description: () => mentor.value ? mentor.value.bio : 'View mentor profile and book sessions'
})
</script>
