import { API_BASE_URL } from '@/config'

export interface TreatmentSchedule {
  _id: string
  assignmentId: string
  patientId: string
  workerId: string
  treatmentType: 'consultation' | 'procedure' | 'surgery' | 'therapy' | 'checkup' | 'lab_work' | 'imaging' | 'emergency'
  title: string
  description: string
  scheduledDate: string
  estimatedDuration: number
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
  location?: {
    room?: string
    floor?: string
    building?: string
    notes?: string
  }
  preparation?: {
    instructions?: string
    medications?: string[]
    restrictions?: string[]
    requiredTests?: string[]
  }
  assignedDoctor?: string
  assistingStaff?: string[]
  reminders: {
    patient: {
      email: {
        enabled: boolean
        sent: boolean
        sentAt?: string
        scheduledFor?: string
      }
      sms: {
        enabled: boolean
        sent: boolean
        sentAt?: string
        scheduledFor?: string
      }
    }
    staff: {
      email: {
        enabled: boolean
        sent: boolean
        sentAt?: string
        scheduledFor?: string
      }
      sms: {
        enabled: boolean
        sent: boolean
        sentAt?: string
        scheduledFor?: string
      }
    }
  }
  results?: {
    completed: boolean
    notes?: string
    followUpRequired: boolean
    followUpDate?: string
    nextAppointment?: string
  }
  createdAt: string
  updatedAt: string
  // Virtual populated fields
  patient?: any
  worker?: any
  doctor?: any
  assignment?: any
}

export interface CreateTreatmentData {
  assignmentId: string
  treatmentType: TreatmentSchedule['treatmentType']
  title: string
  description: string
  scheduledDate: string
  estimatedDuration: number
  priority?: TreatmentSchedule['priority']
  location?: TreatmentSchedule['location']
  preparation?: TreatmentSchedule['preparation']
  assignedDoctor?: string
  reminders?: {
    sendPatientEmail?: boolean
    sendStaffEmail?: boolean
    patientEmailTime?: string
    staffEmailTime?: string
  }
}

export interface UpdateTreatmentData {
  treatmentType?: TreatmentSchedule['treatmentType']
  title?: string
  description?: string
  scheduledDate?: string
  estimatedDuration?: number
  priority?: TreatmentSchedule['priority']
  status?: TreatmentSchedule['status']
  location?: TreatmentSchedule['location']
  preparation?: TreatmentSchedule['preparation']
  assignedDoctor?: string
  results?: TreatmentSchedule['results']
}

export interface TreatmentQueryParams {
  page?: number
  limit?: number
  status?: TreatmentSchedule['status']
  treatmentType?: TreatmentSchedule['treatmentType']
  priority?: TreatmentSchedule['priority']
  workerId?: string
  patientId?: string
  startDate?: string
  endDate?: string
  department?: string
}

class TreatmentScheduleService {
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
    return await response.json()
  }

  private buildQueryString(params: TreatmentQueryParams): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return searchParams.toString()
  }

  async getTreatmentSchedules(params: TreatmentQueryParams = {}): Promise<{
    schedules: TreatmentSchedule[]
    pagination: {
      page: number
      pages: number
      total: number
      limit: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    const queryString = this.buildQueryString(params)
    const url = `${API_BASE_URL}/treatments${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    const result = await this.handleResponse<{success: boolean, data: any}>(response)
    return result.data
  }

  async getTreatmentScheduleById(id: string): Promise<TreatmentSchedule> {
    const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    const result = await this.handleResponse<{success: boolean, data: TreatmentSchedule}>(response)
    return result.data
  }

  async createTreatmentSchedule(data: CreateTreatmentData): Promise<TreatmentSchedule> {
    const response = await fetch(`${API_BASE_URL}/treatments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    const result = await this.handleResponse<{success: boolean, data: TreatmentSchedule}>(response)
    return result.data
  }

  async updateTreatmentSchedule(id: string, data: UpdateTreatmentData): Promise<TreatmentSchedule> {
    const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    const result = await this.handleResponse<{success: boolean, data: TreatmentSchedule}>(response)
    return result.data
  }

  async deleteTreatmentSchedule(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
  }

  async getWorkerSchedule(workerId: string | 'me' = 'me', params: {
    startDate?: string
    endDate?: string
    status?: TreatmentSchedule['status']
  } = {}): Promise<{
    schedules: TreatmentSchedule[]
    summary: {
      total: number
      upcoming: number
      completed: number
      cancelled: number
    }
  }> {
    const queryString = this.buildQueryString(params)
    const url = `${API_BASE_URL}/treatments/worker/${workerId}${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    const result = await this.handleResponse<{success: boolean, data: any}>(response)
    return result.data
  }

  async getPatientAppointments(patientId: string, status?: TreatmentSchedule['status']): Promise<TreatmentSchedule[]> {
    const params = status ? `?status=${status}` : ''
    const response = await fetch(`${API_BASE_URL}/treatments/patient/${patientId}${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    const result = await this.handleResponse<{success: boolean, data: TreatmentSchedule[]}>(response)
    return result.data
  }

  async updateTreatmentStatus(id: string, status: TreatmentSchedule['status'], notes?: string, results?: any): Promise<TreatmentSchedule> {
    const response = await fetch(`${API_BASE_URL}/treatments/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes, results })
    })

    const result = await this.handleResponse<{success: boolean, data: TreatmentSchedule}>(response)
    return result.data
  }

  async getTreatmentStats(params: {
    workerId?: string
    department?: string
  } = {}): Promise<{
    overview: {
      totalScheduled: number
      todayScheduled: number
      completed: number
      cancelled: number
      urgent: number
    }
    upcomingCount: number
  }> {
    const queryString = this.buildQueryString(params)
    const url = `${API_BASE_URL}/treatments/stats/overview${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    const result = await this.handleResponse<{success: boolean, data: any}>(response)
    return result.data
  }

  async getTodaySchedule(workerId: string | 'me' = 'me'): Promise<{
    schedules: TreatmentSchedule[]
    summary: {
      total: number
      upcoming: number
      completed: number
      cancelled: number
    }
  }> {
    const response = await fetch(`${API_BASE_URL}/treatments/today/${workerId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    const result = await this.handleResponse<{success: boolean, data: any}>(response)
    return result.data
  }

  async getUpcomingTreatments(workerId: string | 'me' = 'me'): Promise<{
    schedules: TreatmentSchedule[]
    summary: {
      total: number
      upcoming: number
      completed: number
      cancelled: number
    }
  }> {
    const response = await fetch(`${API_BASE_URL}/treatments/upcoming/${workerId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    const result = await this.handleResponse<{success: boolean, data: any}>(response)
    return result.data
  }

  // Utility methods
  formatTreatmentType(type: TreatmentSchedule['treatmentType']): string {
    const typeMap: Record<TreatmentSchedule['treatmentType'], string> = {
      consultation: 'Consultation',
      procedure: 'Medical Procedure',
      surgery: 'Surgery',
      therapy: 'Therapy Session',
      checkup: 'Check-up',
      lab_work: 'Lab Work',
      imaging: 'Medical Imaging',
      emergency: 'Emergency Treatment'
    }
    return typeMap[type] || type
  }

  formatPriority(priority: TreatmentSchedule['priority']): string {
    const priorityMap: Record<TreatmentSchedule['priority'], string> = {
      low: 'Low Priority',
      normal: 'Normal',
      high: 'High Priority',
      urgent: 'Urgent'
    }
    return priorityMap[priority] || priority
  }

  formatStatus(status: TreatmentSchedule['status']): string {
    const statusMap: Record<TreatmentSchedule['status'], string> = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled'
    }
    return statusMap[status] || status
  }

  getPriorityColor(priority: TreatmentSchedule['priority']): string {
    const colorMap: Record<TreatmentSchedule['priority'], string> = {
      low: 'green',
      normal: 'blue',
      high: 'orange',
      urgent: 'red'
    }
    return colorMap[priority] || 'gray'
  }

  getStatusColor(status: TreatmentSchedule['status']): string {
    const colorMap: Record<TreatmentSchedule['status'], string> = {
      scheduled: 'blue',
      in_progress: 'yellow',
      completed: 'green',
      cancelled: 'red',
      rescheduled: 'purple'
    }
    return colorMap[status] || 'gray'
  }
}

export const treatmentScheduleService = new TreatmentScheduleService()
export default treatmentScheduleService
