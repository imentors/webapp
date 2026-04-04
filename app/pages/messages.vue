<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style="height: calc(100vh - 200px);">
      <div class="flex h-full">
        <!-- Conversations Sidebar -->
        <div class="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <!-- Header -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Messages
              </h2>
              <UButton
                icon="heroicons:pencil-square"
                variant="ghost"
                size="sm"
                @click="showNewMessageModal = true"
              />
            </div>
            
            <UInput
              v-model="searchQuery"
              placeholder="Search conversations..."
              icon="heroicons:magnifying-glass"
              class="w-full"
            />
          </div>

          <!-- Conversations List -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="filteredConversations.length === 0" class="p-4 text-center">
              <Icon name="heroicons:chat-bubble-left-right" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                No conversations yet
              </p>
            </div>
            
            <div v-else>
              <div
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                @click="selectConversation(conversation)"
                :class="[
                  'p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  selectedConversation?.id === conversation.id ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' : ''
                ]"
              >
                <div class="flex items-start space-x-3">
                  <div class="relative">
                    <UAvatar
                      :src="conversation.otherParticipant.avatar"
                      :alt="conversation.otherParticipant.name"
                      size="md"
                    />
                    <div
                      v-if="conversation.unreadCount > 0"
                      class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <span class="text-xs text-white font-medium">
                        {{ conversation.unreadCount > 9 ? '9+' : conversation.unreadCount }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ conversation.otherParticipant.name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatMessageTime(conversation.lastMessage?.timestamp) }}
                      </p>
                    </div>
                    
                    <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {{ conversation.lastMessage?.content || 'No messages yet' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="flex-1 flex flex-col">
          <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <Icon name="heroicons:chat-bubble-left-right" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col min-h-0">
            <!-- Chat Header -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <UAvatar
                    :src="selectedConversation.otherParticipant.avatar"
                    :alt="selectedConversation.otherParticipant.name"
                    size="md"
                  />
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">
                      {{ selectedConversation.otherParticipant.name }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ selectedConversation.otherParticipant.role === 'mentor' ? 'Mentor' : 'Mentee' }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <!-- Video and audio call buttons removed -->
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" ref="messagesContainer">
              <div
                v-for="message in selectedConversationMessages"
                :key="message.id"
                :class="[
                  'flex',
                  message.senderId === user?.id ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                    message.senderId === user?.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  ]"
                >
                  <p class="text-sm">{{ message.content }}</p>
                  <p
                    :class="[
                      'text-xs mt-1',
                      message.senderId === user?.id
                        ? 'text-teal-100'
                        : 'text-gray-500 dark:text-gray-400'
                    ]"
                  >
                    {{ formatMessageTime(message.createdAt) }}
                  </p>
                </div>
              </div>
              
              <div v-if="isTyping" class="flex justify-start">
                <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <form @submit.prevent="sendMessage" class="flex space-x-2">
                <UInput
                  v-model="newMessage"
                  placeholder="Type your message..."
                  class="flex-1"
                  @keydown="handleTyping"
                />
                <UButton
                  type="submit"
                  icon="heroicons:paper-airplane"
                  :disabled="!newMessage.trim() || isSending"
                  :loading="isSending"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Message Modal -->
    <UModal v-model:open="showNewMessageModal" :overlay="true" :prevent-body-scroll="true">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            New Message
          </h3>
          
          <div class="space-y-4">
            <UFormField label="Recipient" required>
              <USelectMenu
                v-model="newMessageForm.recipient"
                :options="availableContacts"
                placeholder="Select a contact"
                searchable
                class="w-full"
              />
            </UFormField>
            
            <UFormField label="Message" required>
              <UTextarea
                v-model="newMessageForm.content"
                placeholder="Type your message..."
                :rows="4"
                class="w-full"
              />
            </UFormField>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <UButton
              variant="ghost"
              @click="showNewMessageModal = false"
            >
              Cancel
            </UButton>
            <UButton
              @click="createNewConversation"
              :loading="isCreatingConversation"
              :disabled="!newMessageForm.recipient || !newMessageForm.content.trim()"
            >
              Send Message
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
interface Conversation {
  id: string
  otherParticipant: {
    id: string
    name: string
    avatar: string
    role: string
  }
  lastMessage: {
    id: string
    content: string
    timestamp: string
    senderId: string
  } | null
  unreadCount: number
  updatedAt: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string // API returns string date
  createdAt: string
  isRead: boolean
}

definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
const route = useRoute()
const toast = useToast()

const searchQuery = ref('')
const selectedConversation = ref<Conversation | null>(null)
const newMessage = ref('')
const isSending = ref(false)
const showNewMessageModal = ref(false)
const isCreatingConversation = ref(false)

const messagesContainer = ref<HTMLElement | null>(null)

const newMessageForm = reactive({
  recipient: null as string | null,
  content: ''
})

// Fetch conversations
const { data: conversations, refresh: refreshConversations } = await useFetch<Conversation[]>('/api/conversations', {
  default: () => []
})

// Fetch messages for selected conversation
const { data: messages, refresh: refreshMessages } = await useFetch<Message[]>(
  () => selectedConversation.value ? `/api/conversations/${selectedConversation.value.id}/messages` : '',
  {
    immediate: false,
    watch: [selectedConversation],
    default: () => []
  }
)

// Mock contacts for now - in a real app this would be a search API
const availableContacts = ref([
  { label: 'Sarah Chen', value: '2' },
  { label: 'Marcus Johnson', value: '3' },
  { label: 'Elena Rodriguez', value: '4' }
])

const filteredConversations = computed(() => {
  if (!conversations.value) return []
  if (!searchQuery.value) return conversations.value
  
  return conversations.value.filter(conv =>
    conv.otherParticipant.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedConversationMessages = computed(() => {
  if (!messages.value) return []
  // API returns oldest first (chronological order)
  return messages.value
})

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const selectConversation = async (conversation: Conversation) => {
  selectedConversation.value = conversation
  
  // Mark as read
  if (conversation.unreadCount > 0) {
    try {
      await $fetch(`/api/conversations/${conversation.id}/read`, { method: 'POST' })
      conversation.unreadCount = 0
      refreshConversations() // Refresh to update unread counts globally if needed
    } catch (e) {
      console.error('Failed to mark as read', e)
    }
  }
  
  scrollToBottom()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return
  
  isSending.value = true
  const content = newMessage.value.trim()
  
  try {
    const message = await $fetch<Message>(`/api/conversations/${selectedConversation.value.id}/messages`, {
      method: 'POST',
      body: { content }
    })
    
    // Add to local messages immediately
    if (messages.value) {
      messages.value.push(message) // Add to end (messages are in chronological order)
    }
    
    // Update conversation last message
    selectedConversation.value.lastMessage = {
      id: message.id,
      content: message.content,
      timestamp: message.createdAt,
      senderId: message.senderId
    }
    selectedConversation.value.updatedAt = message.createdAt
    
    // Clear input
    newMessage.value = ''
    
    scrollToBottom()
    
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to send message. Please try again.',
      color: 'error'
    })
  } finally {
    isSending.value = false
  }
}

const createNewConversation = async () => {
  isCreatingConversation.value = true
  
  try {
    // Create conversation
    const result = await $fetch<{ id: string, isNew: boolean }>('/api/conversations', {
      method: 'POST',
      body: { recipientId: newMessageForm.recipient }
    })
    
    // Send initial message
    await $fetch(`/api/conversations/${result.id}/messages`, {
      method: 'POST',
      body: { content: newMessageForm.content }
    })
    
    toast.add({
      title: 'Message Sent',
      description: 'Your message has been sent successfully.',
      color: 'success'
    })
    
    showNewMessageModal.value = false
    newMessageForm.recipient = null
    newMessageForm.content = ''
    
    // Refresh conversations and select the new one
    await refreshConversations()
    if (conversations.value) {
      const newConv = conversations.value.find(c => c.id === result.id)
      if (newConv) {
        selectConversation(newConv)
      }
    }
    
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to send message. Please try again.',
      color: 'error'
    })
  } finally {
    isCreatingConversation.value = false
  }
}

const formatMessageTime = (timestamp: string | Date | undefined) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}d ago`
  } else if (hours > 0) {
    return `${hours}h ago`
  } else if (minutes > 0) {
    return `${minutes}m ago`
  } else {
    return 'Just now'
  }
}

// Handle URL parameters for direct messaging
onMounted(async () => {
  const mentorId = route.query.mentor
  const userId = route.query.user
  
  if (mentorId || userId) {
    const targetId = (mentorId || userId) as string
    const targetIdStr = (Array.isArray(targetId) ? targetId[0] : targetId) as string
    
    // Check if we already have a conversation with this user
    if (conversations.value) {
      const existingConv = conversations.value.find(
        conv => conv.otherParticipant.id === targetIdStr
      )
      
      if (existingConv) {
        selectConversation(existingConv)
      } else {
        // Open new message modal with pre-selected recipient
        newMessageForm.recipient = targetIdStr
        showNewMessageModal.value = true
      }
    }
  }
})

// Poll for new messages (simple implementation)
// In a real app, use WebSockets or Server-Sent Events
let pollInterval: NodeJS.Timeout
onMounted(() => {
  pollInterval = setInterval(() => {
    refreshConversations()
    if (selectedConversation.value) {
      refreshMessages()
    }
  }, 5000) // Poll every 5 seconds
})

onUnmounted(() => {
  clearInterval(pollInterval)
})
</script>
