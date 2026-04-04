/**
 * Composable for managing the mentee discovery questionnaire flow
 * Handles step tracking, responses storage, and filter generation
 */

interface DiscoveryResponses {
    goals: string[]
    categories: string[]
    journeyStage: string
    sessionType: string
    budget: string
}

interface DiscoveryState {
    currentStep: number
    responses: DiscoveryResponses
    completed: boolean
}

const STORAGE_KEY = 'mentee-discovery-state'

const defaultResponses: DiscoveryResponses = {
    goals: [],
    categories: [],
    journeyStage: '',
    sessionType: '',
    budget: ''
}

export const useMenteeDiscovery = () => {
    const totalSteps = 5

    // Initialize state from sessionStorage or defaults
    const state = useState<DiscoveryState>('mentee-discovery', () => {
        if (import.meta.client) {
            const saved = sessionStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch {
                    // Invalid JSON, use defaults
                }
            }
        }
        return {
            currentStep: 1,
            responses: { ...defaultResponses },
            completed: false
        }
    })

    // Persist to sessionStorage on changes
    watch(state, (newState) => {
        if (import.meta.client) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
        }
    }, { deep: true })

    // Computed properties
    const currentStep = computed(() => state.value.currentStep)
    const responses = computed(() => state.value.responses)
    const progress = computed(() => (state.value.currentStep / totalSteps) * 100)
    const isCompleted = computed(() => state.value.completed)

    // Step validation
    const canProceed = computed(() => {
        const r = state.value.responses
        switch (state.value.currentStep) {
            case 1:
                return r.goals.length > 0
            case 2:
                return r.categories.length > 0
            case 3:
                return !!r.journeyStage
            case 4:
                return !!r.sessionType
            case 5:
                return !!r.budget
            default:
                return false
        }
    })

    // Navigation
    const nextStep = () => {
        if (canProceed.value && state.value.currentStep < totalSteps) {
            state.value.currentStep++
        } else if (state.value.currentStep === totalSteps && canProceed.value) {
            state.value.completed = true
        }
    }

    const previousStep = () => {
        if (state.value.currentStep > 1) {
            state.value.currentStep--
        }
    }

    const goToStep = (step: number) => {
        if (step >= 1 && step <= totalSteps) {
            state.value.currentStep = step
        }
    }

    // Update responses
    const setGoals = (goals: string[]) => {
        state.value.responses.goals = goals.slice(0, 2) // Max 2
    }

    const setCategories = (categories: string[]) => {
        state.value.responses.categories = categories.slice(0, 3) // Max 3
    }

    const setJourneyStage = (stage: string) => {
        state.value.responses.journeyStage = stage
    }

    const setSessionType = (type: string) => {
        state.value.responses.sessionType = type
    }

    const setBudget = (budget: string) => {
        state.value.responses.budget = budget
    }

    // Generate filter params for mentors page
    const getFilterParams = (): URLSearchParams => {
        const params = new URLSearchParams()
        const r = state.value.responses

        if (r.categories.length > 0) {
            params.set('categories', r.categories.join(','))
        }

        // Map budget to price range
        switch (r.budget) {
            case 'under-50':
                params.set('maxPrice', '50')
                break
            case '50-100':
                params.set('minPrice', '50')
                params.set('maxPrice', '100')
                break
            case '100-200':
                params.set('minPrice', '100')
                params.set('maxPrice', '200')
                break
            case '200-plus':
                params.set('minPrice', '200')
                break
            // 'flexible' - no price filter
        }

        // Mark as coming from discovery flow
        params.set('from', 'discovery')

        return params
    }

    // Get URL for mentors page with filters
    const getMentorsUrl = (): string => {
        const params = getFilterParams()
        const queryString = params.toString()
        return queryString ? `/mentors?${queryString}` : '/mentors'
    }

    // Reset the discovery flow
    const reset = () => {
        state.value = {
            currentStep: 1,
            responses: { ...defaultResponses },
            completed: false
        }
        if (import.meta.client) {
            sessionStorage.removeItem(STORAGE_KEY)
        }
    }

    return {
        // State
        currentStep: readonly(currentStep),
        totalSteps,
        responses: readonly(responses),
        progress: readonly(progress),
        isCompleted: readonly(isCompleted),
        canProceed: readonly(canProceed),

        // Navigation
        nextStep,
        previousStep,
        goToStep,

        // Setters
        setGoals,
        setCategories,
        setJourneyStage,
        setSessionType,
        setBudget,

        // Utilities
        getFilterParams,
        getMentorsUrl,
        reset
    }
}
