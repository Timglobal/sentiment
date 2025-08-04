import { API_BASE_URL } from '@/config'
import type { Worker } from './workerService'

export interface Moment {
  _id: string
  workerId: string | Worker  // Can be either string ID or populated Worker object
  extractedText?: string     // Text extracted from media
  mediaUrl: string
  mediaType: 'image' | 'video'
  submittedBy: string
  sentimentScore?: number
  timestamp: string
}

export interface CreateMomentData {
  workerId: string
  mediaType: 'image' | 'video'
  submittedBy: string
  media: File
}

export interface MomentResponse {
  moments: Moment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface CreateMomentResponse {
  message: string
  moment: Moment
}

class MomentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
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

  async createMoment(momentData: CreateMomentData): Promise<CreateMomentResponse> {
    const formData = new FormData()
    formData.append('workerId', momentData.workerId)
    formData.append('mediaType', momentData.mediaType)
    formData.append('submittedBy', momentData.submittedBy)
    formData.append('media', momentData.media)

    const response = await fetch(`${API_BASE_URL}/moments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData
    })
    return this.handleResponse<CreateMomentResponse>(response)
  }

  async getAllMoments(params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    workerId?: string
  }): Promise<MomentResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.workerId) queryParams.append('workerId', params.workerId)

    const response = await fetch(`${API_BASE_URL}/moments?${queryParams}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    })
    return this.handleResponse<MomentResponse>(response)
  }
}

export const momentService = new MomentService()
