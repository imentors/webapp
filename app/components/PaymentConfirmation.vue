<template>
  <div class="text-center py-8">
    <!-- Success Icon -->
    <div class="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
      <Icon name="heroicons:check" class="w-8 h-8 text-green-600 dark:text-green-400" />
    </div>

    <!-- Success Message -->
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Payment Successful!
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Your session has been booked and payment processed successfully.
    </p>

    <!-- Booking Details -->
    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
      <h4 class="font-medium text-gray-900 dark:text-white mb-4">Booking Details</h4>
      
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Session:</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ booking.title }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Mentor:</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ mentorName }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Date:</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(booking.date) }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Time:</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ booking.time }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Duration:</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ booking.duration }} minutes</span>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Amount Paid:</span>
            <span class="font-bold text-gray-900 dark:text-white">${{ booking.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Details -->
    <div class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4 mb-8 max-w-md mx-auto">
      <div class="flex items-start space-x-3">
        <Icon name="heroicons:credit-card" class="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
        <div class="text-left text-sm">
          <p class="text-teal-800 dark:text-teal-200 font-medium mb-1">
            Payment Method
          </p>
          <p class="text-teal-700 dark:text-teal-300">
            {{ paymentMethod }} ending in {{ lastFourDigits }}
          </p>
          <p
            v-if="paymentIntent && paymentIntent.id"
            class="text-teal-600 dark:text-teal-400 text-xs mt-1"
          >
            Transaction ID: {{ paymentIntent?.id }}
          </p>
        </div>
      </div>
    </div>

    <!-- Next Steps -->
    <div class="space-y-4">
      <h4 class="font-medium text-gray-900 dark:text-white">What's Next?</h4>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <Icon name="heroicons:envelope" class="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Email Confirmation</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">Check your email for booking details</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <Icon name="heroicons:video-camera" class="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Meeting Link</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">You'll receive the link 24h before</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
      <UButton
        to="/bookings"
        icon="heroicons:calendar-days"
        size="lg"
      >
        View My Bookings
      </UButton>
      
      <UButton
        variant="outline"
        icon="heroicons:arrow-down-tray"
        size="lg"
        @click="downloadReceipt"
      >
        Download Receipt
      </UButton>
    </div>

    <!-- Support -->
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Need help with your booking?
      </p>
      <UButton
        variant="ghost"
        size="sm"
        icon="heroicons:chat-bubble-left-right"
        @click="contactSupport"
      >
        Contact Support
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef, computed } from 'vue'
interface Props {
  booking: {
    title: string
    date: string
    time: string
    duration: number
    price: number
  }
  mentorName: string
  paymentIntent?: {
    id: string
    payment_method?: {
      card?: {
        brand: string
        last4: string
      }
    }
  }
}

const props = defineProps<Props>()
// Expose `paymentIntent` as a ref so it can be used directly in the template
const paymentIntent = toRef(props, 'paymentIntent')

const paymentMethod = computed(() => {
  const card = paymentIntent.value?.payment_method?.card
  if (card?.brand) {
    const brand = card.brand
    return `${brand.charAt(0).toUpperCase() + brand.slice(1)} ****`
  }
  return 'Card ****'
})

const lastFourDigits = computed(() => {
  return paymentIntent.value?.payment_method?.card?.last4 || '0000'
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const downloadReceipt = () => {
  // Ensure we have a payment intent before generating a receipt
  if (!paymentIntent.value?.id) return

  // Generate and download receipt
  const receiptData = {
    transactionId: paymentIntent.value.id,
    date: new Date().toISOString(),
    booking: props.booking,
    mentor: props.mentorName,
    paymentMethod: paymentMethod.value + lastFourDigits.value
  }
  
  const dataStr = JSON.stringify(receiptData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt-${paymentIntent.value.id}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const contactSupport = () => {
  navigateTo('/support')
}
</script>
