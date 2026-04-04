<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="flex min-h-screen">
      <!-- Left Side - Branding -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-700 pointer-events-none"></div>
        <div class="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <NuxtLink to="/" class="mb-8 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="iMentorsPro" class="h-16 w-auto object-contain" />
          </NuxtLink>
          
          <h1 class="text-4xl font-bold mb-4 text-center">
            Welcome to iMentorsPro
          </h1>
          
          <p class="text-xl text-teal-100 text-center max-w-md mb-8">
            Connect with world-class mentors and accelerate your career growth
          </p>

          <div class="grid grid-cols-1 gap-6 max-w-sm">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:users" class="w-4 h-4 text-white" />
              </div>
              <span class="text-teal-100">Expert mentors from top companies</span>
            </div>
            
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:calendar-days" class="w-4 h-4 text-white" />
              </div>
              <span class="text-teal-100">Flexible scheduling that fits your life</span>
            </div>
            
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:rocket-launch" class="w-4 h-4 text-white" />
              </div>
              <span class="text-teal-100">Accelerate your career growth</span>
            </div>
          </div>
        </div>

        <!-- Decorative Elements -->
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="absolute bottom-20 right-20 w-40 h-40 bg-teal-300/20 rounded-full blur-xl pointer-events-none"></div>
        <div class="absolute top-1/2 left-10 w-24 h-24 bg-teal-300/20 rounded-full blur-xl pointer-events-none"></div>
      </div>

      <!-- Right Side - Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
