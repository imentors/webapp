import type { AdminUser } from '~/types'

export const useAdminUsers = () => {
  const toast = useToast()
  const users = useState<AdminUser[]>('admin-users-list', () => [])
  const isLoading = useState<boolean>('admin-users-loading', () => false)
  const error = useState<string | null>('admin-users-error', () => null)

  // Filters
  const searchQuery = useState<string>('admin-users-search', () => '')
  const selectedStatus = useState<string>('admin-users-status', () => 'all')

  // Pagination
  const currentPage = useState<number>('admin-users-page', () => 1)
  const totalPages = useState<number>('admin-users-total-pages', () => 1)
  const totalUsers = useState<number>('admin-users-total-count', () => 0)
  const pageSize = 10

  // Transform API user to AdminUser type
  const transformUser = (u: ApiAdminUser): AdminUser => {
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      avatar: u.avatar,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
      status: u.status,
      lastActive: new Date(u.lastActive),
    }
  }

  const fetchUsers = async (page = 1) => {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()

      if (searchQuery.value) params.set('search', searchQuery.value)
      if (selectedStatus.value && selectedStatus.value !== 'all') params.set('status', selectedStatus.value)
      params.set('page', page.toString())
      params.set('limit', pageSize.toString())

      const response = await $fetch<AdminUsersResponse>(`/api/admin/users?${params.toString()}`)

      users.value = response.users.map((user: any) => transformUser(user))
      currentPage.value = response.pagination.page
      totalPages.value = response.pagination.totalPages
      totalUsers.value = response.pagination.total
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to fetch users'
      console.error('[useAdminUsers] Error:', e)
    } finally {
      isLoading.value = false
    }
  }

  const getUserById = async (id: string): Promise<AdminUser | null> => {
    try {
      // First check local state
      const localUser = users.value.find(u => u.id === id)
      if (localUser) return localUser

      // If not found, fetch from API
      const response = await $fetch<any>(`/api/admin/users/${id}`)
      return transformUser(response)
    } catch (e) {
      console.error('[useAdminUsers] Error fetching user:', e)
      return null
    }
  }

  const toggleUserStatus = async (user: AdminUser) => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active'

      await $fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: { status: newStatus }
      })

      // Update local state
      user.status = newStatus

      // Refetch to ensure list is in sync (especially for filters)
      await fetchUsers(currentPage.value)

      toast.add({
        title: 'Status Updated',
        description: `User status changed to ${newStatus}`,
        color: 'success'
      })
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to update user status'
      toast.add({
        title: 'Error',
        description: error.value || 'Failed to update user status',
        color: 'error'
      })
      throw e
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await $fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })

      // Update local state
      users.value = users.value.filter(user => user.id !== userId)
      totalUsers.value -= 1

      // Refetch to ensure pagination and list are in sync
      await fetchUsers(currentPage.value)

      toast.add({
        title: 'User Deleted',
        description: 'User has been successfully deleted',
        color: 'success'
      })
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to delete user'
      toast.add({
        title: 'Error',
        description: error.value || 'Failed to delete user',
        color: 'error'
      })
      throw e
    }
  }

  // Client-side filtering for instant feedback (while typing search)
  const filteredUsers = computed(() => {
    // When using API, users are already filtered server-side
    // This is kept for instant client-side filtering while typing
    let filtered = users.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    }

    if (selectedStatus.value && selectedStatus.value !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus.value)
    }

    return filtered
  })

  // Watch for filter changes and refetch (with debounce for search)
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  watch(searchQuery, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 1
      fetchUsers(1)
    }, 300)
  })

  watch(selectedStatus, () => {
    currentPage.value = 1
    fetchUsers(1)
  })

  watch(currentPage, () => {
    fetchUsers(currentPage.value)
  })

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  return {
    users: readonly(users),
    isLoading: readonly(isLoading),
    error: readonly(error),
    searchQuery,
    selectedStatus,
    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalUsers: readonly(totalUsers),
    pageSize: pageSize,
    filteredUsers,
    fetchUsers,
    getUserById,
    toggleUserStatus,
    deleteUser,
    previousPage,
    nextPage,
  }
}
