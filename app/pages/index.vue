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
            <!-- Trust Badge -->
            <div class="inline-flex items-center px-4 py-2 bg-teal-50 dark:bg-teal-900/20 rounded-full text-teal-700 dark:text-teal-300 text-sm font-medium mb-8 animate-pulse-soft border border-teal-200/50 dark:border-teal-700/30">
              <Icon name="heroicons:sparkles-solid" class="w-4 h-4 mr-2" />
              Trusted by 10,000+ professionals worldwide
            </div>
            
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
              Access Mentors &amp; Coaches 
              <span class="text-gradient-teal-navy">Who've Built, Led, and Scaled</span>
            </h1>
            
            <p class="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-xl">
              Get direct, 1-on-1 guidance from proven operators, founders, and leaders — not theory. Book a session and start growing today.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 mb-8">
              <NuxtLink to="/discover">
                <UButton size="xl" class="w-full sm:w-auto btn-glow shadow-lg shadow-teal-500/20">
                  <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
                  Find a Mentor or Coach
                </UButton>
              </NuxtLink>
              <NuxtLink to="/auth/register?role=mentor">
                <UButton size="xl" variant="outline" class="w-full sm:w-auto">
                  <Icon name="heroicons:academic-cap" class="w-5 h-5 mr-2" />
                  Become a Mentor
                </UButton>
              </NuxtLink>
            </div>
            
            <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center">
                <Icon name="heroicons:check-circle-solid" class="w-5 h-5 text-teal-500 mr-2" />
                Free to browse
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle-solid" class="w-5 h-5 text-teal-500 mr-2" />
                Cancel anytime
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle-solid" class="w-5 h-5 text-teal-500 mr-2" />
                Vetted mentors only
              </div>
            </div>
          </div>

          <!-- Right: Floating Mentor Cards -->
          <div class="relative hidden lg:block h-[520px]">
            <!-- Card 1 - Top -->
            <div class="absolute top-0 right-8 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/30 p-6 border border-gray-100 dark:border-gray-700 animate-float z-20 hover:scale-[1.02] transition-transform duration-300">
              <div class="flex items-center space-x-4 mb-4">
                <div class="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/20">JD</div>
                <div class="text-left">
                  <h4 class="font-semibold text-gray-900 dark:text-white">Jane Doe</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Founder &amp; CEO</p>
                </div>
              </div>
              <div class="flex items-center space-x-1 mb-3">
                <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="w-4 h-4 text-yellow-400" />
                <span class="text-sm text-gray-500 ml-2 font-medium">5.0 (128)</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">Product Strategy</span>
                <span class="px-3 py-1 bg-navy-50 dark:bg-navy-900/30 text-navy-700 dark:text-navy-300 rounded-full text-xs font-medium">Leadership</span>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">From <span class="font-semibold text-gray-900 dark:text-white">$150</span>/hr</span>
                <span class="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full font-medium">Available</span>
              </div>
            </div>

            <!-- Card 2 - Middle left -->
            <div class="absolute top-40 left-0 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/30 p-5 border border-gray-100 dark:border-gray-700 animate-float-delayed z-10 hover:scale-[1.02] transition-transform duration-300">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-navy-400 to-navy-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-navy-500/20">MS</div>
                <div class="text-left">
                  <h4 class="font-semibold text-gray-900 dark:text-white text-sm">Michael Smith</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">VP of Engineering</p>
                </div>
              </div>
              <div class="flex items-center space-x-1 mb-3">
                <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="w-3.5 h-3.5 text-yellow-400" />
                <span class="text-xs text-gray-500 ml-1.5 font-medium">4.9 (96)</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">System Design</span>
                <span class="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">Career Growth</span>
              </div>
            </div>

            <!-- Card 3 - Bottom right -->
            <div class="absolute bottom-0 right-0 w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/30 p-5 border border-gray-100 dark:border-gray-700 animate-float-slow z-30 hover:scale-[1.02] transition-transform duration-300">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">AL</div>
                <div class="text-left">
                  <h4 class="font-semibold text-gray-900 dark:text-white text-sm">Amara Lee</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Marketing Director</p>
                </div>
              </div>
              <div class="flex items-center space-x-1 mb-3">
                <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="w-3.5 h-3.5 text-yellow-400" />
                <span class="text-xs text-gray-500 ml-1.5 font-medium">4.8 (72)</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-xs font-medium">Growth</span>
                <span class="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">Branding</span>
              </div>
            </div>

            <!-- Decorative floating badge -->
            <div class="absolute top-28 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-100 dark:border-gray-700 animate-float-slow z-40">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Icon name="heroicons:arrow-trending-up-solid" class="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Sessions this week</p>
                  <p class="text-sm font-bold text-gray-900 dark:text-white">+28%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof / Trusted By Bar -->
    <section class="py-10 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest mb-6">
          Trusted by professionals from
        </p>
        <div class="marquee-container">
          <div class="marquee-track">
            <span v-for="(company, idx) in [...trustedCompanies, ...trustedCompanies]" :key="idx" class="text-gray-300 dark:text-gray-600 font-bold text-2xl whitespace-nowrap select-none">
              {{ company }}
            </span>
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
          <div v-for="stat in stats" :key="stat.label" class="relative group">
            <div class="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
              <div class="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-white/10">
                <Icon :name="stat.icon" class="w-6 h-6 text-teal-300" />
              </div>
              <p class="text-3xl lg:text-4xl font-extrabold text-white mb-1">
                {{ stat.value }}
              </p>
              <p class="text-sm text-navy-200 font-medium">{{ stat.label }}</p>
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

    <!-- Testimonials -->
    <section class="py-24 bg-gradient-to-br from-navy-600 to-navy-900 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-navy-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-navy-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-16">
          <span class="inline-block px-4 py-1.5 bg-white/10 text-navy-100 text-sm font-semibold rounded-full mb-4 border border-white/10">Success Stories</span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            What Our Users Say
          </h2>
          <p class="text-lg text-navy-200 max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their careers
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="testimonial in testimonials" :key="testimonial.name" class="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
            <div class="flex items-center space-x-1 mb-5">
              <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="w-5 h-5 text-yellow-400" />
            </div>
            <p class="text-white/90 mb-8 leading-relaxed text-[15px]">
              "{{ testimonial.quote }}"
            </p>
            <div class="flex items-center space-x-3 mt-auto pt-5 border-t border-white/10">
              <div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/20" :class="testimonial.avatarBg">{{ testimonial.initials }}</div>
              <div>
                <p class="font-semibold text-white text-sm">{{ testimonial.name }}</p>
                <p class="text-sm text-navy-200">{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </div>
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
            <UButton size="xl" class="w-full sm:w-auto btn-glow shadow-lg shadow-teal-500/20 font-semibold px-8">
              <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
              Get Started for Free
            </UButton>
          </NuxtLink>
          <NuxtLink :to="isAuthenticated ? '/mentors' : '/discover'">
            <UButton size="xl" variant="outline" class="w-full sm:w-auto px-8">
              Browse Mentors &amp; Coaches
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
  title: 'iMentorsPro - Connect with Expert Mentors & Coaches',
  description: 'Accelerate your career growth with world-class mentors and coaches. Join iMentorsPro to find the perfect mentor or coach or share your expertise.',
  ogTitle: 'iMentorsPro - Professional Mentorship Platform',
  ogDescription: 'Connect with expert mentors and coaches and accelerate your career growth.',
  twitterCard: 'summary_large_image',
})

const trustedCompanies = [
  'Google', 'Microsoft', 'Amazon', 'Netflix', 'Stripe', 'Shopify', 'Airbnb', 'Meta', 'Apple', 'Spotify', 'Uber', 'LinkedIn'
]

const stats = [
  { value: '500+', label: 'Expert Mentors', icon: 'heroicons:academic-cap-solid', bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400' },
  { value: '10k+', label: 'Active Learners', icon: 'heroicons:users-solid', bgColor: 'bg-navy-100 dark:bg-navy-900/30', iconColor: 'text-navy-600 dark:text-navy-400' },
  { value: '25k+', label: 'Sessions Completed', icon: 'heroicons:video-camera-solid', bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
  { value: '4.9', label: 'Average Rating', icon: 'heroicons:star-solid', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-500' },
]

const steps = [
  {
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your goals, interests, and what you\'re looking to achieve in your career.',
    gradient: 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-500/30',
    dotColor: 'bg-teal-400',
  },
  {
    title: 'Find Your Perfect Mentor',
    description: 'Browse our curated list of mentors and coaches, filter by expertise, and find someone who aligns with your goals.',
    gradient: 'bg-gradient-to-br from-teal-500 to-navy-500 shadow-teal-500/30',
    dotColor: 'bg-teal-500',
  },
  {
    title: 'Book & Grow',
    description: 'Schedule sessions at your convenience, meet via video call, and start accelerating your career growth.',
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

const testimonials = [
  {
    quote: 'Found an amazing mentor who helped me transition from engineering to product management. Best investment in my career!',
    name: 'Sarah Kim',
    role: 'Product Manager @ Stripe',
    initials: 'SK',
    avatarBg: 'bg-gradient-to-br from-teal-400 to-teal-600',
  },
  {
    quote: 'As a mentor, I love how easy the platform makes it to manage bookings and connect with ambitious professionals.',
    name: 'David Rodriguez',
    role: 'VP Engineering @ Netflix',
    initials: 'DR',
    avatarBg: 'bg-gradient-to-br from-navy-400 to-navy-600',
  },
  {
    quote: 'The AI matching feature connected me with a mentor who understood exactly what I needed. Doubled my freelance rates in 3 months!',
    name: 'Alex Liu',
    role: 'Freelance Designer',
    initials: 'AL',
    avatarBg: 'bg-gradient-to-br from-pink-400 to-rose-500',
  },
]
</script>
