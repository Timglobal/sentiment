import { API_BASE_URL } from '@/config'

export interface Worker {
  _id: string
  name: string
  email: string
  role: 'staff' | 'patient'
  department?: string
  note?: string
  avatar?: string
  company: string
  createdAt: string
  updatedAt: string
}

export interface CreateWorkerData {
  name: string
  email: string
  role: 'staff' | 'patient'
  department?: string
  note?: string
}

export interface UpdateWorkerData extends CreateWorkerData {
  _id: string
}

class WorkerService {
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

  async getWorkers(): Promise<Worker[]> {
    const response = await fetch(`${API_BASE_URL}/workers`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<Worker[]>(response)
  }

  async createWorker(workerData: CreateWorkerData): Promise<Worker> {
    const response = await fetch(`${API_BASE_URL}/workers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(workerData)
    })
    return this.handleResponse<Worker>(response)
  }

  async updateWorker(workerId: string, workerData: Partial<UpdateWorkerData>): Promise<Worker> {
    const response = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(workerData)
    })
    return this.handleResponse<Worker>(response)
  }

  async deleteWorker(workerId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
  }
}

export const workerService = new WorkerService()
