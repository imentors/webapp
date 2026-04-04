<template>
  <div class="space-y-6">
    <!-- Payment Method Selection -->
    <div>
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Payment Information
      </h4>
      
      <!-- Payment Summary -->
      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Session Duration:</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ duration }} minutes</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Hourly Rate:</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">${{ hourlyRate }}/hour</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Platform Fee:</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">${{ platformFee }}</span>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          <div class="flex justify-between items-center">
            <span class="text-base font-medium text-gray-900 dark:text-white">Total:</span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">${{ totalAmount }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="mb-6">
        <div class="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-white mb-4">
          <Icon name="heroicons:credit-card" class="w-5 h-5" />
          <span>Credit or Debit Card</span>
        </div>
      </div>
    </div>

    <!-- Card Payment Form -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Number <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div
              ref="cardNumberElement"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <Icon name="heroicons:credit-card" class="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <p v-if="cardErrors.cardNumber" class="mt-1 text-xs text-red-500">{{ cardErrors.cardNumber }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expiry Date <span class="text-red-500">*</span>
            </label>
            <div
              ref="cardExpiryElement"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <p v-if="cardErrors.cardExpiry" class="mt-1 text-xs text-red-500">{{ cardErrors.cardExpiry }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CVC <span class="text-red-500">*</span>
            </label>
            <div
              ref="cardCvcElement"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <p v-if="cardErrors.cardCvc" class="mt-1 text-xs text-red-500">{{ cardErrors.cardCvc }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cardholder Name <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="cardholderName"
            placeholder="Full name on card"
            class="w-full"
          />
          <p v-if="cardErrors.cardholderName" class="mt-1 text-xs text-red-500">{{ cardErrors.cardholderName }}</p>
        </div>
      </div>

      <!-- Billing Address -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h5 class="text-base font-medium text-gray-900 dark:text-white mb-4">
          Billing Address
        </h5>
        
        <div class="grid grid-cols-1 gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="billingAddress.firstName"
                placeholder="First name"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="billingAddress.lastName"
                placeholder="Last name"
                class="w-full"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address <span class="text-red-500">*</span>
            </label>
            <UInput
              v-model="billingAddress.address"
              placeholder="Street address"
              class="w-full"
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="billingAddress.city"
                placeholder="City"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="billingAddress.state"
                placeholder="State"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="billingAddress.zipCode"
                placeholder="ZIP"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Payment Method -->
    <div class="flex items-center space-x-2">
      <input
        id="save-payment"
        v-model="savePaymentMethod"
        type="checkbox"
        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
      />
      <label for="save-payment" class="text-sm text-gray-700 dark:text-gray-300">
        Save this payment method for future bookings
      </label>
    </div>

    <!-- Security Notice -->
    <div class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <Icon name="heroicons:shield-check" class="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
        <div class="text-sm">
          <p class="text-teal-800 dark:text-teal-200 font-medium mb-1">
            Secure Payment
          </p>
          <p class="text-teal-700 dark:text-teal-300">
            Your payment information is encrypted and secure. We use Stripe to process payments and never store your card details.
          </p>
        </div>
      </div>
    </div>

    <!-- Processing State -->
    <div v-if="isProcessingPayment" class="text-center py-4">
      <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
      <p class="text-sm text-gray-600 dark:text-gray-400">Processing your payment...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'

interface Props {
  amount: number
  duration: number
  hourlyRate: number
  mentorId: string
}

interface Emits {
  (e: 'payment-success', paymentIntent: any): void
  (e: 'payment-error', error: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Stripe configuration
// Stripe configuration
const config = useRuntimeConfig()
const stripePublishableKey = config.public.stripePublishableKey as string
let stripe: Stripe | null = null
let elements: StripeElements | null = null

// Component state
const cardholderName = ref('')
const savePaymentMethod = ref(false)
const isProcessingPayment = ref(false)

const cardErrors = ref({
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
  cardholderName: ''
})

const billingAddress = reactive({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
})

// Stripe elements
const cardNumberElement = ref<HTMLElement>()
const cardExpiryElement = ref<HTMLElement>()
const cardCvcElement = ref<HTMLElement>()

// Computed properties
const platformFee = computed(() => Math.round(props.amount * 0.1)) // 10% platform fee
const totalAmount = computed(() => props.amount + platformFee.value)

// Initialize Stripe
onMounted(async () => {
  try {
    stripe = await loadStripe(stripePublishableKey)
    if (stripe) {
      elements = stripe.elements({
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '6px'
          }
        }
      })

      // Create card elements
      if (elements && cardNumberElement.value && cardExpiryElement.value && cardCvcElement.value) {
        const cardNumber = elements.create('cardNumber')
        const cardExpiry = elements.create('cardExpiry')
        const cardCvc = elements.create('cardCvc')

        cardNumber.mount(cardNumberElement.value)
        cardExpiry.mount(cardExpiryElement.value)
        cardCvc.mount(cardCvcElement.value)

        // Handle real-time validation errors
        cardNumber.on('change', (event) => {
          cardErrors.value.cardNumber = event.error ? event.error.message : ''
        })

        cardExpiry.on('change', (event) => {
          cardErrors.value.cardExpiry = event.error ? event.error.message : ''
        })

        cardCvc.on('change', (event) => {
          cardErrors.value.cardCvc = event.error ? event.error.message : ''
        })
      }
    }
  } catch (error) {
    console.error('Failed to initialize Stripe:', error)
  }
})

const validateForm = () => {
  const errors: Record<string, string> = {}

  if (!cardholderName.value.trim()) {
    errors.cardholderName = 'Cardholder name is required'
  }

  if (!billingAddress.firstName.trim()) {
    errors.firstName = 'First name is required'
  }

  if (!billingAddress.lastName.trim()) {
    errors.lastName = 'Last name is required'
  }

  if (!billingAddress.address.trim()) {
    errors.address = 'Address is required'
  }

  if (!billingAddress.city.trim()) {
    errors.city = 'City is required'
  }

  if (!billingAddress.state.trim()) {
    errors.state = 'State is required'
  }

  if (!billingAddress.zipCode.trim()) {
    errors.zipCode = 'ZIP code is required'
  }

  return Object.keys(errors).length === 0
}

const processCardPayment = async () => {
  if (!stripe || !elements) {
    emit('payment-error', 'Payment system not initialized')
    return
  }

  if (!validateForm()) {
    emit('payment-error', 'Please fill in all required fields')
    return
  }

  isProcessingPayment.value = true

  try {
    // Create payment intent on the server
    const { data: paymentIntent } = await $fetch('/api/payments/create-intent', {
      method: 'POST',
      body: {
        amount: totalAmount.value * 100, // Convert to cents
        mentorId: props.mentorId,
        duration: props.duration
      }
    })

    // Confirm payment with Stripe
    const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
      paymentIntent.client_secret,
      {
        payment_method: {
          card: elements.getElement('cardNumber')!,
          billing_details: {
            name: cardholderName.value,
            address: {
              line1: billingAddress.address,
              city: billingAddress.city,
              state: billingAddress.state,
              postal_code: billingAddress.zipCode
            }
          }
        }
      }
    )

    if (error) {
      emit('payment-error', error.message || 'Payment failed')
    } else if (confirmedPayment) {
      emit('payment-success', confirmedPayment)
    }
  } catch (error: any) {
    emit('payment-error', error.message || 'Payment processing failed')
  } finally {
    isProcessingPayment.value = false
  }
}

// Expose methods for parent component
defineExpose({
  processPayment: processCardPayment,
  isProcessingPayment
})
</script>
