interface Category {
  id: string
  name: string
  description: string
  icon: string
}

interface CategoriesResponse {
  categories: Category[]
}

export const useCategories = () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchCategories = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<CategoriesResponse>('/api/categories')
      categories.value = response.categories
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to fetch categories'
      console.error('[useCategories] Error fetching categories:', e)
    } finally {
      isLoading.value = false
    }
  }

  // Computed property for select options
  const categoryOptions = computed(() =>
    categories.value.map(cat => cat.name).sort()
  )

  // Computed property for select options with full objects
  const categorySelectOptions = computed(() =>
    categories.value.map(cat => ({
      label: cat.name,
      value: cat.name
    })).sort((a, b) => a.label.localeCompare(b.label))
  )

  return {
    categories: readonly(categories),
    isLoading: readonly(isLoading),
    error: readonly(error),
    categoryOptions,
    categorySelectOptions,
    fetchCategories,
  }
}

