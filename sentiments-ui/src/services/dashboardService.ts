import { API_BASE_URL } from '@/config'

export interface DashboardStatistics {
  totalFeedbacks: number
  totalMoments: number
  totalUsers: number
  totalWorkers: number
  positivePercentage: number
  averageSentiment: number
  weeklyFeedbacks: number
  weeklyMoments: number
  sentimentAnalysis: {
    feedbacks: {
      averageSentiment: number
      total: number
      positive: number
      neutral: number
      negative: number
    }
    moments: {
      averageSentiment: number
      total: number
      positive: number
      neutral: number
      negative: number
    }
    combined: {
      total: number
      positive: number
      neutral: number
      negative: number
    }
  }
}

export interface RecentActivity {
  id: string
  type: 'feedback' | 'moment'
  title: string
  description: string
  time: string
  sentiment?: number
  userInfo?: {
    _id: string
    name: string
  }
}

export interface UserContext {
  isAdmin: boolean
  companyName: string
  companyId?: string
}

export interface DashboardOverview {
  statistics: DashboardStatistics
  recentActivities: RecentActivity[]
  userContext: UserContext
}

export interface UserProfile {
  _id: string
  name: string
  email: string
  role?: string
  department?: string
  note?: string
  avatar?: string
  company?: {
    _id: string
    name: string
    address?: string
    companyId?: string
  }
  personalStats?: {
    feedbacksSubmitted: number
    momentsShared: number
    lastActivity: string | null
  }
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  route: string
  color: string
  available: boolean
}

export interface QuickActionsResponse {
  actions: QuickAction[]
}

class DashboardService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    return await response.json()
  }

  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse<DashboardOverview>(response)
    } catch (error) {
      console.error('Error fetching dashboard overview:', error)
      throw error
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse<UserProfile>(response)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  async getQuickActions(): Promise<QuickActionsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/quick-actions`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse<QuickActionsResponse>(response)
    } catch (error) {
      console.error('Error fetching quick actions:', error)
      throw error
    }
  }
}

export default new DashboardService()
