<template>
  <div v-if="matches.length > 0" class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <Icon name="heroicons:sparkles" class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          AI Recommended Mentors
        </h2>
      </div>
      <UButton
        variant="ghost"
        size="sm"
        icon="heroicons:x-mark"
        @click="$emit('clear')"
      >
        Clear
      </UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="match in matches"
        :key="match.id"
        class="bg-white dark:bg-gray-800 rounded-xl border-2 border-primary/20 p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
        @click="navigateTo(`/mentors/${match.mentor.id}`)"
      >
        <!-- Match Badge -->
        <div class="absolute top-4 right-4">
          <UBadge color="primary" variant="solid" size="lg">
            {{ Math.round(parseFloat(match.score)) }}% Match
          </UBadge>
        </div>

        <!-- Mentor Header -->
        <div class="flex items-start justify-between mb-4 pr-20">
          <div class="flex items-center space-x-4">
            <UAvatar
              :src="match.mentor.image || undefined"
              :alt="match.mentor.name"
              size="lg"
            />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ match.mentor.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ match.mentor.experience || 'Experienced' }}
              </p>
            </div>
          </div>
        </div>

        <!-- AI Reasoning -->
        <div class="mb-4 p-3 bg-primary/5 rounded-lg">
          <div class="flex items-start space-x-2">
            <Icon name="heroicons:light-bulb" class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ match.reasoning }}
            </p>
          </div>
        </div>

        <!-- Bio -->
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {{ match.mentor.bio || 'No bio available' }}
        </p>

        <!-- Skills -->
        <div class="mb-4">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="skill in (match.mentor.skills || []).slice(0, 3)"
              :key="skill"
              variant="soft"
              size="xs"
            >
              {{ skill }}
            </UBadge>
            <UBadge
              v-if="(match.mentor.skills || []).length > 3"
              variant="soft"
              size="xs"
              color="neutral"
            >
              +{{ (match.mentor.skills || []).length - 3 }} more
            </UBadge>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:star" class="w-4 h-4 text-yellow-400" />
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ match.mentor.rating || 0 }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              ({{ match.mentor.totalSessions || 0 }} sessions)
            </span>
          </div>
          
          <div class="text-right">
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              ${{ match.mentor.hourlyRate || 0 }}/hr
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Match {
  id: string
  score: string
  reasoning: string
  rank: number
  mentor: {
    id: string
    name: string
    image: string | null
    bio: string | null
    skills: string[]
    categories: string[]
    hourlyRate: number
    experience: string | null
    rating: number
    totalSessions: number
  }
}

interface Props {
  matches: Match[]
}

defineProps<Props>()
defineEmits<{
  (e: 'clear'): void
}>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
