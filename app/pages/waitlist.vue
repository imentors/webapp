<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Join Our Waitlist
        </h1>
        <p class="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Be the first to know when we launch our platform.
        </p>
      </div>

      <div class="flex justify-center">
        <WaitlistForm class="w-full max-w-md" />
      </div>

      <div class="mt-16 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Why Join?</h2>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3 mt-8">
          <div class="p-6 bg-white rounded-lg shadow">
            <div class="text-indigo-600 mb-4">
              <UIcon name="i-heroicons-sparkles" class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">Early Access</h3>
            <p class="mt-2 text-gray-600">Be among the first to experience our platform with exclusive early access.</p>
          </div>

          <div class="p-6 bg-white rounded-lg shadow">
            <div class="text-indigo-600 mb-4">
              <UIcon name="i-heroicons-bell-alert" class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">Updates</h3>
            <p class="mt-2 text-gray-600">Get notified about new features, updates, and special offers.</p>
          </div>

          <div class="p-6 bg-white rounded-lg shadow">
            <div class="text-indigo-600 mb-4">
              <UIcon name="i-heroicons-chat-bubble-left-right" class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">Community</h3>
            <p class="mt-2 text-gray-600">Join our growing community of like-minded individuals.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// This will be automatically imported by Nuxt 3
// import WaitlistForm from '~/components/WaitlistForm.vue'
</script>
