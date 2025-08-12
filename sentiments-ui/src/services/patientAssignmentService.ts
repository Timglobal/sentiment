import { API_BASE_URL } from '@/config'

class PatientAssignmentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  }

  // Get patients assigned to current staff member
  async getAssignedPatients(staffId: string, options: {
    page?: number
    limit?: number
    status?: string
    priority?: string
    search?: string
  } = {}) {
    try {
      const params = new URLSearchParams()
      params.append('workerId', staffId)
      if (options.page) params.append('page', options.page.toString())
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.status) params.append('status', options.status)
      if (options.priority) params.append('priority', options.priority)
      if (options.search) params.append('search', options.search)

      const response = await fetch(`${API_BASE_URL}/assignments?${params}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching assigned patients:', error)
      throw error
    }
  }

  // Get patient details with medical history
  async getPatientDetails(patientId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${patientId}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const patientData = await response.json()

      // Also fetch medical history (notes from assignments and treatments)
      const medicalHistoryResponse = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-history`, {
        headers: this.getAuthHeaders()
      })

      let medicalHistory = []
      if (medicalHistoryResponse.ok) {
        const historyData = await medicalHistoryResponse.json()
        medicalHistory = historyData.data || []
      }

      return {
        ...patientData.data,
        medicalHistory
      }
    } catch (error) {
      console.error('Error fetching patient details:', error)
      throw error
    }
  }

  // Update patient information (staff can update notes, treatment plans)
  async updatePatientRecord(patientId: string, updateData: {
    medicalNotes?: string
    treatmentPlan?: {
      medications?: string[]
      instructions?: string
    }
    status?: string
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/update-record`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating patient record:', error)
      throw error
    }
  }

  // Schedule treatment appointment
  async scheduleTreatment(treatmentData: {
    patientId: string
    assignmentId: string
    treatmentType: string
    title: string
    description: string
    scheduledDateTime: string
    duration: number
    priority: string
    location?: {
      room?: string
      department: string
    }
    assignedDoctor?: string
    preparation?: string
    notes?: string
    reminders?: {
      enabled: boolean
      email: boolean
      sms: boolean
    }
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/treatment-schedules`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(treatmentData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error scheduling treatment:', error)
      throw error
    }
  }

  // Get patient's treatment history
  async getPatientTreatments(patientId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/treatment-schedules?patientId=${patientId}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching patient treatments:', error)
      throw error
    }
  }

  // Get staff's upcoming appointments
  async getStaffSchedule(staffId: string, startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams()
      params.append('workerId', staffId)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`${API_BASE_URL}/treatment-schedules?${params}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching staff schedule:', error)
      throw error
    }
  }

  // Update treatment status
  async updateTreatmentStatus(treatmentId: string, status: string, outcome?: {
    notes?: string
    followUpRequired?: boolean
    followUpDate?: string
    complications?: string
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/treatment-schedules/${treatmentId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, outcome })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating treatment status:', error)
      throw error
    }
  }

  // Add medical note to patient history
  async addMedicalNote(patientId: string, note: {
    type: 'consultation' | 'treatment' | 'observation' | 'emergency'
    title: string
    content: string
    treatmentScheduleId?: string
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-notes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(note)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error adding medical note:', error)
      throw error
    }
  }

  // Get assignment statistics for staff dashboard
  async getAssignmentStats(staffId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/stats?workerId=${staffId}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching assignment stats:', error)
      throw error
    }
  }
}

export const patientAssignmentService = new PatientAssignmentService()
