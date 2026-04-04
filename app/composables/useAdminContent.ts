interface AdminCategory {
  id: string
  name: string
  description: string
  icon: string
  active: boolean
  mentorCount: number
  createdAt: Date
  updatedAt: Date
}

interface AdminSkill {
  id: string
  name: string
  categoryId: string | null
  active: boolean
  mentorCount: number
  createdAt: Date
  updatedAt: Date
  category?: {
    id: string
    name: string
    icon: string
  }
}

interface CategoriesResponse {
  categories: AdminCategory[]
}

interface SkillsResponse {
  skills: AdminSkill[]
}

export const useAdminContent = () => {
  const categories = ref<AdminCategory[]>([])
  const skills = ref<AdminSkill[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const skillSearchQuery = ref('')

  // Modals
  const showCategoryModal = ref(false)
  const showSkillModal = ref(false)
  const isSavingCategory = ref(false)
  const isSavingSkill = ref(false)

  // Editing state
  const editingCategory = ref<AdminCategory | null>(null)
  const editingSkill = ref<AdminSkill | null>(null)

  // Form data
  const newCategory = reactive({
    name: '',
    description: '',
    icon: 'heroicons:folder'
  })

  const newSkill = reactive({
    name: '',
    categoryId: ''
  })

  // Categories API calls
  const fetchCategories = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<CategoriesResponse>('/api/admin/categories')
      categories.value = response.categories
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to fetch categories'
      console.error('[useAdminContent] Error fetching categories:', e)
    } finally {
      isLoading.value = false
    }
  }

  const createCategory = async (categoryData: typeof newCategory) => {
    isSavingCategory.value = true
    error.value = null

    try {
      if (editingCategory.value) {
        // Update existing category
        const response = await $fetch<{ category: AdminCategory }>(`/api/admin/categories/${editingCategory.value.id}`, {
          method: 'PUT',
          body: categoryData
        })

        const index = categories.value.findIndex(cat => cat.id === editingCategory.value?.id)
        if (index !== -1) {
          categories.value[index] = response.category
        }
      } else {
        // Create new category
        const response = await $fetch<{ category: AdminCategory }>('/api/admin/categories', {
          method: 'POST',
          body: categoryData
        })
        categories.value.push(response.category)
      }

      // Reset form and close modal
      resetCategoryForm()
      showCategoryModal.value = false
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to save category'
      console.error('[useAdminContent] Error saving category:', e)
    } finally {
      isSavingCategory.value = false
    }
  }

  const resetCategoryForm = () => {
    Object.assign(newCategory, {
      name: '',
      description: '',
      icon: 'heroicons:folder'
    })
    editingCategory.value = null
  }

  const updateCategory = async (categoryId: string, categoryData: Partial<AdminCategory>) => {
    error.value = null

    try {
      const response = await $fetch<{ category: AdminCategory }>(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: categoryData
      })

      const index = categories.value.findIndex(cat => cat.id === categoryId)
      if (index !== -1) {
        categories.value[index] = response.category
      }
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to update category'
      console.error('[useAdminContent] Error updating category:', e)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    error.value = null

    try {
      await $fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      categories.value = categories.value.filter(cat => cat.id !== categoryId)
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to delete category'
      console.error('[useAdminContent] Error deleting category:', e)
    }
  }

  const toggleCategory = async (category: AdminCategory) => {
    await updateCategory(category.id, { active: !category.active })
  }

  // Skills API calls
  const fetchSkills = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<SkillsResponse>('/api/admin/skills', {
        query: {
          search: skillSearchQuery.value || ''
        }
      })
      skills.value = response.skills
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to fetch skills'
      console.error('[useAdminContent] Error fetching skills:', e)
    } finally {
      isLoading.value = false
    }
  }

  const createSkill = async (skillData: typeof newSkill) => {
    isSavingSkill.value = true
    error.value = null

    try {
      if (editingSkill.value) {
        // Update existing skill
        const response = await $fetch<{ skill: AdminSkill }>(`/api/admin/skills/${editingSkill.value.id}`, {
          method: 'PUT',
          body: skillData
        })

        const index = skills.value.findIndex(skill => skill.id === editingSkill.value?.id)
        if (index !== -1) {
          skills.value[index] = response.skill
        }
      } else {
        // Create new skill
        const response = await $fetch<{ skill: AdminSkill }>('/api/admin/skills', {
          method: 'POST',
          body: skillData
        })
        skills.value.push(response.skill)
      }

      // Reset form and close modal
      resetSkillForm()
      showSkillModal.value = false
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to save skill'
      console.error('[useAdminContent] Error saving skill:', e)
    } finally {
      isSavingSkill.value = false
    }
  }

  const resetSkillForm = () => {
    Object.assign(newSkill, {
      name: '',
      categoryId: ''
    })
    editingSkill.value = null
  }

  const updateSkill = async (skillId: string, skillData: Partial<AdminSkill>) => {
    error.value = null

    try {
      const response = await $fetch<{ skill: AdminSkill }>(`/api/admin/skills/${skillId}`, {
        method: 'PUT',
        body: skillData
      })

      const index = skills.value.findIndex(skill => skill.id === skillId)
      if (index !== -1) {
        skills.value[index] = response.skill
      }
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to update skill'
      console.error('[useAdminContent] Error updating skill:', e)
    }
  }

  const deleteSkill = async (skillId: string) => {
    error.value = null

    try {
      await $fetch(`/api/admin/skills/${skillId}`, {
        method: 'DELETE'
      })

      skills.value = skills.value.filter(skill => skill.id !== skillId)
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to delete skill'
      console.error('[useAdminContent] Error deleting skill:', e)
    }
  }

  // Computed properties
  const filteredSkills = computed(() => {
    if (!skillSearchQuery.value) return skills.value

    const query = skillSearchQuery.value.toLowerCase()
    return skills.value.filter(skill =>
      skill.name.toLowerCase().includes(query)
    )
  })

  const categoryOptions = computed(() => [
    { label: 'Select a category', value: '' },
    ...categories.value.map(cat => ({
      label: cat.name,
      value: cat.id
    }))
  ])

  // Watch for search changes
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  watch(skillSearchQuery, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchSkills()
    }, 300)
  })

  return {
    // Categories
    categories: readonly(categories),
    // Skills
    skills: readonly(skills),
    filteredSkills,
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    // Filters
    skillSearchQuery,
    // Modals
    showCategoryModal,
    showSkillModal,
    isSavingCategory,
    isSavingSkill,
    // Forms
    newCategory,
    newSkill,
    // Editing state
    editingCategory,
    editingSkill,
    // Options
    categoryOptions,
    // Category methods
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
    resetCategoryForm,
    // Skill methods
    fetchSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    resetSkillForm,
  }
}
