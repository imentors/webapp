<template>
  <div>
      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="flex items-center"
            :class="{ 'flex-1': index < steps.length - 1 }"
          >
            <div class="flex items-center">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep >= step.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                ]"
              >
                {{ step.id }}
              </div>
              <span
                :class="[
                  'ml-2 text-sm font-medium',
                  currentStep >= step.id
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                ]"
              >
                {{ step.title }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'flex-1 h-0.5 mx-4',
                currentStep > step.id
                  ? 'bg-primary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="min-h-[400px]">
        <!-- Step 1: Session Details -->
        <div v-if="currentStep === 1" class="space-y-6">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Session Details
            </h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Title <span class="text-red-500">*</span>
                </label>
                <UInput
                  v-model="bookingForm.title"
                  placeholder="e.g., Career Growth Discussion"
                  class="w-full"
                />
                <p v-if="errors.title" class="mt-1 text-xs text-red-500">{{ errors.title }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  What would you like to discuss?
                </label>
                <UTextarea
                  v-model="bookingForm.description"
                  placeholder="Describe your goals and what you'd like to cover in this session..."
                  :rows="4"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Goals (Optional)
                </label>
                <div class="space-y-2">
                  <div
                    v-for="(goal, index) in bookingForm.goals"
                    :key="index"
                    class="flex items-center space-x-2"
                  >
                    <UInput
                      v-model="bookingForm.goals[index]"
                      placeholder="Enter a goal for this session"
                      class="flex-1 w-full"
                    />
                    <UButton
                      @click="removeGoal(index)"
                      variant="ghost"
                      size="sm"
                      icon="heroicons:x-mark"
                    />
                  </div>
                  <UButton
                    @click="addGoal"
                    variant="outline"
                    size="sm"
                    icon="heroicons:plus"
                  >
                    Add Goal
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Date & Time Selection -->
        <div v-if="currentStep === 2">
          <BookingCalendar
            :mentor="mentor"
            v-model="calendarSelection"
          />
        </div>

        <!-- Step 3: Review & Confirm -->
        <div v-if="currentStep === 3" class="space-y-6">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Review Your Booking
            </h4>
            
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
              <!-- Mentor Info -->
              <div class="flex items-center space-x-4">
                <UAvatar
                  :src="mentor.avatar"
                  :alt="`${mentor.firstName} ${mentor.lastName}`"
                  size="lg"
                />
                <div>
                  <h5 class="font-medium text-gray-900 dark:text-white">
                    {{ mentor.firstName }} {{ mentor.lastName }}
                  </h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ mentor.categories.join(', ') }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ${{ mentor.hourlyRate }}/hour • {{ mentor.experience }} experience
                  </p>
                </div>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-900 dark:text-white">Session:</span>
                    <p class="text-gray-600 dark:text-gray-400">{{ bookingForm.title }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900 dark:text-white">Date:</span>
                    <p class="text-gray-600 dark:text-gray-400">{{ formatBookingDate }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900 dark:text-white">Time:</span>
                    <p class="text-gray-600 dark:text-gray-400">{{ formatBookingTime }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900 dark:text-white">Duration:</span>
                    <p class="text-gray-600 dark:text-gray-400">{{ calendarSelection.duration }} minutes</p>
                  </div>
                </div>
                
                <div v-if="bookingForm.description" class="mt-4">
                  <span class="font-medium text-gray-900 dark:text-white">Description:</span>
                  <p class="text-gray-600 dark:text-gray-400 mt-1">{{ bookingForm.description }}</p>
                </div>
                
                <div v-if="bookingForm.goals.length > 0" class="mt-4">
                  <span class="font-medium text-gray-900 dark:text-white">Goals:</span>
                  <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                    <li v-for="goal in bookingForm.goals" :key="goal">{{ goal }}</li>
                  </ul>
                </div>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-medium text-gray-900 dark:text-white">Total:</span>
                  <span class="text-2xl font-bold text-gray-900 dark:text-white">${{ totalPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Payment -->
        <div v-if="currentStep === 4 && !paymentCompleted">
          <StripePayment
            :amount="totalPrice"
            :duration="calendarSelection.duration"
            :hourly-rate="mentor.hourlyRate"
            :mentor-id="mentor.id"
            @payment-success="handlePaymentSuccess"
            @payment-error="handlePaymentError"
            ref="stripePayment"
          />
        </div>

        <!-- Step 5: Payment Confirmation -->
        <div v-if="currentStep === 4 && paymentCompleted && confirmedBooking && paymentIntent">
          <PaymentConfirmation
            :booking="bookingSummary"
            :mentor-name="`${mentor.firstName} ${mentor.lastName}`"
            :payment-intent="paymentIntent"
          />
        </div>
      </div>

      
    </div>
</template>

<script setup lang="ts">
import type { MentorProfile, BookingRequest, AvailabilitySlot, Booking } from '~/types'

type PaymentIntentLike = {
  id: string
  payment_method?: {
    card?: {
      brand: string
      last4: string
    }
  }
}

interface StripePaymentExposed {
  processPayment: () => void
  isProcessingPayment: boolean
}

interface Props {
  mentor: MentorProfile
}

interface Emits {
  (e: 'close'): void
  (e: 'booking-confirmed', booking: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { createBooking, isBooking } = useBookings()
const toast = useToast()

const currentStep = ref(1)
const errors = ref<Record<string, string>>({})
const stripePayment = ref<StripePaymentExposed | null>(null)
const paymentIntent = ref<PaymentIntentLike | null>(null)
const paymentCompleted = ref(false)
const confirmedBooking = ref<Booking | null>(null)
const isProcessingPaymentProxy = computed(() => {
  return stripePayment.value?.isProcessingPayment ?? false
})

const processPayment = () => {
  // Safely call the child component's processPayment method if available
  stripePayment.value?.processPayment?.()
}

const steps = [
  { id: 1, title: 'Details' },
  { id: 2, title: 'Schedule' },
  { id: 3, title: 'Review' },
  { id: 4, title: 'Payment' }
]

const bookingForm = reactive({
  title: '',
  description: '',
  goals: [] as string[]
})

const calendarSelection = ref<{
  date: Date | null
  timeSlot: AvailabilitySlot | null
  duration: number
}>({
  date: null,
  timeSlot: null,
  duration: 60
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return bookingForm.title.trim().length > 0
    case 2:
      return calendarSelection.value.date && calendarSelection.value.timeSlot
    case 3:
      return true
    case 4:
      return true // Payment validation handled by StripePayment component
    default:
      return false
  }
})

const totalPrice = computed(() => {
  if (!calendarSelection.value.duration) return 0
  return Math.round((props.mentor.hourlyRate * calendarSelection.value.duration) / 60)
})

const formatBookingDate = computed(() => {
  if (!calendarSelection.value.date) return ''
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(calendarSelection.value.date)
})

const formatBookingTime = computed(() => {
  if (!calendarSelection.value.timeSlot) return ''
  const time = calendarSelection.value.timeSlot.startTime
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours || '0')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes || '00'} ${ampm}`
})

// Summary data for PaymentConfirmation component
const bookingSummary = computed(() => {
  return {
    title: bookingForm.title,
    date: calendarSelection.value.date
      ? String(calendarSelection.value.date.toISOString().split('T')[0])
      : '',
    time: calendarSelection.value.timeSlot?.startTime || '',
    duration: calendarSelection.value.duration,
    price: totalPrice.value,
  }
})

const addGoal = () => {
  bookingForm.goals.push('')
}

const removeGoal = (index: number) => {
  bookingForm.goals.splice(index, 1)
}

const nextStep = async () => {
  if (validateCurrentStep()) {
    if (currentStep.value === 3) {
      try {
        await initiateBooking()
        currentStep.value++
      } catch (error) {
        // Error is handled in initiateBooking
      }
    } else {
      currentStep.value++
    }
  }
}

const previousStep = () => {
  currentStep.value--
}

const validateCurrentStep = () => {
  errors.value = {}
  
  if (currentStep.value === 1) {
    if (!bookingForm.title.trim()) {
      errors.value.title = 'Session title is required'
      return false
    }
  }
  
  return true
}

const handlePaymentSuccess = async (payment: any) => {
  paymentIntent.value = payment
  paymentCompleted.value = true
  
  // Confirm the booking after payment success
  if (pendingBookingId.value) {
    try {
      const { confirmBooking: confirmBookingApi } = useBookings()
      const result = await confirmBookingApi(pendingBookingId.value, payment.id)
      confirmedBooking.value = result as any
      
      toast.add({
        title: 'Session Booked & Paid!',
        description: `Your session with ${props.mentor.firstName} has been confirmed. Meeting link: ${result.meetingLink}`,
        color: 'success'
      })
      
      emit('booking-confirmed', result)
    } catch (error) {
      toast.add({
        title: 'Confirmation Failed',
        description: 'Payment succeeded but confirmation failed. Please contact support.',
        color: 'error'
      })
    }
  }
}

const handlePaymentError = (error: string) => {
  toast.add({
    title: 'Payment Failed',
    description: error,
    color: 'error'
  })
}

// Store pending booking ID for confirmation after payment
const pendingBookingId = ref<string | null>(null)

const initiateBooking = async () => {
  if (!calendarSelection.value.date || !calendarSelection.value.timeSlot) {
    const error = new Error('Date and time slot are required to create a booking')
    toast.add({
      title: 'Booking Failed',
      description: 'Please select a date and time slot before proceeding.',
      color: 'error'
    })
    throw error
  }
  
  const bookingRequest: BookingRequest = {
    mentorId: props.mentor.id,
    date: `${calendarSelection.value.date!.getFullYear()}-${String(calendarSelection.value.date!.getMonth() + 1).padStart(2, '0')}-${String(calendarSelection.value.date!.getDate()).padStart(2, '0')}`,
    time: calendarSelection.value.timeSlot.startTime,
    duration: calendarSelection.value.duration,
    title: bookingForm.title,
    description: bookingForm.description || '',
  }
  
  try {
    const result = await createBooking(bookingRequest)
    pendingBookingId.value = result.booking.id
    
    // Payment info is now available for StripePayment component
    // The payment will be processed in the next step
    return result
  } catch (error: any) {
    toast.add({
      title: 'Booking Failed',
      description: error.data?.message || 'Failed to create booking. Please try again.',
      color: 'error'
    })
    throw error
  }
}

// Legacy function for backwards compatibility
const confirmBooking = async () => {
  await initiateBooking()
}

const closeModal = () => {
  emit('close')
  // Reset form after a delay to allow modal animation
  setTimeout(() => {
    currentStep.value = 1
    Object.assign(bookingForm, {
      title: '',
      description: '',
      goals: []
    })
    calendarSelection.value = {
      date: null,
      timeSlot: null,
      duration: 60
    }
    errors.value = {}
    paymentIntent.value = null
    paymentCompleted.value = false
    confirmedBooking.value = null
    pendingBookingId.value = null
  }, 300)
}

defineExpose({
  currentStep,
  previousStep,
  nextStep,
  canProceed,
  confirmBooking,
  initiateBooking,
  isBooking,
  // Expose payment controls for parent footer actions
  processPayment,
  isProcessingPayment: isProcessingPaymentProxy,
})
</script>
