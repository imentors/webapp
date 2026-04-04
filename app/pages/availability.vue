<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Manage Your Availability</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Set your schedule to let mentees book sessions with you</p>
      </div>
      <div class="flex items-center space-x-3">
        <UButton
          v-if="!showBulkMode"
          @click="showBulkMode = true"
          variant="outline"
          icon="heroicons:calendar-days"
        >
          Bulk Edit
        </UButton>
        <UButton
          v-if="showBulkMode"
          @click="showBulkMode = false"
          variant="outline"
          icon="heroicons:x-mark"
        >
          Exit Bulk
        </UButton>
        <UButton
          @click="showQuickSetup = true"
          icon="heroicons:bolt"
          color="primary"
        >
          Quick Setup
        </UButton>
      </div>
    </div>
    
    <div v-if="isLoading" class="flex justify-center py-10">
      <UProgress animation="carousel" />
    </div>

    <div v-else-if="!isMentor" class="text-center py-10">
      <Icon name="heroicons:user-plus" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-4">You must be a mentor to set availability.</p>
      <UButton to="/onboarding/mentor" size="lg">Become a Mentor</UButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Calendar View -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <AvailabilityCalendar
            :availability="mentorAvailability"
            :bulk-mode="showBulkMode"
            @update-availability="updateAvailability"
            @select-date="handleDateSelect"
          />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Weekly Overview -->
        <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Icon name="heroicons:calendar-days" class="w-5 h-5 mr-2" />
            Weekly Overview
          </h3>
          
          <div v-if="mentorAvailability.length === 0" class="text-center py-8">
            <Icon name="heroicons:clock" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400 mb-4">No availability set yet</p>
            <UButton @click="showQuickSetup = true" size="sm">Get Started</UButton>
          </div>

          <div v-else class="space-y-3">
            <div v-for="(slots, day) in groupedAvailability" :key="day" class="border-l-4 border-primary-500 pl-4">
              <h4 class="font-medium text-gray-800 dark:text-gray-200 text-sm">{{ getDayName(parseInt(day)) }}</h4>
              <div class="space-y-1">
                <div v-for="slot in slots.slice(0, 2)" :key="slot.id" class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}</span>
                  <UButton
                    icon="heroicons:trash"
                    color="error"
                    variant="ghost"
                    size="xs"
                    @click="removeSlot(slot.id)"
                  />
                </div>
                <p v-if="slots.length > 2" class="text-xs text-gray-500">+{{ slots.length - 2 }} more</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <UButton
              @click="showQuickAdd = true"
              variant="outline"
              block
              icon="heroicons:plus"
            >
              Add Time Slot
            </UButton>
            <UButton
              @click="copyPreviousWeek"
              variant="outline"
              block
              icon="heroicons:arrow-path"
              :loading="isCopying"
            >
              Restore Schedule
            </UButton>
            <UButton
              @click="clearAllAvailability"
              variant="outline"
              color="error"
              block
              icon="heroicons:trash"
            >
              Clear All
            </UButton>
          </div>
        </div>

        <!-- Statistics -->
        <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Week</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Available Hours</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ totalAvailableHours }}h</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Time Slots</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ mentorAvailability.length }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Active Days</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ activeDays }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Setup Modal -->
    <UModal
      v-model:open="showQuickSetup"
      title="Quick Availability Setup"
      description="Set up your weekly availability with a few quick steps."
    >
      <template #body>
        <QuickAvailabilitySetup
          @setup-complete="handleQuickSetup"
          @close="showQuickSetup = false"
        />
      </template>
    </UModal>

    <!-- Quick Add Modal -->
    <UModal
      v-model:open="showQuickAdd"
      title="Add New Time Slot"
      description="Define a specific time slot for your availability."
    >
      <template #body>
        <div class="space-y-4 p-4">
          <UFormField label="Day of Week" name="dayOfWeek">
            <USelect
              v-model="newSlot.dayOfWeek"
              :items="dayOptions"
              value-attribute="value"
              option-attribute="label"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Start Time" name="startTime">
              <UInput v-model="newSlot.startTime" type="time" class="w-full" />
            </UFormField>

            <UFormField label="End Time" name="endTime">
              <UInput v-model="newSlot.endTime" type="time" class="w-full" />
            </UFormField>
          </div>
          
          <p v-if="slotValidationError" class="text-sm text-red-500">{{ slotValidationError }}</p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton @click="showQuickAdd = false" variant="ghost">Cancel</UButton>
          <UButton @click="addSlot" :loading="isAddingSlot" :disabled="!!slotValidationError">Add Slot</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TimeSlot } from '~/types'
import AvailabilityCalendar from '~/components/AvailabilityCalendar.vue'
import QuickAvailabilitySetup from '~/components/QuickAvailabilitySetup.vue'

definePageMeta({
  middleware: ['auth', 'onboarding']
})

const { user } = useAuth()
const toast = useToast()
const { 
  slots,
  isLoading: availabilityLoading,
  error: availabilityError,
  groupedByDay,
  totalHours,
  activeDays: composableActiveDays,
  fetchAvailability,
  addSlot: apiAddSlot,
  removeSlot: apiRemoveSlot,
  bulkSetSlots,
  clearAllSlots,
} = useAvailability()

const isLoading = ref(true)
const isAddingSlot = ref(false)
const isCopying = ref(false)
const showBulkMode = ref(false)
const showQuickSetup = ref(false)
const showQuickAdd = ref(false)

const isMentor = computed(() => user.value?.role === 'mentor')

// Use slots from composable
const mentorAvailability = computed<TimeSlot[]>(() => [...slots.value])

// Use grouped data from composable
const groupedAvailability = computed(() => groupedByDay.value)

// Use totalHours from composable
const totalAvailableHours = computed(() => totalHours.value.toFixed(1))

// Use activeDays from composable
const activeDays = computed(() => composableActiveDays.value)

const dayOptions = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
]

const newSlot = ref<Omit<TimeSlot, 'id' | 'isAvailable'>>({
  dayOfWeek: 0,
  startTime: '09:00',
  endTime: '17:00',
})

// Computed validation error
const slotValidationError = computed(() => {
  if (newSlot.value.startTime >= newSlot.value.endTime) {
    return 'End time must be after start time'
  }
  return null
})

const getDayName = (dayOfWeek: number) => {
  return dayOptions.find(day => day.value === dayOfWeek)?.label || 'Unknown'
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours || '0')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const fetchMentorData = async () => {
  isLoading.value = true
  await fetchAvailability()
  isLoading.value = false
}

const addSlot = async () => {
  if (slotValidationError.value) return
  
  isAddingSlot.value = true
  try {
    const result = await apiAddSlot({
      ...newSlot.value,
      isAvailable: true,
    })
    
    if (result.success) {
      toast.add({
        title: 'Slot Added',
        description: `Availability slot for ${getDayName(newSlot.value.dayOfWeek)} added successfully`,
        color: 'success'
      })
      newSlot.value = { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' }
      showQuickAdd.value = false
    } else {
      toast.add({
        title: 'Error',
        description: result.error || 'Failed to add slot',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  } finally {
    isAddingSlot.value = false
  }
}

const removeSlot = async (slotId: string) => {
  try {
    const result = await apiRemoveSlot(slotId)
    if (result.success) {
      toast.add({
        title: 'Slot Removed',
        description: 'Availability slot removed successfully',
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Error',
        description: result.error || 'Failed to remove slot',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  }
}

const updateAvailability = async (availability: TimeSlot[]) => {
  try {
    // Use bulkSetSlots with replaceAll=true to update all slots
    const slotsToSet = availability.map(slot => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
    }))
    const result = await bulkSetSlots(slotsToSet, true)
    if (result.success) {
      toast.add({
        title: 'Availability Updated',
        description: 'Your availability has been saved',
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Error',
        description: result.error || 'Failed to update availability',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  }
}

const handleDateSelect = (date: Date) => {
  // Handle date selection for detailed editing
  console.log('Selected date:', date)
}

const handleQuickSetup = async (availability: TimeSlot[]) => {
  await updateAvailability(availability)
  showQuickSetup.value = false
  toast.add({
    title: 'Quick Setup Complete',
    description: 'Your weekly availability has been configured',
    color: 'success'
  })
}

const copyPreviousWeek = async () => {
  // Since slots are recurring by dayOfWeek, "Copy Last Week" restores from saved schedule
  if (slots.value.length === 0) {
    toast.add({
      title: 'No Saved Schedule',
      description: 'You don\'t have any saved availability to restore. Use Quick Setup to create one.',
      color: 'warning'
    })
    return
  }
  
  isCopying.value = true
  try {
    // Re-fetch from database to restore any unsaved changes
    await fetchAvailability()
    toast.add({
      title: 'Schedule Restored',
      description: 'Your availability has been restored from your saved schedule',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to restore schedule',
      color: 'error'
    })
  } finally {
    isCopying.value = false
  }
}

const clearAllAvailability = async () => {
  try {
    const result = await clearAllSlots()
    if (result.success) {
      toast.add({
        title: 'Availability Cleared',
        description: 'All availability slots have been removed',
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Error',
        description: result.error || 'Failed to clear availability',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred',
      color: 'error'
    })
    console.error('Error clearing availability:', error)
  }
}

onMounted(() => {
  if (isMentor.value) {
    fetchMentorData()
  } else {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Add any specific styles for this page here */
</style>
