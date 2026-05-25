<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/" class="flex items-center">
            <img src="/logo.svg" alt="iMentorsPro" class="h-14 w-auto object-contain" />
          </NuxtLink>
          
          <div class="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" class="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition font-medium">How it works</a>
            <a href="#categories" class="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition font-medium">Categories</a>
            <NuxtLink :to="isAuthenticated ? '/mentors' : '/discover'" class="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition font-medium">Explore Mentors</NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <NuxtLink v-if="!isAuthenticated" to="/auth/login">
              <UButton variant="ghost" color="neutral">Log in</UButton>
            </NuxtLink>
            <NuxtLink v-if="!isAuthenticated" to="/auth/register?role=mentor">
              <UButton variant="outline" color="primary">Become a Mentor</UButton>
            </NuxtLink>
            <NuxtLink v-else to="/dashboard">
              <UButton variant="ghost" color="neutral">Dashboard</UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      <!-- Animated background orbs -->
      <div class="absolute top-20 left-[10%] w-72 h-72 bg-teal-400/20 dark:bg-teal-400/10 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-10 right-[5%] w-96 h-96 bg-navy-400/15 dark:bg-navy-400/10 rounded-full blur-3xl animate-float-delayed"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-200/10 dark:bg-teal-500/5 rounded-full blur-3xl animate-float-slow"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <!-- Left: Text Content -->
          <div class="text-left">
            
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
              Stop Figuring It Out 
              <span class="text-gradient-teal-navy">Alone</span>
            </h1>
            
            <p class="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-xl">
              Book a 1-on-1 session with a mentor who has already solved what you are stuck on. Real founders. Real experience. No courses, no content — just the right conversation.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 mb-8">
              <NuxtLink to="/discover">
                <UButton size="xl" class="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white border-none font-semibold shadow-lg shadow-[#10B981]/25">
                  <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
                  Find a Mentor
                </UButton>
              </NuxtLink>
              <NuxtLink to="/auth/register?role=mentor">
                <UButton size="xl" class="w-full sm:w-auto border border-gray-300 dark:border-white text-gray-700 dark:text-white bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 font-semibold">
                  <Icon name="heroicons:academic-cap" class="w-5 h-5 mr-2" />
                  Become a Mentor — It's Free
                </UButton>
              </NuxtLink>
            </div>
            
            <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center">
                <Icon name="heroicons:check-circle-solid" class="w-5 h-5 text-teal-500 mr-2" />
                Pay per session — no monthly fees
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle-solid" class="w-5 h-5 text-teal-500 mr-2" />
                Mentors with real founder experience
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle-solid" class="w-5 h-5 text-teal-500 mr-2" />
                Book in under 2 minutes
              </div>
            </div>
          </div>

          <!-- Right: Onboarding Banner -->
          <div class="hidden lg:flex items-center justify-center h-[520px] relative">
            <div class="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-navy-500/10 rounded-3xl blur-2xl pointer-events-none"></div>
            
            <div class="relative w-full max-w-md p-10 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800 shadow-2xl shadow-teal-500/10 text-center animate-float hover:scale-[1.01] transition-all duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/20">
                <Icon name="heroicons:sparkles" class="w-8 h-8 text-white" />
              </div>
              
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Founding Onboarding
              </h3>
              
              <p class="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Our founding mentors and coaches are being onboarded now — register to be among the first.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <NuxtLink to="/auth/register?role=mentor" class="flex-1">
                  <UButton size="lg" class="w-full justify-center bg-[#10B981] hover:bg-[#059669] text-white border-none font-semibold py-3 shrink-0">
                    <Icon name="heroicons:user-plus" class="w-5 h-5 mr-1" />
                    Become a Mentor
                  </UButton>
                </NuxtLink>
                <NuxtLink to="/auth/register?role=coach" class="flex-1">
                  <UButton size="lg" class="w-full justify-center bg-[#10B981] hover:bg-[#059669] text-white border-none font-semibold py-3 shrink-0">
                    <Icon name="heroicons:academic-cap" class="w-5 h-5 mr-1" />
                    Become a Coach
                  </UButton>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- Stats Section -->
    <section class="py-20 bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-navy-400/10 rounded-full blur-3xl"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="stat in stats" :key="stat.label" class="relative group h-full">
            <div class="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 h-full flex flex-col justify-start">
              <div class="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-white/10 shrink-0">
                <Icon :name="stat.icon" class="w-6 h-6 text-teal-300" />
              </div>
              <p class="text-xl lg:text-2xl font-extrabold text-white mb-2 leading-snug">
                {{ stat.value }}
              </p>
              <p class="text-sm text-navy-200 font-medium mt-auto">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-24 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <span class="inline-block px-4 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-sm font-semibold rounded-full mb-4">Simple Process</span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started in minutes and begin your journey to success
          </p>
        </div>

        <!-- Timeline -->
        <div class="relative max-w-4xl mx-auto">
          <!-- Vertical line -->
          <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400 via-teal-500 to-navy-500 -translate-x-1/2"></div>

          <div v-for="(step, index) in steps" :key="step.title" class="relative mb-12 last:mb-0">
            <div class="flex flex-col md:flex-row items-center gap-8" :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'">
              <!-- Content -->
              <div class="w-full md:w-[calc(50%-2rem)] p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg" :class="step.gradient">
                    {{ index + 1 }}
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ step.title }}</h3>
                </div>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ step.description }}</p>
              </div>

              <!-- Timeline dot -->
              <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-4 border-white dark:border-gray-950 z-10" :class="step.dotColor"></div>

              <!-- Spacer for the other side -->
              <div class="hidden md:block w-[calc(50%-2rem)]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section id="categories" class="py-24 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block px-4 py-1.5 bg-navy-50 dark:bg-navy-900/20 text-navy-600 dark:text-navy-400 text-sm font-semibold rounded-full mb-4">Browse Topics</span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Explore Categories
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find mentors and coaches across a wide range of industries and expertise areas
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <NuxtLink 
            v-for="category in featuredCategories" 
            :key="category.name"
            :to="isAuthenticated ? `/mentors?category=${encodeURIComponent(category.name)}` : '/discover'"
            class="group relative p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <!-- Gradient hover background -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" :class="category.hoverBg"></div>
            
            <div class="relative z-10">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" :class="category.bgColor">
                <Icon :name="category.icon" class="w-7 h-7" :class="category.iconColor" />
              </div>
              <h3 class="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-gray-900 dark:group-hover:text-white transition text-base">
                {{ category.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ category.count }}+ mentors</p>
            </div>
          </NuxtLink>
        </div>

        <div class="text-center mt-12">
          <NuxtLink :to="isAuthenticated ? '/mentors' : '/discover'">
            <UButton variant="outline" size="lg" class="px-8">
              View All Categories
              <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-2" />
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features — Bento Grid -->
    <section class="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block px-4 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-sm font-semibold rounded-full mb-4">Platform Features</span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Why Choose iMentorsPro?
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We've built the tools you need for a seamless mentorship experience
          </p>
        </div>

        <div class="bento-grid">
          <!-- Hero Feature -->
          <div class="bento-hero gradient-border-hover p-8 lg:p-10 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group">
            <div class="flex flex-col lg:flex-row lg:items-center gap-6">
              <div class="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                <Icon name="heroicons:shield-check" class="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Verified Experts Only
                </h3>
                <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  Every mentor and coach is carefully vetted for real-world experience. No self-proclaimed gurus — only proven operators, leaders, and practitioners who've delivered results.
                </p>
              </div>
            </div>
          </div>

          <!-- Regular features -->
          <div v-for="feature in features" :key="feature.title" class="gradient-border-hover p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" :class="feature.bgColor">
              <Icon :name="feature.icon" class="w-6 h-6" :class="feature.iconColor" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Founding Story Section -->
    <section class="py-24 bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-navy-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-navy-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/15">
          <Icon name="heroicons:book-open" class="w-8 h-8 text-teal-300" />
        </div>
        
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
          Be Part of Our Founding Story
        </h2>
        
        <p class="text-lg md:text-xl text-navy-200 max-w-2xl mx-auto leading-relaxed">
          The first mentors and founders on iMentorsPro are joining now.
        </p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
      <!-- Decorative orbs -->
      <div class="absolute top-10 left-[10%] w-64 h-64 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-[10%] w-72 h-72 bg-navy-200/20 dark:bg-navy-500/5 rounded-full blur-3xl"></div>

      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          Ready to Accelerate<br class="hidden sm:block" /> Your Career?
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of professionals who are already growing with iMentorsPro. 
          Start your journey today — it's free to get started.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/discover">
            <UButton size="xl" class="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white border-none font-semibold shadow-lg shadow-[#10B981]/25 px-8">
              <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
              Find a Mentor
            </UButton>
          </NuxtLink>
          <NuxtLink to="/auth/register?role=mentor">
            <UButton size="xl" class="w-full sm:w-auto border border-gray-300 dark:border-white text-gray-700 dark:text-white bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 font-semibold px-8">
              <Icon name="heroicons:academic-cap" class="w-5 h-5 mr-2" />
              Become a Mentor — It's Free
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth()

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'iMentorsPro — The Mentorship Marketplace for Founders',
  description: 'iMentorsPro connects founders and entrepreneurs with experienced mentors and coaches. Book 1-on-1 sessions, pay per booking. Real founders, real conversations',
  ogTitle: 'iMentorsPro — The Mentorship Marketplace for Founders',
  ogDescription: 'iMentorsPro connects founders and entrepreneurs with experienced mentors and coaches. Book 1-on-1 sessions, pay per booking. Real founders, real conversations',
  twitterCard: 'summary_large_image',
})


const stats = [
  { value: 'Now Onboarding', label: 'Founding Mentors', icon: 'heroicons:user-plus-solid', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400' },
  { value: 'Free to Join', label: 'As a Mentor', icon: 'heroicons:academic-cap-solid', bgColor: 'bg-navy-100 dark:bg-navy-900/30', iconColor: 'text-navy-600 dark:text-navy-400' },
  { value: 'Book in Minutes', label: 'Direct Connection', icon: 'heroicons:clock-solid', bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
  { value: '15-20%', label: 'Commission on Completed Sessions Only', icon: 'heroicons:banknotes-solid', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-500' },
]

const steps = [
  {
    title: 'Find your mentor',
    description: 'Browse by industry, challenge, or expertise. Every mentor is a real founder or operator.',
    gradient: 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-500/30',
    dotColor: 'bg-teal-400',
  },
  {
    title: 'Book in minutes',
    description: 'No gatekeepers. No cold emails. Choose a time and confirm instantly.',
    gradient: 'bg-gradient-to-br from-teal-500 to-navy-500 shadow-teal-500/30',
    dotColor: 'bg-teal-500',
  },
  {
    title: 'Move faster',
    description: 'Walk away with clarity, a decision made, and next steps you can act on.',
    gradient: 'bg-gradient-to-br from-navy-400 to-navy-600 shadow-navy-500/30',
    dotColor: 'bg-navy-400',
  },
]

const featuredCategories = [
  { name: 'Software Engineering', icon: 'heroicons:code-bracket', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', count: 120, hoverBg: 'bg-gradient-to-br from-teal-50/80 to-transparent dark:from-teal-900/20 dark:to-transparent' },
  { name: 'Product Management', icon: 'heroicons:cube', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', count: 85, hoverBg: 'bg-gradient-to-br from-teal-50/80 to-transparent dark:from-teal-900/20 dark:to-transparent' },
  { name: 'Data Science', icon: 'heroicons:chart-bar', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', count: 65, hoverBg: 'bg-gradient-to-br from-teal-50/80 to-transparent dark:from-teal-900/20 dark:to-transparent' },
  { name: 'UX Design', icon: 'heroicons:paint-brush', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', count: 70, hoverBg: 'bg-gradient-to-br from-teal-50/80 to-transparent dark:from-teal-900/20 dark:to-transparent' },
  { name: 'Marketing', icon: 'heroicons:megaphone', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', count: 55, hoverBg: 'bg-gradient-to-br from-teal-50/80 to-transparent dark:from-teal-900/20 dark:to-transparent' },
  { name: 'Leadership', icon: 'heroicons:user-group', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', count: 90, hoverBg: 'bg-gradient-to-br from-teal-50/80 to-transparent dark:from-teal-900/20 dark:to-transparent' },
  { name: 'Entrepreneurship', icon: 'heroicons:rocket-launch', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', count: 45, hoverBg: 'bg-gradient-to-br from-teal-50/80 to-transparent dark:from-teal-900/20 dark:to-transparent' },
  { name: 'Finance', icon: 'heroicons:banknotes', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', count: 40, hoverBg: 'bg-gradient-to-br from-teal-50/80 to-transparent dark:from-teal-900/20 dark:to-transparent' },
]

const features = [
  { title: 'Flexible Scheduling', description: 'Book sessions that fit your schedule with our intuitive calendar system.', icon: 'heroicons:calendar-days', bgColor: 'bg-navy-100 dark:bg-navy-900/30', iconColor: 'text-navy-600 dark:text-navy-400' },
  { title: 'HD Video Calls', description: 'Crystal-clear video meetings built right into the platform. No extra apps needed.', icon: 'heroicons:video-camera', bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
  { title: 'Direct Messaging', description: 'Stay connected with your mentor through our secure messaging system.', icon: 'heroicons:chat-bubble-left-right', bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
  { title: 'Secure Payments', description: 'Safe and secure payment processing with a money-back guarantee.', icon: 'heroicons:credit-card', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { title: 'AI Matching', description: 'Our smart algorithm helps you find the perfect mentor based on your goals.', icon: 'heroicons:sparkles', bgColor: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
]

</script>
