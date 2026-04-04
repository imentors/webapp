import type { TimeSlot } from '~/types'

interface ApiSlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface ApiBooking {
  id: string
  scheduledDate: string
  duration: number
}

export const useAvailability = () => {
  const slots = ref<TimeSlot[]>([])
  const bookedSlots = ref<ApiBooking[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const transformSlot = (slot: ApiSlot): TimeSlot => ({
    id: slot.id,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isAvailable: slot.isAvailable,
  })

  const fetchAvailability = async (mentorId?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const params = mentorId ? `?mentorId=${mentorId}` : ''
      const response = await $fetch<{ slots: ApiSlot[], bookings?: ApiBooking[] }>(`/api/availability${params}`)
      slots.value = response.slots.map(transformSlot)
      bookedSlots.value = response.bookings || []
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch availability'
      console.error('[useAvailability] Error:', e)
    } finally {
      isLoading.value = false
    }
  }

  const addSlot = async (slot: Omit<TimeSlot, 'id'>) => {
    try {
      const response = await $fetch<{ slot: ApiSlot }>('/api/availability', {
        method: 'POST',
        body: {
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        },
      })
      slots.value.push(transformSlot(response.slot))
      return { success: true, slot: response.slot }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to add slot'
      return { success: false, error: error.value }
    }
  }

  const removeSlot = async (slotId: string) => {
    try {
      await $fetch(`/api/availability/${slotId}`, { method: 'DELETE' })
      slots.value = slots.value.filter(s => s.id !== slotId)
      return { success: true }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to remove slot'
      return { success: false, error: error.value }
    }
  }

  const bulkSetSlots = async (newSlots: Omit<TimeSlot, 'id'>[], replaceAll = false) => {
    isLoading.value = true
    try {
      const response = await $fetch<{ slots: ApiSlot[] }>('/api/availability/bulk', {
        method: 'POST',
        body: {
          slots: newSlots.map(s => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            isAvailable: s.isAvailable,
          })),
          replaceAll,
        },
      })

      if (replaceAll) {
        slots.value = response.slots.map(transformSlot)
      } else {
        slots.value.push(...response.slots.map(transformSlot))
      }

      return { success: true }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to set availability'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const clearAllSlots = async () => {
    isLoading.value = true
    try {
      await $fetch('/api/availability/clear', { method: 'DELETE' })
      slots.value = []
      return { success: true }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to clear availability'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Computed helpers
  const groupedByDay = computed(() => {
    return slots.value.reduce((acc, slot) => {
      const day = slot.dayOfWeek.toString()
      if (!acc[day]) acc[day] = []
      acc[day].push(slot)
      return acc
    }, {} as Record<string, TimeSlot[]>)
  })

  const totalHours = computed(() => {
    return slots.value.reduce((total, slot) => {
      const [startH, startM] = slot.startTime.split(':').map(Number)
      const [endH, endM] = slot.endTime.split(':').map(Number)
      const hours = (endH + endM / 60) - (startH + startM / 60)
      return total + hours
    }, 0)
  })

  const activeDays = computed(() => {
    return new Set(slots.value.map(s => s.dayOfWeek)).size
  })

  const getAvailableSlots = (mentorId: string, dateStr: string): AvailabilitySlot[] => {
    // dateStr is YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number)
    // Create date at noon to avoid midnight timezone shifts
    const d = new Date(year, month - 1, day, 12, 0, 0)
    const dayOfWeek = d.getDay()

    // Find recurring slots for this day
    const daySlots = slots.value.filter(s => s.dayOfWeek === dayOfWeek && s.isAvailable)

    const availableSlots: AvailabilitySlot[] = []

    daySlots.forEach(slot => {
      // Generate 30-min intervals
      const [startH, startM] = slot.startTime.split(':').map(Number)
      const [endH, endM] = slot.endTime.split(':').map(Number)

      let currentH = startH
      let currentM = startM

      // Convert to minutes for easier comparison
      const endMinutes = endH * 60 + endM

      while (true) {
        const currentTotalMinutes = currentH * 60 + currentM
        const nextTotalMinutes = currentTotalMinutes + 30

        if (nextTotalMinutes > endMinutes) break

        const timeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`

        let nextH = Math.floor(nextTotalMinutes / 60)
        let nextM = nextTotalMinutes % 60
        const endTimeStr = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`

        // Check if this slot overlaps with any existing booking
        const slotStart = new Date(year, month - 1, day, currentH, currentM)
        const slotEnd = new Date(year, month - 1, day, nextH, nextM)

        const isBooked = bookedSlots.value.some(booking => {
          const bookingDate = new Date(booking.scheduledDate)
          // Check if booking is on the same day
          if (bookingDate.getFullYear() !== year ||
            bookingDate.getMonth() !== month - 1 ||
            bookingDate.getDate() !== day) {
            return false
          }

          const bookingStart = bookingDate
          const bookingEnd = new Date(bookingDate.getTime() + booking.duration * 60000)

          // Check for overlap
          // Slot starts before booking ends AND slot ends after booking starts
          return slotStart < bookingEnd && slotEnd > bookingStart
        })

        if (!isBooked) {
          availableSlots.push({
            id: `${slot.id}-${timeStr}`,
            mentorId,
            date: dateStr,
            startTime: timeStr,
            endTime: endTimeStr,
            isBooked: false,
            isAvailable: true
          })
        }

        currentH = nextH
        currentM = nextM
      }
    })

    return availableSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return {
    slots: readonly(slots),
    isLoading: readonly(isLoading),
    error: readonly(error),
    groupedByDay,
    totalHours,
    activeDays,
    fetchAvailability,
    addSlot,
    removeSlot,
    bulkSetSlots,
    clearAllSlots,
    getAvailableSlots,
  }
}

