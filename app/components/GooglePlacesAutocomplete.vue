<template>
  <div class="relative w-full">
    <UInput
      ref="inputRef"
      v-model="searchQuery"
      :placeholder="placeholder"
      :size="size"
      :icon="icon"
      :disabled="disabled"
      class="w-full"
      autocomplete="off"
      @input="handleInput"
      @focus="showDropdown = true"
      @blur="handleBlur"
      @keydown.down.prevent="navigateDown"
      @keydown.up.prevent="navigateUp"
      @keydown.enter.prevent="selectHighlighted"
      @keydown.escape="closeDropdown"
    />
    
    <!-- Dropdown with search results -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showDropdown && (predictions.length > 0 || isLoading)"
        class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto"
      >
        <!-- Loading state -->
        <div v-if="isLoading" class="px-4 py-3 flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span class="text-sm">Searching places...</span>
        </div>
        
        <!-- Results -->
        <ul v-else-if="predictions.length > 0" class="py-1">
          <li
            v-for="(prediction, index) in predictions"
            :key="prediction.place_id"
            :class="[
              'px-4 py-3 cursor-pointer flex items-start space-x-3 transition-colors',
              highlightedIndex === index
                ? 'bg-teal-50 dark:bg-teal-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            ]"
            @mousedown.prevent="selectPlace(prediction)"
            @mouseenter="highlightedIndex = index"
          >
            <Icon 
              name="heroicons:map-pin" 
              class="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" 
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ prediction.structured_formatting?.main_text || prediction.description }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ prediction.structured_formatting?.secondary_text || '' }}
              </p>
            </div>
          </li>
        </ul>
        
        <!-- Powered by Google attribution -->
        <div class="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <img 
            src="https://developers.google.com/static/maps/documentation/images/powered_by_google_on_white.png" 
            alt="Powered by Google" 
            class="h-4 dark:hidden"
          />
          <img 
            src="https://developers.google.com/static/maps/documentation/images/powered_by_google_on_non_white.png" 
            alt="Powered by Google" 
            class="h-4 hidden dark:block"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
}

interface Props {
  modelValue: string
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  disabled?: boolean
  types?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for a location',
  size: 'lg',
  icon: 'heroicons:map-pin',
  disabled: false,
  types: () => ['(cities)']
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'place-selected': [place: { description: string; placeId: string }]
}>()

const config = useRuntimeConfig()

const inputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref(props.modelValue)
const predictions = ref<PlacePrediction[]>([])
const showDropdown = ref(false)
const isLoading = ref(false)
const highlightedIndex = ref(-1)
const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const sessionToken = ref<string>('')

// Generate a new session token for billing optimization
const generateSessionToken = () => {
  sessionToken.value = crypto.randomUUID()
}

// Initialize session token
onMounted(() => {
  generateSessionToken()
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

const handleInput = () => {
  highlightedIndex.value = -1
  
  // Clear existing timer
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
  
  // Don't search if query is too short
  if (searchQuery.value.length < 2) {
    predictions.value = []
    return
  }
  
  // Debounce the search
  debounceTimer.value = setTimeout(() => {
    searchPlaces()
  }, 300)
}

const searchPlaces = async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    predictions.value = []
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await $fetch<{ predictions: PlacePrediction[] }>('/api/places/autocomplete', {
      params: {
        input: searchQuery.value,
        types: props.types.join('|'),
        sessionToken: sessionToken.value
      }
    })
    
    predictions.value = response.predictions || []
  } catch (error) {
    console.error('Places autocomplete error:', error)
    predictions.value = []
  } finally {
    isLoading.value = false
  }
}

const selectPlace = (prediction: PlacePrediction) => {
  searchQuery.value = prediction.description
  emit('update:modelValue', prediction.description)
  emit('place-selected', {
    description: prediction.description,
    placeId: prediction.place_id
  })
  
  closeDropdown()
  
  // Generate new session token after selection (for billing optimization)
  generateSessionToken()
}

const handleBlur = () => {
  // Delay closing to allow click events on dropdown items
  setTimeout(() => {
    closeDropdown()
  }, 200)
}

const closeDropdown = () => {
  showDropdown.value = false
  highlightedIndex.value = -1
}

const navigateDown = () => {
  if (predictions.value.length > 0) {
    highlightedIndex.value = (highlightedIndex.value + 1) % predictions.value.length
  }
}

const navigateUp = () => {
  if (predictions.value.length > 0) {
    highlightedIndex.value = highlightedIndex.value <= 0 
      ? predictions.value.length - 1 
      : highlightedIndex.value - 1
  }
}

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < predictions.value.length) {
    selectPlace(predictions.value[highlightedIndex.value])
  }
}

// Cleanup
onUnmounted(() => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})
</script>
