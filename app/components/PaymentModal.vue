<template>
  <UModal
    v-model:open="isOpen"
    :title="paymentCompleted ? 'Payment Confirmed' : 'Complete Your Payment'"
    :description="paymentCompleted ? undefined : `Booking: ${booking.title}`"
    :ui="{ footer: 'justify-end' }"
    @close="handleClose"
  >
    <template #body>
      <div v-if="!paymentCompleted" class="space-y-6">
        <StripePayment
          :amount="booking.price"
          :duration="booking.duration"
          :hourly-rate="mentorHourlyRate"
          :mentor-id="booking.mentorId"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
          ref="stripePayment"
        />
      </div>
      <div v-else-if="confirmedBooking && paymentIntent">
        <PaymentConfirmation
          :booking="bookingSummary"
          :mentor-name="mentorName"
          :payment-intent="paymentIntent"
        />
      </div>
    </template>

    <template #footer>
      <div v-if="!paymentCompleted" class="flex justify-end space-x-3">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          @click="isOpen = false"
          :disabled="isProcessingPayment"
        />
        <UButton
          label="Pay Now"
          @click="processPayment"
          :loading="isProcessingPayment"
        />
      </div>
      <div v-else class="flex justify-end">
        <UButton
          label="Close"
          @click="isOpen = false"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Booking } from '~/types'

interface Props {
  booking: Booking
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'payment-success'])

const isOpen = defineModel<boolean>('open', { default: false })

const { confirmBooking } = useBookings()
const toast = useToast()

const stripePayment = ref<any>(null)
const paymentIntent = ref<any>(null)
const paymentCompleted = ref(false)
const confirmedBooking = ref<Booking | null>(null)

const isProcessingPayment = computed(() => {
  return stripePayment.value?.isProcessingPayment ?? false
})

const mentorName = computed(() => {
  if (!props.booking.mentor) return 'Mentor'
  return `${props.booking.mentor.firstName} ${props.booking.mentor.lastName}`
})

const mentorHourlyRate = computed(() => {
  return props.booking.mentor?.hourlyRate || 0
})

const bookingSummary = computed(() => {
  return {
    title: props.booking.title,
    date: props.booking.scheduledDate.toISOString().split('T')[0],
    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    }).format(props.booking.scheduledDate),
    duration: props.booking.duration,
    price: props.booking.price,
  }
})

const processPayment = () => {
  stripePayment.value?.processPayment?.()
}

const handlePaymentSuccess = async (payment: any) => {
  paymentIntent.value = payment
  
  try {
    const result = await confirmBooking(props.booking.id, payment.id)
    confirmedBooking.value = result as any
    paymentCompleted.value = true
    
    toast.add({
      title: 'Payment Successful!',
      description: 'Your booking has been confirmed.',
      color: 'success'
    })
    
    emit('payment-success', result)
  } catch (error) {
    toast.add({
      title: 'Confirmation Failed',
      description: 'Payment succeeded but confirmation failed. Please contact support.',
      color: 'error'
    })
  }
}

const handlePaymentError = (error: string) => {
  toast.add({
    title: 'Payment Failed',
    description: error,
    color: 'error'
  })
}

const handleClose = () => {
  if (paymentCompleted.value) {
    // Reset state after closing if payment was completed
    setTimeout(() => {
      paymentCompleted.value = false
      paymentIntent.value = null
      confirmedBooking.value = null
    }, 300)
  }
}

watch(isOpen, (newVal) => {
  if (!newVal) {
    emit('close')
  }
})
</script>
