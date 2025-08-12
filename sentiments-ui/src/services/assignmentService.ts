import { API_BASE_URL } from '@/config'

export interface Assignment {
  _id: string
  patientId: string
  patientName: string
  patientEmail: string
  workerId: string
  workerName: string
  workerRole: string
  department: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'completed' | 'cancelled'
  notes: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  // Virtual populated fields from backend
  patient?: any
  worker?: any
  assignedByUser?: any
}

interface CreateAssignmentData {
  patientId: string
  patientName: string
  patientEmail: string
  workerId: string
  workerName: string
  workerRole: string
  department: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'active' | 'completed' | 'cancelled'
  notes?: string
  startDate: string
  endDate: string
}

export interface UpdateAssignmentData {
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'active' | 'completed' | 'cancelled'
  notes?: string
  endDate?: string
  metadata?: any
}

class AssignmentService {
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

  async getAssignments(): Promise<Assignment[]> {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    const result = await this.handleResponse<{success: boolean, data: {assignments: any[]}}>(response)

    // Transform backend response to frontend interface
    return (result.data?.assignments || []).map((assignment: any) => ({
      _id: assignment._id,
      patientId: assignment.patientId,
      patientName: assignment.patient?.name || 'Unknown Patient',
      patientEmail: assignment.patient?.email || '',
      workerId: assignment.workerId,
      workerName: assignment.worker?.name || 'Unknown Worker',
      workerRole: assignment.worker?.role || 'Staff',
      department: assignment.department,
      priority: assignment.priority,
      status: assignment.status,
      notes: assignment.notes || '',
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      patient: assignment.patient,
      worker: assignment.worker,
      assignedByUser: assignment.assignedByUser
    }))
  }

  async getAssignmentById(assignmentId: string): Promise<Assignment> {
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<Assignment>(response)
  }

  async createAssignment(assignmentData: CreateAssignmentData): Promise<Assignment> {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData)
    })
    const result = await this.handleResponse<{success: boolean, data: any}>(response)

    // Transform backend response to frontend interface
    const assignment = result.data
    return {
      _id: assignment._id,
      patientId: assignment.patientId,
      patientName: assignment.patient?.name || 'Unknown Patient',
      patientEmail: assignment.patient?.email || '',
      workerId: assignment.workerId,
      workerName: assignment.worker?.name || 'Unknown Worker',
      workerRole: assignment.worker?.role || 'Staff',
      department: assignment.department,
      priority: assignment.priority,
      status: assignment.status,
      notes: assignment.notes || '',
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      patient: assignment.patient,
      worker: assignment.worker,
      assignedByUser: assignment.assignedByUser
    }
  }

  async updateAssignment(id: string, updateData: Partial<CreateAssignmentData>): Promise<Assignment> {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    })
    const result = await this.handleResponse<{success: boolean, data: any}>(response)

    // Transform backend response to frontend interface
    const assignment = result.data
    return {
      _id: assignment._id,
      patientId: assignment.patientId,
      patientName: assignment.patient?.name || 'Unknown Patient',
      patientEmail: assignment.patient?.email || '',
      workerId: assignment.workerId,
      workerName: assignment.worker?.name || 'Unknown Worker',
      workerRole: assignment.worker?.role || 'Staff',
      department: assignment.department,
      priority: assignment.priority,
      status: assignment.status,
      notes: assignment.notes || '',
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      patient: assignment.patient,
      worker: assignment.worker,
      assignedByUser: assignment.assignedByUser
    }
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
  }

  async getAssignmentsByPatient(patientId: string): Promise<Assignment[]> {
    const response = await fetch(`${API_BASE_URL}/assignments/patient/${patientId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<Assignment[]>(response)
  }

  async getAssignmentsByWorker(workerId: string): Promise<Assignment[]> {
    const response = await fetch(`${API_BASE_URL}/assignments/worker/${workerId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<Assignment[]>(response)
  }

  async updateAssignmentStatus(assignmentId: string, status: 'active' | 'completed' | 'cancelled'): Promise<Assignment> {
    return this.updateAssignment(assignmentId, { status })
  }

  async getAssignmentStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/assignments/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<any>(response)
  }
}

export const assignmentService = new AssignmentService()
export default assignmentService
