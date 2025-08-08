import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FormData from 'form-data';
import axios from 'axios';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import your existing models
import User from '../models/User.js';
import Task from '../models/Task.js';
import Feedback from '../models/Feedback.js';
import Tenant from '../models/Tenant.js';

class AIVoiceStreamHandler {
  constructor(server) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is not configured');
      throw new Error('OPENAI_API_KEY is required for AI Voice Stream Handler');
    }
    
    this.wss = new WebSocketServer({ 
      server,
      path: '/ai-voice-stream',
      // Add CORS handling for WebSocket
      verifyClient: (info) => {
        console.log('🔗 WebSocket connection attempt from:', info.origin);
        return true; // Accept all origins for now, restrict in production
      }
    });
    
    this.setupWebSocketServer();
    this.activeConnections = new Map();
  }

  setupWebSocketServer() {
    this.wss.on('connection', async (ws, req) => {
      console.log('🎙️ New WebSocket connection attempt');
      console.log('🔗 Request URL:', req.url);
      console.log('🔗 Request headers:', req.headers);
      console.log('🔗 Origin:', req.headers.origin);
      console.log('🔗 User-Agent:', req.headers['user-agent']);
      
      try {
        // Authenticate user
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        console.log('🔑 Token provided:', !!token);
        console.log('🔑 Token length:', token ? token.length : 0);
        
        if (!token) {
          console.error('❌ No token provided in WebSocket connection');
          ws.close(1008, 'No authentication token provided');
          return;
        }
        
        const user = await this.authenticateUser(token);
        
        if (!user) {
          console.error('❌ Authentication failed for WebSocket connection');
          ws.close(1008, 'Authentication failed');
          return;
        }

        console.log('✅ User authenticated:', user.name, '(' + user.role + ')');

        // Setup connection
        const connectionId = this.generateConnectionId();
        const connectionData = {
          ws,
          user,
          audioBuffer: Buffer.alloc(0),
          conversationContext: {
            messages: [],
            userRole: user.role,
            userName: user.name,
            userId: user._id,
            companyName: user.companyName || ''
          },
          isProcessing: false
        };

        this.activeConnections.set(connectionId, connectionData);
        console.log('🔗 Active connections:', this.activeConnections.size);

        // Setup message handlers
        ws.on('message', (data) => this.handleMessage(connectionId, data));
        ws.on('close', () => this.handleDisconnection(connectionId));
        ws.on('error', (error) => this.handleError(connectionId, error));

        console.log(`✅ AI Voice Stream connected: ${user.name} (${user.role})`);
        
        // Send connection confirmation
        this.sendMessage(ws, 'connection_ready', {
          message: 'WebSocket connection established successfully',
          userId: user._id,
          userRole: user.role
        });

      } catch (error) {
        console.error('❌ WebSocket connection error:', error);
        console.error('❌ Error stack:', error.stack);
        ws.close(1011, 'Server error during connection setup');
      }
    });
    
    this.wss.on('error', (error) => {
      console.error('❌ WebSocket Server error:', error);
    });
    
    console.log('🎙️ WebSocket Server initialized on path: /ai-voice-stream');
  }

  async authenticateUser(token) {
    try {
      if (!token) return null;
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log({decoded})
      const user = await User.findById(decoded.id);
      console.log({user})
      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  generateConnectionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async handleMessage(connectionId, rawData) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) {
      console.error('❌ No connection found for ID:', connectionId);
      return;
    }

    try {
      const message = JSON.parse(rawData.toString());
      console.log('📨 Received message type:', message.type, 'from user:', connection.user.name);
      
      switch (message.type) {
        case 'init':
          await this.handleInit(connection, message.data);
          break;
          
        case 'audio_chunk':
          await this.handleAudioChunk(connection, message.data);
          break;
          
        case 'vad_audio':
          await this.handleVADAudio(connection, message.data);
          break;
          
        case 'end_speech':
          await this.handleEndSpeech(connection);
          break;
          
        default:
          console.log('⚠️ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Message handling error:', error);
      this.sendError(connection, 'Failed to process message');
    }
  }

  async handleInit(connection, data) {
    // Update conversation context
    Object.assign(connection.conversationContext, data);
    
    // Send welcome message
    const welcomeMessage = this.generateWelcomeMessage(connection.user);
    
    // Generate and send welcome audio
    const welcomeAudio = await this.generateSpeech(welcomeMessage);
    
    this.sendMessage(connection.ws, 'welcome', {
      message: welcomeMessage,
      audio: welcomeAudio
    });

    // Signal that AI is ready for user input after welcome
    setTimeout(() => {
      this.sendMessage(connection.ws, 'ready_for_speech', {
        message: 'AI is ready to listen'
      });
    }, 2000); // Give 2 seconds for welcome audio to play
  }

  generateWelcomeMessage(user) {
    const roleFeatures = {
      staff: "I can help you create and manage work tasks, retrieve patient information, and submit feedback about your work or patient care.",
      patient: "I can help you submit feedback about your care experience or staff members, and answer general questions.",
      admin: "I can help you with comprehensive system management, staff task oversight, patient information access, and analytics."
    };

    return `Hello ${user.name}, I'm your AI assistant. ${roleFeatures[user.role] || 'I\'m here to help you.'} What would you like to do today?`;
  }

  async handleAudioChunk(connection, data) {
    try {
      // Accumulate audio data
      const audioChunk = Buffer.from(data.audio);
      connection.audioBuffer = Buffer.concat([connection.audioBuffer, audioChunk]);
      
      // Optional: Real-time transcription for very responsive systems
      // For now, we'll process on end_speech for better accuracy
      
    } catch (error) {
      console.error('Audio chunk handling error:', error);
    }
  }

  async handleEndSpeech(connection) {
    if (connection.isProcessing || connection.audioBuffer.length === 0) {
      return;
    }

    connection.isProcessing = true;

    try {
      // 1. Speech-to-Text
      const transcription = await this.transcribeAudio(connection.audioBuffer);
      
      if (!transcription?.trim()) {
        connection.isProcessing = false;
        connection.audioBuffer = Buffer.alloc(0);
        return;
      }

      // Send transcription to client
      this.sendMessage(connection.ws, 'transcription', {
        text: transcription
      });

      // Add to conversation history
      connection.conversationContext.messages.push({
        role: 'user',
        content: transcription
      });

      // 2. Process with AI and determine intent
      const aiResponse = await this.processWithAI(connection, transcription);
      
      // 3. Execute any required actions
      const actionResult = await this.executeAction(connection, aiResponse);
      
      // 4. Generate final response
      const finalResponse = actionResult.response || aiResponse.message;
      
      // 5. Text-to-Speech
      const responseAudio = await this.generateSpeech(finalResponse);
      
      // Send AI response with audio
      this.sendMessage(connection.ws, 'ai_response', {
        text: finalResponse,
        audio: responseAudio,
        actionPerformed: actionResult.actionPerformed || false
      });

      // Add AI response to conversation history
      connection.conversationContext.messages.push({
        role: 'assistant',
        content: finalResponse
      });

      // Signal that AI is ready for next user input (for automatic conversation flow)
      setTimeout(() => {
        this.sendMessage(connection.ws, 'ready_for_speech', {
          message: 'AI is ready to listen'
        });
      }, 1000); // Give 1 second for AI audio to start playing

    } catch (error) {
      console.error('Speech processing error:', error);
      this.sendError(connection, 'Failed to process your speech. Please try again.');
    } finally {
      connection.isProcessing = false;
      connection.audioBuffer = Buffer.alloc(0);
    }
  }

  async handleVADAudio(connection, data) {
    if (connection.isProcessing) {
      console.log('⚠️ Already processing, ignoring VAD audio');
      return;
    }

    connection.isProcessing = true;

    try {
      console.log('🎙️ Processing VAD audio, size:', data.audio?.length || 0);
      
      // Convert audio array back to buffer
      const audioBuffer = Buffer.from(data.audio);
      
      if (audioBuffer.length === 0) {
        console.log('⚠️ Empty VAD audio buffer, skipping');
        connection.isProcessing = false;
        return;
      }

      // 1. Speech-to-Text
      const transcription = await this.transcribeVADAudio(audioBuffer);
      
      if (!transcription?.trim()) {
        console.log('⚠️ No transcription from VAD audio');
        connection.isProcessing = false;
        return;
      }

      console.log('📝 VAD Transcription:', transcription);

      // Send transcription to client
      this.sendMessage(connection.ws, 'transcription', {
        text: transcription
      });

      // Add to conversation history
      connection.conversationContext.messages.push({
        role: 'user',
        content: transcription
      });

      // 2. Process with AI and determine intent
      const aiResponse = await this.processWithAI(connection, transcription);
      
      // 3. Execute any required actions
      const actionResult = await this.executeAction(connection, aiResponse);
      
      // 4. Generate final response
      const finalResponse = actionResult.response || aiResponse.message;
      
      // 5. Text-to-Speech
      const responseAudio = await this.generateSpeech(finalResponse);
      
      // Send AI response with audio
      this.sendMessage(connection.ws, 'ai_response', {
        text: finalResponse,
        audio: responseAudio,
        actionPerformed: actionResult.actionPerformed || false
      });

      // Add AI response to conversation history
      connection.conversationContext.messages.push({
        role: 'assistant',
        content: finalResponse
      });

      // Signal that VAD audio has been processed
      this.sendMessage(connection.ws, 'vad_audio_processed', {
        message: 'VAD audio processed successfully'
      });

    } catch (error) {
      console.error('❌ VAD audio processing error:', error);
      this.sendError(connection, 'Failed to process your speech. Please try again.');
    } finally {
      connection.isProcessing = false;
    }
  }

  async transcribeVADAudio(audioBuffer) {
    try {
      console.log('🔄 Transcribing VAD audio, buffer size:', audioBuffer.length);
      
      // Save VAD audio to temporary file (WAV format from client)
      const tempFile = path.join(__dirname, '../temp', `vad_audio_${Date.now()}.wav`);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(tempFile);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(tempFile, audioBuffer);

      // Create form data for OpenAI Whisper
      const form = new FormData();
      form.append('file', fs.createReadStream(tempFile));
      form.append('model', 'whisper-1');
      form.append('language', 'en');

      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      // Clean up temp file
      fs.unlinkSync(tempFile);

      return response.data.text;
      
    } catch (error) {
      console.error('VAD transcription error:', error);
      throw new Error('Failed to transcribe VAD audio');
    }
  }

  async transcribeAudio(audioBuffer) {
    try {
      // Save audio to temporary file (WebM format from MediaRecorder)
      const tempFile = path.join(__dirname, '../temp', `audio_${Date.now()}.webm`);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(tempFile);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(tempFile, audioBuffer);

      // Create form data for OpenAI Whisper
      const form = new FormData();
      form.append('file', fs.createReadStream(tempFile));
      form.append('model', 'whisper-1');
      form.append('language', 'en');

      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      // Clean up temp file
      fs.unlinkSync(tempFile);

      return response.data.text;
      
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async processWithAI(connection, userInput) {
    try {
      const systemPrompt = this.generateSystemPrompt(connection.user);
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...connection.conversationContext.messages.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userInput }
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        functions: this.getFunctionDefinitions(connection.user.role),
        function_call: 'auto'
      });

      const aiMessage = response.choices[0].message;

      if (aiMessage.function_call) {
        return {
          message: aiMessage.content || "I'll help you with that.",
          functionCall: aiMessage.function_call,
          requiresAction: true
        };
      }

      return {
        message: aiMessage.content,
        requiresAction: false
      };

    } catch (error) {
      console.error('AI processing error:', error);
      return {
        message: "I'm having trouble processing that right now. Could you please try again?",
        requiresAction: false
      };
    }
  }

  generateSystemPrompt(user) {
    const basePrompt = `You are a helpful AI assistant for a healthcare management system. 
The user is ${user.name}, a ${user.role} in the system.

Keep your responses conversational, helpful, and concise. You're having a voice conversation, so speak naturally.

Current conversation context:
- User: ${user.name}
- Role: ${user.role}
- Company: ${user.companyName || 'Healthcare System'}`;

    const roleSpecificPrompts = {
      staff: `As a staff member, you can help them:
- Search for patients and get detailed patient information
- Create and manage work tasks for healthcare operations and administration
- Update task status (pending, in-progress, completed, overdue) and add notes
- View and filter tasks by status, priority, category, or assignment
- Submit feedback about other staff members or patients by searching for them by name
- Assign tasks for yourself

Tasks are work items for staff to complete - they can be patient care tasks, administrative work, follow-ups, or any healthcare-related activities. Each task has a title, description, category, priority, due date, and can be assigned to specific staff members.

For feedback submission:
1. When users want to give feedback, ask them who they want to give feedback about
2. Use the search_staff_by_name function to find staff members by name
3. Show the search results with clear numbering (1, 2, 3, etc.)
4. Ask users to select the correct person by number
5. Collect their detailed feedback message
6. Use submit_feedback with the person selection and message

Example workflow:
- User: "I want to give feedback about Dr. Smith"
- You: Search for "Dr. Smith" and show results
- You: Ask user to select the correct Dr. Smith by number
- You: Ask for their feedback message
- You: Submit the feedback with the selected person and message

Tasks are work items for staff to complete - they can be patient care tasks, administrative work, follow-ups, or any healthcare-related activities. Each task has a title, description, category, priority, due date, and can be assigned to specific staff members.

When creating tasks, gather all required information: title, description, category, and due date.
When managing tasks, provide clear status updates and ask if they need to add notes.
Always ask for clarification when needed and confirm important actions before executing them.`,

      patient: `As a patient, you can help them:
- Submit feedback about their healthcare experience and staff members
- Get general information about the system
- Answer questions about their account

For submitting feedback about staff:
1. When they want to give feedback, ask who they want to give feedback about
2. Use search_staff_by_name to find the staff member by name
3. Show search results with clear numbering
4. Ask them to select the correct staff member by number
5. Collect their detailed feedback message about their care experience
6. Submit the feedback with the selected person and message

Example: "I want to give feedback about my nurse Sarah" → search for Sarah → show results → select correct Sarah → collect feedback about their experience → submit

You cannot:
- Access other patients' information
- Submit feedback about other patients (only about staff)
- Perform administrative tasks
- View staff tasks or system operations data

Always be helpful, professional, and ensure patients feel heard when providing feedback about their healthcare experience.`,

      admin: `As an administrator, you have access to all system features:
- Complete patient management: search, view detailed info, manage patient records
- Full task management: create, update, view, and manage all staff work tasks
- Task workflow: update status, add notes, set priorities and due dates, assign to staff
- Submit feedback about staff members by searching for them by name
- View tasks across all staff members and departments
- System analytics and reports
- User management functions
- All feedback and operational data review

Tasks represent work items for healthcare staff - patient care activities, administrative work, follow-ups, etc. You can create, assign, and manage tasks for any staff member.

For feedback submission:
1. Ask who they want to give feedback about
2. Search for staff members using search_staff_by_name
3. Show search results with numbering
4. Let them select the correct person
5. Collect feedback message
6. Submit the feedback

You have unrestricted access to all system functions and can perform any administrative task.`
    };

    return basePrompt + '\n\n' + (roleSpecificPrompts[user.role] || roleSpecificPrompts.patient);
  }

  getFunctionDefinitions(userRole) {
    const baseFunctions = [];

    // Patient-specific functions
    if (userRole === 'patient') {
      baseFunctions.push(
        {
          name: 'search_staff_for_feedback',
          description: 'Search for staff members by name to provide feedback about',
          parameters: {
            type: 'object',
            properties: {
              staffName: { type: 'string', description: 'Name or partial name of the staff member' }
            },
            required: ['staffName']
          }
        },
        {
          name: 'submit_feedback',
          description: 'Submit feedback about staff members',
          parameters: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Detailed feedback message' },
              personSelection: { type: 'number', description: 'Number selection from search results (1, 2, 3, etc.)' }
            },
            required: ['message']
          }
        }
      );
    }

    // Staff and Admin functions
    if (userRole === 'staff' || userRole === 'admin') {
      baseFunctions.push(
        {
          name: 'search_patients_for_feedback',
          description: 'Search for patients by name to provide feedback about them',
          parameters: {
            type: 'object',
            properties: {
              patientName: { type: 'string', description: 'Name or partial name of the patient to search for' }
            },
            required: ['patientName']
          }
        },
        {
          name: 'search_staff_for_feedback',
          description: 'Search for staff members by name to provide feedback about them',
          parameters: {
            type: 'object',
            properties: {
              staffName: { type: 'string', description: 'Name or partial name of the staff member to search for' }
            },
            required: ['staffName']
          }
        },
        {
          name: 'search_patients',
          description: 'Search for patients by name or ID for medical purposes',
          parameters: {
            type: 'object',
            properties: {
              patientName: { type: 'string', description: 'Patient name for search' },
              patientId: { type: 'string', description: 'Specific patient ID' }
            }
          }
        },
        {
          name: 'get_patient_details',
          description: 'Get detailed information about a specific patient',
          parameters: {
            type: 'object',
            properties: {
              patientId: { type: 'string', description: 'Patient ID' },
              patientSelection: { type: 'number', description: 'Number selection from patient search results' }
            }
          }
        },
        {
          name: 'create_task',
          description: 'Create a new task for staff management',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Task title' },
              description: { type: 'string', description: 'Detailed task description' },
              category: { type: 'string', description: 'Task category (e.g., "Patient Care", "Administration", "Medical", "Follow-up")' },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Task priority level' },
              dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
              estimatedHours: { type: 'number', description: 'Estimated hours to complete the task' },
              tags: { type: 'array', items: { type: 'string' }, description: 'Tags for task organization' },
              assignedTo: { type: 'string', description: 'User ID to assign task to (optional, defaults to current user)' }
            },
            required: ['title', 'description', 'category', 'dueDate']
          }
        },
        {
          name: 'get_tasks',
          description: 'Retrieve and manage tasks for the current user',
          parameters: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['pending', 'in-progress', 'completed', 'overdue'], description: 'Filter by task status' },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Filter by priority' },
              category: { type: 'string', description: 'Filter by task category' },
              assignedTo: { type: 'string', description: 'User ID of assigned staff member' },
              limit: { type: 'number', description: 'Number of tasks to retrieve (default: 10)' },
              page: { type: 'number', description: 'Page number for pagination (default: 1)' }
            }
          }
        },
        {
          name: 'update_task_status',
          description: 'Update the status of an existing task',
          parameters: {
            type: 'object',
            properties: {
              taskId: { type: 'string', description: 'Task ID to update' },
              status: { type: 'string', enum: ['pending', 'in-progress', 'completed', 'overdue'] },
              notes: { type: 'string', description: 'Optional notes about the status change' }
            },
            required: ['taskId', 'status']
          }
        },
        {
          name: 'submit_feedback',
          description: 'Submit feedback about staff members. Use this after searching for and selecting the staff member you want to give feedback about.',
          parameters: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Detailed feedback message about the staff member' },
              personSelection: { type: 'number', description: 'Number selection from search results (1, 2, 3, etc.)' },
              aboutType: { type: 'string', enum: ['staff'], description: 'Type of person feedback is about', default: 'staff' }
            },
            required: ['message']
          }
        },
        {
          name: 'search_staff_by_name',
          description: 'Search for staff members by name to give feedback about them. Use this first before submitting feedback.',
          parameters: {
            type: 'object',
            properties: {
              staffName: { type: 'string', description: 'Name or partial name of the staff member to search for' }
            },
            required: ['staffName']
          }
        }
      );
    }

    return baseFunctions;
  }

  async executeAction(connection, aiResponse) {
    if (!aiResponse.requiresAction || !aiResponse.functionCall) {
      return { actionPerformed: false, response: aiResponse.message };
    }

    try {
      const { name, arguments: args } = aiResponse.functionCall;
      const parsedArgs = JSON.parse(args);

      switch (name) {
        case 'submit_feedback':
          return await this.handleSubmitFeedback(connection, parsedArgs);
          
        case 'search_staff_by_name':
        case 'search_staff_for_feedback':
          return await this.handleSearchStaffForFeedback(connection, parsedArgs);
          
        case 'search_patients_for_feedback':
          return await this.handleSearchPatientsForFeedback(connection, parsedArgs);
          
        case 'search_patients':
          return await this.handleSearchPatients(connection, parsedArgs);
          
        case 'get_patient_details':
          return await this.handleGetPatientDetails(connection, parsedArgs);
          
        case 'create_task':
          return await this.handleCreateTask(connection, parsedArgs);
          
        case 'get_tasks':
          return await this.handleGetTasks(connection, parsedArgs);
          
        case 'update_task_status':
          return await this.handleUpdateTaskStatus(connection, parsedArgs);
          
        default:
          return { 
            actionPerformed: false, 
            response: "I'm not sure how to help with that. Could you please try again?" 
          };
      }
    } catch (error) {
      console.error('Action execution error:', error);
      return {
        actionPerformed: false,
        response: "I encountered an error while trying to help you. Please try again."
      };
    }
  }

  async handleSubmitFeedback(connection, args) {
    try {
      const { message, personSelection, aboutType } = args;
      
      // Validate required fields
      if (!message || message.trim().length < 10) {
        return {
          actionPerformed: false,
          response: "Please provide a more detailed feedback message (at least 10 characters)."
        };
      }

      let selectedPerson = null;
      let targetWorkerId = null;
      let targetWorkerName = null;

      // Handle selection from search results only
      if (personSelection) {
        if (connection.tempStaffSearchResults && connection.tempStaffSearchResults.length > 0) {
          selectedPerson = connection.tempStaffSearchResults[personSelection - 1];
          if (!selectedPerson) {
            return {
              actionPerformed: false,
              response: `Invalid selection. Please choose a number between 1 and ${connection.tempStaffSearchResults.length}.`
            };
          }
          targetWorkerId = selectedPerson._id;
          targetWorkerName = selectedPerson.name;
        } else if (connection.tempPatientSearchResults && connection.tempPatientSearchResults.length > 0) {
          selectedPerson = connection.tempPatientSearchResults[personSelection - 1];
          if (!selectedPerson) {
            return {
              actionPerformed: false,
              response: `Invalid selection. Please choose a number between 1 and ${connection.tempPatientSearchResults.length}.`
            };
          }
          targetWorkerId = selectedPerson._id;
          targetWorkerName = selectedPerson.name;
        } else {
          return {
            actionPerformed: false,
            response: "Please search for the person first, then select them by number."
          };
        }
      } else {
        return {
          actionPerformed: false,
          response: "Please specify who you want to give feedback about. You can search for them by name first."
        };
      }

      // Role-based validation - patients can only give feedback about staff
      if (connection.user.role === 'patient' && aboutType === 'patient') {
        return {
          actionPerformed: false,
          response: "As a patient, you can only provide feedback about staff members, not other patients."
        };
      }

      // Verify the target person exists and is accessible
      const targetWorker = await User.findById(targetWorkerId);
      if (!targetWorker) {
        return {
          actionPerformed: false,
          response: "The person you want to give feedback about could not be found."
        };
      }

      // Company validation - users can only give feedback about people in their company
      if (connection.user.company && targetWorker.company) {
        if (connection.user.company.toString() !== targetWorker.company.toString()) {
          return {
            actionPerformed: false,
            response: "You can only provide feedback about staff members in your healthcare facility."
        };
        }
      }

      // Get sentiment score for the feedback
      let sentimentScore = null;
      try {
        const { getSentimentScore } = await import('../utils/getSentiment.js');
        sentimentScore = await getSentimentScore(message.trim());
      } catch (error) {
        console.log('Sentiment analysis failed, continuing without score:', error.message);
      }

      // Prepare feedback data according to the Feedback model
      const feedbackData = {
        userId: connection.user._id,
        workerId: targetWorkerId,
        senderName: connection.user.name,
        senderEmail: connection.user.email || `${connection.user.name}@healthcare.com`,
        workerName: targetWorkerName,
        message: message.trim(),
        source: connection.user.role,
        sentimentScore: sentimentScore >= 0 ? sentimentScore : null,
        timestamp: new Date()
      };

      // Create the feedback record
      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      // Clear temporary search results
      delete connection.tempStaffSearchResults;
      delete connection.tempPatientSearchResults;

      // Format sentiment feedback
      let sentimentText = '';
      if (sentimentScore !== null && sentimentScore >= 0) {
        if (sentimentScore >= 70) sentimentText = 'Positive';
        else if (sentimentScore >= 30) sentimentText = 'Neutral';
        else sentimentText = 'Needs Attention';
      }

      const responseMessage = `✅ Thank you for your feedback! I've successfully submitted your feedback about ${targetWorkerName}.

**Feedback Summary:**
• **About:** ${targetWorkerName} (${targetWorker.role})
${sentimentScore !== null ? `• **Sentiment:** ${sentimentText} (${sentimentScore}/100)` : ''}
• **Submitted:** ${new Date().toLocaleString()}

Your feedback has been recorded and will be reviewed by the appropriate team. Thank you for helping us improve our healthcare services!`;

      return {
        actionPerformed: true,
        response: responseMessage,
        data: {
          feedbackId: savedFeedback._id,
          aboutPerson: targetWorkerName,
          aboutPersonRole: targetWorker.role,
          sentimentScore: sentimentScore,
          sentimentCategory: sentimentText
        }
      };
    } catch (error) {
      console.error('Submit feedback error:', error);
      return {
        actionPerformed: false,
        response: "I apologize, but I couldn't submit your feedback right now. Please try again later or contact support if the issue persists."
      };
    }
  }

  async handleSearchStaffForFeedback(connection, args) {
    try {
      if (!args.staffName || args.staffName.trim().length < 2) {
        return {
          actionPerformed: false,
          response: "Please provide at least 2 characters of the staff member's name to search."
        };
      }

      const staffQuery = {
        role: { $in: ['staff', 'admin'] },
        name: new RegExp(args.staffName.trim(), 'i')
      };

      // Filter by company if available
      if (connection.user.company) {
        staffQuery.company = connection.user.company;
      }

      const staffMembers = await User.find(staffQuery)
        .select('name role department email')
        .limit(10);

      if (staffMembers.length === 0) {
        return {
          actionPerformed: true,
          response: `I couldn't find any staff members with the name "${args.staffName}". Could you please check the spelling or try a different name? You can also try searching with just the first name or last name.`
        };
      }

      // Store search results for later selection
      connection.tempStaffSearchResults = staffMembers;

      const staffList = staffMembers.map((staff, index) => 
        `${index + 1}. ${staff.name} - ${staff.role}${staff.department ? ` (${staff.department})` : ''}${staff.email ? ` - ${staff.email}` : ''}`
      ).join('\n');

      const selectionPrompt = staffMembers.length === 1 
        ? "I found 1 staff member. To submit feedback about them, please tell me:\n1. The number (1)\n2. Your detailed feedback message"
        : `I found ${staffMembers.length} staff members. Please tell me:\n1. The number of the staff member you want to give feedback about\n2. Your detailed feedback message`;

      return {
        actionPerformed: true,
        response: `${staffList}\n\n${selectionPrompt}`
      };
    } catch (error) {
      console.error('Search staff for feedback error:', error);
      return {
        actionPerformed: false,
        response: "I couldn't search for staff members right now. Please try again later."
      };
    }
  }

  async handleSearchPatientsForFeedback(connection, args) {
    try {
      // Only staff and admin can search patients for feedback
      if (connection.user.role !== 'staff' && connection.user.role !== 'admin') {
        return {
          actionPerformed: false,
          response: "I'm sorry, only staff members can provide feedback about patients."
        };
      }

      if (!args.patientName || args.patientName.trim().length < 2) {
        return {
          actionPerformed: false,
          response: "Please provide at least 2 characters of the patient's name to search."
        };
      }

      const patientQuery = {
        role: 'patient',
        name: new RegExp(args.patientName.trim(), 'i')
      };

      // Filter by company if available
      if (connection.user.company) {
        patientQuery.company = connection.user.company;
      }

      const patients = await User.find(patientQuery)
        .select('name email department createdAt')
        .limit(10);

      if (patients.length === 0) {
        return {
          actionPerformed: true,
          response: `I couldn't find any patients with the name "${args.patientName}". Could you please check the spelling or try a different name? You can also try searching with just the first name or last name.`
        };
      }

      // Store search results for later selection
      connection.tempPatientSearchResults = patients;

      const patientList = patients.map((patient, index) => 
        `${index + 1}. ${patient.name}${patient.department ? ` (${patient.department})` : ''}${patient.email ? ` - ${patient.email}` : ''}`
      ).join('\n');

      const selectionPrompt = patients.length === 1 
        ? "I found 1 patient. To submit feedback about them, please tell me:\n1. The number (1)\n2. Your detailed feedback message"
        : `I found ${patients.length} patients. Please tell me:\n1. The number of the patient you want to give feedback about\n2. Your detailed feedback message`;

      return {
        actionPerformed: true,
        response: `${patientList}\n\n${selectionPrompt}`
      };
    } catch (error) {
      console.error('Search patients for feedback error:', error);
      return {
        actionPerformed: false,
        response: "I couldn't search for patients right now. Please try again later."
      };
    }
  }

  async handleSearchPatients(connection, args) {
    try {
      // Verify user has permission
      if (connection.user.role === 'patient') {
        return {
          actionPerformed: false,
          response: "I'm sorry, I can't access patient information. Is there something else I can help you with?"
        };
      }

      let query = { role: 'patient' };
      
      // Filter by company
      if (connection.user.company) {
        query.company = connection.user.company;
      }

      if (args.patientId) {
        query._id = args.patientId;
      } else if (args.patientName) {
        query.name = new RegExp(args.patientName, 'i');
      } else {
        return {
          actionPerformed: false,
          response: "Please provide either a patient name or patient ID to search for."
        };
      }

      const patients = await User.find(query)
        .select('name email phone createdAt department')
        .limit(10);

      if (patients.length === 0) {
        return {
          actionPerformed: true,
          response: "I couldn't find any patients matching that criteria. Could you please check the name or ID and try again?"
        };
      }

      // Store search results for later selection
      connection.tempPatientSearchResults = patients;

      const patientList = patients.map((patient, index) => 
        `${index + 1}. ${patient.name} (ID: ${patient._id.toString().slice(-6)}, Email: ${patient.email || 'N/A'})`
      ).join('\n');

      return {
        actionPerformed: true,
        response: patients.length === 1 
          ? `I found the patient: ${patientList}. What would you like to know about them or what action would you like to take?`
          : `I found ${patients.length} patients:\n\n${patientList}\n\nPlease tell me the number of the patient you're interested in, or ask me to get detailed information about a specific one.`
      };
    } catch (error) {
      console.error('Search patients error:', error);
      return {
        actionPerformed: false,
        response: "I couldn't search for patients right now. Please try again later."
      };
    }
  }

  async handleGetPatientDetails(connection, args) {
    try {
      // Verify user has permission
      if (connection.user.role === 'patient') {
        return {
          actionPerformed: false,
          response: "I'm sorry, I can't access patient information. Is there something else I can help you with?"
        };
      }

      let patient = null;

      // Handle patient selection from search results
      if (args.patientSelection && connection.tempPatientSearchResults) {
        patient = connection.tempPatientSearchResults[args.patientSelection - 1];
      } else if (args.patientId) {
        patient = await User.findById(args.patientId);
      }

      if (!patient) {
        return {
          actionPerformed: false,
          response: "I couldn't find the patient you're looking for. Please search for patients first or provide a valid patient ID."
        };
      }

      // Get patient's tasks
      const tasks = await Task.find({ userId: patient._id })
        .select('title status priority dueDate createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      // Get patient's feedback
      const feedbacks = await Feedback.find({ userId: patient._id })
        .select('message sentimentScore createdAt')
        .sort({ timestamp: -1 })
        .limit(3);

      const taskSummary = tasks.length > 0 
        ? tasks.map(t => `- ${t.title} (${t.status}, ${t.priority} priority)`).join('\n')
        : 'No recent tasks';

      const feedbackSummary = feedbacks.length > 0
        ? feedbacks.map(f => `- ${f.message.substring(0, 50)}... (Score: ${f.sentimentScore || 'N/A'})`).join('\n')
        : 'No recent feedback';

      const patientInfo = `
Patient Details:
Name: ${patient.name}
Email: ${patient.email || 'N/A'}
Phone: ${patient.phone || 'N/A'}
Department: ${patient.department || 'N/A'}
Registered: ${patient.createdAt ? patient.createdAt.toDateString() : 'N/A'}

Recent Tasks (${tasks.length}):
${taskSummary}

Recent Feedback (${feedbacks.length}):
${feedbackSummary}
      `.trim();

      // Clear temp search results
      delete connection.tempPatientSearchResults;

      return {
        actionPerformed: true,
        response: patientInfo + "\n\nWhat would you like to do next? I can help you create a task, view more details, or assist with other patient management activities."
      };
    } catch (error) {
      console.error('Get patient details error:', error);
      return {
        actionPerformed: false,
        response: "I couldn't retrieve patient details right now. Please try again later."
      };
    }
  }

  async handleCreateTask(connection, args) {
    try {
      // Verify user has permission
      if (connection.user.role !== 'staff' && connection.user.role !== 'admin') {
        return {
          actionPerformed: false,
          response: "I'm sorry, only staff members can create tasks."
        };
      }

      // Validate required fields
      if (!args.title || !args.description || !args.category) {
        return {
          actionPerformed: false,
          response: "I need at least a title, description, and category to create a task. Please provide these details."
        };
      }

      // Validate due date
      let dueDate;
      if (args.dueDate) {
        dueDate = new Date(args.dueDate);
        if (dueDate <= new Date()) {
          return {
            actionPerformed: false,
            response: "The due date must be in the future. Please provide a valid due date."
          };
        }
      } else {
        // Default to 7 days from now if no due date provided
        dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }

      // Validate assigned user if provided
      let assignedTo = connection.user._id; // Default to current user
      if (args.assignedTo) {
        const assignedUser = await User.findById(args.assignedTo);
        if (!assignedUser || (assignedUser.role !== 'staff' && assignedUser.role !== 'admin')) {
          return {
            actionPerformed: false,
            response: "The assigned user must be a staff member. Task will be assigned to you instead."
          };
        } else {
          assignedTo = args.assignedTo;
        }
      }

      const taskData = {
        title: args.title.trim(),
        description: args.description.trim(),
        category: args.category.trim(),
        priority: args.priority || 'medium',
        dueDate: dueDate,
        userId: connection.user._id, // Created by current user
        assignedTo: assignedTo,
        company: connection.user.company || null,
        status: 'pending'
      };

      // Add optional fields
      if (args.estimatedHours && args.estimatedHours > 0 && args.estimatedHours <= 1000) {
        taskData.estimatedHours = args.estimatedHours;
      }

      if (args.tags && Array.isArray(args.tags)) {
        taskData.tags = args.tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
      }

      const task = new Task(taskData);
      await task.save();
      await task.populate('assignedTo', 'name email role');

      const assignedToName = taskData.assignedTo.toString() === connection.user._id.toString() ? 'you' : task.assignedTo.name;
      
      return {
        actionPerformed: true,
        response: `Perfect! I've created the task "${args.title}" in the ${args.category} category. The task is set to ${args.priority} priority, due on ${dueDate.toDateString()}${taskData.estimatedHours ? `, with an estimated ${taskData.estimatedHours} hours` : ''}, and assigned to ${assignedToName}. The task is now pending and ready to be worked on.`
      };
    } catch (error) {
      console.error('Create task error:', error);
      return {
        actionPerformed: false,
        response: "I couldn't create the task right now. Please make sure all the information is correct and try again."
      };
    }
  }

  async handleGetTasks(connection, args) {
    try {
      // Verify user has permission
      if (connection.user.role === 'patient') {
        return {
          actionPerformed: false,
          response: "I'm sorry, I can't access task information. Is there something else I can help you with?"
        };
      }

      let query = {
        isArchived: false // Only show non-archived tasks
      };
      
      // Filter by company
      if (connection.user.company) {
        query.company = connection.user.company;
      }
      
      // Filter by current user's tasks or assigned tasks
      if (connection.user.role === 'staff') {
        query.$or = [
          { userId: connection.user._id }, // Tasks created by this user
          { assignedTo: connection.user._id } // Tasks assigned to this user
        ];
      }
      // Admin can see all tasks in their company
      
      // Apply additional filters
      if (args.status) {
        query.status = args.status;
      }
      if (args.assignedTo) {
        query.assignedTo = args.assignedTo;
      }
      if (args.priority) {
        query.priority = args.priority;
      }
      if (args.category) {
        query.category = args.category;
      }

      const limit = args.limit || 10;
      const page = args.page || 1;
      const skip = (page - 1) * limit;

      const [tasks, totalTasks] = await Promise.all([
        Task.find(query)
          .populate('userId', 'name email role') // Task creator
          .populate('assignedTo', 'name email role') // Assigned staff
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Task.countDocuments(query)
      ]);

      if (tasks.length === 0) {
        return {
          actionPerformed: true,
          response: "No tasks found matching those criteria. Would you like me to help you create a new task?"
        };
      }

      const taskSummary = tasks.map((task, index) => 
        `${index + 1}. ${task.title} - ${task.status} (${task.priority} priority)
   Category: ${task.category}
   Created by: ${task.userId?.name || 'Unknown'}
   Assigned to: ${task.assignedTo?.name || 'Unassigned'}
   Due: ${task.dueDate ? task.dueDate.toDateString() : 'No due date'}${task.estimatedHours ? `
   Estimated: ${task.estimatedHours} hours` : ''}`
      ).join('\n\n');

      const pagination = totalTasks > limit ? `\n\nShowing ${tasks.length} of ${totalTasks} total tasks (page ${page}).` : '';

      return {
        actionPerformed: true,
        response: `I found ${totalTasks} task${totalTasks === 1 ? '' : 's'}:\n\n${taskSummary}${pagination}\n\nWould you like more details about any specific task, or would you like me to help you update a task status?`
      };
    } catch (error) {
      console.error('Get tasks error:', error);
      return {
        actionPerformed: false,
        response: "I couldn't retrieve tasks right now. Please try again later."
      };
    }
  }

  async handleUpdateTaskStatus(connection, args) {
    try {
      // Verify user has permission
      if (connection.user.role === 'patient') {
        return {
          actionPerformed: false,
          response: "I'm sorry, only staff members can update task status."
        };
      }

      const task = await Task.findById(args.taskId);
      if (!task) {
        return {
          actionPerformed: false,
          response: "I couldn't find the task you're trying to update. Please check the task ID."
        };
      }

      // Update task status
      const oldStatus = task.status;
      task.status = args.status;

      // Add completion timestamp if marking as completed
      if (args.status === 'completed' && oldStatus !== 'completed') {
        task.completedAt = new Date();
      }

      // Add notes if provided
      if (args.notes) {
        if (!task.notes) {
          task.notes = [];
        }
        task.notes.push({
          content: args.notes,
          createdBy: connection.user._id,
          createdAt: new Date()
        });
      }

      await task.save();

      const patientName = task.userId?.name || 'Unknown Patient';
      return {
        actionPerformed: true,
        response: `Perfect! I've updated the task "${task.title}" from ${oldStatus} to ${args.status}. ${args.notes ? 'I\'ve also added your notes.' : ''} The task is for patient ${patientName}.`
      };
    } catch (error) {
      console.error('Update task status error:', error);
      return {
        actionPerformed: false,
        response: "I couldn't update the task status right now. Please try again later."
      };
    }
  }

  async generateSpeech(text) {
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Female voice, sounds professional
        input: text,
        response_format: 'mp3'
      });

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      return audioBuffer.toString('base64');
      
    } catch (error) {
      console.error('Speech generation error:', error);
      return null;
    }
  }

  sendMessage(ws, type, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, ...data }));
    }
  }

  sendError(connection, message) {
    this.sendMessage(connection.ws, 'error', { message });
  }

  handleDisconnection(connectionId) {
    const connection = this.activeConnections.get(connectionId);
    if (connection) {
      console.log(`AI Voice Stream disconnected: ${connection.user.name}`);
      this.activeConnections.delete(connectionId);
    }
  }

  handleError(connectionId, error) {
    console.error(`WebSocket error for connection ${connectionId}:`, error);
    const connection = this.activeConnections.get(connectionId);
    if (connection) {
      this.sendError(connection, 'Connection error occurred');
    }
  }
}

export default AIVoiceStreamHandler;
