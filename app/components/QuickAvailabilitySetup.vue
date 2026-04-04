<template>
  <div>

    <div class="space-y-6">
      <!-- Setup Method Selection -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Choose Setup Method</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            @click="setupMethod = 'template'"
            :class="[
              'p-4 rounded-lg border-2 text-left transition-colors',
              setupMethod === 'template'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <Icon name="heroicons:document-duplicate" class="w-6 h-6 text-primary-500 mb-2" />
            <h5 class="font-medium text-gray-900 dark:text-white">Use Template</h5>
            <p class="text-sm text-gray-600 dark:text-gray-400">Choose from common schedules</p>
          </button>
          
          <button
            @click="setupMethod = 'custom'"
            :class="[
              'p-4 rounded-lg border-2 text-left transition-colors',
              setupMethod === 'custom'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 text-primary-500 mb-2" />
            <h5 class="font-medium text-gray-900 dark:text-white">Custom Setup</h5>
            <p class="text-sm text-gray-600 dark:text-gray-400">Configure your own schedule</p>
          </button>
        </div>
      </div>

      <!-- Template Selection -->
      <div v-if="setupMethod === 'template'">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Select Template</h4>
        <div class="space-y-3">
          <div
            v-for="template in templates"
            :key="template.id"
            @click="selectedTemplate = template.id"
            :class="[
              'p-4 rounded-lg border cursor-pointer transition-colors',
              selectedTemplate === template.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <div class="flex justify-between items-start">
              <div>
                <h5 class="font-medium text-gray-900 dark:text-white">{{ template.name }}</h5>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ template.description }}</p>
                <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ template.totalHours }}h/week</span>
                  <span>{{ template.days.length }} days</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div v-for="day in template.days.slice(0, 3)" :key="day">{{ day }}</div>
                  <div v-if="template.days.length > 3" class="text-gray-400">+{{ template.days.length - 3 }} more</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Setup -->
      <div v-if="setupMethod === 'custom'">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Custom Schedule</h4>
        
        <!-- Working Days -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Working Days
          </label>
          <div class="grid grid-cols-7 gap-2">
            <div
              v-for="(day, index) in dayNames"
              :key="index"
              @click="toggleDay(index)"
              :class="[
                'p-2 text-center text-sm rounded-lg cursor-pointer transition-colors',
                customSetup.workingDays.includes(index)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              {{ day }}
            </div>
          </div>
        </div>

        <!-- Working Hours -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <UFormField label="Start Time">
            <UInput v-model="customSetup.startTime" type="time" class="w-full" />
          </UFormField>
          <UFormField label="End Time">
            <UInput v-model="customSetup.endTime" type="time" class="w-full" />
          </UFormField>
        </div>

        <!-- Break Time -->
        <div class="mb-6">
          <UCheckbox
            v-model="customSetup.hasBreak"
            label="Include lunch break"
          />
          
          <div v-if="customSetup.hasBreak" class="grid grid-cols-2 gap-4 mt-3">
            <UFormField label="Break Start">
              <UInput v-model="customSetup.breakStart" type="time" class="w-full" />
            </UFormField>
            <UFormField label="Break End">
              <UInput v-model="customSetup.breakEnd" type="time" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Session Duration -->
        <div class="mb-6">
          <UFormField label="Preferred Session Duration">
            <USelect
              v-model="customSetup.sessionDuration"
              :items="[
                { label: '30 minutes', value: 30 },
                { label: '1 hour', value: 60 },
                { label: '1.5 hours', value: 90 },
                { label: '2 hours', value: 120 }
              ]"
              option-attribute="label"
            />
          </UFormField>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="previewSlots.length > 0" class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Preview</h4>
        <div class="space-y-2">
          <div v-for="(daySlots, day) in groupedPreview" :key="day" class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
              {{ getDayName(parseInt(day)) }}
            </span>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="slot in daySlots"
                :key="slot.id"
                class="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded"
              >
                {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
              </span>
            </div>
          </div>
        </div>
        <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Total: {{ totalPreviewHours }} hours per week
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <UButton @click="$emit('close')" variant="ghost">
          Cancel
        </UButton>
        <UButton
          @click="applySetup"
          :disabled="previewSlots.length === 0"
          :loading="isApplying"
        >
          Apply Schedule
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeSlot } from '~/types'

interface Emits {
  (e: 'setup-complete', availability: TimeSlot[]): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const setupMethod = ref<'template' | 'custom'>('template')
const selectedTemplate = ref<string>('')
const isApplying = ref(false)

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const customSetup = ref({
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  startTime: '09:00',
  endTime: '17:00',
  hasBreak: true,
  breakStart: '12:00',
  breakEnd: '13:00',
  sessionDuration: 60
})

const templates = [
  {
    id: 'business-hours',
    name: 'Business Hours',
    description: 'Monday to Friday, 9 AM to 5 PM with lunch break',
    totalHours: 35,
    days: ['Mon-Fri', '9:00-12:00', '13:00-17:00'],
    slots: generateBusinessHoursSlots()
  },
  {
    id: 'flexible',
    name: 'Flexible Schedule',
    description: 'Monday to Sunday, morning and evening slots',
    totalHours: 28,
    days: ['Mon-Sun', '8:00-10:00', '18:00-20:00'],
    slots: generateFlexibleSlots()
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Friday evening, Saturday and Sunday',
    totalHours: 20,
    days: ['Fri 18:00-20:00', 'Sat-Sun 10:00-18:00'],
    slots: generateWeekendSlots()
  },
  {
    id: 'part-time',
    name: 'Part-time',
    description: 'Tuesday, Thursday, Saturday mornings',
    totalHours: 12,
    days: ['Tue', 'Thu', 'Sat 9:00-13:00'],
    slots: generatePartTimeSlots()
  }
]

const previewSlots = computed(() => {
  if (setupMethod.value === 'template' && selectedTemplate.value) {
    const template = templates.find(t => t.id === selectedTemplate.value)
    return template?.slots || []
  } else if (setupMethod.value === 'custom') {
    return generateCustomSlots()
  }
  return []
})

const groupedPreview = computed(() => {
  return previewSlots.value.reduce((acc, slot) => {
    const day = slot.dayOfWeek.toString()
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)
})

const totalPreviewHours = computed(() => {
  return previewSlots.value.reduce((total, slot) => {
    const start = new Date(`2000-01-01T${slot.startTime}:00`)
    const end = new Date(`2000-01-01T${slot.endTime}:00`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return total + hours
  }, 0).toFixed(1)
})

function generateBusinessHoursSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let day = 1; day <= 5; day++) { // Monday to Friday
    slots.push(
      {
        id: `template-business-${day}-morning`,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '12:00',
        isAvailable: true
      },
      {
        id: `template-business-${day}-afternoon`,
        dayOfWeek: day,
        startTime: '13:00',
        endTime: '17:00',
        isAvailable: true
      }
    )
  }
  return slots
}

function generateFlexibleSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let day = 1; day <= 7; day++) { // Monday to Sunday
    slots.push(
      {
        id: `template-flexible-${day}-morning`,
        dayOfWeek: day % 7,
        startTime: '08:00',
        endTime: '10:00',
        isAvailable: true
      },
      {
        id: `template-flexible-${day}-evening`,
        dayOfWeek: day % 7,
        startTime: '18:00',
        endTime: '20:00',
        isAvailable: true
      }
    )
  }
  return slots
}

function generateWeekendSlots(): TimeSlot[] {
  return [
    {
      id: 'template-weekend-friday',
      dayOfWeek: 5,
      startTime: '18:00',
      endTime: '20:00',
      isAvailable: true
    },
    {
      id: 'template-weekend-saturday',
      dayOfWeek: 6,
      startTime: '10:00',
      endTime: '18:00',
      isAvailable: true
    },
    {
      id: 'template-weekend-sunday',
      dayOfWeek: 0,
      startTime: '10:00',
      endTime: '18:00',
      isAvailable: true
    }
  ]
}

function generatePartTimeSlots(): TimeSlot[] {
  return [
    {
      id: 'template-parttime-tuesday',
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '13:00',
      isAvailable: true
    },
    {
      id: 'template-parttime-thursday',
      dayOfWeek: 4,
      startTime: '09:00',
      endTime: '13:00',
      isAvailable: true
    },
    {
      id: 'template-parttime-saturday',
      dayOfWeek: 6,
      startTime: '09:00',
      endTime: '13:00',
      isAvailable: true
    }
  ]
}

function generateCustomSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  
  for (const day of customSetup.value.workingDays) {
    if (customSetup.value.hasBreak) {
      // Morning slot
      slots.push({
        id: `custom-${day}-morning`,
        dayOfWeek: day,
        startTime: customSetup.value.startTime,
        endTime: customSetup.value.breakStart,
        isAvailable: true
      })
      
      // Afternoon slot
      slots.push({
        id: `custom-${day}-afternoon`,
        dayOfWeek: day,
        startTime: customSetup.value.breakEnd,
        endTime: customSetup.value.endTime,
        isAvailable: true
      })
    } else {
      // Full day slot
      slots.push({
        id: `custom-${day}-full`,
        dayOfWeek: day,
        startTime: customSetup.value.startTime,
        endTime: customSetup.value.endTime,
        isAvailable: true
      })
    }
  }
  
  return slots
}

const toggleDay = (dayIndex: number) => {
  const index = customSetup.value.workingDays.indexOf(dayIndex)
  if (index > -1) {
    customSetup.value.workingDays.splice(index, 1)
  } else {
    customSetup.value.workingDays.push(dayIndex)
    customSetup.value.workingDays.sort()
  }
}

const getDayName = (dayOfWeek: number) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || 'Unknown'
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours || '0')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const applySetup = async () => {
  isApplying.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    emit('setup-complete', previewSlots.value)
  } finally {
    isApplying.value = false
  }
}
</script>
