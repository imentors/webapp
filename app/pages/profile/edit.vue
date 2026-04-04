<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Edit Profile
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Update your profile information and preferences
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div class="lg:col-span-2 space-y-6">
          <UCard>
            <template #header>
              <USkeleton class="h-6 w-40" />
            </template>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <USkeleton class="h-10 w-full" />
                <USkeleton class="h-10 w-full" />
              </div>
              <USkeleton class="h-10 w-full" />
              <USkeleton class="h-24 w-full" />
            </div>
          </UCard>
          <UCard>
            <template #header>
              <USkeleton class="h-6 w-48" />
            </template>
            <div class="space-y-4">
              <USkeleton class="h-10 w-full" />
              <USkeleton class="h-10 w-full" />
              <USkeleton class="h-10 w-full" />
            </div>
          </UCard>
        </div>
        <div class="space-y-6">
          <UCard>
            <template #header>
              <USkeleton class="h-6 w-32" />
            </template>
            <div class="flex flex-col items-center">
              <USkeleton class="h-16 w-16 rounded-full mb-4" />
              <USkeleton class="h-5 w-32 mb-2" />
              <USkeleton class="h-4 w-20" />
            </div>
          </UCard>
        </div>
      </template>

      <!-- Profile Form -->
      <template v-else>
      <div class="lg:col-span-2">
        <UForm
          :schema="profileSchema"
          :state="profileForm"
          @submit="saveProfile"
          class="space-y-6"
        >
          <!-- Basic Information -->
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Information
              </h2>
            </template>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="First Name" name="firstName" required>
                  <UInput v-model="profileForm.firstName" class="w-full" />
                </UFormField>
                <UFormField label="Last Name" name="lastName" required>
                  <UInput v-model="profileForm.lastName" class="w-full" />
                </UFormField>
              </div>

              <UFormField label="Email" name="email" required>
                <UInput v-model="profileForm.email" type="email" disabled class="w-full" />
              </UFormField>

              <UFormField label="Bio" name="bio">
                <UTextarea
                  v-model="profileForm.bio"
                  placeholder="Tell others about yourself..."
                  :rows="4"
                  class="w-full"
                />
              </UFormField>
            </div>
          </UCard>

          <!-- Role-specific Information -->
          <UCard v-if="user?.role === 'mentor'">
            <template #header>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Mentor Information
              </h2>
            </template>

            <div class="space-y-4">
              <UFormField label="Hourly Rate ($)" name="hourlyRate">
                <UInput
                  v-model="profileForm.hourlyRate"
                  type="number"
                  min="0"
                  step="5"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Experience" name="experience">
                <USelect
                  v-model="profileForm.experience"
                  :items="experienceOptions"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Categories" name="categories">
                <USelectMenu
                  v-model="profileForm.categories"
                  :items="categoryOptions"
                  multiple
                  searchable
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Skills" name="skills">
                <USelectMenu
                  v-model="profileForm.skills"
                  :items="skillOptions"
                  multiple
                  searchable
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Languages" name="languages">
                <USelectMenu
                  v-model="profileForm.languages"
                  :items="languageOptions"
                  multiple
                  searchable
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Timezone" name="timezone">
                <USelect
                  v-model="profileForm.timezone"
                  :items="timezoneOptions"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Date of Birth" name="dateOfBirth">
                <UInput
                  v-model="profileForm.dateOfBirth"
                  type="date"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Expertise Document" name="expertiseDocument" help="Upload a portfolio, certificate, or CV that proves your expertise (PDF, Word, or Image).">
                <div class="flex items-center space-x-3 w-full">
                  <UInput
                    type="file"
                    class="flex-1"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    @change="handleFileUpload"
                  />
                  <div v-if="isUploading" class="flex items-center">
                    <UIcon name="heroicons:arrow-path" class="animate-spin w-5 h-5 text-teal-600" />
                  </div>
                  <div v-else-if="profileForm.expertiseDocument" class="flex items-center">
                    <UIcon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div v-if="profileForm.expertiseDocument" class="mt-2 flex items-center space-x-2">
                  <p class="text-xs text-gray-500 truncate max-w-xs">
                    Current: {{ profileForm.expertiseDocument.split('/').pop() }}
                  </p>
                  <UButton
                    :href="profileForm.expertiseDocument"
                    target="_blank"
                    size="xs"
                    variant="ghost"
                    icon="heroicons:eye"
                  >
                    View
                  </UButton>
                </div>
              </UFormField>
            </div>
          </UCard>

          <UCard v-if="user?.role === 'mentee'">
            <template #header>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Learning Goals
              </h2>
            </template>

            <div class="space-y-4">
              <UFormField label="Interests" name="interests">
                <USelectMenu
                  v-model="profileForm.interests"
                  :items="categoryOptions"
                  multiple
                  searchable
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Goals" name="goals">
                <UTextarea
                  v-model="profileForm.goalsText"
                  placeholder="What are your learning and career goals?"
                  :rows="3"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Experience Level" name="experience">
                <USelect
                  v-model="profileForm.experience"
                  :items="experienceOptions"
                  class="w-full"
                />
              </UFormField>
            </div>
          </UCard>

          <!-- Save Button -->
          <div class="flex justify-end space-x-3">
            <UButton
              variant="ghost"
              @click="$router.back()"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              :loading="isSaving"
              icon="heroicons:check"
            >
              Save Changes
            </UButton>
          </div>
        </UForm>
      </div>

      <!-- Profile Preview -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Preview
            </h3>
          </template>

          <div class="text-center">
            <!-- Profile Image Upload -->
            <div class="relative group inline-block mb-4">
              <UAvatar
                :src="profileForm.profileImage || user?.avatar"
                :alt="`${profileForm.firstName} ${profileForm.lastName}`"
                size="xl"
                class="border-4 border-gray-200 dark:border-gray-600"
              />
              <label 
                v-if="user?.role === 'mentor'"
                class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <input 
                  type="file" 
                  class="hidden" 
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  @change="handleProfileImageUpload"
                />
                <div v-if="isUploadingImage" class="text-white">
                  <UIcon name="heroicons:arrow-path" class="animate-spin w-6 h-6" />
                </div>
                <div v-else class="text-center text-white">
                  <UIcon name="heroicons:camera" class="w-6 h-6" />
                </div>
              </label>
            </div>
            <p v-if="user?.role === 'mentor'" class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Hover to change photo
            </p>
            
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {{ profileForm.firstName }} {{ profileForm.lastName }}
            </h4>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 capitalize mb-4">
              {{ user?.role }}
            </p>

            <div v-if="profileForm.bio" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ profileForm.bio }}
            </div>

            <div v-if="user?.role === 'mentor'" class="space-y-2">
              <div v-if="profileForm.hourlyRate" class="text-lg font-bold text-gray-900 dark:text-white">
                ${{ profileForm.hourlyRate }}/hr
              </div>
              
              <div v-if="profileForm.experience" class="text-sm text-gray-600 dark:text-gray-400">
                {{ profileForm.experience }} experience
              </div>

              <div v-if="profileForm.categories.length > 0" class="flex flex-wrap gap-1 justify-center">
                <UBadge
                  v-for="category in profileForm.categories.slice(0, 3)"
                  :key="category"
                  variant="soft"
                  size="xs"
                >
                  {{ category }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Completeness
            </h3>
          </template>

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Overall</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ profileCompleteness }}%</span>
            </div>
            
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-teal-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${profileCompleteness}%` }"
              ></div>
            </div>

            <div class="space-y-2 text-sm">
              <div
                v-for="item in completenessItems"
                :key="item.label"
                class="flex items-center justify-between"
              >
                <span :class="item.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                  <Icon
                    :name="item.completed ? 'heroicons:check-circle' : 'heroicons:minus-circle'"
                    class="w-4 h-4 inline mr-2"
                  />
                  {{ item.label }}
                </span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'auth'
})

const { user, refreshSession } = useAuth()
const toast = useToast()

const isLoading = ref(true)
const isSaving = ref(false)
const isUploading = ref(false)
const isUploadingImage = ref(false)

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  experience: z.string().optional(),
  categories: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  expertiseDocument: z.string().optional(),
  profileImage: z.string().optional(),
  interests: z.array(z.string()).optional(),
  goalsText: z.string().optional()
})

const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  bio: '',
  hourlyRate: 0,
  experience: '',
  categories: [] as string[],
  skills: [] as string[],
  languages: [] as string[],
  timezone: '',
  dateOfBirth: '',
  expertiseDocument: '',
  profileImage: '',
  interests: [] as string[],
  goalsText: ''
})

// Fetch profile data on mount
onMounted(async () => {
  try {
    const data = await $fetch('/api/profile')
    
    // Populate form with fetched data
    profileForm.firstName = data.user.firstName || ''
    profileForm.lastName = data.user.lastName || ''
    profileForm.email = data.user.email || ''
    profileForm.bio = data.profile.bio || ''
    profileForm.experience = data.profile.experience || ''
    profileForm.languages = data.profile.languages || []
    profileForm.timezone = data.profile.timezone || ''
    profileForm.profileImage = data.user.image || ''
    
    // Role-specific fields
    if (user.value?.role === 'mentor') {
      profileForm.hourlyRate = data.profile.hourlyRate || 0
      profileForm.skills = data.profile.skills || []
      profileForm.categories = data.profile.categories || []
      profileForm.dateOfBirth = data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : ''
      profileForm.expertiseDocument = data.profile.expertiseDocument || ''
    } else {
      profileForm.interests = data.profile.interests || []
      // Convert goals array to text if needed
      const goals = data.profile.goals || []
      profileForm.goalsText = Array.isArray(goals) ? goals.join('\n') : goals
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load profile data.',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
})

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
    // Refresh session to update user data in auth state
    await refreshSession()
    toast.add({
      title: 'Success',
      description: 'Profile photo updated successfully',
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
    profileForm.expertiseDocument = response.url
    toast.add({
      title: 'Success',
      description: 'Document uploaded successfully',
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

const experienceOptions = [
  '0-2 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
]

const categoryOptions = [
  'Software Development',
  'Product Management',
  'Design',
  'Marketing',
  'Sales',
  'Data Science',
  'Leadership',
  'Career Growth',
  'Entrepreneurship'
]

const skillOptions = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'AWS',
  'Product Strategy',
  'User Research',
  'UI/UX Design',
  'Figma',
  'Data Analysis',
  'Machine Learning',
  'Leadership',
  'Communication'
]

const languageOptions = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Japanese',
  'Portuguese',
  'Italian'
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

const profileCompleteness = computed(() => {
  let completed = 0
  let total = 0

  // Basic fields
  total += 4
  if (profileForm.firstName) completed++
  if (profileForm.lastName) completed++
  if (profileForm.email) completed++
  if (profileForm.bio) completed++

  if (user.value?.role === 'mentor') {
    total += 8
    if (profileForm.profileImage) completed++
    if (profileForm.hourlyRate) completed++
    if (profileForm.experience) completed++
    if (profileForm.categories.length > 0) completed++
    if (profileForm.skills.length > 0) completed++
    if (profileForm.languages.length > 0) completed++
    if (profileForm.dateOfBirth) completed++
    if (profileForm.expertiseDocument) completed++
  } else {
    total += 3
    if (profileForm.interests.length > 0) completed++
    if (profileForm.goalsText) completed++
    if (profileForm.experience) completed++
  }

  return Math.round((completed / total) * 100)
})

const completenessItems = computed(() => {
  const items = [
    { label: 'Basic info', completed: !!(profileForm.firstName && profileForm.lastName && profileForm.email) },
    { label: 'Bio', completed: !!profileForm.bio }
  ]

  if (user.value?.role === 'mentor') {
    items.push(
      { label: 'Profile photo', completed: !!profileForm.profileImage },
      { label: 'Hourly rate', completed: !!profileForm.hourlyRate },
      { label: 'Experience', completed: !!profileForm.experience },
      { label: 'Categories', completed: profileForm.categories.length > 0 },
      { label: 'Skills', completed: profileForm.skills.length > 0 },
      { label: 'Date of Birth', completed: !!profileForm.dateOfBirth },
      { label: 'Expertise Document', completed: !!profileForm.expertiseDocument }
    )
  } else {
    items.push(
      { label: 'Interests', completed: profileForm.interests.length > 0 },
      { label: 'Goals', completed: !!profileForm.goalsText },
      { label: 'Experience level', completed: !!profileForm.experience }
    )
  }

  return items
})

const saveProfile = async () => {
  isSaving.value = true
  
  try {
    // Prepare data based on role
    const updateData: Record<string, any> = {
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      bio: profileForm.bio,
      experience: profileForm.experience,
      languages: profileForm.languages,
      timezone: profileForm.timezone,
    }

    if (user.value?.role === 'mentor') {
      updateData.hourlyRate = profileForm.hourlyRate
      updateData.skills = profileForm.skills
      updateData.categories = profileForm.categories
      updateData.dateOfBirth = profileForm.dateOfBirth
      updateData.expertiseDocument = profileForm.expertiseDocument
    } else {
      updateData.interests = profileForm.interests
      // Convert goals text to array
      updateData.goals = profileForm.goalsText 
        ? profileForm.goalsText.split('\n').filter(g => g.trim())
        : []
    }

    await $fetch('/api/profile', {
      method: 'PUT',
      body: updateData
    })
    
    // Refresh the session to update user data
    await refreshSession()
    
    toast.add({
      title: 'Profile Updated',
      description: 'Your profile has been saved successfully.',
      color: 'success'
    })
    
    // Navigate back to dashboard
    navigateTo('/dashboard')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to save profile. Please try again.',
      color: 'error'
    })
  } finally {
    isSaving.value = false
  }
}
</script>
