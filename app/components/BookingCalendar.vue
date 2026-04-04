<template>
  <div class="booking-calendar">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Select Date & Time
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Choose an available slot for your session
        </p>
      </div>
      
      <div class="flex items-center space-x-2">
        <UButton
          @click="previousMonth"
          variant="ghost"
          size="sm"
          icon="heroicons:chevron-left"
        />
        <span class="text-sm font-medium text-gray-900 dark:text-white px-4">
          {{ currentMonthYear }}
        </span>
        <UButton
          @click="nextMonth"
          variant="ghost"
          size="sm"
          icon="heroicons:chevron-right"
        />
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-1 mb-6">
      <!-- Day headers -->
      <div
        v-for="day in dayHeaders"
        :key="day"
        class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
      >
        {{ day }}
      </div>
      
      <!-- Calendar days -->
      <div
        v-for="date in calendarDays"
        :key="date.key"
        class="aspect-square"
      >
        <button
          v-if="date.date"
          @click="selectDate(date.date)"
          :disabled="!date.isSelectable"
          :class="[
            'w-full h-full rounded-lg text-sm transition-colors',
            date.isToday && 'ring-2 ring-primary-500',
            date.isSelected && 'bg-primary-500 text-white',
            !date.isSelected && date.isSelectable && 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
            !date.isSelectable && 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
            date.hasAvailability && !date.isSelected && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
          ]"
        >
          {{ date.date.getDate() }}
        </button>
      </div>
    </div>

    <!-- Time Slots -->
    <div v-if="selectedDate" class="space-y-4">
      <h4 class="text-md font-medium text-gray-900 dark:text-white">
        Available Times for {{ formatSelectedDate }}
      </h4>
      
      <div v-if="isLoading" class="flex justify-center py-8">
        <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin text-gray-400" />
      </div>
      
      <div v-else-if="availableTimeSlots.length === 0" class="text-center py-8">
        <Icon name="heroicons:calendar-x-mark" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">No available slots for this date</p>
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <button
          v-for="slot in availableTimeSlots"
          :key="slot.id"
          @click="selectTimeSlot(slot)"
          :class="[
            'p-3 rounded-lg border text-sm font-medium transition-colors',
            selectedTimeSlot?.id === slot.id
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          ]"
        >
          {{ formatTime(slot.startTime) }}
        </button>
      </div>
    </div>

    <!-- Duration Selection -->
    <div v-if="selectedTimeSlot" class="mt-6 space-y-4">
      <h4 class="text-md font-medium text-gray-900 dark:text-white">
        Session Duration
      </h4>
      
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="duration in durationOptions"
          :key="duration.value"
          @click="selectedDuration = duration.value"
          :class="[
            'p-3 rounded-lg border text-sm font-medium transition-colors',
            selectedDuration === duration.value
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          ]"
        >
          {{ duration.label }}
        </button>
      </div>
    </div>

    <!-- Booking Summary -->
    <div v-if="selectedTimeSlot && selectedDuration" class="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <h4 class="text-md font-medium text-gray-900 dark:text-white mb-2">
        Booking Summary
      </h4>
      <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <p><span class="font-medium">Date:</span> {{ formatSelectedDate }}</p>
        <p><span class="font-medium">Time:</span> {{ formatTime(selectedTimeSlot.startTime) }}</p>
        <p><span class="font-medium">Duration:</span> {{ selectedDuration }} minutes</p>
        <p v-if="mentor" class="text-lg font-semibold text-gray-900 dark:text-white">
          <span class="font-medium">Total:</span> ${{ calculatePrice }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MentorProfile, AvailabilitySlot } from '~/types'

interface Props {
  mentor: MentorProfile
  modelValue?: {
    date: Date | null
    timeSlot: AvailabilitySlot | null
    duration: number
  }
}

interface Emits {
  (e: 'update:modelValue', value: {
    date: Date | null
    timeSlot: AvailabilitySlot | null
    duration: number
  }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fetchAvailability, getAvailableSlots, isLoading } = useAvailability()

const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)
const selectedTimeSlot = ref<AvailabilitySlot | null>(null)
const selectedDuration = ref(60)

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const durationOptions = [
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 }
]

const currentMonthYear = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(currentDate.value)
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(selectedDate.value)
})

const calculatePrice = computed(() => {
  if (!selectedDuration.value || !props.mentor) return 0
  return Math.round((props.mentor.hourlyRate * selectedDuration.value) / 60)
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.getTime() === today.getTime()
    const isPast = date < today
    const isSelected = selectedDate.value && date.getTime() === selectedDate.value.getTime()
    
    // Check actual availability
    let hasAvailability = false
    if (isCurrentMonth && !isPast) {
      const dayOfWeek = date.getDay()
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      // Check if there are any slots for this day of week
      const daySlots = getAvailableSlots(props.mentor.id, dateString)
      hasAvailability = daySlots.length > 0
    }
    
    days.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date: isCurrentMonth ? date : null,
      isToday,
      isSelected,
      isSelectable: isCurrentMonth && !isPast,
      hasAvailability
    })
  }
  
  return days
})

const availableTimeSlots = computed(() => {
  if (!selectedDate.value) return []
  const date = selectedDate.value
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return getAvailableSlots(props.mentor.id, dateString)
})

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (date: Date) => {
  selectedDate.value = date
  selectedTimeSlot.value = null
  emitUpdate()
}

const selectTimeSlot = (slot: AvailabilitySlot) => {
  selectedTimeSlot.value = slot
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', {
    date: selectedDate.value,
    timeSlot: selectedTimeSlot.value,
    duration: selectedDuration.value
  })
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours || '0')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Watch for duration changes
watch(selectedDuration, () => {
  emitUpdate()
})

// Initialize with mentor's availability
onMounted(async () => {
  await fetchAvailability(props.mentor.id)
})
</script>

<style scoped>
.booking-calendar {
  @apply w-full;
}
</style>
