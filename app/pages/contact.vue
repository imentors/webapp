<template>
  <div class="py-12 sm:py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Have questions? We're here to help. Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <UInput
                id="name"
                v-model="form.name"
                placeholder="John Doe"
                required
                class="w-full"
                icon="heroicons:user"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <UInput
                id="email"
                v-model="form.email"
                type="email"
                placeholder="john@example.com"
                required
                class="w-full"
                icon="heroicons:envelope"
              />
            </div>
            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <UInput
                id="subject"
                v-model="form.subject"
                placeholder="How can we help?"
                required
                class="w-full"
                icon="heroicons:chat-bubble-left-right"
              />
            </div>
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <UTextarea
                id="message"
                v-model="form.message"
                placeholder="Tell us more about your inquiry..."
                required
                class="w-full"
                :rows="4"
              />
            </div>
            <UButton
              type="submit"
              block
              size="lg"
              :loading="submitting"
              color="primary"
            >
              Send Message
            </UButton>
          </form>
          
          <div v-if="success" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm flex items-center">
            <Icon name="heroicons:check-circle" class="w-5 h-5 mr-2" />
            Thank you! Your message has been sent successfully.
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Prefer to reach out directly? Here are other ways to contact our team.
            </p>
            
            <div class="space-y-4">
              <div class="flex items-start space-x-4">
                <div class="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:envelope" class="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">Email</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">support@imentorspro.com</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-4">
                <div class="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:map-pin" class="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">Office</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                    123 Innovation Drive,<br />
                    Tech Valley, CA 94043
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-gradient-to-br from-teal-600 to-teal-600 rounded-2xl text-white">
            <h4 class="font-bold mb-2">Are you a Mentor or Mentee?</h4>
            <p class="text-teal-50 text-sm mb-4">
              Check out our Help Center for answers to popular questions.
            </p>
            <UButton variant="outline" color="neutral" to="/faq">
              Visit FAQ
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const submitting = ref(false)
const success = ref(false)
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: { ...form }
    })
    
    success.value = true
    // Reset form
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      success.value = false
    }, 5000)
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.statusMessage || 'Failed to send message. Please try again later.',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

useSeoMeta({
  title: 'Contact Us - iMentorsPro',
  description: 'Reach out to the iMentorsPro team for any questions, support, or feedback.'
})
</script>
