import { API_BASE_URL } from '@/config'

export interface Feedback {
  _id: string
  senderName: string
  senderEmail: string
  workerName: string
  workerId: string
  userId?: string
  source: string
  message: string
  sentimentScore?: number
  timestamp: string
}

export interface FeedbackStats {
  totalFeedbacks: number
  averageSentiment: number | null
  positiveCount: number
  neutralCount: number
  negativeCount: number
}

export interface FeedbackResponse {
  feedbacks: Feedback[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface SubmitFeedbackData {
  name: string
  email: string
  message: string
  workerId: string
  source: string
}

class FeedbackService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async submitFeedback(feedbackData: SubmitFeedbackData): Promise<{ message: string }> {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Include auth header if user is logged in
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(feedbackData)
    })
    return this.handleResponse<{ message: string }>(response)
  }

  async getAllFeedbacks(params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    workerId?: string
    sentimentFilter?: 'positive' | 'negative' | 'neutral'
  }): Promise<FeedbackResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.workerId) queryParams.append('workerId', params.workerId)
    if (params?.sentimentFilter) queryParams.append('sentimentFilter', params.sentimentFilter)

    const response = await fetch(`${API_BASE_URL}/feedback?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<FeedbackResponse>(response)
  }

  async getFeedbackStats(params?: {
    workerId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<FeedbackStats> {
    const queryParams = new URLSearchParams()

    if (params?.workerId) queryParams.append('workerId', params.workerId)
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo)

    const response = await fetch(`${API_BASE_URL}/feedback/stats?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<FeedbackStats>(response)
  }
}

export const feedbackService = new FeedbackService()
