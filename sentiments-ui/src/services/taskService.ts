// Remove the config import since we're using relative API paths
import { API_BASE_URL } from '@/config'
export interface Task {
  _id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  category: string
  dueDate: string
  createdAt: string
  updatedAt: string
  userId: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  notes?: Array<{
    content: string
    createdBy: {
      _id: string
      name: string
      email: string
    }
    createdAt: string
  }>
  completedAt?: string
  isArchived?: boolean
}

export interface CreateTaskRequest {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  dueDate: string
  estimatedHours?: number
  tags?: string[]
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: 'pending' | 'in-progress' | 'completed' | 'overdue'
  actualHours?: number
}

export interface TaskFilters {
  status?: string
  priority?: string
  category?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  limit?: number
}

export interface TaskStats {
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  overdueTasks: number
  averageCompletionTime?: number
}

class TaskService {
  private baseURL = `${API_BASE_URL}/tasks`

  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    console.log('Auth token:', token ? 'Token exists' : 'No token found')
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  }

  /**
   * Get all tasks for the current user
   */
  async getTasks(filters?: TaskFilters): Promise<{
    success: boolean
    data: Task[]
    total: number
    stats?: TaskStats
    message?: string
  }> {
    try {
      const params = new URLSearchParams()

      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.page) params.append('page', filters.page.toString())

      const url = `${this.baseURL}${params.toString() ? '?' + params.toString() : ''}`
      console.log('Fetching tasks from:', url)
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      })

      console.log('Response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If response isn't JSON, use the text
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Raw API response:', data)

      return {
        success: true,
        data: data.data || [],
        total: data.pagination?.totalTasks || data.data?.length || 0,
        stats: data.stats
      }
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      return {
        success: false,
        data: [],
        total: 0,
        message: error.message || 'Failed to fetch tasks'
      }
    }
  }

  /**
   * Get task statistics for the current user
   */
  async getTaskStats(): Promise<{
    success: boolean
    data: TaskStats
    message?: string
  }> {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: data
      }
    } catch (error: any) {
      console.error('Error fetching task stats:', error)
      return {
        success: false,
        data: {
          totalTasks: 0,
          pendingTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          averageCompletionTime: 0
        },
        message: error.message || 'Failed to fetch task statistics'
      }
    }
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(taskId: string): Promise<{
    success: boolean
    data: Task | null
    message?: string
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${taskId}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: data.data
      }
    } catch (error: any) {
      console.error('Error fetching task:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch task'
      }
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskRequest): Promise<{
    success: boolean
    data: Task | null
    message?: string
  }> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create Task API Error:', errorText)
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      return {
        success: true,
        data: data.data,
        message: data.message || 'Task created successfully'
      }
    } catch (error: any) {
      console.error('Error creating task:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create task'
      }
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, taskData: UpdateTaskRequest): Promise<{
    success: boolean
    data: Task | null
    message?: string
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${taskId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update Task API Error:', errorText)
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      return {
        success: true,
        data: data.data,
        message: data.message || 'Task updated successfully'
      }
    } catch (error: any) {
      console.error('Error updating task:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update task'
      }
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${taskId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return {
        success: true,
        message: 'Task deleted successfully'
      }
    } catch (error: any) {
      console.error('Error deleting task:', error)
      return {
        success: false,
        message: error.message || 'Failed to delete task'
      }
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<{
    success: boolean
    data: Task | null
    message?: string
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${taskId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: data,
        message: 'Task status updated successfully'
      }
    } catch (error: any) {
      console.error('Error updating task status:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update task status'
      }
    }
  }
}

export const taskService = new TaskService()
export default taskService
