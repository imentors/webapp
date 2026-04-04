<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <template #header>
      <div class="flex items-center space-x-2">
        <Icon name="heroicons:sparkles" class="w-5 h-5 text-primary" />
        <h3 class="text-lg font-semibold">AI Mentor Matching</h3>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col h-[500px]">
        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto space-y-4 p-4">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-[80%] rounded-lg px-4 py-2',
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              ]"
            >
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
              <p class="text-xs mt-1 opacity-70">
                {{ formatTime(message.timestamp) }}
              </p>
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-4">
          <div v-if="showMatchButton" class="mb-4">
            <UButton
              block
              size="lg"
              icon="heroicons:sparkles"
              @click="generateMatches"
              :loading="isGenerating"
            >
              Find My Perfect Mentors
            </UButton>
          </div>

          <form @submit.prevent="sendMessage" class="flex space-x-2">
            <UInput
              v-model="inputMessage"
              placeholder="Type your message..."
              size="lg"
              class="flex-1"
              :disabled="isLoading || isGenerating"
            />
            <UButton
              type="submit"
              icon="heroicons:paper-airplane"
              size="lg"
              :disabled="!inputMessage.trim() || isLoading || isGenerating"
            />
          </form>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'matches-found', matches: any[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const isGenerating = ref(false)
const sessionId = ref<string | null>(null)
const showMatchButton = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// Start session when modal opens
watch(isOpen, async (newValue) => {
  if (newValue && !sessionId.value) {
    await startSession()
  }
})

const startSession = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<{ sessionId: string; message: string }>('/api/ai/match/start', {
      method: 'POST',
    })

    sessionId.value = response.sessionId
    messages.value.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[AI Matcher] Start session error:', error)
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date().toISOString(),
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !sessionId.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // Add user message
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  })

  scrollToBottom()
  isLoading.value = true

  try {
    const response = await $fetch<{
      message: string
      shouldGenerateMatches: boolean
      conversationLength: number
    }>('/api/ai/match/message', {
      method: 'POST',
      body: {
        sessionId: sessionId.value,
        message: userMessage,
      },
    })

    messages.value.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString(),
    })

    // Show match button if AI suggests it
    if (response.shouldGenerateMatches) {
      showMatchButton.value = true
    }
  } catch (error: any) {
    console.error('[AI Matcher] Send message error:', error)
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date().toISOString(),
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const generateMatches = async () => {
  if (!sessionId.value) return

  isGenerating.value = true

  try {
    const response = await $fetch<{ matches: any[]; preferences: any }>('/api/ai/match/recommend', {
      method: 'POST',
      body: {
        sessionId: sessionId.value,
      },
    })

    // Close modal and emit matches
    isOpen.value = false
    emit('matches-found', response.matches)
  } catch (error: any) {
    console.error('[AI Matcher] Generate matches error:', error)
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I had trouble finding matches. Please try adjusting your preferences.',
      timestamp: new Date().toISOString(),
    })
  } finally {
    isGenerating.value = false
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>
