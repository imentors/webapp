<template>
  <div class="availability-calendar">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ bulkMode ? 'Bulk Edit Mode' : 'Weekly Availability' }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ bulkMode ? 'Select multiple slots to edit or delete' : 'Click on time slots to manage your availability' }}
        </p>
      </div>
      
      <div class="flex items-center space-x-2">
        <UButton
          @click="previousWeek"
          variant="ghost"
          size="sm"
          icon="heroicons:chevron-left"
        />
        <span class="text-sm font-medium text-gray-900 dark:text-white px-4">
          {{ currentWeekRange }}
        </span>
        <UButton
          @click="nextWeek"
          variant="ghost"
          size="sm"
          icon="heroicons:chevron-right"
        />
      </div>
    </div>

    <!-- Time Grid -->
    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
      <div class="grid grid-cols-8 gap-1 min-w-[800px]">
        <!-- Time column header -->
        <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
          Time
        </div>
        
        <!-- Day headers -->
        <div
          v-for="(day, index) in weekDays"
          :key="index"
          class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
        >
          <div>{{ day.name }}</div>
          <div class="text-xs text-gray-400">{{ day.date }}</div>
        </div>

        <!-- Time slots grid -->
        <template v-for="hour in timeSlots" :key="hour">
          <!-- Time label -->
          <div class="text-xs text-gray-500 dark:text-gray-400 py-2 text-center">
            {{ formatHour(hour) }}
          </div>
          
          <!-- Day slots -->
          <div
            v-for="(day, dayIndex) in weekDays"
            :key="`${hour}-${dayIndex}`"
            class="relative"
          >
            <button
              @click="toggleSlot(dayIndex, hour)"
              :class="[
                'w-full h-8 rounded text-xs transition-all duration-200 border',
                getSlotClass(dayIndex, hour),
                bulkMode && selectedSlots.has(`${dayIndex}-${hour}`) && 'ring-2 ring-primary-500'
              ]"
            >
              <span v-if="hasSlot(dayIndex, hour)" class="text-xs">
                {{ getSlotDuration(dayIndex, hour) }}
              </span>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="bulkMode && selectedSlots.size > 0" class="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm text-primary-700 dark:text-primary-300">
          {{ selectedSlots.size }} slot{{ selectedSlots.size > 1 ? 's' : '' }} selected
        </span>
        <div class="flex space-x-2">
          <UButton
            @click="bulkDelete"
            color="error"
            variant="outline"
            size="sm"
            icon="heroicons:trash"
          >
            Delete Selected
          </UButton>
          <UButton
            @click="clearSelection"
            variant="ghost"
            size="sm"
          >
            Clear Selection
          </UButton>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-6 flex flex-wrap items-center gap-4 text-sm">
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-green-200 dark:bg-green-800 border border-green-300 dark:border-green-700 rounded"></div>
        <span class="text-gray-600 dark:text-gray-400">Available</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-yellow-200 dark:bg-yellow-800 border border-yellow-300 dark:border-yellow-700 rounded"></div>
        <span class="text-gray-600 dark:text-gray-400">Partially Booked</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-red-200 dark:bg-red-800 border border-red-300 dark:border-red-700 rounded"></div>
        <span class="text-gray-600 dark:text-gray-400">Fully Booked</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"></div>
        <span class="text-gray-600 dark:text-gray-400">Unavailable</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeSlot } from '~/types'

interface Props {
  availability: TimeSlot[]
  bulkMode?: boolean
}

interface Emits {
  (e: 'update-availability', availability: TimeSlot[]): void
  (e: 'select-date', date: Date): void
}

interface WeekDay {
  name: string
  date: string
  fullDate: Date
}

const props = withDefaults(defineProps<Props>(), {
  bulkMode: false
})
const emit = defineEmits<Emits>()

const currentWeek = ref(new Date())
const selectedSlots = ref(new Set<string>())

const timeSlots = Array.from({ length: 24 }, (_, i) => i)

const weekDays = computed((): WeekDay[] => {
  const startOfWeek = new Date(currentWeek.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate().toString(),
      fullDate: date
    }
  })
})

const currentWeekRange = computed((): string => {
  const start = weekDays.value[0]?.fullDate
  const end = weekDays.value[6]?.fullDate
  
  if (!start || !end) return ''
  
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`
  } else {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`
  }
})

const formatHour = (hour: number): string => {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour} ${ampm}`
}

const hasSlot = (dayIndex: number, hour: number): boolean => {
  return props.availability.some(slot => 
    slot.dayOfWeek === dayIndex && 
    parseInt(slot.startTime?.split(':')[0] ?? '0') <= hour && 
    parseInt(slot.endTime?.split(':')[0] ?? '0') > hour
  )
}

const getSlotClass = (dayIndex: number, hour: number): string => {
  const slot = props.availability.find(s => 
    s.dayOfWeek === dayIndex && 
    parseInt(s.startTime?.split(':')[0] ?? '0') <= hour && 
    parseInt(s.endTime?.split(':')[0] ?? '0') > hour
  )
  
  if (!slot) {
    return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
  }
  
  if (slot.isAvailable) {
    return 'bg-green-200 dark:bg-green-800 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-700'
  } else {
    return 'bg-yellow-200 dark:bg-yellow-800 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
  }
}

const getSlotDuration = (dayIndex: number, hour: number): string => {
  const slot = props.availability.find(s => 
    s.dayOfWeek === dayIndex && 
    parseInt(s.startTime?.split(':')[0] ?? '0') <= hour && 
    parseInt(s.endTime?.split(':')[0] ?? '0') > hour
  )
  
  if (!slot) return ''
  
  const start = parseInt(slot.startTime?.split(':')[0] ?? '0')
  const end = parseInt(slot.endTime?.split(':')[0] ?? '0')
  const duration = end - start
  
  return `${duration}h`
}

const toggleSlot = (dayIndex: number, hour: number): void => {
  if (props.bulkMode) {
    const slotKey = `${dayIndex}-${hour}`
    if (selectedSlots.value.has(slotKey)) {
      selectedSlots.value.delete(slotKey)
    } else {
      selectedSlots.value.add(slotKey)
    }
    return
  }
  
  const existingSlotIndex = props.availability.findIndex(slot => 
    slot.dayOfWeek === dayIndex && 
    parseInt(slot.startTime?.split(':')[0] ?? '0') <= hour && 
    parseInt(slot.endTime?.split(':')[0] ?? '0') > hour
  )
  
  if (existingSlotIndex !== -1) {
    // Remove existing slot
    const newAvailability = [...props.availability]
    newAvailability.splice(existingSlotIndex, 1)
    emit('update-availability', newAvailability)
  } else {
    // Add new slot
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}-${dayIndex}-${hour}`,
      dayOfWeek: dayIndex,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      isAvailable: true
    }
    
    emit('update-availability', [...props.availability, newSlot])
  }
}

const bulkDelete = (): void => {
  const slotsToDelete = Array.from(selectedSlots.value).map(slotKey => {
    const parts = slotKey.split('-').map(Number)
    const dayIndex = parts[0] ?? 0
    const hour = parts[1] ?? 0
    return { dayIndex, hour }
  })
  
  const newAvailability = props.availability.filter(slot => {
    return !slotsToDelete.some(({ dayIndex, hour }) => 
      slot.dayOfWeek === dayIndex && 
      parseInt(slot.startTime?.split(':')[0] ?? '0') <= hour && 
      parseInt(slot.endTime?.split(':')[0] ?? '0') > hour
    )
  })
  
  emit('update-availability', newAvailability)
  clearSelection()
}

const clearSelection = (): void => {
  selectedSlots.value.clear()
}

const previousWeek = (): void => {
  const newDate = new Date(currentWeek.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeek.value = newDate
}

const nextWeek = (): void => {
  const newDate = new Date(currentWeek.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeek.value = newDate
}

// Clear selection when bulk mode is disabled
watch(() => props.bulkMode, (newValue) => {
  if (!newValue) {
    clearSelection()
  }
})
</script>

<style scoped>
.availability-calendar {
  width: 100%;
}
</style>
