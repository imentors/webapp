<template>
  <footer class="bg-navy-900 dark:bg-navy-950 text-white">
    <!-- Newsletter Section -->
    <div class="border-b border-navy-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 class="text-xl font-bold text-white mb-1">Stay in the loop</h3>
            <p class="text-navy-300 text-sm">Get mentorship tips, new features, and exclusive updates delivered to your inbox.</p>
          </div>
          <div class="flex w-full md:w-auto gap-3">
            <UInput
              v-model="email"
              placeholder="Enter your email"
              class="w-full md:w-72"
              size="lg"
            />
            <UButton color="primary" size="lg" class="shrink-0 px-6">
              Subscribe
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <NuxtLink to="/" class="inline-block mb-5">
            <img src="/logo.svg" alt="iMentorsPro" class="h-14 w-auto object-contain brightness-0 invert" />
          </NuxtLink>
          <p class="text-navy-300 text-sm leading-relaxed">
            Connecting ambitious professionals with world-class mentors and coaches who've built, led, and scaled.
          </p>
        </div>
        
        <div>
          <h4 class="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Platform</h4>
          <ul class="space-y-3">
            <li><NuxtLink :to="isAuthenticated ? '/mentors' : '/discover'" class="text-navy-300 hover:text-teal-400 transition text-sm">Explore Mentors</NuxtLink></li>
            <li><NuxtLink to="/auth/register?role=mentor" class="text-navy-300 hover:text-teal-400 transition text-sm">Become a Mentor</NuxtLink></li>
            <li><NuxtLink to="/#how-it-works" class="text-navy-300 hover:text-teal-400 transition text-sm">How It Works</NuxtLink></li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Company</h4>
          <ul class="space-y-3">
            <li><NuxtLink to="/about" class="text-navy-300 hover:text-teal-400 transition text-sm">About Us</NuxtLink></li>
            <li><NuxtLink to="/contact" class="text-navy-300 hover:text-teal-400 transition text-sm">Contact Us</NuxtLink></li>
            <li><NuxtLink to="/faq" class="text-navy-300 hover:text-teal-400 transition text-sm">FAQ</NuxtLink></li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Legal</h4>
          <ul class="space-y-3">
            <li><NuxtLink to="/privacy" class="text-navy-300 hover:text-teal-400 transition text-sm">Privacy Policy</NuxtLink></li>
            <li><NuxtLink to="/terms" class="text-navy-300 hover:text-teal-400 transition text-sm">Terms of Service</NuxtLink></li>
            <li><NuxtLink to="/cookies" class="text-navy-300 hover:text-teal-400 transition text-sm">Cookie Policy</NuxtLink></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-navy-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-navy-400 text-sm">
          © {{ new Date().getFullYear() }} iMentorsPro. All rights reserved.
        </p>
        <div class="flex space-x-5">
          <a href="https://x.com/iMentorsPro" target="_blank" rel="noopener noreferrer" class="text-navy-400 hover:text-teal-400 transition-colors duration-200">
            <Icon name="simple-icons:twitter" class="w-5 h-5" />
          </a>
          <a href="https://www.linkedin.com/company/imentorspro/" target="_blank" rel="noopener noreferrer" class="text-navy-400 hover:text-teal-400 transition-colors duration-200">
            <Icon name="simple-icons:linkedin" class="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com/imentorspro?igsh=MWlyYjB2bHpiem9rZg==" target="_blank" rel="noopener noreferrer" class="text-navy-400 hover:text-teal-400 transition-colors duration-200">
            <Icon name="simple-icons:instagram" class="w-5 h-5" />
          </a>
          <a href="https://www.facebook.com/share/1APB3xEGtR/" target="_blank" rel="noopener noreferrer" class="text-navy-400 hover:text-teal-400 transition-colors duration-200">
            <Icon name="simple-icons:facebook" class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth()
const email = ref('')
</script>
