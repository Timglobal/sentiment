import { ref, computed } from 'vue'
import { momentService, type CreateMomentData, type Moment } from '@/services/momentService'
import { useToast } from 'vue-toast-notification'

export function useMoments() {
  const $toast = useToast()

  // State
  const moments = ref<Moment[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const momentCount = computed(() => moments.value.length)

  const recentMoments = computed(() =>
    moments.value
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  )

  // Actions
  const createMoment = async (momentData: CreateMomentData): Promise<boolean> => {
    try {
      isSubmitting.value = true
      error.value = null

      const response = await momentService.createMoment(momentData)

      // Add the new moment to the list
      moments.value.unshift(response.moment)

      $toast.success('Moment uploaded successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload moment'
      error.value = errorMessage
      $toast.error(errorMessage)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const loadMoments = async (params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    workerId?: string
  }): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const data = await momentService.getAllMoments(params)
      moments.value = data.moments
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load moments'
      error.value = errorMessage
      $toast.error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Utility functions
  const getFileType = (file: File): 'image' | 'video' => {
    return file.type.startsWith('image/') ? 'image' : 'video'
  }

  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi'
    ]

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV, AVI) file'
    }

    if (file.size > maxSize) {
      return 'File size must be less than 50MB'
    }

    return null
  }

  return {
    // State
    moments,
    isLoading,
    isSubmitting,
    error,

    // Computed
    momentCount,
    recentMoments,

    // Actions
    createMoment,
    loadMoments,
    clearError,

    // Utilities
    getFileType,
    validateFile
  }
}
