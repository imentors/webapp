import type { MentorProfile } from '~/types'

interface MentorListResponse {
  mentors: ApiMentor[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ApiMentor {
  id: string
  name: string
  image: string | null
  bio: string | null
  experience: string | null
  hourlyRate: number | null
  skills: string[]
  categories: string[]
  languages: string[]
  timezone: string | null
  rating: number
  totalSessions: number
  isAvailable: boolean
}

interface MentorDetailResponse {
  id: string
  firstName: string
  lastName: string
  name: string
  avatar: string | null
  bio: string | null
  location: string | null
  experience: string | null
  hourlyRate: number | null
  skills: string[]
  categories: string[]
  languages: string[]
  timezone: string | null
  rating: number
  totalSessions: number
  isAvailable: boolean
  createdAt: string
}

interface FiltersResponse {
  categories: string[]
  skills: string[]
  priceRange: {
    min: number
    max: number
  }
}

export const useMentors = () => {
  const mentors = ref<MentorProfile[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Filters
  const searchQuery = ref('')
  const selectedCategories = ref<string[]>([])
  const selectedSkills = ref<string[]>([])
  const priceRange = ref<{ min?: number; max?: number }>({})
  
  // Pagination
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalMentors = ref(0)
  
  // Available filter options (from API)
  const availableCategories = ref<string[]>([])
  const availableSkills = ref<string[]>([])
  const availablePriceRange = ref<{ min: number; max: number }>({ min: 0, max: 500 })

  // Transform API mentor to MentorProfile type
  const transformMentor = (m: ApiMentor): MentorProfile => {
    const nameParts = m.name.split(' ')
    return {
      id: m.id,
      email: '', // Not exposed in API
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      role: 'mentor',
      avatar: m.image || undefined,
      bio: m.bio || '',
      skills: m.skills,
      categories: m.categories,
      hourlyRate: m.hourlyRate || 0,
      experience: m.experience || '',
      availability: [],
      rating: m.rating,
      totalSessions: m.totalSessions,
      languages: m.languages,
      timezone: m.timezone || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  const fetchMentors = async (page = 1) => {
    isLoading.value = true
    error.value = null
    
    try {
      const params = new URLSearchParams()
      
      if (searchQuery.value) params.set('search', searchQuery.value)
      if (selectedCategories.value.length) params.set('categories', selectedCategories.value.join(','))
      if (selectedSkills.value.length) params.set('skills', selectedSkills.value.join(','))
      if (priceRange.value.min !== undefined) params.set('minPrice', priceRange.value.min.toString())
      if (priceRange.value.max !== undefined) params.set('maxPrice', priceRange.value.max.toString())
      params.set('page', page.toString())
      params.set('limit', '20')

      const response = await $fetch<MentorListResponse>(`/api/mentors?${params.toString()}`)
      
      mentors.value = response.mentors.map(transformMentor)
      currentPage.value = response.pagination.page
      totalPages.value = response.pagination.totalPages
      totalMentors.value = response.pagination.total
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch mentors'
      console.error('[useMentors] Error:', e)
    } finally {
      isLoading.value = false
    }
  }

  const fetchFilters = async () => {
    try {
      const response = await $fetch<FiltersResponse>('/api/mentors/filters')
      availableCategories.value = response.categories
      availableSkills.value = response.skills
      availablePriceRange.value = response.priceRange
    } catch (e) {
      console.error('[useMentors] Error fetching filters:', e)
    }
  }

  const getMentorById = async (id: string): Promise<MentorProfile | null> => {
    try {
      const response = await $fetch<MentorDetailResponse>(`/api/mentors/${id}`)
      
      return {
        id: response.id,
        email: '',
        firstName: response.firstName,
        lastName: response.lastName,
        role: 'mentor',
        avatar: response.avatar || undefined,
        bio: response.bio || '',
        skills: response.skills,
        categories: response.categories,
        hourlyRate: response.hourlyRate || 0,
        experience: response.experience || '',
        availability: [],
        rating: response.rating,
        totalSessions: response.totalSessions,
        languages: response.languages,
        timezone: response.timezone || '',
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.createdAt),
      }
    } catch (e) {
      console.error('[useMentors] Error fetching mentor:', e)
      return null
    }
  }

  // For backward compatibility with existing code
  const getMentorProfile = (id: string) => {
    return mentors.value.find(m => m.id === id)
  }

  // Client-side filtering for instant feedback
  const filteredMentors = computed(() => {
    // When using API, mentors are already filtered server-side
    // This is kept for instant client-side filtering while typing
    let filtered = mentors.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(mentor => 
        mentor.firstName.toLowerCase().includes(query) ||
        mentor.lastName.toLowerCase().includes(query) ||
        mentor.bio.toLowerCase().includes(query) ||
        mentor.skills.some(skill => skill.toLowerCase().includes(query))
      )
    }

    return filtered
  })

  // Computed for filter options (use API data or fallback to mentor data)
  const getAllCategories = computed(() => {
    if (availableCategories.value.length > 0) {
      return availableCategories.value
    }
    const categories = new Set<string>()
    mentors.value.forEach(mentor => {
      mentor.categories.forEach(category => categories.add(category))
    })
    return Array.from(categories).sort()
  })

  const getAllSkills = computed(() => {
    if (availableSkills.value.length > 0) {
      return availableSkills.value
    }
    const skills = new Set<string>()
    mentors.value.forEach(mentor => {
      mentor.skills.forEach(skill => skills.add(skill))
    })
    return Array.from(skills).sort()
  })

  // Watch for filter changes and refetch (with debounce)
  let filterTimeout: ReturnType<typeof setTimeout> | null = null
  
  watch([selectedCategories, selectedSkills, priceRange], () => {
    if (filterTimeout) clearTimeout(filterTimeout)
    filterTimeout = setTimeout(() => {
      fetchMentors(1)
    }, 300)
  }, { deep: true })

  return {
    mentors: readonly(mentors),
    isLoading: readonly(isLoading),
    error: readonly(error),
    searchQuery,
    selectedCategories,
    selectedSkills,
    priceRange,
    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalMentors: readonly(totalMentors),
    filteredMentors,
    fetchMentors,
    fetchFilters,
    getMentorById,
    getMentorProfile,
    getAllCategories,
    getAllSkills,
  }
}
