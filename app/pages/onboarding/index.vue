<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Complete Your Profile
          </h1>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Step {{ currentStep }} of {{ totalSteps }}
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-teal-600 to-teal-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Step 1: Welcome & Role Confirmation -->
        <div v-if="currentStep === 1" class="p-8">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:hand-raised" class="w-10 h-10 text-white" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to iMentorsPro — Mentor & Coach Onboarding, {{ parsedName.firstName || 'there' }}!
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Let's set up your profile so you can get the most out of your mentoring journey.
            </p>
          </div>

          <div class="max-w-md mx-auto">

            <div v-if="userRole === 'mentor'" class="mb-8">
              <p class="font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Are you a mentor or a coach?
              </p>
              <div class="grid grid-cols-2 gap-4">
                <button
                  v-for="role in ['mentor', 'coach']"
                  :key="role"
                  @click="mentorForm.roleTitle = role"
                  :class="[
                    'px-4 py-3 rounded-xl border-2 transition-all duration-200 capitalize font-medium',
                    mentorForm.roleTitle === role
                      ? 'border-teal-600 bg-teal-50 text-teal-600 dark:bg-teal-900/20'
                      : 'border-gray-200 hover:border-teal-300 dark:border-gray-700 dark:hover:border-teal-500 text-gray-600 dark:text-gray-400'
                  ]"
                >
                  {{ role }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Basic Profile Info -->
        <div v-else-if="currentStep === 2" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Tell us about your experience
          </h2>
          
          <UForm :state="profileForm" class="space-y-6">
            <!-- Profile Photo Upload -->
            <div class="flex flex-col items-center mb-6">
              <div class="relative group">
                <UAvatar
                  :src="profileForm.profileImage"
                  :alt="`${profileForm.firstName} ${profileForm.lastName}`"
                  size="3xl"
                  class="border-4 border-gray-200 dark:border-gray-600"
                />
                <label 
                  class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <input 
                    type="file" 
                    class="hidden" 
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    @change="handleProfileImageUpload"
                  />
                  <div v-if="isUploadingImage" class="text-white">
                    <UIcon name="heroicons:arrow-path" class="animate-spin w-8 h-8" />
                  </div>
                  <div v-else class="text-center text-white">
                    <UIcon name="heroicons:camera" class="w-8 h-8 mb-1" />
                    <p class="text-xs">Upload Photo</p>
                  </div>
                </label>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Add a professional photo to help mentees connect with you
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="First Name" name="firstName" required>
                <UInput
                  v-model="profileForm.firstName"
                  placeholder="Your first name"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Last Name" name="lastName" required>
                <UInput
                  v-model="profileForm.lastName"
                  placeholder="Your last name"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Bio" name="bio" required>
              <UTextarea
                v-model="profileForm.bio"
                placeholder="Describe your experience and what you can help with..."
                :rows="4"
                resize
                class="w-full"
              />
            </UFormField>

            <UFormField label="Location (Optional)" name="location">
              <GooglePlacesAutocomplete
                v-model="profileForm.location"
                placeholder="Search for your city"
                size="lg"
                icon="heroicons:map-pin"
              />
            </UFormField>
          </UForm>
        </div>

        <!-- Step 3: Mentor Expertise -->
        <div v-else-if="currentStep === 3" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Expertise & Credentials
          </h2>
          
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Experience level" name="experience" required>
                <USelect
                  v-model="mentorForm.experience"
                  :items="experienceOptions"
                  placeholder="Select your experience level"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Hourly Rate (USD)" name="hourlyRate" required>
                <UInput
                  v-model="mentorForm.hourlyRate"
                  type="number"
                  placeholder="75"
                  size="lg"
                  icon="heroicons:currency-dollar"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Date of Birth" name="dateOfBirth" required>
                <UInput
                  v-model="mentorForm.dateOfBirth"
                  type="date"
                  size="lg"
                  icon="heroicons:calendar"
                  class="w-full"
                  :color="mentorForm.dateOfBirth && !isOldEnough ? 'error' : undefined"
                />
                <p v-if="mentorForm.dateOfBirth && !isOldEnough" class="text-xs text-red-600 mt-1">
                  You must be at least 18 years old.
                </p>
              </UFormField>

              <UFormField label="Expertise Document" name="expertiseDocument" required help="Upload a portfolio, certificate, or CV that proves your expertise (PDF, Word, or Image).">
                <div class="flex items-center space-x-3 w-full">
                  <UInput
                    type="file"
                    size="lg"
                    icon="heroicons:document-text"
                    class="flex-1"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    @change="handleFileUpload"
                  />
                  <div v-if="isUploading" class="flex items-center">
                    <UIcon name="heroicons:arrow-path" class="animate-spin w-5 h-5 text-teal-600" />
                  </div>
                  <div v-else-if="mentorForm.expertiseDocument" class="flex items-center">
                    <UIcon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p v-if="mentorForm.expertiseDocument" class="text-xs text-gray-500 mt-1 truncate max-w-xs">
                  Uploaded: {{ mentorForm.expertiseDocument.split('/').pop() }}
                </p>
              </UFormField>
            </div>

            <!-- ID Document Upload -->
            <UFormField label="ID Document" name="idDocument" required help="Upload a government-issued ID (Passport, National ID, or Driver's License) for identity verification.">
              <div class="flex items-center space-x-3 w-full">
                <UInput
                  type="file"
                  size="lg"
                  icon="heroicons:identification"
                  class="flex-1"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  @change="handleIdDocumentUpload"
                />
                <div v-if="isUploadingId" class="flex items-center">
                  <UIcon name="heroicons:arrow-path" class="animate-spin w-5 h-5 text-teal-600" />
                </div>
                <div v-else-if="mentorForm.idDocument" class="flex items-center">
                  <UIcon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p v-if="mentorForm.idDocument" class="text-xs text-gray-500 mt-1 truncate max-w-xs">
                Uploaded: {{ mentorForm.idDocument.split('/').pop() }}
              </p>
              <p class="text-xs text-gray-400 mt-2">
                <UIcon name="heroicons:lock-closed" class="w-3 h-3 inline" />
                Your ID is securely stored and only used for verification purposes.
              </p>
            </UFormField>
          </div>
        </div>

        <!-- Step 4: What can you help people with? (3-layer expertise) -->
        <div v-else-if="currentStep === 4" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            What can you help people with?
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            Select your core areas of expertise. These are used to match you with the right mentees.
          </p>
          
          <div class="space-y-8">
            <!-- Layer 1: Core Domains -->
            <UFormField label="Core Domains" name="coreDomains" required help="Select up to 3 high-level areas you specialize in.">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  v-for="domain in coreDomainOptions"
                  :key="domain.value"
                  type="button"
                  @click="toggleCoreDomain(domain.value)"
                  :disabled="!mentorForm.coreDomains.includes(domain.value) && mentorForm.coreDomains.length >= 3"
                  :class="[
                    'p-3 rounded-xl border-2 text-left transition-all duration-200 text-sm font-medium',
                    mentorForm.coreDomains.includes(domain.value)
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : mentorForm.coreDomains.length >= 3
                        ? 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed text-gray-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-500 text-gray-700 dark:text-gray-300'
                  ]"
                >
                  {{ domain.label }}
                </button>
              </div>
              <p v-if="mentorForm.coreDomains.length > 0" class="text-xs text-gray-500 mt-2">{{ mentorForm.coreDomains.length }}/3 selected</p>
            </UFormField>

            <!-- Layer 2: Practical Expertise -->
            <UFormField label="Practical Expertise" name="practicalExpertise" required help="Select the specific skills and areas you can help with.">
              <div class="space-y-3">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="expertise in practicalExpertiseOptions"
                    :key="expertise.value"
                    type="button"
                    @click="togglePracticalExpertise(expertise.value)"
                    :class="[
                      'px-3 py-1.5 rounded-full border text-sm transition-all duration-200',
                      mentorForm.practicalExpertise.includes(expertise.value)
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 text-gray-700 dark:text-gray-300'
                    ]"
                  >
                    {{ expertise.label }}
                  </button>
                </div>
                <p v-if="mentorForm.practicalExpertise.length > 0" class="text-xs text-gray-500">{{ mentorForm.practicalExpertise.length }} selected</p>
              </div>
            </UFormField>

            <!-- Layer 3: Experience Context (Optional) -->
            <UFormField label="Experience Context" name="experienceContext" help="Optional: At what stage do you typically help people? Select all that apply.">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="context in experienceContextOptions"
                  :key="context.value"
                  type="button"
                  @click="toggleExperienceContext(context.value)"
                  :class="[
                    'px-3 py-1.5 rounded-full border text-sm transition-all duration-200',
                    mentorForm.experienceContext.includes(context.value)
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 text-gray-700 dark:text-gray-300'
                  ]"
                >
                  {{ context.label }}
                </button>
              </div>
            </UFormField>
          </div>
        </div>

        <!-- Step 5: Who do you help most? -->
        <div v-else-if="currentStep === 5" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Who do you help most?
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            Select the groups that align best with your expertise and experience. <br />
            <span class="font-medium text-teal-600 dark:text-teal-400">Select up to 2.</span>
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              v-for="option in targetAudienceOptions"
              :key="option.value"
              @click="toggleTargetAudience(option.value)"
              :disabled="!mentorForm.targetAudience.includes(option.value) && mentorForm.targetAudience.length >= 2"
              :class="[
                'p-6 rounded-2xl border-2 text-left transition-all duration-200 h-full flex flex-col',
                mentorForm.targetAudience.includes(option.value)
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : mentorForm.targetAudience.length >= 2
                    ? 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-500'
              ]"
            >
              <span class="font-bold text-gray-900 dark:text-white block mb-2">{{ option.label }}</span>
              <Icon 
                v-if="mentorForm.targetAudience.includes(option.value)"
                name="heroicons:check-circle-solid" 
                class="w-6 h-6 text-teal-500 mt-auto self-end" 
              />
            </button>
          </div>
          <p v-if="mentorForm.targetAudience.length > 0" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {{ mentorForm.targetAudience.length }}/2 selected
          </p>
        </div>

        <!-- Step 6: Support Type -->
        <div v-else-if="currentStep === 6" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What type of support do you mainly offer?
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            This helps us match you with mentees seeking your specific style of guidance.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              v-for="option in supportTypeOptions"
              :key="option.value"
              @click="toggleSupportType(option.value)"
              :class="[
                'p-6 rounded-2xl border-2 text-left transition-all duration-200 h-full flex flex-col',
                mentorForm.supportTypes.includes(option.value)
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-500'
              ]"
            >
              <span class="font-bold text-gray-900 dark:text-white block mb-2">{{ option.label }}</span>
              <Icon 
                v-if="mentorForm.supportTypes.includes(option.value)"
                name="heroicons:check-circle-solid" 
                class="w-6 h-6 text-teal-500 mt-auto self-end" 
              />
            </button>
          </div>
          <p v-if="mentorForm.supportTypes.length > 0" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {{ mentorForm.supportTypes.length }} selected
          </p>
        </div>

        <!-- Step 7: Preferences -->
        <div v-else-if="currentStep === 7" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Mentor Availability & Preferences
          </h2>
          
          <div class="space-y-6">
            <UFormField label="Timezone" name="timezone" required>
              <USelect
                v-model="preferencesForm.timezone"
                :items="timezoneOptions"
                placeholder="Select your timezone"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Languages" name="languages" required>
              <USelectMenu
                v-model="preferencesForm.languages"
                :items="languageOptions"
                multiple
                placeholder="Languages you speak"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Communication Preferences
              </h3>
              
              <UCheckbox
                v-model="preferencesForm.emailNotifications"
                label="Email notifications for new messages and bookings"
              />
              
              <UCheckbox
                v-model="preferencesForm.weeklyDigest"
                label="Weekly digest with platform updates"
              />
              
              <UCheckbox
                v-model="preferencesForm.marketingEmails"
                label="Marketing emails about new features"
              />
            </div>
          </div>
        </div>

        <!-- Step 8: Complete -->
        <div v-else-if="currentStep === 8" class="p-8 text-center">
          <div class="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon name="heroicons:check-circle" class="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
           Your mentor profile is now live!
          </h2>
          
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Your mentor profile is complete. Start connecting with mentees and share your expertise!
          </p>

          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 max-w-md mx-auto mb-8">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">
              Next Steps:
            </h3>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Set your availability schedule</li>
              <li>• Review your profile and make it shine</li>
              <li>• Complete your profile with a photo</li>
            </ul>
          </div>
        </div>

        <!-- Navigation -->
        <div class="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-between">
            <UButton
              v-if="currentStep > 1"
              @click="previousStep"
              variant="outline"
              icon="heroicons:arrow-left"
            >
              Back
            </UButton>
            <div v-else></div>

            <UButton
              v-if="currentStep < totalSteps"
              @click="nextStep"
              :disabled="!canProceed"
              icon="heroicons:arrow-right"
              trailing
            >
              {{ currentStep === 1 ? 'Get Started' : 'Continue' }}
            </UButton>
            
            <UButton
              v-else
              @click="completeOnboardingFlow"
              :loading="isCompleting"
              icon="heroicons:rocket-launch"
            >
              Go to Dashboard
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: 'auth',
  layout: false
})

const { user, authUser, refreshSession, userRole, logout } = useAuth()
const { categoryOptions, fetchCategories } = useCategories()
const toast = useToast()

const currentStep = ref(1)
const totalSteps = 8
const isCompleting = ref(false)
const isUploading = ref(false)
const isUploadingImage = ref(false)
const isUploadingId = ref(false)

// Parse user name into first/last
const parsedName = computed(() => {
  const name = user.value?.name || ''
  const parts = name.split(' ')
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || ''
  }
})

// Form data
const profileForm = reactive({
  firstName: parsedName.value.firstName,
  lastName: parsedName.value.lastName,
  bio: '',
  location: '',
  profileImage: ''
})

const mentorForm = reactive({
  experience: 'Foundation (0–2 years)',
  hourlyRate: 75,
  coreDomains: [] as string[],
  practicalExpertise: [] as string[],
  experienceContext: [] as string[],
  dateOfBirth: '',
  expertiseDocument: '',
  idDocument: '',
  targetAudience: [] as string[],
  supportTypes: [] as string[],
  roleTitle: 'mentor'
})

const menteeForm = reactive({
  experience: 'Entry Level (0-2 years)',
  interests: [] as string[],
  goals: [] as string[]
})

const preferencesForm = reactive({
  timezone: 'America/New_York',
  languages: ['English'] as string[],
  emailNotifications: true,
  weeklyDigest: true,
  marketingEmails: false
})

// Input helpers
const goalInput = ref('')

// Options
const experienceOptions = [
  { label: 'Foundation (0–2 years)', value: 'Foundation (0–2 years)' },
  { label: 'Growth (3–5 years)', value: 'Growth (3–5 years)' },
  { label: 'Advanced (6–10 years)', value: 'Advanced (6–10 years)' },
  { label: 'Senior / Expert (10+ years)', value: 'Senior / Expert (10+ years)' }
]

// Layer 1: Core Domains (up to 3)
const coreDomainOptions = [
  { label: 'Business & Entrepreneurship', value: 'business-entrepreneurship' },
  { label: 'Career Growth', value: 'career-growth' },
  { label: 'Leadership & Management', value: 'leadership-management' },
  { label: 'Technology & Product', value: 'technology-product' },
  { label: 'Marketing & Growth', value: 'marketing-growth' },
  { label: 'Finance & Investing', value: 'finance-investing' },
  { label: 'Personal Development', value: 'personal-development' },
  { label: 'Health & Wellbeing', value: 'health-wellbeing' },
  { label: 'Creative & Media', value: 'creative-media' },
  { label: 'Academia & Research', value: 'academia-research' },
]

// Layer 2: Practical Expertise
const practicalExpertiseOptions = [
  { label: 'Fundraising & Pitching', value: 'fundraising-pitching' },
  { label: 'Go-to-Market Strategy', value: 'go-to-market' },
  { label: 'Hiring & Team Building', value: 'hiring-team-building' },
  { label: 'Product Management', value: 'product-management' },
  { label: 'UX/UI Design', value: 'ux-ui-design' },
  { label: 'Software Engineering', value: 'software-engineering' },
  { label: 'Sales Strategy', value: 'sales-strategy' },
  { label: 'Public Speaking', value: 'public-speaking' },
  { label: 'Executive Presence', value: 'executive-presence' },
  { label: 'Financial Modelling', value: 'financial-modelling' },
  { label: 'Career Switching', value: 'career-switching' },
  { label: 'Interview Preparation', value: 'interview-preparation' },
  { label: 'Time Management', value: 'time-management' },
  { label: 'Burnout Recovery', value: 'burnout-recovery' },
]

// Layer 3: Experience Context (optional)
const experienceContextOptions = [
  { label: 'Early stage', value: 'early-stage' },
  { label: 'Growth stage', value: 'growth-stage' },
  { label: 'Scale stage', value: 'scale-stage' },
  { label: 'Transition / Reset', value: 'transition-reset' },
  { label: 'High-pressure decision points', value: 'high-pressure' },
]

const targetAudienceOptions = [
  { value: 'early', label: 'Early-stage professionals & first-time founders' },
  { value: 'growing', label: 'Growing professionals & startup builders' },
  { value: 'scaling', label: 'Leaders, executives & scaling founders' },
  { value: 'reinvention', label: 'Career transitions & reinvention' },
]

const supportTypeOptions = [
  { value: 'strategic', label: 'Strategic guidance' },
  { value: 'execution', label: 'Skills & execution' },
  { value: 'clarity', label: 'Accountability & clarity' },
  { value: 'leadership', label: 'Leadership & decision-making' },
]


const timezoneOptions = [
  // Americas
  { label: 'Pacific Time (PT) - Los Angeles', value: 'America/Los_Angeles' },
  { label: 'Mountain Time (MT) - Denver', value: 'America/Denver' },
  { label: 'Central Time (CT) - Chicago', value: 'America/Chicago' },
  { label: 'Eastern Time (ET) - New York', value: 'America/New_York' },
  { label: 'Atlantic Time (AT) - Halifax', value: 'America/Halifax' },
  { label: 'Argentina - Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
  { label: 'Brazil - São Paulo', value: 'America/Sao_Paulo' },
  { label: 'Mexico - Mexico City', value: 'America/Mexico_City' },
  { label: 'Canada - Toronto', value: 'America/Toronto' },
  { label: 'Canada - Vancouver', value: 'America/Vancouver' },
  // Europe
  { label: 'GMT/UTC - London', value: 'Europe/London' },
  { label: 'Central European Time (CET) - Paris', value: 'Europe/Paris' },
  { label: 'Central European Time (CET) - Berlin', value: 'Europe/Berlin' },
  { label: 'Central European Time (CET) - Amsterdam', value: 'Europe/Amsterdam' },
  { label: 'Central European Time (CET) - Rome', value: 'Europe/Rome' },
  { label: 'Central European Time (CET) - Madrid', value: 'Europe/Madrid' },
  { label: 'Eastern European Time (EET) - Athens', value: 'Europe/Athens' },
  { label: 'Moscow Time (MSK) - Moscow', value: 'Europe/Moscow' },
  { label: 'Western European Time (WET) - Lisbon', value: 'Europe/Lisbon' },
  // Africa
  { label: 'West Africa Time (WAT) - Lagos', value: 'Africa/Lagos' },
  { label: 'Central Africa Time (CAT) - Johannesburg', value: 'Africa/Johannesburg' },
  { label: 'East Africa Time (EAT) - Nairobi', value: 'Africa/Nairobi' },
  { label: 'Egypt - Cairo', value: 'Africa/Cairo' },
  // Middle East
  { label: 'Gulf Standard Time (GST) - Dubai', value: 'Asia/Dubai' },
  { label: 'Israel - Tel Aviv', value: 'Asia/Tel_Aviv' },
  { label: 'Turkey - Istanbul', value: 'Europe/Istanbul' },
  { label: 'Saudi Arabia - Riyadh', value: 'Asia/Riyadh' },
  // Asia
  { label: 'India Standard Time (IST) - Mumbai', value: 'Asia/Kolkata' },
  { label: 'Pakistan - Karachi', value: 'Asia/Karachi' },
  { label: 'Bangladesh - Dhaka', value: 'Asia/Dhaka' },
  { label: 'Thailand - Bangkok', value: 'Asia/Bangkok' },
  { label: 'Vietnam - Ho Chi Minh', value: 'Asia/Ho_Chi_Minh' },
  { label: 'Singapore Time (SGT)', value: 'Asia/Singapore' },
  { label: 'Malaysia - Kuala Lumpur', value: 'Asia/Kuala_Lumpur' },
  { label: 'Philippines - Manila', value: 'Asia/Manila' },
  { label: 'Indonesia - Jakarta', value: 'Asia/Jakarta' },
  { label: 'China Standard Time (CST) - Shanghai', value: 'Asia/Shanghai' },
  { label: 'Hong Kong Time (HKT)', value: 'Asia/Hong_Kong' },
  { label: 'Taiwan - Taipei', value: 'Asia/Taipei' },
  { label: 'Korea Standard Time (KST) - Seoul', value: 'Asia/Seoul' },
  { label: 'Japan Standard Time (JST) - Tokyo', value: 'Asia/Tokyo' },
  // Oceania
  { label: 'Australian Western Time (AWST) - Perth', value: 'Australia/Perth' },
  { label: 'Australian Central Time (ACST) - Adelaide', value: 'Australia/Adelaide' },
  { label: 'Australian Eastern Time (AEST) - Sydney', value: 'Australia/Sydney' },
  { label: 'Australian Eastern Time (AEST) - Melbourne', value: 'Australia/Melbourne' },
  { label: 'New Zealand Time (NZT) - Auckland', value: 'Pacific/Auckland' },
  // UTC
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' }
]

const languageOptions = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Mandarin',
  'Japanese',
  'Korean'
]

const isOldEnough = computed(() => {
  if (!mentorForm.dateOfBirth) return false
  const dob = new Date(mentorForm.dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age >= 18
})

// Computed
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return userRole.value === 'mentor' ? !!mentorForm.roleTitle : true
    case 3:
      return mentorForm.experience && mentorForm.hourlyRate && 
             mentorForm.dateOfBirth && isOldEnough.value && 
             mentorForm.expertiseDocument && mentorForm.idDocument
    case 4:
      return mentorForm.coreDomains.length > 0 && mentorForm.practicalExpertise.length > 0
    case 5:
      return mentorForm.targetAudience.length > 0
    case 6:
      return mentorForm.supportTypes.length > 0
    case 7:
      return preferencesForm.timezone && preferencesForm.languages.length > 0
    default:
      return true
  }
})

// Methods
const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  try {
    const response = await $fetch<{ url: string }>('/api/uploads', {
      method: 'POST',
      body: formData
    })
    mentorForm.expertiseDocument = response.url
    toast.add({
      title: 'Success',
      description: 'Document uploaded successfully. It will be reviewed by the admin.',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Upload Failed',
      description: error.data?.message || 'Failed to upload document',
      color: 'error'
    })
  } finally {
    isUploading.value = false
  }
}

const handleProfileImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploadingImage.value = true
  try {
    const response = await $fetch<{ url: string }>('/api/profile/image', {
      method: 'POST',
      body: formData
    })
    profileForm.profileImage = response.url
    toast.add({
      title: 'Success',
      description: 'Profile photo uploaded successfully',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Upload Failed',
      description: error.data?.message || 'Failed to upload profile photo',
      color: 'error'
    })
  } finally {
    isUploadingImage.value = false
  }
}

const handleIdDocumentUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploadingId.value = true
  try {
    const response = await $fetch<{ url: string }>('/api/uploads', {
      method: 'POST',
      body: formData
    })
    mentorForm.idDocument = response.url
    toast.add({
      title: 'Success',
      description: 'ID document uploaded successfully. It will be reviewed by the admin.',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Upload Failed',
      description: error.data?.message || 'Failed to upload ID document',
      color: 'error'
    })
  } finally {
    isUploadingId.value = false
  }
}

const toggleCoreDomain = (value: string) => {
  const index = mentorForm.coreDomains.indexOf(value)
  if (index > -1) {
    mentorForm.coreDomains.splice(index, 1)
  } else if (mentorForm.coreDomains.length < 3) {
    mentorForm.coreDomains.push(value)
  }
}

const togglePracticalExpertise = (value: string) => {
  const index = mentorForm.practicalExpertise.indexOf(value)
  if (index > -1) {
    mentorForm.practicalExpertise.splice(index, 1)
  } else {
    mentorForm.practicalExpertise.push(value)
  }
}

const toggleExperienceContext = (value: string) => {
  const index = mentorForm.experienceContext.indexOf(value)
  if (index > -1) {
    mentorForm.experienceContext.splice(index, 1)
  } else {
    mentorForm.experienceContext.push(value)
  }
}

const addGoal = () => {
  if (goalInput.value.trim() && !menteeForm.goals.includes(goalInput.value.trim())) {
    menteeForm.goals.push(goalInput.value.trim())
    goalInput.value = ''
  }
}

const toggleTargetAudience = (value: string) => {
  const index = mentorForm.targetAudience.indexOf(value)
  if (index > -1) {
    mentorForm.targetAudience.splice(index, 1)
  } else if (mentorForm.targetAudience.length < 2) {
    mentorForm.targetAudience.push(value)
  }
}

const toggleSupportType = (value: string) => {
  const index = mentorForm.supportTypes.indexOf(value)
  if (index > -1) {
    mentorForm.supportTypes.splice(index, 1)
  } else {
    mentorForm.supportTypes.push(value)
  }
}

const removeGoal = (goal: string) => {
  const index = menteeForm.goals.indexOf(goal)
  if (index > -1) {
    menteeForm.goals.splice(index, 1)
  }
}

const completeOnboardingFlow = async () => {
  isCompleting.value = true
  
  try {
    // Save onboarding data to backend
    await $fetch('/api/onboarding/complete', {
      method: 'POST',
      body: {
        profile: {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          bio: profileForm.bio,
          location: profileForm.location,
        },
        roleData: {
          experience: mentorForm.experience,
          hourlyRate: mentorForm.hourlyRate,
          coreDomains: mentorForm.coreDomains,
          practicalExpertise: mentorForm.practicalExpertise,
          experienceContext: mentorForm.experienceContext,
          dateOfBirth: mentorForm.dateOfBirth,
          expertiseDocument: mentorForm.expertiseDocument,
          idDocument: mentorForm.idDocument,
          targetAudience: mentorForm.targetAudience,
          supportTypes: mentorForm.supportTypes,
          roleTitle: mentorForm.roleTitle,
        },
        preferences: {
          timezone: preferencesForm.timezone,
          languages: preferencesForm.languages,
          emailNotifications: preferencesForm.emailNotifications,
          weeklyDigest: preferencesForm.weeklyDigest,
          marketingEmails: preferencesForm.marketingEmails,
        },
      },
    })
    
    // Refresh session to get updated user data
    await refreshSession()
    
    // Directly update the user state to ensure middleware doesn't redirect back
    // This is a fallback in case refreshSession doesn't return fresh data
    if (authUser.value) {
      authUser.value = {
        ...authUser.value,
        hasCompletedOnboarding: true,
        onboardingStep: 'complete',
        onboardingCompletedAt: new Date()
      }
    }
    
    toast.add({
      title: 'Profile Complete!',
      description: 'Welcome to iMentorsPro. Your journey begins now!',
      color: 'success'
    })
    
    const dest = userRole.value === 'admin' ? '/admin' : '/dashboard'
    await navigateTo(dest)
  } catch (error: any) {
    if (error.statusCode === 401) {
      toast.add({
        title: 'Session Expired',
        description: 'Please log in again to continue.',
        color: 'error'
      })
      await logout()
      return
    }

    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to complete onboarding. Please try again.',
      color: 'error'
    })
  } finally {
    isCompleting.value = false
  }
}

// Initialize form with user data
onMounted(async () => {
  // Fetch categories for the selects
  await fetchCategories()

  if (user.value?.name) {
    const parts = user.value.name.split(' ')
    profileForm.firstName = parts[0] || ''
    profileForm.lastName = parts.slice(1).join(' ') || ''
  }

  // Redirect mentees to discovery flow
  if (userRole.value === 'mentee') {
    await navigateTo('/discover')
  }
})
</script>
