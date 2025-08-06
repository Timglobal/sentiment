import { ref } from 'vue'
import { API_BASE_URL } from '@/config'

// Base response interface
export interface AnalyticsResponse {
  success: boolean
  message?: string
  data?: {
    executiveSummary?: {
      overallSentiment?: number
      totalFeedbacks?: number
      totalMoments?: number
      totalUsers?: number
    }
    sentimentOverview?: {
      breakdown?: {
        feedback?: {
          excellent?: number
          veryPositive?: number
          positive?: number
          neutral?: number
          negative?: number
          veryNegative?: number
          avgSentiment?: number
          totalAnalyzed?: number
        }
        moments?: {
          excellent?: number
          veryPositive?: number
          positive?: number
          neutral?: number
          negative?: number
          veryNegative?: number
          avgSentiment?: number
          totalAnalyzed?: number
        }
      }
    }
    performance?: {
      departments?: Array<{
        _id: string
        totalWorkers?: number
        totalFeedbacks?: number
        totalMoments?: number
        avgSentiment?: number
        workerCount?: number
        overallSentiment?: number
      }>
      workers?: {
        topPerformers?: Array<{
          _id: string
          name: string
          department: string
          feedbackCount?: number
          momentCount?: number
          totalFeedbacks?: number
          totalMoments?: number
          avgSentiment?: number
        }>
        needsAttention?: Array<{
          _id: string
          name: string
          department: string
          feedbackCount?: number
          momentCount?: number
          totalFeedbacks?: number
          totalMoments?: number
          avgSentiment?: number
        }>
      }
    }
    insights?: Array<{
      type: string
      message: string
    }>
  }
}

// Filtered analytics parameters
export interface FilteredAnalyticsParams {
  startDate?: string
  endDate?: string
  department?: string
  workerId?: string
  source?: string
  timeRange?: string
}

// Types for new backend API response structure
export interface ExecutiveSummary {
  totalFeedbacks: number
  totalMoments: number
  totalUsers: number
  overallSentiment: number
}

export interface SentimentBreakdown {
  feedback: {
    avgSentiment: number
    totalAnalyzed: number
    excellent: number
    veryPositive: number
    positive: number
    neutral: number
    negative: number
    veryNegative: number
    maxSentiment: number
    minSentiment: number
  }
  moments: {
    avgSentiment: number
    totalAnalyzed: number
    excellent: number
    veryPositive: number
    positive: number
    neutral: number
    negative: number
    veryNegative: number
    maxSentiment: number
    minSentiment: number
  }
}

export interface SentimentOverview {
  breakdown: SentimentBreakdown
  combined: {
    avgSentiment: number
    totalAnalyzed: number
  }
}

export interface DailyTrend {
  _id: string
  avgSentiment: number
  count: number
}

export interface WeeklyTrend {
  current: {
    count: number
    avgSentiment: number
  }
  previous: {
    count: number
    avgSentiment: number
  }
  growth: number
}

export interface HourlyActivity {
  _id: number
  count: number
  avgSentiment: number
}

export interface Trends {
  daily: DailyTrend[]
  weekly: WeeklyTrend
  hourly: HourlyActivity[]
}

export interface DepartmentAnalysis {
  _id: string
  totalWorkers: number
  totalFeedbacks: number
  totalMoments: number
  avgSentiment: number
  workerCount: number
  overallSentiment: number
  positivePercentage: number
}

export interface WorkerPerformance {
  _id: string
  name: string
  email: string
  role: string
  department: string
  feedbackCount: number
  momentCount: number
  totalFeedbacks: number
  totalMoments: number
  avgSentiment: number
}

export interface Performance {
  departments: DepartmentAnalysis[]
  workers: {
    topPerformers: WorkerPerformance[]
    needsAttention: WorkerPerformance[]
  }
}

export interface SourceAnalysis {
  _id: string
  count: number
  avgSentiment: number
  totalFeedbacks: number
  positivePercentage: number
}

export interface Insight {
  type: string
  title: string
  description: string
  message: string
  value: number
  priority: string
}

export interface ComprehensiveAnalytics {
  executiveSummary: ExecutiveSummary
  summary: ExecutiveSummary // alias for backward compatibility
  sentimentOverview: SentimentOverview
  trends: Trends
  performance: Performance
  departmentAnalysis: DepartmentAnalysis[]
  workerPerformance: {
    topPerformers: WorkerPerformance[]
    needsAttention: WorkerPerformance[]
    all: WorkerPerformance[]
  }
  sourceAnalysis: SourceAnalysis[]
  sources: SourceAnalysis[]
  insights: Insight[]
  metadata: {
    generatedAt: string
    timeRange: string
    companyId: string
    dateFilter: object
  }
}

export interface ComprehensiveAnalyticsResponse {
  success: boolean
  data: ComprehensiveAnalytics
}

export interface AnalyticsParams {
  timeRange?: '7d' | '30d' | '90d' | '1y'
  startDate?: string
  endDate?: string
}

export interface ExportParams {
  format?: 'json' | 'csv'
  type?: 'summary' | 'detailed'
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

  // Get comprehensive analytics data with time range
  async getComprehensiveAnalytics(timeRange: string = '30d'): Promise<AnalyticsResponse> {
    try {
      console.log('📊 Fetching comprehensive analytics from:', `${this.baseURL}/?timeRange=${timeRange}`)

      const response = await fetch(`${this.baseURL}/?timeRange=${timeRange}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      console.log('📊 Comprehensive analytics response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Comprehensive analytics API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 Comprehensive analytics data received:', data)
      return data
    } catch (error) {
      console.error('❌ Error fetching comprehensive analytics:', error)
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
      if (params.source && params.source !== 'all') {
        queryParams.append('source', params.source)
      }
      if (params.timeRange) {
        queryParams.append('timeRange', params.timeRange)
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

    // Return simplified structure that matches the new API format
    return {
      realTimeData: {
        sentimentTrends: [],
        feedbackCategories: [],
        departmentScores: [],
        metrics: {
          totalFeedback: data.executiveSummary?.totalFeedbacks || 0,
          avgSentimentScore: data.executiveSummary?.overallSentiment || 0
        }
      },
      analyticsData: {
        totalFeedback: data.executiveSummary?.totalFeedbacks || 0,
        positiveSentiment: 0,
        neutralSentiment: 0,
        negativeSentiment: 0,
        engagementScore: Math.round((data.executiveSummary?.overallSentiment || 0) * 100),
        averageRating: 4.0,
        momentsShared: data.executiveSummary?.totalMoments || 0,
        activeUsers: data.executiveSummary?.totalUsers || 0,
        completionRate: 94.5,
        averageResponseTime: 2.1,
        satisfactionScore: data.executiveSummary?.overallSentiment || 0
      },
      workers: [],
      departments: [],
      recentActivity: []
    }
  }
}

// Create and export a singleton instance
export const analyticsService = new AnalyticsService()

// Default export for compatibility
export default analyticsService

// Composable for reactive analytics data
export function useAnalyticsService() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const fetchAnalytics = async (params?: AnalyticsParams) => {
    isLoading.value = true
    error.value = null

    try {
      const timeRange = params?.timeRange || '30d'
      const data = await analyticsService.getComprehensiveAnalytics(timeRange)
      lastUpdated.value = new Date()
      return data
    } catch (err) {
      console.error('❌ Analytics fetch error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch analytics'
      throw err
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
