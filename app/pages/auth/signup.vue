<template>
  <div>
    <!-- Logo for mobile -->
    <div class="lg:hidden flex justify-center mb-8">
      <NuxtLink to="/" class="w-auto h-16 bg-gradient-to-br from-teal-600 to-teal-600 rounded-2xl flex items-center justify-center px-4 hover:opacity-90 transition-opacity">
        <img src="/logo.svg" alt="iMentorsPro" class="h-14 w-auto object-contain" />
      </NuxtLink>
    </div>

    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Join iMentor
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Choose how you want to use the platform
      </p>
    </div>

    <!-- Role Selection -->
    <div class="space-y-6">
      <div class="grid grid-cols-1 gap-4">
        <button
          type="button"
          @click="selectRole('mentee')"
          class="group p-6 rounded-2xl border-2 transition-all duration-200 text-left flex items-center space-x-4 border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20"
        >
          <div class="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center group-hover:bg-teal-600 transition-colors">
            <Icon name="heroicons:user" class="w-6 h-6 text-teal-600 group-hover:text-white" />
          </div>
          <div>
            <p class="font-bold text-lg text-gray-900 dark:text-white">Find a Mentor or Coach</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Learn from industry experts and grow your career</p>
          </div>
          <Icon name="heroicons:chevron-right" class="w-5 h-5 text-gray-400 ml-auto group-hover:text-teal-600" />
        </button>
        
        <button
          type="button"
          @click="selectRole('mentor')"
          class="group p-6 rounded-2xl border-2 transition-all duration-200 text-left flex items-center space-x-4 border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20"
        >
          <div class="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center group-hover:bg-teal-600 transition-colors">
            <Icon name="heroicons:academic-cap" class="w-6 h-6 text-teal-600 group-hover:text-white" />
          </div>
          <div>
            <p class="font-bold text-lg text-gray-900 dark:text-white">Become a Mentor or Coach</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Share your expertise and guide the next generation</p>
          </div>
          <Icon name="heroicons:chevron-right" class="w-5 h-5 text-gray-400 ml-auto group-hover:text-teal-600" />
        </button>
      </div>

      <div class="mt-8 text-center">
        <p class="text-gray-600 dark:text-gray-400">
          Already have an account?
          <NuxtLink
            to="/auth/login"
            class="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Sign in
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()

const selectRole = (role: UserRole) => {
  const query: any = { role }
  if (route.query.redirect) {
    query.redirect = route.query.redirect
  }
  
  // Mentees go to the discovery flow first
  if (role === 'mentee') {
    navigateTo({
      path: '/discover',
      query
    })
    return
  }
  
  navigateTo({
    path: '/auth/register',
    query
  })
}
</script>

