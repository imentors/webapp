<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-start justify-between">
      <!-- Main Content -->
      <div class="flex-1">
        <div class="flex items-start space-x-4">
          <!-- Mentor Avatar -->
          <UAvatar
            :src="booking.mentor?.avatar"
            :alt="mentorName"
            size="lg"
          />
          
          <!-- Session Details -->
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ booking.title }}
              </h3>
              <UBadge
                :color="statusColor"
                :variant="statusVariant"
                size="sm"
              >
                {{ statusLabel }}
              </UBadge>
            </div>
            
            <p class="text-gray-600 dark:text-gray-400 mb-2">
              with {{ mentorName }}
            </p>
            
            <div class="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:calendar-days" class="w-4 h-4" />
                <span>{{ formatDate }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:clock" class="w-4 h-4" />
                <span>{{ formatTime }} ({{ booking.duration }}min)</span>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:currency-dollar" class="w-4 h-4" />
                <span>${{ booking.price }}</span>
              </div>
            </div>
            
            <p v-if="booking.description" class="text-gray-600 dark:text-gray-400 text-sm">
              {{ booking.description }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex flex-col space-y-2 ml-4">
        <!-- Confirmed session actions -->
        <template v-if="booking.status === 'confirmed'">
          <UButton
            v-if="canJoin"
            @click="$emit('join', booking)"
            size="sm"
            icon="heroicons:video-camera"
          >
            Join Session
          </UButton>
          
          <UButton
            v-if="isPast"
            @click="$emit('complete', booking)"
            size="sm"
            color="primary"
            icon="heroicons:check-circle"
          >
            Mark as Complete
          </UButton>

          <UButton
            @click="$emit('chat', booking)"
            variant="outline"
            size="sm"
            icon="heroicons:chat-bubble-left-right"
          >
            Chat
          </UButton>
          <UButton
            v-if="isUpcoming"
            @click="$emit('reschedule', booking)"
            variant="outline"
            size="sm"
            icon="heroicons:arrow-path"
          >
            Reschedule
          </UButton>
          <UButton
            v-if="isUpcoming"
            @click="$emit('cancel', booking)"
            variant="outline"
            size="sm"
            color="error"
            icon="heroicons:x-mark"
          >
            Cancel
          </UButton>
        </template>
        
        <!-- Pending session actions -->
        <template v-else-if="booking.status === 'pending'">
          <UButton
            v-if="isUpcoming && isMentee"
            @click="$emit('pay', booking)"
            size="sm"
            color="primary"
            icon="heroicons:credit-card"
          >
            Pay Now
          </UButton>
          <UButton
            v-if="isUpcoming"
            @click="$emit('cancel', booking)"
            variant="outline"
            size="sm"
            color="error"
            icon="heroicons:x-mark"
          >
            Cancel
          </UButton>
        </template>
        
        <template v-else-if="booking.status === 'completed'">
          <UButton
            v-if="isMentee"
            @click="$emit('review', booking)"
            variant="outline"
            size="sm"
            icon="heroicons:star"
          >
            Review
          </UButton>
          <UButton
            v-if="isMentee"
            @click="$emit('book-again', booking)"
            size="sm"
            icon="heroicons:arrow-path"
          >
            Book Again
          </UButton>
        </template>
        
        <!-- Cancelled session -->
        <template v-else-if="booking.status === 'cancelled'">
          <div class="text-center">
            <Icon name="heroicons:x-circle" class="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Cancelled
            </p>
          </div>
          <UButton
            v-if="isMentee"
            @click="$emit('book-again', booking)"
            variant="outline"
            size="sm"
            icon="heroicons:arrow-path"
          >
            Book Again
          </UButton>
        </template>
        
        <!-- Rescheduled session -->
        <template v-else-if="booking.status === 'rescheduled'">
          <div class="text-center">
            <Icon name="heroicons:arrow-path" class="w-5 h-5 text-teal-500 mx-auto mb-1" />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Rescheduled
            </p>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Meeting Link (for confirmed upcoming sessions) -->
    <div v-if="booking.status === 'confirmed' && booking.meetingLink && canJoin" class="mt-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Icon name="heroicons:video-camera" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span class="text-sm font-medium text-teal-900 dark:text-teal-100">
            Meeting ready
          </span>
        </div>
        <UButton
          @click="$emit('join', booking)"
          size="xs"
          variant="soft"
          color="primary"
        >
          Join Now
        </UButton>
      </div>
    </div>
    
    <!-- Notes (if any) -->
    <div v-if="booking.notes" class="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        <span class="font-medium">Notes:</span> {{ booking.notes }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/types'

interface Props {
  booking: Booking
}

interface Emits {
  (e: 'reschedule', booking: Booking): void
  (e: 'cancel', booking: Booking): void
  (e: 'join', booking: Booking): void
  (e: 'review', booking: Booking): void
  (e: 'book-again', booking: Booking): void
  (e: 'chat', booking: Booking): void
  (e: 'pay', booking: Booking): void
  (e: 'complete', booking: Booking): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { user } = useAuth()

const isMentee = computed(() => user.value?.id === props.booking.menteeId)
const isMentor = computed(() => user.value?.id === props.booking.mentorId)

const mentorName = computed(() => {
  if (!props.booking.mentor) return 'Unknown Mentor'
  return `${props.booking.mentor.firstName} ${props.booking.mentor.lastName}`
})

const formatDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(props.booking.scheduledDate)
})

const formatTime = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(props.booking.scheduledDate)
})

const isUpcoming = computed(() => {
  const endTime = new Date(props.booking.scheduledDate.getTime() + props.booking.duration * 60000)
  return endTime > new Date()
})

const isPast = computed(() => !isUpcoming.value)

const canJoin = computed(() => {
  if (!isUpcoming.value || props.booking.status !== 'confirmed') return false
  
  // Allow joining 15 minutes before the session
  const sessionTime = props.booking.scheduledDate.getTime()
  const now = Date.now()
  const fifteenMinutes = 15 * 60 * 1000
  
  return (sessionTime - now) <= fifteenMinutes
})

const statusLabel = computed(() => {
  switch (props.booking.status) {
    case 'pending':
      return isUpcoming.value ? 'Pending' : 'Expired'
    case 'confirmed':
      return 'Confirmed'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    case 'rescheduled':
      return 'Rescheduled'
    default:
      return 'Unknown'
  }
})

const statusColor = computed(() => {
  switch (props.booking.status) {
    case 'pending':
      return isUpcoming.value ? 'warning' : 'neutral'
    case 'confirmed':
      return 'success'
    case 'completed':
      return 'primary'
    case 'cancelled':
      return 'error'
    case 'rescheduled':
      return 'warning'
    default:
      return 'neutral'
  }
})

const statusVariant = computed(() => {
  return 'soft' as const
})
</script>
