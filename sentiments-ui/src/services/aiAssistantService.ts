import { API_BASE_URL } from '@/config'
import { taskService } from './taskService'
import { feedbackService, type SubmitFeedbackData } from './feedbackService'
import { patientAssignmentService } from './patientAssignmentService'
import { treatmentScheduleService } from './treatmentScheduleService'

export interface ConversationContext {
  userRole: 'staff' | 'patient' | 'admin'
  userName: string
  userId: string
  companyName?: string
  intent?: 'task_management' | 'feedback_submission' | 'patient_inquiry' | 'general'
  currentAction?: string
  pendingData?: any
}

export interface AIResponse {
  message: string
  actionRequired?: boolean
  actionType?: 'create_task' | 'submit_feedback' | 'get_patient_info' | 'schedule_treatment' | 'get_tasks'
  followUpQuestions?: string[]
  data?: any
  intent?: string
}

export interface PatientInfo {
  _id: string
  name: string
  email: string
  department: string
  medicalHistory: Array<{
    id: string
    date: string
    type: string
    title: string
    content: string
    provider: string
    providerRole: string
  }>
  assignments?: Array<{
    _id: string
    workerId: string
    priority: string
    status: string
    notes?: string
  }>
  treatments?: Array<{
    _id: string
    treatmentType: string
    title: string
    status: string
    scheduledDate: string
  }>
}

class AIAssistantService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  }

  /**
   * Process user input and generate AI response using backend OpenAI integration
   */
  async processUserInput(
    userMessage: string,
    context: ConversationContext,
    conversationHistory: Array<{text: string, sender: string}> = []
  ): Promise<AIResponse> {
    try {
      // Call backend AI processing endpoint
      const response = await fetch(`${API_BASE_URL}/ai-assistant/process`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          message: userMessage,
          context: {
            userRole: context.userRole,
            userName: context.userName,
            userId: context.userId,
            currentAction: context.currentAction,
            companyName: context.companyName || 'Healthcare Facility'
          },
          conversationHistory: conversationHistory
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        const aiResponse = data.data

        return {
          message: aiResponse.message,
          actionRequired: aiResponse.actionRequired || false,
          actionType: aiResponse.actionType,
          followUpQuestions: aiResponse.followUpQuestions || [],
          data: aiResponse.data,
          intent: aiResponse.intent
        }
      } else {
        throw new Error(data.message || 'Failed to process AI request')
      }
    } catch (error) {
      console.error('AI processing error:', error)

      // Fallback to local processing for basic responses
      return this.handleLocalFallback(userMessage, context)
    }
  }

  /**
   * Handle local fallback when backend AI is unavailable
   */
  private handleLocalFallback(userMessage: string, context: ConversationContext): AIResponse {
    const message = userMessage.toLowerCase().trim()
    const { userRole, userName } = context

    // Basic greeting detection
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('start')) {
      return {
        message: `Hello ${userName}! I'm your AI healthcare assistant. ${userRole === 'staff'
          ? 'I can help you manage tasks, access patient information, schedule treatments, and submit feedback.'
          : 'I can help you submit feedback and answer questions about our services.'
        } How can I assist you today?`,
        actionRequired: false,
        followUpQuestions: userRole === 'staff'
          ? ["Create a task", "Check patients", "Schedule treatment", "Submit feedback"]
          : ["Submit feedback", "Ask questions", "Get help"]
      }
    }

    // Basic intent detection and response
    if (userRole === 'staff') {
      if (message.includes('task')) {
        return {
          message: "I can help you create and manage tasks. What would you like to do with tasks?",
          actionRequired: false,
          followUpQuestions: ["Create new task", "Show my tasks", "Update task status"]
        }
      }

      if (message.includes('patient')) {
        return {
          message: "I can help you access patient information for your assigned patients. Which patient would you like to know about?",
          actionRequired: false,
          followUpQuestions: ["Show my patients", "Search patient", "Patient history"]
        }
      }

      if (message.includes('treatment') || message.includes('schedule')) {
        return {
          message: "I can help you schedule treatments for your patients. Which patient needs a treatment scheduled?",
          actionRequired: false,
          followUpQuestions: ["Schedule consultation", "Schedule procedure", "View appointments"]
        }
      }
    }

    if (message.includes('feedback')) {
      return {
        message: "I can help you submit feedback. Please tell me who the feedback is about and what you'd like to share.",
        actionRequired: false,
        followUpQuestions: ["About a doctor", "About nursing staff", "About services"]
      }
    }

    return {
      message: "I'm here to help! Could you please tell me what you'd like to do? I can assist with various healthcare-related tasks.",
      actionRequired: false,
      followUpQuestions: userRole === 'staff'
        ? ["Task management", "Patient information", "Treatment scheduling", "Feedback"]
        : ["Submit feedback", "Ask questions", "Get support"]
    }
  }

  /**
   * Execute confirmed actions through backend API
   */
  async executeAction(actionType: string, actionData: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      let endpoint = ''
      let method = 'POST'

      switch (actionType) {
        case 'create_task':
          endpoint = '/ai-assistant/create-task'
          break
        case 'submit_feedback':
          endpoint = '/ai-assistant/submit-feedback'
          break
        case 'schedule_treatment':
          endpoint = '/ai-assistant/schedule-treatment'
          break
        default:
          throw new Error(`Unknown action type: ${actionType}`)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: this.getAuthHeaders(),
        body: JSON.stringify(actionData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: data.success,
        message: data.message,
        data: data.data
      }
    } catch (error) {
      console.error(`Action execution error (${actionType}):`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to execute action'
      }
    }
  }

  /**
   * Get patient information for staff members
   */
  async getPatientInfo(patientId: string): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-assistant/patient-info/${patientId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: data.success,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error('Patient info retrieval error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get patient information'
      }
    }
  }

  /**
   * Get available workers for feedback
   */
  async getAvailableWorkers(): Promise<{ success: boolean; data?: any[]; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-assistant/workers`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: data.success,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error('Workers retrieval error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get available workers'
      }
    }
  }

  /**
   * Get user context for AI assistant
   */
  async getUserContext(): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-assistant/context`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: data.success,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error('Context retrieval error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user context'
      }
    }
  }

  /**
   * Detect user intent from message
   */
  private detectIntent(message: string, userRole: string): ConversationContext['intent'] {
    if (userRole === 'staff') {
      if (message.includes('task') || message.includes('create') || message.includes('assign') || message.includes('schedule')) {
        return 'task_management'
      }
      if (message.includes('patient') || message.includes('medical') || message.includes('record') || message.includes('history')) {
        return 'patient_inquiry'
      }
      if (message.includes('feedback') || message.includes('review')) {
        return 'feedback_submission'
      }
    } else {
      if (message.includes('feedback') || message.includes('review') || message.includes('comment')) {
        return 'feedback_submission'
      }
    }
    return 'general'
  }

  /**
   * Handle task management for staff
   */
  private async handleTaskManagement(
    message: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    if (context.userRole !== 'staff') {
      return {
        message: "I'm sorry, but task management is only available for staff members. How else can I help you today?",
        actionRequired: false
      }
    }

    // Check if user wants to create a task
    if (message.includes('create') || message.includes('new task') || message.includes('add task')) {
      if (!context.currentAction) {
        context.currentAction = 'creating_task'
        context.pendingData = {}
        return {
          message: "I'll help you create a new task. Let's start with the basics:\n\n1. What is the title of the task?\n2. Could you provide a brief description?\n3. What's the priority level? (low, medium, high, urgent)\n4. Which category does this task belong to?\n5. When is the due date?\n\nYou can provide all this information at once, or we can go step by step.",
          actionRequired: true,
          actionType: 'create_task',
          followUpQuestions: [
            "What is the task title?",
            "What category is this task?",
            "When is it due?"
          ]
        }
      } else {
        // Parse task information from message
        const taskData = this.parseTaskData(message, context.pendingData)

        // Check if we have enough information
        if (taskData.title && taskData.description && taskData.category && taskData.dueDate) {
          try {
            const result = await taskService.createTask({
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority || 'medium',
              category: taskData.category,
              dueDate: taskData.dueDate,
              tags: taskData.tags || []
            })

            if (result.success) {
              context.currentAction = undefined
              context.pendingData = undefined
              return {
                message: `Great! I've successfully created the task "${taskData.title}" with ${taskData.priority} priority. It's scheduled to be completed by ${new Date(taskData.dueDate).toLocaleDateString()}. The task has been added to your task list.\n\nIs there anything else you'd like me to help you with?`,
                actionRequired: false,
                data: result.data
              }
            } else {
              return {
                message: `I encountered an issue while creating the task: ${result.message}. Could you please provide the information again or try a different approach?`,
                actionRequired: true,
                actionType: 'create_task'
              }
            }
          } catch (error) {
            return {
              message: "I'm having trouble creating the task right now. Please try again later or create the task manually through the task management page.",
              actionRequired: false
            }
          }
        } else {
          // Ask for missing information
          const missing = []
          if (!taskData.title) missing.push('title')
          if (!taskData.description) missing.push('description')
          if (!taskData.category) missing.push('category')
          if (!taskData.dueDate) missing.push('due date')

          return {
            message: `I need a bit more information to create the task. Please provide the ${missing.join(', ')}.\n\nFor example: "Create a task titled 'Review patient records' in the 'Medical Review' category, with high priority, due next Friday. Description: Review all patient records for compliance check."`,
            actionRequired: true,
            actionType: 'create_task'
          }
        }
      }
    }

    // Check if user wants to view tasks
    if (message.includes('show') || message.includes('list') || message.includes('view') || message.includes('my tasks')) {
      try {
        const result = await taskService.getTasks({ limit: 10 })
        if (result.success && result.data.length > 0) {
          const taskList = result.data.slice(0, 5).map((task: any, index: number) =>
            `${index + 1}. ${task.title} (${task.priority} priority, due: ${new Date(task.dueDate).toLocaleDateString()}) - ${task.status}`
          ).join('\n')

          return {
            message: `Here are your recent tasks:\n\n${taskList}\n\nYou have ${result.stats?.totalTasks || result.data.length} total tasks, with ${result.stats?.pendingTasks || 0} pending and ${result.stats?.completedTasks || 0} completed.\n\nWould you like me to help you with any specific task or create a new one?`,
            actionRequired: false,
            data: result.data
          }
        } else {
          return {
            message: "You don't have any tasks at the moment. Would you like me to help you create a new task?",
            actionRequired: false,
            followUpQuestions: ["Create a new task", "Schedule a treatment", "Check patient information"]
          }
        }
      } catch (error) {
        return {
          message: "I'm having trouble retrieving your tasks right now. You can check them manually in the task management section.",
          actionRequired: false
        }
      }
    }

    return {
      message: "I can help you with task management. I can:\n• Create new tasks\n• Show your current tasks\n• Update task status\n• Set task priorities\n\nWhat would you like to do?",
      actionRequired: false,
      followUpQuestions: ["Create a new task", "Show my tasks", "Update a task"]
    }
  }

  /**
   * Handle feedback submission
   */
  private async handleFeedbackSubmission(
    message: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    if (!context.currentAction) {
      context.currentAction = 'submitting_feedback'
      context.pendingData = { message: '' }

      if (context.userRole === 'staff') {
        return {
          message: "I'll help you submit feedback about a colleague or patient. Please tell me:\n\n1. Who is the feedback about? (Name or ID)\n2. What would you like to share about them?\n\nFor example: 'I want to give feedback about Dr. Smith regarding excellent patient care' or 'Feedback for nurse Sarah about her professionalism'",
          actionRequired: true,
          actionType: 'submit_feedback'
        }
      } else {
        return {
          message: "I'd be happy to help you submit feedback about your healthcare experience. Please share your thoughts about:\n\n• The quality of care you received\n• Your assigned healthcare staff\n• Any suggestions or concerns\n\nWhat would you like to tell us?",
          actionRequired: true,
          actionType: 'submit_feedback'
        }
      }
    } else {
      // Parse feedback information
      const feedbackData = this.parseFeedbackData(message, context)

      if (feedbackData.workerId && feedbackData.message) {
        try {
          const result = await feedbackService.submitFeedback({
            name: context.userName,
            email: '', // Will be filled from user profile
            message: feedbackData.message,
            workerId: feedbackData.workerId,
            source: 'AI Assistant'
          })

          context.currentAction = undefined
          context.pendingData = undefined

          return {
            message: "Thank you for your feedback! I've successfully submitted it to the appropriate team. Your input helps us improve our healthcare services.\n\nIs there anything else I can help you with?",
            actionRequired: false
          }
        } catch (error) {
          return {
            message: "I encountered an issue while submitting your feedback. Please try again or use the feedback form directly.",
            actionRequired: true,
            actionType: 'submit_feedback'
          }
        }
      } else {
        return {
          message: "I need a bit more information to submit your feedback. Please specify who the feedback is about and what you'd like to share. For example: 'Feedback for Dr. Johnson: Excellent bedside manner and very thorough explanations.'",
          actionRequired: true,
          actionType: 'submit_feedback'
        }
      }
    }
  }

  /**
   * Handle patient information inquiries for staff
   */
  private async handlePatientInquiry(
    message: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    if (context.userRole !== 'staff') {
      return {
        message: "I'm sorry, but patient information access is restricted to healthcare staff only. How else can I help you?",
        actionRequired: false
      }
    }

    const patientName = this.extractPatientName(message)
    if (!patientName) {
      return {
        message: "I can help you get patient information. Please specify which patient you'd like to know about. For example: 'Tell me about patient John Smith' or 'Show me Sarah Johnson's medical history'",
        actionRequired: false
      }
    }

    try {
      // Get assigned patients for the staff member
      const assignmentsResult = await patientAssignmentService.getAssignedPatients(context.userId)

      if (assignmentsResult.success && assignmentsResult.data) {
        const matchingPatient = assignmentsResult.data.find((assignment: any) =>
          assignment.patient?.name?.toLowerCase().includes(patientName.toLowerCase())
        )

        if (matchingPatient) {
          // Get detailed patient information
          const patientDetails = await patientAssignmentService.getPatientDetails(matchingPatient.patientId)

          const medicalHistory = patientDetails.medicalHistory || []
          const recentHistory = medicalHistory.slice(0, 3)

          let response = `Here's information about ${matchingPatient.patient.name}:\n\n`
          response += `**Patient Details:**\n`
          response += `• Name: ${matchingPatient.patient.name}\n`
          response += `• Department: ${matchingPatient.patient.department || 'N/A'}\n`
          response += `• Assignment Priority: ${matchingPatient.priority}\n`
          response += `• Assignment Status: ${matchingPatient.status}\n\n`

          if (recentHistory.length > 0) {
            response += `**Recent Medical History:**\n`
            recentHistory.forEach((record: any, index: number) => {
              response += `${index + 1}. ${record.title} (${new Date(record.date).toLocaleDateString()})\n`
              response += `   ${record.content.substring(0, 100)}${record.content.length > 100 ? '...' : ''}\n\n`
            })
          }

          if (matchingPatient.notes) {
            response += `**Assignment Notes:** ${matchingPatient.notes}\n\n`
          }

          response += `Would you like me to:\n• Schedule a treatment for this patient\n• Update their medical records\n• Get more detailed history?`

          return {
            message: response,
            actionRequired: false,
            data: patientDetails,
            followUpQuestions: [
              "Schedule treatment",
              "Add medical note",
              "View full history"
            ]
          }
        } else {
          return {
            message: `I couldn't find a patient named "${patientName}" in your assigned patients. You can only access information for patients assigned to you. Would you like to see your current patient assignments?`,
            actionRequired: false,
            followUpQuestions: ["Show my assigned patients"]
          }
        }
      } else {
        return {
          message: "I'm having trouble accessing patient information right now. Please try again later or access the patient records directly.",
          actionRequired: false
        }
      }
    } catch (error) {
      return {
        message: "I encountered an error while retrieving patient information. Please check the patient management section directly.",
        actionRequired: false
      }
    }
  }

  /**
   * Handle general inquiries and provide role-based guidance
   */
  private handleGeneralInquiry(
    message: string,
    context: ConversationContext
  ): AIResponse {
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('start')) {
      if (context.userRole === 'staff') {
        return {
          message: `Hello ${context.userName}! I'm your AI healthcare assistant. As a staff member, I can help you with:\n\n🔹 **Task Management**: Create, view, and manage your work tasks\n🔹 **Patient Information**: Access assigned patient records and medical history\n🔹 **Feedback Submission**: Submit feedback about colleagues or patients\n🔹 **Treatment Scheduling**: Help schedule patient treatments\n\nWhat would you like to do today?`,
          actionRequired: false,
          followUpQuestions: [
            "Show my tasks",
            "Check patient information",
            "Create a new task",
            "Submit feedback"
          ]
        }
      } else {
        return {
          message: `Hello ${context.userName}! I'm your AI healthcare assistant. I'm here to help you with:\n\n🔹 **Feedback Submission**: Share your healthcare experience and suggestions\n🔹 **General Questions**: Get information about our services\n🔹 **Support**: Connect you with the right healthcare team member\n\nHow can I assist you today?`,
          actionRequired: false,
          followUpQuestions: [
            "Submit feedback",
            "Ask about services",
            "Get support"
          ]
        }
      }
    }

    // Help requests
    if (message.includes('help') || message.includes('what can you do')) {
      return this.handleGeneralInquiry('hello', context)
    }

    // Default response
    return {
      message: "I'm here to help! Could you please tell me more about what you need assistance with? I can help with tasks, patient information, feedback, and more depending on your role.",
      actionRequired: false,
      followUpQuestions: context.userRole === 'staff'
        ? ["Manage tasks", "Patient information", "Submit feedback"]
        : ["Submit feedback", "Ask questions", "Get help"]
    }
  }

  /**
   * Parse task data from user message
   */
  private parseTaskData(message: string, existingData: any = {}): any {
    const data = { ...existingData }

    // Extract title
    const titleMatch = message.match(/(?:title|task|called?)\s+["']?([^"',.!?]+)["']?/i)
    if (titleMatch) data.title = titleMatch[1].trim()

    // Extract description
    const descMatch = message.match(/(?:description|about|desc|details?)\s*:?\s*["']?([^"',.!?]+)["']?/i)
    if (descMatch) data.description = descMatch[1].trim()

    // Extract priority
    const priorityMatch = message.match(/\b(low|medium|high|urgent)\s+priority/i) ||
                         message.match(/priority\s+(?:is\s+)?(low|medium|high|urgent)/i)
    if (priorityMatch) data.priority = priorityMatch[1].toLowerCase()

    // Extract category
    const categoryMatch = message.match(/(?:category|in|under)\s+["']?([^"',.!?]+)["']?\s+category/i) ||
                         message.match(/category\s+["']?([^"',.!?]+)["']?/i)
    if (categoryMatch) data.category = categoryMatch[1].trim()

    // Extract due date (basic patterns)
    const dueDateMatch = message.match(/due\s+(?:by\s+|on\s+)?(today|tomorrow|next\s+week|next\s+friday|\d{1,2}\/\d{1,2}\/\d{4})/i)
    if (dueDateMatch) {
      const dateStr = dueDateMatch[1].toLowerCase()
      const now = new Date()
      if (dateStr === 'today') {
        data.dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      } else if (dateStr === 'tomorrow') {
        data.dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
      } else if (dateStr === 'next week') {
        data.dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      } else if (dateStr.includes('/')) {
        data.dueDate = new Date(dateStr).toISOString()
      }
    }

    return data
  }

  /**
   * Parse feedback data from user message
   */
  private parseFeedbackData(message: string, context: ConversationContext): any {
    const data: any = { message }

    // For staff, try to extract worker name/ID
    if (context.userRole === 'staff') {
      const workerMatch = message.match(/(?:about|for)\s+(?:dr\.?|nurse|doctor|staff)?\s*([a-z]+\s+[a-z]+)/i)
      if (workerMatch) {
        // In a real implementation, you'd look up the worker ID by name
        data.workerName = workerMatch[1].trim()
        // For now, we'll need to implement worker lookup
        data.workerId = 'placeholder-worker-id' // This should be resolved through API
      }
    }

    return data
  }

  /**
   * Extract patient name from user message
   */
  private extractPatientName(message: string): string | null {
    const patterns = [
      /(?:patient|about|for)\s+([a-z]+\s+[a-z]+)/i,
      /([a-z]+\s+[a-z]+)(?:'s|\s+medical|\s+record)/i
    ]

    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }

    return null
  }

  /**
   * Get initial AI greeting based on user role
   */
  getInitialGreeting(context: ConversationContext): AIResponse {
    return this.handleGeneralInquiry('hello', context)
  }
}

export const aiAssistantService = new AIAssistantService()
export default aiAssistantService
