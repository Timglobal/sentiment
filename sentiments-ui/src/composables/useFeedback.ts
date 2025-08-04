import { ref, computed } from 'vue'
import {
  feedbackService,
  type SubmitFeedbackData,
  type Feedback,
  type FeedbackStats,
  type FeedbackResponse
} from '@/services/feedbackService'
import { useToast } from 'vue-toast-notification'

export function useFeedback() {
  const $toast = useToast()

  // State
  const feedbacks = ref<Feedback[]>([])
  const feedbackStats = ref<FeedbackStats | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const isLoadingStats = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const feedbackCount = computed(() => pagination.value.total)

  const positiveCount = computed(() =>
    feedbackStats.value?.positiveCount ||
    feedbacks.value.filter(f => f.sentimentScore && f.sentimentScore >= 70).length
  )

  const negativeCount = computed(() =>
    feedbackStats.value?.negativeCount ||
    feedbacks.value.filter(f => f.sentimentScore && f.sentimentScore < 30).length
  )

  const neutralCount = computed(() =>
    feedbackStats.value?.neutralCount ||
    feedbacks.value.filter(f => f.sentimentScore && f.sentimentScore >= 30 && f.sentimentScore < 70).length
  )

  const averageSentiment = computed(() => feedbackStats.value?.averageSentiment || null)

  // Actions
  const submitFeedback = async (feedbackData: SubmitFeedbackData): Promise<boolean> => {
    try {
      isSubmitting.value = true
      error.value = null

      await feedbackService.submitFeedback(feedbackData)

      $toast.success('Feedback submitted successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback'
      error.value = errorMessage
      $toast.error(errorMessage)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const loadFeedbacks = async (params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    workerId?: string
    sentimentFilter?: 'positive' | 'negative' | 'neutral'
  }): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const data = await feedbackService.getAllFeedbacks(params)
      feedbacks.value = data.feedbacks
      pagination.value = data.pagination
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feedbacks'
      error.value = errorMessage
      $toast.error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const loadFeedbackStats = async (params?: {
    workerId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<void> => {
    try {
      isLoadingStats.value = true
      error.value = null

      const data = await feedbackService.getFeedbackStats(params)
      feedbackStats.value = data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feedback statistics'
      error.value = errorMessage
      $toast.error(errorMessage)
    } finally {
      isLoadingStats.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    feedbacks,
    feedbackStats,
    pagination,
    isLoading,
    isSubmitting,
    isLoadingStats,
    error,

    // Computed
    feedbackCount,
    positiveCount,
    negativeCount,
    neutralCount,
    averageSentiment,

    // Actions
    submitFeedback,
    loadFeedbacks,
    loadFeedbackStats,
    clearError
  }
}
