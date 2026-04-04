import type { Booking } from '~/types'

export interface Review {
  id: string
  bookingId: string
  mentorId: string
  menteeId: string
  rating: number
  comment?: string
  createdAt: Date
  mentee?: {
    id: string
    name: string
    image?: string | null
  }
}

interface ReviewRequest {
  bookingId: string
  rating: number
  comment?: string
}

interface ReviewsResponse {
  reviews: Review[]
  total: number
  limit: number
  offset: number
}

export const useReviews = () => {
  const reviews = ref<Review[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  /**
   * Create a review for a completed booking
   */
  const createReview = async (reviewData: ReviewRequest): Promise<Review> => {
    isSubmitting.value = true
    error.value = null
    try {
      const data = await $fetch<{ review: Review }>('/api/reviews', {
        method: 'POST',
        body: reviewData
      })

      const newReview: Review = {
        ...data.review,
        createdAt: new Date(data.review.createdAt),
      }

      reviews.value.push(newReview)
      return newReview
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to create review'
      console.error('[useReviews] Error:', e)
      throw e
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Fetch reviews for a mentor
   */
  const fetchReviewsByMentor = async (mentorId: string, limit = 10, offset = 0) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch<ReviewsResponse>('/api/reviews', {
        query: { mentorId, limit, offset }
      })

      reviews.value = data.reviews.map(r => ({
        ...r,
        createdAt: new Date(r.createdAt),
      }))
      
      return data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch reviews'
      console.error('[useReviews] Error:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch review for a specific booking
   */
  const fetchReviewByBooking = async (bookingId: string): Promise<Review | null> => {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch<ReviewsResponse>('/api/reviews', {
        query: { bookingId }
      })

      if (data.reviews.length > 0) {
        const review = {
          ...data.reviews[0],
          createdAt: new Date(data.reviews[0].createdAt),
        }
        return review
      }
      return null
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch review'
      console.error('[useReviews] Error:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check if a booking has been reviewed
   */
  const hasReview = async (bookingId: string): Promise<boolean> => {
    try {
      const review = await fetchReviewByBooking(bookingId)
      return review !== null
    } catch {
      return false
    }
  }

  return {
    reviews: readonly(reviews),
    isLoading: readonly(isLoading),
    isSubmitting: readonly(isSubmitting),
    error: readonly(error),
    createReview,
    fetchReviewsByMentor,
    fetchReviewByBooking,
    hasReview,
  }
}















