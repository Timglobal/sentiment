import express from 'express'
import { verifyToken } from '../middleware/auth.middleware.js'
import User from '../models/User.js'
import Task from '../models/Task.js'
import Assignment from '../models/Assignment.js'
import TreatmentSchedule from '../models/TreatmentSchedule.js'
import Feedback from '../models/Feedback.js'
import openaiService from '../services/openaiService.js'

const router = express.Router()

// All AI assistant routes require authentication
router.use(verifyToken)

/**
 * Process AI conversation and provide contextual responses
 */
router.post('/process', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Build conversation context
    const aiContext = {
      userRole: user.role,
      userName: user.name,
      userId: user._id,
      companyId: user.company?._id,
      ...context
    }

    // Process the message and generate response
    const response = await processAIMessage(message.toLowerCase(), aiContext, conversationHistory)

    res.json({
      success: true,
      data: response
    })
  } catch (error) {
    console.error('AI processing error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request',
      error: error.message
    })
  }
})

/**
 * Create a task through AI assistant
 */
router.post('/create-task', async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, assigneeId } = req.body
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.role !== 'staff' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only staff and admin users can create tasks'
      })
    }

    const task = new Task({
      title,
      description,
      category: category || 'General',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 1 week
      userId: assigneeId || userId,
      createdBy: userId,
      companyId: user.company?._id,
      status: 'pending'
    })

    const savedTask = await task.save()
    await savedTask.populate('userId', 'name email role')
    await savedTask.populate('createdBy', 'name')

    res.json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    })
  } catch (error) {
    console.error('Task creation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    })
  }
})

/**
 * Submit feedback through AI assistant
 */
router.post('/submit-feedback', async (req, res) => {
  try {
    const { aboutUserId, message, category, rating } = req.body
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Validate the user being reviewed exists and is accessible
    const aboutUser = await User.findById(aboutUserId).populate('company')
    if (!aboutUser) {
      return res.status(404).json({
        success: false,
        message: 'The person you want to give feedback about was not found'
      })
    }

    // Check role-based access permissions
    if (user.role === 'patient') {
      // Patients can only give feedback about staff in their company
      if (aboutUser.role !== 'staff' || 
          !user.company || 
          !aboutUser.company || 
          user.company._id.toString() !== aboutUser.company._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only provide feedback about staff members in your healthcare facility'
        })
      }
    }

    const feedback = new Feedback({
      fromUserId: userId,
      aboutUserId: aboutUserId,
      message: message,
      category: category || 'General',
      rating: rating || null,
      companyId: user.company?._id,
      status: 'active'
    })

    const savedFeedback = await feedback.save()
    await savedFeedback.populate([
      { path: 'fromUserId', select: 'name email role' },
      { path: 'aboutUserId', select: 'name email role department' }
    ])

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: savedFeedback
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    })
  }
})

/**
 * Get patient information for AI assistant (staff only)
 */
router.get('/patient-info/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.role !== 'staff' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only staff members can access patient information'
      })
    }

    // Check if the staff member is assigned to this patient
    const assignment = await Assignment.findOne({
      workerId: userId,
      patientId: patientId,
      status: 'active'
    })

    if (!assignment && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only access information for patients assigned to you'
      })
    }

    // Get patient information
    const patient = await User.findById(patientId)
      .select('name email department createdAt')
      .populate('company', 'name')

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    // Get treatment history
    const treatments = await TreatmentSchedule.find({
      patientId: patientId
    })
    .sort({ scheduledDate: -1 })
    .limit(10)
    .populate('workerId', 'name role')
    .select('title description scheduledDate status notes')

    // Get recent tasks related to this patient
    const tasks = await Task.find({
      $or: [
        { description: { $regex: patient.name, $options: 'i' } },
        { title: { $regex: patient.name, $options: 'i' } }
      ],
      isArchived: false
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title description status priority dueDate createdAt')

    // Get feedback about this patient (if any)
    const feedback = await Feedback.find({
      aboutUserId: patientId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('fromUserId', 'name role')
    .select('message category rating createdAt')

    const patientInfo = {
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        department: patient.department,
        company: patient.company?.name,
        joinDate: patient.createdAt
      },
      assignment: assignment ? {
        priority: assignment.priority,
        notes: assignment.notes,
        assignedDate: assignment.createdAt
      } : null,
      treatments: treatments,
      relatedTasks: tasks,
      feedback: feedback,
      stats: {
        totalTreatments: treatments.length,
        completedTreatments: treatments.filter(t => t.status === 'completed').length,
        upcomingTreatments: treatments.filter(t => t.status === 'scheduled' && new Date(t.scheduledDate) > new Date()).length
      }
    }

    res.json({
      success: true,
      data: patientInfo
    })
  } catch (error) {
    console.error('Patient info retrieval error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get patient information',
      error: error.message
    })
  }
})

/**
 * Schedule treatment through AI assistant
 */
router.post('/schedule-treatment', async (req, res) => {
  try {
    const { patientId, title, description, scheduledDate, duration, notes } = req.body
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.role !== 'staff' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only staff members can schedule treatments'
      })
    }

    // Validate patient exists and is assigned to the staff member
    const patient = await User.findById(patientId)
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    // Check assignment (admins can schedule for any patient)
    if (user.role !== 'admin') {
      const assignment = await Assignment.findOne({
        workerId: userId,
        patientId: patientId,
        status: 'active'
      })

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'You can only schedule treatments for patients assigned to you'
        })
      }
    }

    const treatment = new TreatmentSchedule({
      patientId: patientId,
      workerId: userId,
      title: title,
      description: description,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60, // Default 60 minutes
      notes: notes,
      status: 'scheduled',
      companyId: user.company?._id
    })

    const savedTreatment = await treatment.save()
    await savedTreatment.populate([
      { path: 'patientId', select: 'name email' },
      { path: 'workerId', select: 'name email' }
    ])

    res.json({
      success: true,
      message: 'Treatment scheduled successfully',
      data: savedTreatment
    })
  } catch (error) {
    console.error('Treatment scheduling error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to schedule treatment',
      error: error.message
    })
  }
})

/**
 * Get contextual data for AI assistant
 */
router.get('/context', async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const context = {
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        department: user.department,
        company: user.company?.name
      },
      capabilities: getAICapabilities(user.role)
    }

    // Get relevant data based on role
    if (user.role === 'staff') {
      // Get assigned patients count
      const assignedPatients = await Assignment.countDocuments({
        workerId: userId,
        status: 'active'
      })

      // Get pending tasks count
      const pendingTasks = await Task.countDocuments({
        userId,
        status: { $in: ['pending', 'in-progress'] },
        isArchived: false
      })

      // Get upcoming treatments count
      const upcomingTreatments = await TreatmentSchedule.countDocuments({
        workerId: userId,
        scheduledDate: { $gte: new Date() },
        status: 'scheduled'
      })

      context.stats = {
        assignedPatients,
        pendingTasks,
        upcomingTreatments
      }
    }

    res.json({
      success: true,
      data: context
    })
  } catch (error) {
    console.error('Error getting AI context:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get AI context',
      error: error.message
    })
  }
})

/**
 * Get available workers for feedback/assignment
 */
router.get('/workers', async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    let workersQuery = {}
    
    if (user.role === 'patient') {
      // Patients can only see staff members in their company
      if (user.company) {
        workersQuery = {
          company: user.company._id,
          role: 'staff'
        }
      }
    } else if (user.role === 'staff') {
      // Staff can see other staff and patients in their company
      if (user.company) {
        workersQuery = {
          company: user.company._id,
          role: { $in: ['staff', 'patient'] }
        }
      }
    } else if (user.role === 'admin') {
      // Admins can see all users in their company
      if (user.company) {
        workersQuery = {
          company: user.company._id
        }
      }
    }

    const workers = await User.find(workersQuery)
      .select('name email role department')
      .sort({ name: 1 })

    res.json({
      success: true,
      data: workers
    })
  } catch (error) {
    console.error('Error getting workers:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get workers list',
      error: error.message
    })
  }
})

/**
 * Process AI message and generate contextual response
 */
async function processAIMessage(message, context, conversationHistory = []) {
  const { userRole, userId, userName, companyId } = context

  // Check for confirmation responses first
  if (message.includes('yes') || message.includes('confirm') || message.includes('proceed') || message.includes('create it')) {
    // Look for pending action in conversation history
    const lastMessage = conversationHistory[conversationHistory.length - 1]
    if (lastMessage && lastMessage.sender === 'assistant' && lastMessage.text.includes('Should I proceed')) {
      return {
        message: "Great! I'll proceed with your request. Please wait while I process this...",
        actionRequired: true,
        intent: 'confirm_action',
        actionType: 'proceed_with_last_action'
      }
    }
  }

  if (message.includes('no') || message.includes('cancel') || message.includes('stop')) {
    return {
      message: "No problem! I've cancelled the previous action. How else can I help you?",
      actionRequired: false,
      intent: 'cancel_action'
    }
  }

  // Use OpenAI to detect intent and generate response
  try {
    // Build context for OpenAI
    const aiContext = {
      userRole,
      userName,
      companyName: context.companyName || 'Healthcare Facility',
      conversationHistory: conversationHistory.slice(-3) // Last 3 messages for context
    }

    // Detect intent using OpenAI
    const intentResult = await openaiService.detectIntent(message, aiContext)
    const intent = intentResult.success ? intentResult.intent : detectIntentFallback(message, userRole)

    // Handle different intents
    switch (intent) {
      case 'greeting':
        return generateGreeting(context)
      
      case 'task_management':
        return await handleTaskManagementWithAI(message, context)
      
      case 'patient_inquiry':
        return await handlePatientInquiryWithAI(message, context)
      
      case 'feedback_submission':
        return await handleFeedbackSubmissionWithAI(message, context)
      
      case 'treatment_scheduling':
        return await handleTreatmentSchedulingWithAI(message, context)
      
      case 'help':
        return generateHelpResponse(context)
      
      default:
        return await generateAIResponse(message, aiContext)
    }
  } catch (error) {
    console.error('AI processing error:', error)
    return {
      message: "I encountered an error while processing your request. Please try rephrasing or contact support if the issue persists.",
      actionRequired: false,
      intent: 'error'
    }
  }
}

/**
 * Generate AI response using OpenAI
 */
async function generateAIResponse(message, context) {
  // Build a comprehensive prompt for OpenAI
  const prompt = `User message: "${message}"

Previous conversation context: ${JSON.stringify(context.conversationHistory)}

Please provide a helpful, conversational response that:
1. Addresses the user's request appropriately for their role
2. Offers specific next steps or actions they can take
3. Maintains a professional but friendly healthcare assistant tone
4. Suggests follow-up questions or actions when appropriate`

  const result = await openaiService.generateResponse(prompt, context)
  
  if (result.success) {
    return {
      message: result.response,
      actionRequired: false,
      intent: 'general_ai_response'
    }
  } else {
    // Fallback to basic response
    return generateDefaultResponse(context)
  }
}

/**
 * Handle task management with AI assistance
 */
async function handleTaskManagementWithAI(message, context) {
  const { userId, userName, userRole } = context

  if (userRole !== 'staff' && userRole !== 'admin') {
    return {
      message: "I'm sorry, but task management is only available for healthcare staff members. How else can I help you?",
      actionRequired: false,
      intent: 'access_denied'
    }
  }

  // Check if user wants to view existing tasks
  if (message.includes('show') || message.includes('list') || message.includes('view') || message.includes('my tasks')) {
    return await handleTaskManagement(message, context)
  }

  // Use OpenAI to extract task information
  if (message.includes('create') || message.includes('new task') || message.includes('add task')) {
    const extractionResult = await openaiService.extractData(message, 'task', context)
    
    if (extractionResult.success && extractionResult.data.hasAllRequiredFields) {
      const taskData = extractionResult.data
      
      // Generate confirmation using OpenAI
      const confirmationResult = await openaiService.generateConfirmation('create_task', taskData, context)
      const confirmationMessage = confirmationResult.success ? 
        confirmationResult.message : 
        `I'll create a task titled "${taskData.title}" with ${taskData.priority} priority, due ${taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString() : 'soon'}. Should I proceed?`

      return {
        message: confirmationMessage,
        actionRequired: true,
        intent: 'task_management',
        actionType: 'confirm_create_task',
        data: taskData,
        followUpQuestions: [
          "Yes, create it",
          "No, let me modify",
          "Cancel"
        ]
      }
    } else {
      // Ask for more information
      const prompt = `The user wants to create a task but didn't provide complete information. 
      
      Current information: ${JSON.stringify(extractionResult.data)}
      
      Generate a helpful response that:
      1. Acknowledges their request to create a task
      2. Lists what information is still needed (title, description, priority, due date, category)
      3. Provides an example of a complete task request
      4. Maintains a helpful, professional tone`

      const aiResponse = await openaiService.generateResponse(prompt, context)
      
      return {
        message: aiResponse.success ? aiResponse.response : 
          "I'd be happy to help you create a task. Please provide the task title, description, priority level (low/medium/high/urgent), category, and due date. For example: 'Create a task titled Patient Chart Review in Medical Documentation category, high priority, due next Friday. Description: Review patient charts for compliance audit.'",
        actionRequired: true,
        intent: 'task_management',
        actionType: 'create_task',
        followUpQuestions: [
          "What is the task title?",
          "Which category is this for?",
          "When is it due?"
        ]
      }
    }
  }

  // General task management help
  const prompt = `The user is asking about task management: "${message}"
  
  Provide a helpful response about task management capabilities for a healthcare staff member, including:
  - Creating new tasks
  - Viewing current tasks  
  - Task priorities and categories
  - Due dates and scheduling
  
  Ask what specific task management help they need.`

  const aiResponse = await openaiService.generateResponse(prompt, context)
  
  return {
    message: aiResponse.success ? aiResponse.response : 
      "I can help you with task management. I can create new tasks, show your current tasks, and help with task organization. What would you like to do?",
    actionRequired: false,
    intent: 'task_management',
    followUpQuestions: ["Create a new task", "Show my tasks", "Update a task"]
  }
}

/**
 * Handle patient inquiry with AI assistance
 */
async function handlePatientInquiryWithAI(message, context) {
  const { userId, userRole } = context

  if (userRole !== 'staff' && userRole !== 'admin') {
    return {
      message: "I'm sorry, but patient information access is restricted to healthcare staff only. How else can I help you?",
      actionRequired: false,
      intent: 'access_denied'
    }
  }

  // Extract patient search information using OpenAI
  const extractionResult = await openaiService.extractData(message, 'patient_search', context)
  
  if (extractionResult.success && extractionResult.data.hasValidSearch) {
    const searchData = extractionResult.data
    
    // Get assigned patients and search for the requested patient
    const assignments = await Assignment.find({
      workerId: userId,
      status: 'active'
    })
    .populate('patientId', 'name email department')
    .sort({ priority: -1, createdAt: -1 })

    if (assignments.length === 0) {
      return {
        message: "You don't have any patients currently assigned to you. Contact your supervisor if you believe this is incorrect.",
        actionRequired: false,
        intent: 'patient_inquiry'
      }
    }

    // Find matching patient
    const matchingAssignment = assignments.find(a => 
      a.patientId.name.toLowerCase().includes(searchData.patientName.toLowerCase())
    )

    if (matchingAssignment) {
      // Get detailed patient information
      const patient = matchingAssignment.patientId
      
      // Get recent treatments
      const treatments = await TreatmentSchedule.find({
        patientId: patient._id
      })
      .sort({ scheduledDate: -1 })
      .limit(3)
      .populate('workerId', 'name')

      // Use OpenAI to generate a comprehensive patient summary
      const patientInfo = {
        name: patient.name,
        department: patient.department,
        email: patient.email,
        assignmentPriority: matchingAssignment.priority,
        assignmentNotes: matchingAssignment.notes,
        recentTreatments: treatments.map(t => ({
          title: t.title,
          date: t.scheduledDate,
          status: t.status,
          provider: t.workerId?.name
        }))
      }

      const prompt = `Generate a professional summary of patient information for a healthcare staff member.

Patient Information: ${JSON.stringify(patientInfo, null, 2)}

Create a well-formatted response that:
1. Presents the patient's basic information clearly
2. Highlights assignment details and priority
3. Summarizes recent treatments
4. Offers relevant follow-up actions
5. Maintains patient confidentiality standards

Keep it conversational but professional.`

      const aiResponse = await openaiService.generateResponse(prompt, context)
      
      return {
        message: aiResponse.success ? aiResponse.response : `**Patient Information: ${patient.name}**

• **Department**: ${patient.department || 'N/A'}
• **Assignment Priority**: ${matchingAssignment.priority}
• **Recent Treatments**: ${treatments.length} treatments on file

Would you like me to help you schedule a treatment, add notes, or get more detailed history?`,
        actionRequired: false,
        intent: 'patient_inquiry',
        data: { patient, assignment: matchingAssignment, treatments },
        followUpQuestions: [
          "Schedule treatment",
          "Add medical note", 
          "View full history"
        ]
      }
    } else {
      return {
        message: `I couldn't find a patient named "${searchData.patientName}" in your assigned patients. Please check the name or ask to see your full patient list.`,
        actionRequired: false,
        intent: 'patient_inquiry',
        followUpQuestions: ["Show my patients"]
      }
    }
  } else {
    // Show all assigned patients or general patient inquiry help
    return await handlePatientInquiry(message, context)
  }
}

/**
 * Handle feedback submission with AI assistance
 */
async function handleFeedbackSubmissionWithAI(message, context) {
  const { userId, userRole, companyId } = context

  // Use OpenAI to extract feedback information
  const extractionResult = await openaiService.extractData(message, 'feedback', context)
  
  if (extractionResult.success && extractionResult.data.hasAllRequiredFields) {
    const feedbackData = extractionResult.data
    
    // Find the person the feedback is about
    const aboutUser = await User.findOne({
      company: companyId,
      name: { $regex: new RegExp(feedbackData.aboutPersonName, 'i') }
    }).select('name role department')

    if (aboutUser) {
      // Validate role-based access
      if (userRole === 'patient' && aboutUser.role !== 'staff') {
        return {
          message: "As a patient, you can only provide feedback about healthcare staff members. Would you like to give feedback about one of your care team members?",
          actionRequired: false,
          intent: 'feedback_submission'
        }
      }

      const feedbackInfo = {
        ...feedbackData,
        aboutUserId: aboutUser._id,
        aboutUserName: aboutUser.name,
        aboutUserRole: aboutUser.role
      }

      // Generate confirmation using OpenAI
      const confirmationResult = await openaiService.generateConfirmation('submit_feedback', feedbackInfo, context)
      const confirmationMessage = confirmationResult.success ? 
        confirmationResult.message : 
        `I'll submit your ${feedbackData.isPositive ? 'positive' : 'constructive'} feedback about ${aboutUser.name} regarding ${feedbackData.category.toLowerCase()}. Should I proceed?`

      return {
        message: confirmationMessage,
        actionRequired: true,
        intent: 'feedback_submission',
        actionType: 'confirm_feedback',
        data: feedbackInfo,
        followUpQuestions: [
          "Yes, submit it",
          "No, let me modify",
          "Cancel"
        ]
      }
    } else {
      return {
        message: `I couldn't find someone named "${feedbackData.aboutPersonName}" in your healthcare facility. Could you check the name or tell me more about who you'd like to give feedback about?`,
        actionRequired: false,
        intent: 'feedback_submission'
      }
    }
  } else {
    // Use OpenAI to generate a helpful feedback request
    const prompt = `The user wants to submit feedback but didn't provide complete information.

Current information: ${JSON.stringify(extractionResult.data)}

Generate a helpful response that:
1. Acknowledges their desire to give feedback
2. Asks for the missing information (who the feedback is about, what they want to say)
3. Explains what kinds of feedback are valuable
4. Provides an example
5. Considers the user's role (${userRole}) for appropriate suggestions`

    const aiResponse = await openaiService.generateResponse(prompt, context)
    
    return {
      message: aiResponse.success ? aiResponse.response : await handleFeedbackSubmission(message, context),
      actionRequired: true,
      intent: 'feedback_submission',
      actionType: 'collect_feedback_info'
    }
  }
}

/**
 * Handle treatment scheduling with AI assistance
 */
async function handleTreatmentSchedulingWithAI(message, context) {
  const { userId, userRole, companyId } = context

  if (userRole !== 'staff' && userRole !== 'admin') {
    return {
      message: "I'm sorry, but only healthcare staff can schedule treatments. How else can I help you?",
      actionRequired: false,
      intent: 'access_denied'
    }
  }

  // Use OpenAI to extract treatment scheduling information
  const extractionResult = await openaiService.extractData(message, 'treatment', context)
  
  if (extractionResult.success && extractionResult.data.hasAllRequiredFields) {
    const treatmentData = extractionResult.data
    
    // Find the patient and verify assignment
    const assignment = await Assignment.findOne({
      workerId: userId,
      status: 'active'
    }).populate({
      path: 'patientId',
      match: { name: { $regex: new RegExp(treatmentData.patientName, 'i') } }
    })

    if (assignment && assignment.patientId) {
      const enhancedTreatmentData = {
        ...treatmentData,
        patientId: assignment.patientId._id,
        patientName: assignment.patientId.name
      }

      // Generate confirmation using OpenAI
      const confirmationResult = await openaiService.generateConfirmation('schedule_treatment', enhancedTreatmentData, context)
      const confirmationMessage = confirmationResult.success ? 
        confirmationResult.message : 
        `I'll schedule a ${treatmentData.treatmentType} for ${assignment.patientId.name} on ${treatmentData.scheduledDateTime ? new Date(treatmentData.scheduledDateTime).toLocaleString() : 'the requested time'}. Should I proceed?`

      return {
        message: confirmationMessage,
        actionRequired: true,
        intent: 'treatment_scheduling',
        actionType: 'confirm_treatment',
        data: enhancedTreatmentData,
        followUpQuestions: [
          "Yes, schedule it",
          "No, let me modify",
          "Cancel"
        ]
      }
    } else {
      return {
        message: `I couldn't find a patient named "${treatmentData.patientName}" in your assigned patients. Please check the name or ask to see your patient list.`,
        actionRequired: false,
        intent: 'treatment_scheduling'
      }
    }
  } else {
    // Use OpenAI to generate helpful treatment scheduling guidance
    const assignments = await Assignment.find({
      workerId: userId,
      status: 'active'
    }).populate('patientId', 'name department').limit(5)

    const prompt = `The user wants to schedule a treatment but didn't provide complete information.

Available patients: ${JSON.stringify(assignments.map(a => ({ name: a.patientId.name, department: a.patientId.department })))}

Current information: ${JSON.stringify(extractionResult.data)}

Generate a helpful response that:
1. Acknowledges their request to schedule treatment
2. Lists their available patients if relevant
3. Asks for missing information (patient name, treatment type, date/time, duration)
4. Provides a clear example
5. Maintains professional healthcare tone`

    const aiResponse = await openaiService.generateResponse(prompt, context)
    
    return {
      message: aiResponse.success ? aiResponse.response : await handleTreatmentScheduling(message, context),
      actionRequired: true,
      intent: 'treatment_scheduling',
      actionType: 'collect_treatment_info'
    }
  }
}

/**
 * Fallback intent detection when OpenAI is unavailable
 */
function detectIntentFallback(message, userRole) {
  // Greetings
  if (message.match(/\b(hello|hi|hey|start|good morning|good afternoon)\b/i)) {
    return 'greeting'
  }

  // Help requests
  if (message.match(/\b(help|what can you do|capabilities|assistance)\b/i)) {
    return 'help'
  }

  // Staff-specific intents
  if (userRole === 'staff') {
    if (message.match(/\b(task|create|assign|schedule|manage|todo)\b/i)) {
      return 'task_management'
    }
    if (message.match(/\b(patient|medical|record|history|assign)\b/i)) {
      return 'patient_inquiry'
    }
    if (message.match(/\b(treatment|appointment|schedule|book)\b/i)) {
      return 'treatment_scheduling'
    }
  }

  // Common intents
  if (message.match(/\b(feedback|review|comment|complain|suggest)\b/i)) {
    return 'feedback_submission'
  }

  return 'general'
}

/**
 * Generate greeting response
 */
function generateGreeting(context) {
  const { userRole, userName } = context

  if (userRole === 'staff') {
    return {
      message: `Hello ${userName}! I'm your AI healthcare assistant. As a staff member, I can help you with:

🔹 **Task Management**: Create, view, and manage your work tasks
🔹 **Patient Information**: Access assigned patient records and medical history  
🔹 **Treatment Scheduling**: Schedule patient treatments and appointments
🔹 **Feedback Submission**: Submit feedback about colleagues or patients

What would you like to do today?`,
      actionRequired: false,
      intent: 'greeting',
      followUpQuestions: [
        "Show my tasks",
        "Check patient information", 
        "Create a new task",
        "Submit feedback"
      ]
    }
  } else if (userRole === 'admin') {
    return {
      message: `Hello ${userName}! I'm your AI healthcare assistant. As an administrator, I can help you with:

🔹 **System Overview**: Get insights into system performance and usage
🔹 **Task Management**: Create and manage tasks for your team
🔹 **Feedback Review**: Access and review feedback submissions
🔹 **User Management**: Get information about users and assignments

How can I assist you today?`,
      actionRequired: false,
      intent: 'greeting',
      followUpQuestions: [
        "System overview",
        "Create team task",
        "Review feedback",
        "User statistics"
      ]
    }
  } else {
    return {
      message: `Hello ${userName}! I'm your AI healthcare assistant. I'm here to help you with:

🔹 **Feedback Submission**: Share your healthcare experience and suggestions
🔹 **General Questions**: Get information about our services  
🔹 **Support**: Connect you with the right healthcare team member

How can I assist you today?`,
      actionRequired: false,
      intent: 'greeting',
      followUpQuestions: [
        "Submit feedback",
        "Ask about services", 
        "Get support"
      ]
    }
  }
}

/**
 * Handle task management requests
 */
async function handleTaskManagement(message, context) {
  const { userId, userName } = context

  if (message.includes('show') || message.includes('list') || message.includes('my tasks')) {
    // Get user's tasks
    const tasks = await Task.find({ 
      userId, 
      isArchived: false 
    })
    .sort({ createdAt: -1 })
    .limit(5)

    if (tasks.length > 0) {
      const taskList = tasks.map((task, index) => 
        `${index + 1}. ${task.title} (${task.priority} priority, due: ${new Date(task.dueDate).toLocaleDateString()}) - ${task.status}`
      ).join('\n')

      const stats = await Task.aggregate([
        { $match: { userId: userId, isArchived: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $in: ['$status', ['pending', 'in-progress']] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        }
      ])

      const { total = 0, pending = 0, completed = 0 } = stats[0] || {}

      return {
        message: `Here are your recent tasks:

${taskList}

**Summary**: ${total} total tasks, ${pending} pending, ${completed} completed.

Would you like me to help you with any specific task or create a new one?`,
        actionRequired: false,
        intent: 'task_management',
        data: { tasks, stats: { total, pending, completed } },
        followUpQuestions: [
          "Create a new task",
          "Update task status",
          "Show overdue tasks"
        ]
      }
    } else {
      return {
        message: "You don't have any tasks at the moment. Would you like me to help you create a new task?",
        actionRequired: false,
        intent: 'task_management',
        followUpQuestions: ["Create a new task", "Schedule a treatment", "Check patient information"]
      }
    }
  }

  if (message.includes('create') || message.includes('new task')) {
    // Check if the message contains task details
    const taskData = extractTaskData(message)
    
    if (taskData.hasAllRequiredFields) {
      return {
        message: `I'll create a task with the following details:
        
**Title**: ${taskData.title}
**Description**: ${taskData.description}
**Category**: ${taskData.category}
**Priority**: ${taskData.priority}
**Due Date**: ${taskData.dueDate}

Should I proceed with creating this task?`,
        actionRequired: true,
        intent: 'task_management',
        actionType: 'confirm_create_task',
        data: taskData,
        followUpQuestions: [
          "Yes, create it",
          "No, let me modify",
          "Cancel"
        ]
      }
    } else {
      return {
        message: `I'll help you create a new task. Please provide the following information:

1. **Task title** - What is the task called?
2. **Description** - What needs to be done?
3. **Category** - Which category (e.g., Medical Review, Patient Care, Documentation)
4. **Priority** - Low, Medium, High, or Urgent?
5. **Due date** - When should this be completed?

You can provide all this information in one message, for example:
"Create a task titled 'Review patient records' in Medical Review category, high priority, due next Friday. Description: Review all patient records for quarterly compliance check."`,
        actionRequired: true,
        intent: 'task_management',
        actionType: 'create_task',
        followUpQuestions: [
          "What is the task title?",
          "Which category is this for?",
          "When is it due?"
        ]
      }
    }
  }

  return {
    message: "I can help you with task management. I can:\n• Create new tasks\n• Show your current tasks\n• Update task status\n• View overdue tasks\n\nWhat would you like to do?",
    actionRequired: false,
    intent: 'task_management',
    followUpQuestions: ["Create a new task", "Show my tasks", "Update task status"]
  }
}

/**
 * Extract task data from natural language message
 */
function extractTaskData(message) {
  const taskData = {
    hasAllRequiredFields: false,
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
    dueDate: null
  }

  // Extract title (look for patterns like "titled", "called", "named")
  const titleMatch = message.match(/(?:titled?|called|named)\s+['""]([^'""]+)['""]|(?:titled?|called|named)\s+([^,\.]+)/i)
  if (titleMatch) {
    taskData.title = (titleMatch[1] || titleMatch[2]).trim()
  }

  // Extract description (look for "description:")
  const descMatch = message.match(/description[:\s]+([^\.]+)/i)
  if (descMatch) {
    taskData.description = descMatch[1].trim()
  }

  // Extract category
  const categoryMatch = message.match(/(?:category|in)\s+([^,\s]+(?:\s+[^,\s]+)?)\s+category/i)
  if (categoryMatch) {
    taskData.category = categoryMatch[1].trim()
  }

  // Extract priority
  const priorityMatch = message.match(/\b(low|medium|high|urgent)\s+priority/i)
  if (priorityMatch) {
    taskData.priority = priorityMatch[1].toLowerCase()
  }

  // Extract due date
  const dueDateMatch = message.match(/due\s+(next\s+\w+|tomorrow|today|in\s+\d+\s+days?|\d{4}-\d{2}-\d{2})/i)
  if (dueDateMatch) {
    const dateStr = dueDateMatch[1].toLowerCase()
    const now = new Date()
    
    if (dateStr === 'today') {
      taskData.dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    } else if (dateStr === 'tomorrow') {
      taskData.dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    } else if (dateStr.startsWith('next')) {
      taskData.dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Default to next week
    } else if (dateStr.includes('days')) {
      const daysMatch = dateStr.match(/(\d+)\s+days?/)
      if (daysMatch) {
        const days = parseInt(daysMatch[1])
        taskData.dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      }
    } else {
      // Try to parse as date
      const parsedDate = new Date(dateStr)
      if (!isNaN(parsedDate)) {
        taskData.dueDate = parsedDate
      }
    }
  }

  // Check if we have minimum required fields
  taskData.hasAllRequiredFields = taskData.title.length > 0 && taskData.dueDate !== null

  return taskData
}

/**
 * Handle patient inquiry requests
 */
async function handlePatientInquiry(message, context) {
  const { userId, userRole } = context

  if (userRole !== 'staff' && userRole !== 'admin') {
    return {
      message: "I'm sorry, but patient information access is restricted to healthcare staff only. How else can I help you?",
      actionRequired: false,
      intent: 'access_denied'
    }
  }

  // Get assigned patients
  const assignments = await Assignment.find({
    workerId: userId,
    status: 'active'
  })
  .populate('patientId', 'name email department')
  .sort({ priority: -1, createdAt: -1 })
  .limit(10)

  if (assignments.length === 0) {
    return {
      message: "You don't have any patients currently assigned to you. Contact your supervisor if you believe this is incorrect.",
      actionRequired: false,
      intent: 'patient_inquiry'
    }
  }

  if (message.includes('show') || message.includes('list') || message.includes('my patients')) {
    const patientList = assignments.map((assignment, index) => {
      const patient = assignment.patientId
      return `${index + 1}. ${patient.name} (${patient.department || 'N/A'}) - ${assignment.priority} priority`
    }).join('\n')

    return {
      message: `Here are your assigned patients:

${patientList}

You have ${assignments.length} active patient assignments.

To get detailed information about a specific patient, say: "Tell me about [patient name]" or "Show [patient name]'s medical history"`,
      actionRequired: false,
      intent: 'patient_inquiry',
      data: { assignments },
      followUpQuestions: assignments.slice(0, 3).map(a => `About ${a.patientId.name}`)
    }
  }

  // Look for specific patient name
  const patientNameMatch = message.match(/(?:about|tell me about|show|for)\s+(?:patient\s+)?([a-z\s]+)(?:'s|\s|$)/i)
  if (patientNameMatch) {
    const searchName = patientNameMatch[1].trim().toLowerCase()
    const matchingAssignment = assignments.find(a => 
      a.patientId.name.toLowerCase().includes(searchName)
    )

    if (matchingAssignment) {
      const patient = matchingAssignment.patientId
      
      // Get recent treatments
      const treatments = await TreatmentSchedule.find({
        patientId: patient._id
      })
      .sort({ scheduledDate: -1 })
      .limit(3)
      .populate('workerId', 'name')

      let response = `**Patient Information: ${patient.name}**

• **Department**: ${patient.department || 'N/A'}
• **Email**: ${patient.email}
• **Assignment Priority**: ${matchingAssignment.priority}
• **Assignment Status**: ${matchingAssignment.status}`

      if (matchingAssignment.notes) {
        response += `\n• **Notes**: ${matchingAssignment.notes}`
      }

      if (treatments.length > 0) {
        response += `\n\n**Recent Treatments**:`
        treatments.forEach((treatment, index) => {
          response += `\n${index + 1}. ${treatment.title} (${new Date(treatment.scheduledDate).toLocaleDateString()}) - ${treatment.status}`
        })
      }

      response += `\n\nWould you like me to:\n• Schedule a treatment for this patient\n• Add a medical note\n• View full medical history?`

      return {
        message: response,
        actionRequired: false,
        intent: 'patient_inquiry',
        data: { patient, assignment: matchingAssignment, treatments },
        followUpQuestions: [
          "Schedule treatment",
          "Add medical note", 
          "View full history"
        ]
      }
    } else {
      return {
        message: `I couldn't find a patient named "${searchName}" in your assigned patients. Please check the name or ask to see your full patient list.`,
        actionRequired: false,
        intent: 'patient_inquiry',
        followUpQuestions: ["Show my patients"]
      }
    }
  }

  return {
    message: `I can help you with patient information. I can:
• Show your assigned patients
• Provide detailed patient information  
• Display medical history
• Help schedule treatments

What would you like to know?`,
    actionRequired: false,
    intent: 'patient_inquiry',
    followUpQuestions: ["Show my patients", "Search for patient", "Recent treatments"]
  }
}

/**
 * Handle feedback submission
 */
async function handleFeedbackSubmission(message, context) {
  const { userId, userRole, companyId } = context

  // Extract feedback data from the message
  const feedbackData = await extractFeedbackData(message, userId, companyId)

  if (feedbackData.hasRequiredFields) {
    return {
      message: `I'll submit feedback with the following details:

**About**: ${feedbackData.aboutUserName}
**Category**: ${feedbackData.category}
**Feedback**: ${feedbackData.feedbackMessage}
${feedbackData.rating ? `**Rating**: ${feedbackData.rating}/5` : ''}

Should I proceed with submitting this feedback?`,
      actionRequired: true,
      intent: 'feedback_submission',
      actionType: 'confirm_feedback',
      data: feedbackData,
      followUpQuestions: [
        "Yes, submit it",
        "No, let me modify",
        "Cancel"
      ]
    }
  } else {
    // Get available users for feedback based on role
    let availableUsers = []
    if (userRole === 'patient') {
      // Patients can only give feedback about staff
      availableUsers = await User.find({
        company: companyId,
        role: 'staff'
      }).select('name role department').limit(10)
    } else if (userRole === 'staff') {
      // Staff can give feedback about anyone in the company
      availableUsers = await User.find({
        company: companyId,
        _id: { $ne: userId }
      }).select('name role department').limit(10)
    }

    const userList = availableUsers.map((user, index) => 
      `${index + 1}. ${user.name} (${user.role}${user.department ? ` - ${user.department}` : ''})`
    ).join('\n')

    return {
      message: `I can help you submit feedback. Here are the available people you can provide feedback about:

${userList}

Please tell me:
1. **Who is the feedback about?** (mention their name)
2. **What would you like to share?** (your feedback message)
3. **Category** (optional): Professional, Communication, Patient Care, etc.
4. **Rating** (optional): 1-5 stars

For example: "I want to give positive feedback about Dr. Smith regarding his excellent patient care. He was very professional and caring. Rating: 5 stars."`,
      actionRequired: true,
      intent: 'feedback_submission',
      actionType: 'collect_feedback_info',
      data: { availableUsers },
      followUpQuestions: [
        "About a doctor",
        "About nursing staff",
        "About administrative staff"
      ]
    }
  }
}

/**
 * Extract feedback data from natural language message
 */
async function extractFeedbackData(message, userId, companyId) {
  const feedbackData = {
    hasRequiredFields: false,
    aboutUserId: null,
    aboutUserName: '',
    feedbackMessage: '',
    category: 'General',
    rating: null
  }

  // Extract person name (look for patterns like "about", "for", "regarding")
  const nameMatch = message.match(/(?:about|for|regarding)\s+(?:dr\.?\s+|nurse\s+|doctor\s+)?([a-z\s]+?)(?:\s+(?:regarding|his|her|their|who|that|,)|$)/i)
  if (nameMatch) {
    const extractedName = nameMatch[1].trim()
    
    // Find the user by name in the same company
    const user = await User.findOne({
      company: companyId,
      name: { $regex: new RegExp(extractedName, 'i') }
    }).select('name role')

    if (user) {
      feedbackData.aboutUserId = user._id
      feedbackData.aboutUserName = user.name
    }
  }

  // Extract feedback message (everything after the name and context words)
  let feedbackMessage = message
  if (nameMatch) {
    const afterNameIndex = message.toLowerCase().indexOf(nameMatch[0].toLowerCase()) + nameMatch[0].length
    feedbackMessage = message.substring(afterNameIndex).trim()
  }

  // Remove common starting words
  feedbackMessage = feedbackMessage.replace(/^(?:regarding|about|that|who|his|her|their)\s+/i, '').trim()
  
  if (feedbackMessage.length > 10) { // Minimum feedback length
    feedbackData.feedbackMessage = feedbackMessage
  }

  // Extract category
  if (message.includes('professional') || message.includes('professionalism')) {
    feedbackData.category = 'Professional'
  } else if (message.includes('communication') || message.includes('communicat')) {
    feedbackData.category = 'Communication'
  } else if (message.includes('patient care') || message.includes('care')) {
    feedbackData.category = 'Patient Care'
  } else if (message.includes('technical') || message.includes('skill')) {
    feedbackData.category = 'Technical Skills'
  }

  // Extract rating
  const ratingMatch = message.match(/(?:rating[:\s]*|rate[:\s]*)\s*(\d)[\/\s]*(?:5|star|out)/i)
  if (ratingMatch) {
    const rating = parseInt(ratingMatch[1])
    if (rating >= 1 && rating <= 5) {
      feedbackData.rating = rating
    }
  }

  // Check if we have minimum required fields
  feedbackData.hasRequiredFields = feedbackData.aboutUserId !== null && feedbackData.feedbackMessage.length > 0

  return feedbackData
}

/**
 * Handle treatment scheduling
 */
async function handleTreatmentScheduling(message, context) {
  const { userId, userRole, companyId } = context

  if (userRole !== 'staff' && userRole !== 'admin') {
    return {
      message: "I'm sorry, but only healthcare staff can schedule treatments. How else can I help you?",
      actionRequired: false,
      intent: 'access_denied'
    }
  }

  // Extract treatment data from the message
  const treatmentData = await extractTreatmentData(message, userId, companyId)

  if (treatmentData.hasRequiredFields) {
    return {
      message: `I'll schedule a treatment with the following details:

**Patient**: ${treatmentData.patientName}
**Treatment**: ${treatmentData.title}
**Date & Time**: ${treatmentData.scheduledDate}
**Duration**: ${treatmentData.duration} minutes
**Description**: ${treatmentData.description}
${treatmentData.notes ? `**Notes**: ${treatmentData.notes}` : ''}

Should I proceed with scheduling this treatment?`,
      actionRequired: true,
      intent: 'schedule_treatment',
      actionType: 'confirm_treatment',
      data: treatmentData,
      followUpQuestions: [
        "Yes, schedule it",
        "No, let me modify",
        "Cancel"
      ]
    }
  } else {
    // Get assigned patients for staff
    const assignments = await Assignment.find({
      workerId: userId,
      status: 'active'
    })
    .populate('patientId', 'name department')
    .limit(10)

    if (assignments.length === 0) {
      return {
        message: "You don't have any patients assigned to you currently. Please contact your supervisor to get patient assignments before scheduling treatments.",
        actionRequired: false,
        intent: 'schedule_treatment'
      }
    }

    const patientList = assignments.map((assignment, index) => 
      `${index + 1}. ${assignment.patientId.name} (${assignment.patientId.department || 'N/A'})`
    ).join('\n')

    return {
      message: `I can help you schedule patient treatments. Here are your assigned patients:

${patientList}

Please provide:
1. **Patient name** - Who is the treatment for?
2. **Treatment type** - Consultation, procedure, therapy, etc.
3. **Preferred date and time**
4. **Duration estimate**
5. **Special requirements or notes**

For example: "Schedule a consultation for John Smith on January 15th at 2 PM, duration 30 minutes. Initial assessment for back pain treatment."`,
      actionRequired: true,
      intent: 'schedule_treatment',
      actionType: 'collect_treatment_info',
      data: { availablePatients: assignments },
      followUpQuestions: [
        "Schedule consultation",
        "Schedule procedure",
        "Schedule therapy session"
      ]
    }
  }
}

/**
 * Extract treatment data from natural language message
 */
async function extractTreatmentData(message, userId, companyId) {
  const treatmentData = {
    hasRequiredFields: false,
    patientId: null,
    patientName: '',
    title: '',
    description: '',
    scheduledDate: null,
    duration: 60,
    notes: ''
  }

  // Extract patient name
  const patientMatch = message.match(/(?:for|with|patient)\s+([a-z\s]+?)(?:\s+on|\s+at|\s+,|$)/i)
  if (patientMatch) {
    const extractedName = patientMatch[1].trim()
    
    // Find patient in assignments
    const assignment = await Assignment.findOne({
      workerId: userId,
      status: 'active'
    }).populate({
      path: 'patientId',
      match: { name: { $regex: new RegExp(extractedName, 'i') } }
    })

    if (assignment && assignment.patientId) {
      treatmentData.patientId = assignment.patientId._id
      treatmentData.patientName = assignment.patientId.name
    }
  }

  // Extract treatment type/title
  const titleMatch = message.match(/\b(consultation|procedure|therapy|treatment|session|appointment|checkup|follow-up|assessment)\b/i)
  if (titleMatch) {
    treatmentData.title = titleMatch[1].charAt(0).toUpperCase() + titleMatch[1].slice(1)
  }

  // Extract description (look for medical terms or descriptions)
  const descMatch = message.match(/(?:for|regarding|about)\s+([^\.]+)(?:\.|$)/i)
  if (descMatch) {
    treatmentData.description = descMatch[1].trim()
  }

  // Extract date and time
  const dateTimeMatch = message.match(/(?:on|at)\s+([^,\.]+?)(?:\s*,|\s*\.|\s+duration|\s+for|$)/i)
  if (dateTimeMatch) {
    const dateStr = dateTimeMatch[1].trim()
    const parsedDate = parseDateTime(dateStr)
    if (parsedDate) {
      treatmentData.scheduledDate = parsedDate
    }
  }

  // Extract duration
  const durationMatch = message.match(/(?:duration|for)\s+(\d+)\s*(?:minutes?|mins?|hours?)/i)
  if (durationMatch) {
    let duration = parseInt(durationMatch[1])
    if (message.includes('hour')) {
      duration *= 60 // Convert hours to minutes
    }
    treatmentData.duration = duration
  }

  // Extract notes (anything after key phrases)
  const notesMatch = message.match(/(?:notes?|special|requirements?|details?)[:\s]+([^\.]+)/i)
  if (notesMatch) {
    treatmentData.notes = notesMatch[1].trim()
  }

  // Check if we have minimum required fields
  treatmentData.hasRequiredFields = treatmentData.patientId !== null && 
                                   treatmentData.title.length > 0 && 
                                   treatmentData.scheduledDate !== null

  return treatmentData
}

/**
 * Parse date/time string into Date object
 */
function parseDateTime(dateStr) {
  const now = new Date()
  const lowerDateStr = dateStr.toLowerCase()

  // Handle relative dates
  if (lowerDateStr === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0) // Default 9 AM
  } else if (lowerDateStr === 'tomorrow') {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0)
  }

  // Try to parse various date formats
  try {
    // Handle formats like "January 15th at 2 PM"
    let cleanStr = dateStr.replace(/(\d+)(st|nd|rd|th)/g, '$1')
    cleanStr = cleanStr.replace(/\bat\s+/i, ' ')
    
    const parsed = new Date(cleanStr)
    if (!isNaN(parsed) && parsed > now) {
      return parsed
    }
  } catch (e) {
    // Ignore parse errors
  }

  return null
}

/**
 * Generate help response
 */
function generateHelpResponse(context) {
  return generateGreeting(context)
}

/**
 * Generate default response
 */
function generateDefaultResponse(context) {
  const { userRole } = context
  
  if (userRole === 'staff') {
    return {
      message: "I'm here to help! I can assist you with:\n• Managing tasks\n• Patient information\n• Treatment scheduling\n• Feedback submission\n\nWhat would you like to do?",
      actionRequired: false,
      intent: 'general',
      followUpQuestions: ["Show capabilities", "Create task", "Check patients"]
    }
  } else {
    return {
      message: "I'm here to help! I can assist you with:\n• Submitting feedback\n• General questions about services\n• Connecting with support\n\nWhat would you like to do?",
      actionRequired: false, 
      intent: 'general',
      followUpQuestions: ["Submit feedback", "Ask questions", "Get support"]
    }
  }
}

/**
 * Get AI capabilities based on user role
 */
function getAICapabilities(userRole) {
  const baseCapabilities = [
    'conversation',
    'feedback_submission',
    'general_questions'
  ]

  if (userRole === 'staff') {
    return [
      ...baseCapabilities,
      'task_management',
      'patient_information',
      'treatment_scheduling',
      'medical_notes'
    ]
  } else if (userRole === 'admin') {
    return [
      ...baseCapabilities,
      'task_management',
      'system_overview',
      'user_management',
      'feedback_review'
    ]
  }

  return baseCapabilities
}

export default router
