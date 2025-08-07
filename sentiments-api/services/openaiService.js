import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
  }

  /**
   * Generate AI response for healthcare assistant
   */
  async generateResponse(prompt, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(context)
      
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false
      })

      return {
        success: true,
        response: completion.choices[0].message.content,
        usage: completion.usage
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackResponse(context.userRole)
      }
    }
  }

  /**
   * Generate confirmation message for actions
   */
  async generateConfirmation(actionType, data, context = {}) {
    try {
      let prompt = ''
      
      switch (actionType) {
        case 'create_task':
          prompt = `Generate a professional confirmation message for creating a task with these details:
Title: ${data.title}
Description: ${data.description}
Priority: ${data.priority}
Due Date: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'Not specified'}
Category: ${data.category}

Make it conversational and ask for confirmation to proceed.`
          break
          
        case 'submit_feedback':
          prompt = `Generate a professional confirmation message for submitting feedback with these details:
About: ${data.aboutPersonName}
Category: ${data.category}
Message: ${data.message}
${data.rating ? `Rating: ${data.rating}/5` : ''}

Make it conversational and ask for confirmation to proceed.`
          break
          
        case 'schedule_treatment':
          prompt = `Generate a professional confirmation message for scheduling a treatment with these details:
Patient: ${data.patientName}
Treatment: ${data.treatmentType}
Date/Time: ${data.scheduledDateTime ? new Date(data.scheduledDateTime).toLocaleString() : 'Not specified'}
Duration: ${data.duration} minutes
${data.notes ? `Notes: ${data.notes}` : ''}

Make it conversational and ask for confirmation to proceed.`
          break
          
        default:
          prompt = `Generate a confirmation message for the action "${actionType}" with the provided data. Make it conversational and ask for confirmation.`
      }
      
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a helpful healthcare assistant. Generate clear, professional confirmation messages that summarize the action and ask for user confirmation.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
        stream: false
      })

      return {
        success: true,
        message: completion.choices[0].message.content,
        usage: completion.usage
      }
    } catch (error) {
      console.error('OpenAI Confirmation Generation Error:', error)
      return {
        success: false,
        error: error.message,
        message: `I'll help you with this request. Should I proceed?`
      }
    }
  }

  /**
   * Extract structured data from natural language
   */
  async extractData(text, extractionType, context = {}) {
    try {
      const prompt = this.buildExtractionPrompt(text, extractionType, context)
      
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a data extraction assistant for a healthcare system. Extract information accurately and respond only in valid JSON format.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.3,
        stream: false
      })

      const response = completion.choices[0].message.content
      return {
        success: true,
        data: JSON.parse(response),
        usage: completion.usage
      }
    } catch (error) {
      console.error('OpenAI Data Extraction Error:', error)
      return {
        success: false,
        error: error.message,
        data: this.getFallbackExtraction(extractionType)
      }
    }
  }

  /**
   * Detect user intent using OpenAI
   */
  async detectIntent(message, context = {}) {
    try {
      const prompt = `
Analyze the following user message and determine their intent in a healthcare assistant context.

User Role: ${context.userRole || 'unknown'}
Message: "${message}"

Possible intents:
- greeting: User is greeting or starting conversation
- task_management: User wants to create, view, or manage tasks
- patient_inquiry: User wants information about patients (staff only)
- feedback_submission: User wants to submit feedback about staff/services
- treatment_scheduling: User wants to schedule treatments/appointments
- help: User needs help or wants to know capabilities
- general: General questions or unclear intent

Respond with only the intent name (lowercase, underscore format).`

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.3,
        stream: false
      })

      const intent = completion.choices[0].message.content.trim().toLowerCase()
      return {
        success: true,
        intent,
        confidence: 0.95 // OpenAI doesn't provide confidence scores
      }
    } catch (error) {
      console.error('OpenAI Intent Detection Error:', error)
      return {
        success: false,
        intent: 'general',
        confidence: 0.5
      }
    }
  }

  /**
   * Build system prompt based on user context
   */
  buildSystemPrompt(context) {
    const { userRole, userName, companyName } = context
    
    let systemPrompt = `You are a helpful AI assistant for a healthcare management system. You are professional, empathetic, and knowledgeable about healthcare operations.

Current User: ${userName || 'User'}
Role: ${userRole || 'Unknown'}
Healthcare Facility: ${companyName || 'Healthcare Facility'}

Guidelines:
1. Always maintain patient confidentiality and HIPAA compliance
2. Be professional but warm in your communication
3. Provide clear, actionable responses
4. Ask clarifying questions when needed
5. Respect role-based access controls
6. Use medical terminology appropriately for the user's role level

`

    // Role-specific capabilities
    if (userRole === 'staff') {
      systemPrompt += `As a staff member, you can help with:
- Task management (create, view, update tasks)
- Patient information access (for assigned patients only)
- Treatment scheduling
- Feedback submission about colleagues and patients
- Medical documentation assistance

`
    } else if (userRole === 'admin') {
      systemPrompt += `As an administrator, you have expanded access to help with:
- All staff capabilities
- System overview and analytics
- User management information
- Company-wide task and assignment management

`
    } else if (userRole === 'patient') {
      systemPrompt += `As a patient, you can:
- Submit feedback about your healthcare experience
- Ask general questions about services
- Get information about your care team
- Request assistance with healthcare-related concerns

`
    }

    systemPrompt += `Always confirm before taking actions that modify data (creating tasks, submitting feedback, scheduling treatments).
Keep responses conversational but informative.
If you cannot help with something due to role restrictions, explain why and suggest alternatives.`

    return systemPrompt
  }

  /**
   * Build extraction prompt for specific data types
   */
  buildExtractionPrompt(text, extractionType, context) {
    const basePrompt = `Extract structured information from the following text for a healthcare system.\n\nText: "${text}"\n\n`
    
    switch (extractionType) {
      case 'task':
        return basePrompt + `Extract task information and return JSON with these fields:
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "string (Medical Review, Patient Care, Documentation, Administrative, etc.)",
  "priority": "string (low, medium, high, urgent)",
  "dueDate": "ISO date string or null",
  "assignee": "string (name or null)",
  "tags": "array of strings",
  "hasAllRequiredFields": "boolean (true if title and description are present)"
}

Extract as much information as possible. If information is missing, use reasonable defaults or null.`

      case 'feedback':
        return basePrompt + `Extract feedback information and return JSON with these fields:
{
  "aboutPersonName": "string (name of person feedback is about)",
  "category": "string (Professional, Communication, Patient Care, Technical Skills, General)",
  "message": "string (the actual feedback content)",
  "rating": "number 1-5 or null",
  "isPositive": "boolean (overall sentiment)",
  "hasAllRequiredFields": "boolean (true if aboutPersonName and message are present)"
}

Focus on identifying who the feedback is about and the core message.`

      case 'treatment':
        return basePrompt + `Extract treatment scheduling information and return JSON with these fields:
{
  "patientName": "string (name of patient)",
  "treatmentType": "string (consultation, procedure, therapy, checkup, etc.)",
  "title": "string (treatment title/name)",
  "description": "string (treatment description)",
  "scheduledDateTime": "ISO datetime string or null",
  "duration": "number (minutes, default 60)",
  "notes": "string (special requirements/notes)",
  "hasAllRequiredFields": "boolean (true if patientName and treatmentType are present)"
}

Extract date/time information carefully. Convert relative dates (today, tomorrow, next week) to approximate future dates.`

      case 'patient_search':
        return basePrompt + `Extract patient search criteria and return JSON with these fields:
{
  "patientName": "string (patient name to search for)",
  "searchType": "string (info, history, treatments, assignments)",
  "specificQuery": "string (what specific information is requested)",
  "hasValidSearch": "boolean (true if patientName is present)"
}`

      default:
        return basePrompt + `Extract any relevant structured information from the text and return as JSON.`
    }
  }

  /**
   * Get fallback responses when OpenAI is unavailable
   */
  getFallbackResponse(userRole) {
    const responses = {
      staff: "I'm here to help you with task management, patient information, and treatment scheduling. What would you like to do?",
      patient: "I can help you submit feedback about your healthcare experience. How can I assist you today?",
      admin: "I can help you with system management, user information, and administrative tasks. What do you need?"
    }
    
    return responses[userRole] || "I'm here to help! How can I assist you today?"
  }

  /**
   * Get fallback data extraction when OpenAI is unavailable
   */
  getFallbackExtraction(extractionType) {
    const fallbacks = {
      task: {
        title: '',
        description: '',
        category: 'General',
        priority: 'medium',
        dueDate: null,
        assignee: null,
        tags: [],
        hasAllRequiredFields: false
      },
      feedback: {
        aboutPersonName: '',
        category: 'General',
        message: '',
        rating: null,
        isPositive: true,
        hasAllRequiredFields: false
      },
      treatment: {
        patientName: '',
        treatmentType: '',
        title: '',
        description: '',
        scheduledDateTime: null,
        duration: 60,
        notes: '',
        hasAllRequiredFields: false
      },
      patient_search: {
        patientName: '',
        searchType: 'info',
        specificQuery: '',
        hasValidSearch: false
      }
    }
    
    return fallbacks[extractionType] || {}
  }

  /**
   * Generate conversational response for confirmations
   */
  async generateConfirmation(actionType, extractedData, context = {}) {
    try {
      let prompt = `Generate a friendly confirmation message for a healthcare AI assistant.

Action Type: ${actionType}
Extracted Data: ${JSON.stringify(extractedData, null, 2)}
User Role: ${context.userRole}

Create a conversational confirmation that:
1. Summarizes what will be done
2. Shows the key details clearly
3. Asks for confirmation
4. Maintains a professional but warm tone

Keep it concise and clear. End with asking if they want to proceed.`

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
        stream: false
      })

      return {
        success: true,
        message: completion.choices[0].message.content
      }
    } catch (error) {
      console.error('OpenAI Confirmation Generation Error:', error)
      return {
        success: false,
        message: this.getFallbackConfirmation(actionType, extractedData)
      }
    }
  }

  /**
   * Fallback confirmation messages
   */
  getFallbackConfirmation(actionType, extractedData) {
    switch (actionType) {
      case 'create_task':
        return `I'll create a task titled "${extractedData.title}" with ${extractedData.priority} priority. Should I proceed?`
      case 'submit_feedback':
        return `I'll submit your feedback about ${extractedData.aboutPersonName}. Should I proceed?`
      case 'schedule_treatment':
        return `I'll schedule a ${extractedData.treatmentType} for ${extractedData.patientName}. Should I proceed?`
      default:
        return "Should I proceed with this action?"
    }
  }

  /**
   * Check if OpenAI service is properly configured
   */
  isConfigured() {
    return !!process.env.OPENAI_API_KEY
  }
}

export default new OpenAIService()
