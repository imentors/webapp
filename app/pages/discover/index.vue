<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Header -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-600 rounded-xl flex items-center justify-center">
              <Icon name="heroicons:academic-cap" class="w-5 h-5 text-white" />
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">iMentorsPro</span>
          </NuxtLink>
          
          <UButton variant="ghost" color="neutral" @click="exitFlow">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </UButton>
        </div>
      </div>
    </nav>

    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Step {{ currentStep }} of {{ totalSteps }}
          </p>
          <button 
            v-if="currentStep > 1"
            @click="previousStep"
            class="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center"
          >
            <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-1" />
            Back
          </button>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-teal-600 to-teal-600 h-2 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        <!-- Step 1: Goals -->
        <Transition name="slide" mode="out-in">
          <div v-if="currentStep === 1" key="step1" class="p-8">
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="heroicons:rocket-launch" class="w-8 h-8 text-white" />
              </div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                What brings you here?
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                Understanding your goals helps us find the right mentor for you. <br />
                <span class="font-medium text-teal-600 dark:text-teal-400">Select up to 2.</span>
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                v-for="option in goalOptions"
                :key="option.value"
                @click="toggleGoal(option.value)"
                :disabled="!responses.goals.includes(option.value) && responses.goals.length >= 2"
                :class="[
                  'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center space-x-4',
                  responses.goals.includes(option.value)
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : responses.goals.length >= 2
                      ? 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
              >
                <div :class="[
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  responses.goals.includes(option.value) 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                ]">
                  <Icon :name="option.icon" class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 dark:text-white truncate text-sm">{{ option.label }}</h3>
                </div>
                <Icon 
                  v-if="responses.goals.includes(option.value)"
                  name="heroicons:check-circle-solid" 
                  class="w-5 h-5 text-teal-500 ml-auto flex-shrink-0" 
                />
              </button>
            </div>
            <p v-if="responses.goals.length > 0" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {{ responses.goals.length }}/2 selected
            </p>
          </div>

          <!-- Step 2: Categories -->
          <div v-else-if="currentStep === 2" key="step2" class="p-8">
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="heroicons:squares-2x2" class="w-8 h-8 text-white" />
              </div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                What areas interest you?
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                Select up to 3 categories you'd like to focus on
              </p>
            </div>

            <div v-if="isLoadingCategories" class="grid grid-cols-2 gap-3">
              <div v-for="i in 8" :key="i" class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>

            <div v-else class="grid grid-cols-2 gap-3">
              <button
                v-for="category in availableCategories"
                :key="category"
                @click="toggleCategory(category)"
                :disabled="!responses.categories.includes(category) && responses.categories.length >= 3"
                :class="[
                  'p-4 rounded-xl border-2 text-left transition-all duration-200',
                  responses.categories.includes(category)
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : responses.categories.length >= 3
                      ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-500'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-gray-900 dark:text-white text-sm">{{ category }}</span>
                  <Icon 
                    v-if="responses.categories.includes(category)"
                    name="heroicons:check-circle-solid" 
                    class="w-5 h-5 text-teal-500 flex-shrink-0" 
                  />
                </div>
              </button>
            </div>

            <p v-if="responses.categories.length > 0" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {{ responses.categories.length }}/3 selected
            </p>
          </div>

          <!-- Step 3: Journey Stage -->
          <div v-else-if="currentStep === 3" key="step3" class="p-8">
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="heroicons:map" class="w-8 h-8 text-white" />
              </div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Where are you in your journey?
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                This helps us match you with the right level of guidance
              </p>
            </div>

            <div class="space-y-3">
              <button
                v-for="option in journeyOptions"
                :key="option.value"
                @click="selectJourney(option.value)"
                :class="[
                  'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center space-x-4',
                  responses.journeyStage === option.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
              >
                <div :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold',
                  responses.journeyStage === option.value 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                ]">
                  {{ option.emoji }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{{ option.label }}</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ option.description }}</p>
                  <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-2 font-medium">Examples: {{ option.examples.join(' • ') }}</p>
                </div>
                <Icon 
                  v-if="responses.journeyStage === option.value"
                  name="heroicons:check-circle-solid" 
                  class="w-6 h-6 text-green-500 ml-auto flex-shrink-0" 
                />
              </button>
            </div>
          </div>

          <!-- Step 4: Session Type -->
          <div v-else-if="currentStep === 4" key="step4" class="p-8">
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="heroicons:calendar-days" class="w-8 h-8 text-white" />
              </div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                What type of mentoring?
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                Choose the format that works best for you
              </p>
            </div>

            <div class="space-y-3">
              <button
                v-for="option in sessionOptions"
                :key="option.value"
                @click="selectSessionType(option.value)"
                :class="[
                  'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center space-x-4',
                  responses.sessionType === option.value
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
              >
                <div :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  responses.sessionType === option.value 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                ]">
                  <Icon :name="option.icon" class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ option.label }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ option.description }}</p>
                </div>
                <Icon 
                  v-if="responses.sessionType === option.value"
                  name="heroicons:check-circle-solid" 
                  class="w-6 h-6 text-orange-500 ml-auto flex-shrink-0" 
                />
              </button>
            </div>
          </div>
          <div v-else-if="currentStep === 5" key="step5" class="p-8">
            <div class="text-center mb-8">
              <p class="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Step 5 of 5 — almost there</p>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Choose your mentor experience level
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                We’ll match you with proven operators aligned to your ambition.
              </p>
              
              <div class="mt-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl inline-flex items-center text-sm text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800">
                <Icon name="heroicons:shield-check" class="w-4 h-4 mr-2 text-teal-500" />
                Vetted for experience, integrity, and real-world impact.
              </div>
            </div>

            <div class="space-y-3">
              <button
                v-for="option in budgetOptions"
                :key="option.value"
                @click="selectBudget(option.value)"
                :class="[
                  'w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-start space-x-4',
                  responses.budget === option.value
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
              >
                <div :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl',
                  responses.budget === option.value 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                ]">
                  {{ option.emoji }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="font-bold text-gray-900 dark:text-white flex items-center">
                      {{ option.label }}
                      <span v-if="option.subtitle" class="ml-2 text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">{{ option.subtitle }}</span>
                    </h3>
                    <span class="text-sm font-semibold text-teal-600 dark:text-teal-400">{{ option.price }}</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1 leading-snug">{{ option.description }}</p>
                  <p v-if="option.outcomes" class="text-xs text-gray-500 dark:text-gray-500 font-medium italic border-t border-gray-100 dark:border-gray-700 pt-1 mt-1">
                    {{ option.outcomes }}
                  </p>
                </div>
                <Icon 
                  v-if="responses.budget === option.value"
                  name="heroicons:check-circle-solid" 
                  class="w-6 h-6 text-teal-500 flex-shrink-0 mt-1" 
                />
              </button>
            </div>
          </div>
        </Transition>

        <!-- Footer -->
        <div class="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
          <UButton
            @click="handleContinue"
            :disabled="!canProceed"
            size="lg"
            class="w-full justify-center"
            :loading="isNavigating"
          >
            <span v-if="currentStep === totalSteps">Find My Mentors</span>
            <span v-else>Continue</span>
            <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-2" />
          </UButton>
        </div>
      </div>

      <!-- Trust indicators -->
      <div class="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
        <div class="flex items-center">
          <Icon name="heroicons:shield-check" class="w-5 h-5 text-green-500 mr-2" />
          Verified mentors
        </div>
        <div class="flex items-center">
          <Icon name="heroicons:lock-closed" class="w-5 h-5 text-teal-500 mr-2" />
          Private & secure
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'Find Your Perfect Mentor - iMentorsPro',
  description: 'Answer a few questions and we\'ll match you with the perfect mentor for your goals.',
})

const { user, refreshSession, isAuthenticated } = useAuth()
const toast = useToast()

const {
  currentStep,
  totalSteps,
  responses,
  progress,
  canProceed,
  nextStep,
  previousStep,
  setGoals,
  setCategories,
  setJourneyStage,
  setSessionType,
  setBudget,
  getMentorsUrl,
  reset,
} = useMenteeDiscovery()

// Fetch categories from API
const isLoadingCategories = ref(true)
const availableCategories = ref<string[]>([])

onMounted(async () => {
  // Reset the flow to ensure fresh start on page load/refresh
  reset()

  try {
    const response = await $fetch<{ categories: string[], skills: string[] }>('/api/mentors/filters')
    availableCategories.value = response.categories
  } catch (e) {
    console.error('Failed to load categories:', e)
    // Fallback categories
    availableCategories.value = [
      'Software Engineering',
      'Product Management',
      'Data Science',
      'UX Design',
      'Marketing',
      'Leadership',
      'Entrepreneurship',
      'Finance'
    ]
  } finally {
    isLoadingCategories.value = false
  }
})

const isNavigating = ref(false)

// Options data
const goalOptions = [
  { 
    value: 'career-advancement', 
    label: 'Career Advancement', 
    icon: 'heroicons:arrow-trending-up'
  },
  { 
    value: 'skill-development', 
    label: 'Skill Development', 
    icon: 'heroicons:academic-cap'
  },
  { 
    value: 'leadership', 
    label: 'Leadership Guidance', 
    icon: 'heroicons:user-group'
  },
  { 
    value: 'career-transition', 
    label: 'Career Transition', 
    icon: 'heroicons:arrows-right-left'
  },
  { 
    value: 'entrepreneurship', 
    label: 'Business & Entrepreneurship', 
    icon: 'heroicons:building-office'
  },
  { 
    value: 'scaling-growth', 
    label: 'Scaling & Growth', 
    icon: 'heroicons:chart-bar'
  },
  { 
    value: 'confidence-clarity', 
    label: 'Confidence & Clarity', 
    icon: 'heroicons:sparkles'
  },
  { 
    value: 'burnout-balance', 
    label: 'Burnout & Balance', 
    icon: 'heroicons:scale'
  },
  { 
    value: 'accountability-focus', 
    label: 'Accountability & Focus', 
    icon: 'heroicons:flag'
  },
  { 
    value: 'not-sure', 
    label: 'Not sure yet', 
    icon: 'heroicons:question-mark-circle'
  },
]

const journeyOptions = [
  { 
    value: 'exploring', 
    label: 'Exploring & Starting', 
    description: 'I’m just getting started or figuring things out',
    emoji: '🔍',
    examples: ['Early career', 'First-time founder', 'Career switcher']
  },
  { 
    value: 'building', 
    label: 'Building & Growing', 
    description: 'I’m actively building skills, confidence, or a business',
    emoji: '🏗️',
    examples: ['Growing professional', 'Startup founder (0–3 yrs)', 'New manager']
  },
  { 
    value: 'scaling', 
    label: 'Scaling & Leading', 
    description: 'I’m leading teams, scaling impact, or making big decisions',
    emoji: '🚀',
    examples: ['Business owner', 'Senior professional', 'Scale-up founder']
  },
  { 
    value: 'reinventing', 
    label: 'Transitioning or Reinventing', 
    description: 'I’m navigating change or redefining my next chapter',
    emoji: '🔄',
    examples: ['Exit / pivot', 'Burnout recovery', 'New industry move']
  },
]

const sessionOptions = [
  { 
    value: 'one-time', 
    label: 'One-Time Consultation', 
    description: 'Get specific advice on a particular challenge',
    icon: 'heroicons:chat-bubble-left-right'
  },
  { 
    value: 'ongoing', 
    label: 'Regular Mentorship', 
    description: 'Ongoing guidance over weeks or months',
    icon: 'heroicons:calendar'
  },
  { 
    value: 'project', 
    label: 'Project-Based', 
    description: 'Help with a specific project or goal',
    icon: 'heroicons:clipboard-document-check'
  },
  { 
    value: 'not-sure', 
    label: 'Not Sure Yet', 
    description: 'I\'ll figure it out as I explore',
    icon: 'heroicons:question-mark-circle'
  },
]

const budgetOptions = [
  { 
    value: 'under-50', 
    label: 'Foundation Level', 
    price: 'Under $50 / hour',
    description: 'For early-stage founders, professionals, and creators seeking clarity and direction.',
    outcomes: 'Best for validation, positioning, confidence-building, and first momentum.',
    emoji: '🌱'
  },
  { 
    value: '50-100', 
    label: 'Growth Level', 
    price: '$50 – $100 / hour',
    subtitle: '(Most chosen)',
    description: 'Experienced mentors who’ve helped others navigate growth decisions and execution.',
    outcomes: 'Ideal for traction, strategy, prioritisation, and building repeatable progress.',
    emoji: '🚀'
  },
  { 
    value: '100-200', 
    label: 'Scale Level', 
    price: '$100 – $200 / hour',
    description: 'Senior operators and leaders with hands-on scaling experience.',
    outcomes: 'Best for hiring, systems, revenue growth, and leadership challenges.',
    emoji: '📊'
  },
  { 
    value: '200-plus', 
    label: 'Elite Level', 
    price: '$200+ / hour',
    description: 'Top-tier founders, executives, and industry experts.',
    outcomes: 'Designed for high-stakes decisions, rapid scale, and complex strategic challenges.',
    emoji: '🧠'
  },
  { 
    value: 'flexible', 
    label: 'Help me decide', 
    price: 'Let iMentorsPro recommend the best matches',
    description: 'We’ll suggest mentors based on your goals, stage, urgency, and preferences.',
    emoji: '✨'
  },
]

// Handlers
const toggleGoal = (goal: string) => {
  const current = [...responses.value.goals]
  const index = current.indexOf(goal)
  if (index > -1) {
    current.splice(index, 1)
  } else if (current.length < 2) {
    current.push(goal)
  }
  setGoals(current)
}

const toggleCategory = (category: string) => {
  const current = [...responses.value.categories]
  const index = current.indexOf(category)
  if (index > -1) {
    current.splice(index, 1)
  } else if (current.length < 3) {
    current.push(category)
  }
  setCategories(current)
}

const selectJourney = (stage: string) => {
  setJourneyStage(stage)
}

const selectSessionType = (type: string) => {
  setSessionType(type)
}

const selectBudget = (budget: string) => {
  setBudget(budget)
}

const handleContinue = async () => {
  if (currentStep.value === totalSteps) {
    isNavigating.value = true
    
    // If user is logged in, mark onboarding as complete
    if (isAuthenticated.value && user.value) {
      try {
        await $fetch('/api/onboarding/complete', {
          method: 'POST',
          body: {
            profile: {
              firstName: user.value.firstName || '',
              lastName: user.value.lastName || '',
              bio: '',
            },
            roleData: {
              goals: responses.value.goals,
              interests: responses.value.categories,
              journeyStage: responses.value.journeyStage,
            },
            preferences: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              languages: ['English'],
              emailNotifications: true,
              weeklyDigest: true,
              marketingEmails: false,
            }
          }
        })
        await refreshSession()
      } catch (e) {
        console.error('Failed to complete onboarding:', e)
        // Continue anyway to the filtered mentors page
      }
    }
    
    navigateTo(getMentorsUrl())
  } else {
    nextStep()
  }
}

const exitFlow = () => {
  reset()
  navigateTo('/')
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
