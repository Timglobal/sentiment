import { ref, computed } from 'vue'
import { workerService, type Worker, type CreateWorkerData, type UpdateWorkerData } from '@/services/workerService'
import { useToast } from 'vue-toast-notification'

export function useWorkers() {
  const toast = useToast()

  // State
  const workers = ref<Worker[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Search and filter state
  const searchQuery = ref('')
  const selectedRoleFilter = ref<'' | 'staff' | 'patient'>('')
  const selectedStatusFilter = ref<'' | 'Active' | 'Inactive'>('')

  // Computed filtered workers
  const filteredWorkers = computed(() => {
    let filtered = workers.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(query) ||
        worker.email.toLowerCase().includes(query) ||
        (worker.department && worker.department.toLowerCase().includes(query))
      )
    }

    // Filter by role
    if (selectedRoleFilter.value) {
      filtered = filtered.filter(worker => worker.role === selectedRoleFilter.value)
    }

    // Note: Status filtering would need to be implemented based on your business logic
    // For now, all workers are considered "Active" unless you add a status field

    return filtered
  })

  // API Methods
  const fetchWorkers = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await workerService.getWorkers()
      workers.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch workers'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  const createWorker = async (workerData: CreateWorkerData): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const newWorker = await workerService.createWorker(workerData)
      workers.value.push(newWorker)
      toast.success('Worker added successfully! Welcome email sent.')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create worker'
      toast.error(error.value)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateWorker = async (workerId: string, workerData: Partial<UpdateWorkerData>): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const updatedWorker = await workerService.updateWorker(workerId, workerData)
      const index = workers.value.findIndex(w => w._id === workerId)
      if (index !== -1) {
        workers.value[index] = updatedWorker
      }
      toast.success('Worker updated successfully!')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update worker'
      toast.error(error.value)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteWorker = async (workerId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await workerService.deleteWorker(workerId)
      workers.value = workers.value.filter(w => w._id !== workerId)
      toast.success('Worker deleted successfully!')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete worker'
      toast.error(error.value)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getWorkerById = (workerId: string): Worker | undefined => {
    return workers.value.find(w => w._id === workerId)
  }

  return {
    // State
    workers,
    isLoading,
    error,

    // Filters
    searchQuery,
    selectedRoleFilter,
    selectedStatusFilter,
    filteredWorkers,

    // Methods
    fetchWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
    getWorkerById
  }
}
