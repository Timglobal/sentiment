import { ref } from 'vue'
import { API_BASE_URL } from '@/config'

// Types for API responses - Updated to match new backend
export interface SentimentOverview {
  moments: {
    totalMoments: number
    averageSentiment: number
    positive: number
    neutral: number
    negative: number
  }
  feedbacks: {
    totalFeedbacks: number
    averageSentiment: number
    positive: number
    neutral: number
    negative: number
  }
  combined: {
    total: number
    averageSentiment: number
    positive: number
    neutral: number
    negative: number
  }
}

export interface SentimentTrend {
  date: string
  averageSentiment: number
  count: number
  positive: number
  neutral: number
  negative: number
}

export interface DepartmentAnalytics {
  department: string
  workerCount: number
  totalMoments: number
  totalFeedbacks: number
  momentsSentiment: number
  feedbacksSentiment: number
  overallSentiment: number
}

export interface WorkerPerformance {
  _id: string
  name: string
  email: string
  role: string
  department: string
  totalMoments: number
  totalFeedbacks: number
  momentsSentiment: number
  feedbacksSentiment: number
  overallSentiment: number
  positiveMoments: number
  positiveFeedbacks: number
  totalPositive: number
}

export interface AnalyticsResponse {
  success: boolean
  data: {
    sentimentOverview: SentimentOverview
    momentsSentimentTrend: SentimentTrend[]
    feedbackSentimentTrend: SentimentTrend[]
    departmentAnalytics: DepartmentAnalytics[]
    workerPerformance: WorkerPerformance[]
    sentimentComparison: {
      moments: Array<{
        _id: number
        count: number
        avgScore: number
      }>
      feedbacks: Array<{
        _id: number
        count: number
        avgScore: number
      }>
    }
    recentActivity: {
      moments: Array<{
        _id: string
        workerId: {
          _id: string
          name: string
          department: string
          role: string
        }
        mediaType: string
        sentimentScore: number
        timestamp: string
      }>
      feedbacks: Array<{
        _id: string
        workerId: {
          _id: string
          name: string
          department: string
          role: string
        }
        senderName: string
        sentimentScore: number
        timestamp: string
      }>
    }
    lastUpdated: string
    totalWorkers: number
  }
}

export interface FilteredAnalyticsParams {
  startDate?: string
  endDate?: string
  department?: string
  workerId?: string
}

class AnalyticsService {
  private baseURL = `${API_BASE_URL}/analytics`

  // Get the auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('token')
  }

  // Create headers with auth token
  private getHeaders(): HeadersInit {
    const token = this.getAuthToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Get comprehensive analytics data
  async getAnalytics(): Promise<AnalyticsResponse> {
    try {
      console.log('📊 Fetching analytics from:', `${this.baseURL}/`)

      const response = await fetch(`${this.baseURL}/`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      console.log('📊 Analytics response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Analytics API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 Analytics data received:', data)
      return data
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
      throw error
    }
  }

  // Get filtered analytics data
  async getFilteredAnalytics(params: FilteredAnalyticsParams): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.department && params.department !== 'all') {
        queryParams.append('department', params.department)
      }
      if (params.workerId && params.workerId !== 'all') {
        queryParams.append('workerId', params.workerId)
      }

      const url = `${this.baseURL}/filtered?${queryParams.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching filtered analytics:', error)
      throw error
    }
  }

  // Transform API data to match frontend interface
  transformToFrontendFormat(apiData: AnalyticsResponse) {
    console.log('🔄 Transforming analytics data:', apiData)

    if (!apiData || !apiData.data) {
      console.error('❌ Invalid analytics data structure:', apiData)
      throw new Error('Invalid analytics data received from API')
    }

    const { data } = apiData

    // Safely handle potentially undefined arrays
    const momentsTrend = data.momentsSentimentTrend || []
    const departmentAnalytics = data.departmentAnalytics || []
    const workerPerformance = data.workerPerformance || []
    const overview = data.sentimentOverview || {
      moments: { totalMoments: 0, averageSentiment: 0, positive: 0, neutral: 0, negative: 0 },
      feedbacks: { totalFeedbacks: 0, averageSentiment: 0, positive: 0, neutral: 0, negative: 0 },
      combined: { total: 0, averageSentiment: 0, positive: 0, neutral: 0, negative: 0 }
    }
    const recentActivity = data.recentActivity || { moments: [], feedbacks: [] }

    console.log('📊 Data arrays:', {
      momentsTrend: momentsTrend.length,
      departmentAnalytics: departmentAnalytics.length,
      workerPerformance: workerPerformance.length,
      recentMoments: recentActivity.moments.length,
      recentFeedbacks: recentActivity.feedbacks.length
    })

    // Transform to match SentimentTrendData interface
    const sentimentTrends = momentsTrend.map(item => ({
      date: item.date,
      positive: item.positive,
      neutral: item.neutral,
      negative: item.negative,
      timestamp: new Date(item.date).getTime()
    }))

    // Transform feedback categories - create from department analytics
    const feedbackCategories = departmentAnalytics.map((item, index) => ({
      name: item.department,
      value: overview.feedbacks.totalFeedbacks > 0
        ? Math.round((item.totalFeedbacks / overview.feedbacks.totalFeedbacks) * 100)
        : 0,
      fill: `hsl(var(--chart-${index + 1}))`
    }))

    // Transform department scores to match DepartmentScoreData interface
    const departmentScores = departmentAnalytics.map(item => ({
      department: item.department,
      score: Math.round(item.overallSentiment * 10) / 10,
      change: 0 // Calculate based on historical data if available
    }))

    // Transform metrics using new structure
    const metrics = {
      totalFeedback: overview.feedbacks.totalFeedbacks,
      avgSentimentScore: Math.round(overview.combined.averageSentiment * 10) / 10,
      responseRate: 85.2, // This would be calculated from response tracking
      avgResponseTime: 2.1 // This would come from response time tracking
    }

    // Analytics table data using new structure
    const analyticsData = {
      totalFeedback: overview.feedbacks.totalFeedbacks,
      positiveSentiment: overview.combined.positive,
      neutralSentiment: overview.combined.neutral,
      negativeSentiment: overview.combined.negative,
      engagementScore: Math.round(overview.combined.averageSentiment * 100),
      responseRate: 85.2,
      averageRating: Math.round((overview.combined.averageSentiment + 1) * 2.5), // Convert to 5-star scale
      momentsShared: overview.moments.totalMoments,
      activeUsers: data.totalWorkers || 0,
      completionRate: 94.5, // This would be calculated from completion tracking
      averageResponseTime: 2.1,
      satisfactionScore: Math.round(overview.combined.averageSentiment * 10) / 10
    }

    return {
      realTimeData: {
        sentimentTrends,
        feedbackCategories,
        departmentScores,
        metrics
      },
      analyticsData,
      workers: workerPerformance.map(worker => ({
        id: worker._id,
        name: worker.name,
        department: worker.department,
        role: worker.role
      })),
      departments: [...new Set(departmentAnalytics.map(d => d.department))].map(dept => ({
        id: dept.toLowerCase(),
        name: dept
      })),
      recentActivity: [
        ...recentActivity.moments.map(moment => ({
          _id: moment._id,
          type: 'moment' as const,
          content: `${moment.mediaType} moment`,
          sentiment: moment.sentimentScore,
          sentimentLabel: moment.sentimentScore > 0.1 ? 'positive' : moment.sentimentScore < -0.1 ? 'negative' : 'neutral',
          worker: moment.workerId.name,
          department: moment.workerId.department,
          createdAt: moment.timestamp
        })),
        ...recentActivity.feedbacks.map(feedback => ({
          _id: feedback._id,
          type: 'feedback' as const,
          content: `Feedback from ${feedback.senderName}`,
          sentiment: feedback.sentimentScore,
          sentimentLabel: feedback.sentimentScore > 0.1 ? 'positive' : feedback.sentimentScore < -0.1 ? 'negative' : 'neutral',
          worker: feedback.workerId.name,
          department: feedback.workerId.department,
          createdAt: feedback.timestamp
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
    }
  }
}

// Create and export a singleton instance
export const analyticsService = new AnalyticsService()

// Composable for reactive analytics data
export function useAnalyticsService() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const fetchAnalytics = async (params?: FilteredAnalyticsParams) => {
    isLoading.value = true
    error.value = null

    try {
      const data = params
        ? await analyticsService.getFilteredAnalytics(params)
        : await analyticsService.getAnalytics()

      lastUpdated.value = new Date()
      return analyticsService.transformToFrontendFormat(data)
    } catch (err) {
      console.error('❌ Analytics fetch error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch analytics'

      // Return empty analytics data as fallback
      return {
        realTimeData: {
          sentimentTrends: [],
          feedbackCategories: [],
          departmentScores: [],
          metrics: {
            totalFeedback: 0,
            avgSentimentScore: 0,
            responseRate: 0,
            avgResponseTime: 0
          }
        },
        analyticsData: {
          totalFeedback: 0,
          positiveSentiment: 0,
          neutralSentiment: 0,
          negativeSentiment: 0,
          engagementScore: 0,
          responseRate: 0,
          averageRating: 0,
          momentsShared: 0,
          activeUsers: 0,
          completionRate: 0,
          averageResponseTime: 0,
          satisfactionScore: 0
        },
        workers: [{ id: "all", name: "All Workers", department: "All" }],
        departments: [{ id: "all", name: "All Departments" }],
        recentActivity: []
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    lastUpdated,
    fetchAnalytics
  }
}
