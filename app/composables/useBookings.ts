import type { Booking, BookingRequest, AvailabilitySlot, CalendarEvent } from '~/types'

export const useBookings = () => {
  const bookings = ref<Booking[]>([])
  const isLoading = ref(false)
  const isBooking = ref(false)

  /**
   * Fetch bookings for the current user
   */
  const fetchBookings = async (params?: { role?: 'mentor' | 'mentee'; status?: string }) => {
    isLoading.value = true
    try {
      const data = await $fetch('/api/bookings', { query: params })

      // Convert dates from strings to Date objects
      bookings.value = data.bookings.map((b: any) => ({
        ...b,
        scheduledDate: new Date(b.scheduledDate),
        createdAt: new Date(b.createdAt),
        confirmedAt: b.confirmedAt ? new Date(b.confirmedAt) : undefined,
        updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined,
      }))
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new booking with payment intent
   */
  const createBooking = async (bookingRequest: BookingRequest): Promise<{ booking: Booking; payment: { clientSecret: string; paymentIntentId: string } }> => {
    isBooking.value = true
    try {
      const data = await $fetch('/api/bookings', {
        method: 'POST',
        body: bookingRequest
      })

      const newBooking: Booking = {
        ...data.booking,
        scheduledDate: new Date(data.booking.scheduledDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      bookings.value.push(newBooking)

      return {
        booking: newBooking,
        payment: data.payment as { clientSecret: string; paymentIntentId: string }
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    } finally {
      isBooking.value = false
    }
  }

  /**
   * Confirm booking after successful payment
   */
  const confirmBooking = async (bookingId: string, paymentIntentId?: string): Promise<Booking> => {
    try {
      const data = await $fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        body: { paymentIntentId }
      })

      // Update local state
      const index = bookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = {
          ...bookings.value[index],
          status: 'confirmed',
          meetingLink: data.booking.meetingLink || undefined,
          paymentStatus: 'succeeded',
        } as Booking
      }

      return data.booking
    } catch (error) {
      console.error('Error confirming booking:', error)
      throw error
    }
  }

  /**
   * Cancel a pending booking (not allowed after confirmation)
   */
  const cancelBooking = async (bookingId: string): Promise<void> => {
    try {
      await $fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST'
      })

      // Update local state
      const index = bookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = {
          ...bookings.value[index],
          status: 'cancelled',
        } as Booking
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      throw error
    }
  }

  /**
   * Mark booking as complete (mentor only)
   */
  const completeBooking = async (bookingId: string): Promise<void> => {
    try {
      await $fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'POST'
      })

      // Update local state
      const index = bookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = {
          ...bookings.value[index],
          status: 'completed',
        } as Booking
      }
    } catch (error) {
      console.error('Error completing booking:', error)
      throw error
    }
  }

  /**
   * Get a single booking by ID
   */
  const getBookingById = async (id: string): Promise<Booking | null> => {
    try {
      const data = await $fetch(`/api/bookings/${id}`)
      return {
        ...data.booking,
        scheduledDate: new Date(data.booking.scheduledDate),
        createdAt: new Date(data.booking.createdAt),
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      return null
    }
  }

  // Computed getters
  const getUpcomingBookings = computed(() => {
    const now = new Date()
    return bookings.value
      .filter(booking => {
        const endTime = new Date(booking.scheduledDate.getTime() + booking.duration * 60000)
        return endTime > now && booking.status === 'confirmed'
      })
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  })

  const getPastBookings = computed(() => {
    const now = new Date()
    return bookings.value
      .filter(booking => {
        const endTime = new Date(booking.scheduledDate.getTime() + booking.duration * 60000)
        return (endTime <= now && booking.status === 'confirmed') || booking.status === 'completed'
      })
      .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime())
  })

  const getPendingBookings = computed(() => {
    const now = new Date()
    return bookings.value.filter(booking =>
      booking.status === 'pending' &&
      booking.scheduledDate > now
    )
  })

  const getConfirmedBookings = computed(() => {
    return bookings.value.filter(booking => booking.status === 'confirmed')
  })

  // Calendar events for display
  const getCalendarEvents = computed((): CalendarEvent[] => {
    return bookings.value.map(booking => ({
      id: booking.id,
      title: booking.title,
      start: booking.scheduledDate,
      end: new Date(booking.scheduledDate.getTime() + booking.duration * 60000),
      type: 'booking' as const,
      status: booking.status,
      mentorId: booking.mentorId,
      menteeId: booking.menteeId
    }))
  })

  const getTotalEarnings = computed(() => {
    return bookings.value
      .filter(booking => booking.status === 'completed')
      .reduce((total, booking) => total + (booking.price || 0), 0)
  })

  const getMonthlyEarnings = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return bookings.value
      .filter(booking => {
        const bookingDate = booking.scheduledDate
        return bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear &&
          booking.status === 'completed'
      })
      .reduce((total, booking) => total + (booking.price || 0), 0)
  })

  return {
    // State
    bookings: readonly(bookings),
    isLoading: readonly(isLoading),
    isBooking: readonly(isBooking),

    // Actions
    fetchBookings,
    createBooking,
    confirmBooking,
    cancelBooking,
    completeBooking,
    getBookingById,

    // Computed
    getUpcomingBookings,
    getPastBookings,
    getPendingBookings,
    getConfirmedBookings,
    getCalendarEvents,
    getTotalEarnings,
    getMonthlyEarnings
  }
}
