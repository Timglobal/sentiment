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
    
    this.wss = new WebSocketServer({ 
      server,
      path: '/ai-voice-stream'
    });
    
    this.setupWebSocketServer();
    this.activeConnections = new Map();
  }

  setupWebSocketServer() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Authenticate user
        const token = new URL(req.url, 'http://localhost').searchParams.get('token');
        const user = await this.authenticateUser(token);
        
        if (!user) {
          ws.close(1008, 'Authentication failed');
          return;
        }

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

        // Setup message handlers
        ws.on('message', (data) => this.handleMessage(connectionId, data));
        ws.on('close', () => this.handleDisconnection(connectionId));
        ws.on('error', (error) => this.handleError(connectionId, error));

        console.log(`AI Voice Stream connected: ${user.name} (${user.role})`);

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1011, 'Server error');
      }
    });
  }

  async authenticateUser(token) {
    try {
      if (!token) return null;
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
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
    if (!connection) return;

    try {
      const message = JSON.parse(rawData.toString());
      
      switch (message.type) {
        case 'init':
          await this.handleInit(connection, message.data);
          break;
          
        case 'audio_chunk':
          await this.handleAudioChunk(connection, message.data);
          break;
          
        case 'end_speech':
          await this.handleEndSpeech(connection);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Message handling error:', error);
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
  }

  generateWelcomeMessage(user) {
    const roleFeatures = {
      staff: "I can help you create and manage tasks, retrieve patient information, and collect feedback.",
      patient: "I can help you submit feedback and answer general questions about your care.",
      admin: "I can help you with system management, analytics, and all available features."
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

    } catch (error) {
      console.error('Speech processing error:', error);
      this.sendError(connection, 'Failed to process your speech. Please try again.');
    } finally {
      connection.isProcessing = false;
      connection.audioBuffer = Buffer.alloc(0);
    }
  }

  async transcribeAudio(audioBuffer) {
    try {
      // Save audio to temporary file
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
      console.error('Transcription error:', error);
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
- Create and manage tasks for patients
- Retrieve patient information and records
- Submit feedback about the system or patients
- View analytics and reports

Always ask for clarification when needed and confirm important actions before executing them.`,

      patient: `As a patient, you can help them:
- Submit feedback about their care experience
- Get general information about the system
- Answer questions about their account

You cannot access other patients' information or perform administrative tasks.`,

      admin: `As an administrator, you have access to all system features:
- Full task management capabilities
- Complete patient information access
- System analytics and reports
- User management functions
- All feedback and operational data

You can perform any available system function.`
    };

    return basePrompt + '\n\n' + (roleSpecificPrompts[user.role] || roleSpecificPrompts.patient);
  }

  getFunctionDefinitions(userRole) {
    const baseFunctions = [
      {
        name: 'submit_feedback',
        description: 'Submit feedback about care or system',
        parameters: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Feedback message' },
            category: { type: 'string', enum: ['care', 'system', 'staff', 'general'] },
            workerId: { type: 'string', description: 'ID of staff member if feedback is about specific staff' }
          },
          required: ['message', 'category']
        }
      }
    ];

    if (userRole === 'staff' || userRole === 'admin') {
      baseFunctions.push(
        {
          name: 'create_task',
          description: 'Create a new task for a patient',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Task title' },
              description: { type: 'string', description: 'Task description' },
              patientId: { type: 'string', description: 'Patient ID' },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
              dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD format)' }
            },
            required: ['title', 'description', 'patientId']
          }
        },
        {
          name: 'get_patient_info',
          description: 'Retrieve patient information',
          parameters: {
            type: 'object',
            properties: {
              patientId: { type: 'string', description: 'Patient ID' },
              patientName: { type: 'string', description: 'Patient name for search' }
            }
          }
        },
        {
          name: 'get_tasks',
          description: 'Retrieve tasks based on criteria',
          parameters: {
            type: 'object',
            properties: {
              patientId: { type: 'string', description: 'Patient ID to filter tasks' },
              status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
              assignedTo: { type: 'string', description: 'User ID of assigned staff' }
            }
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
          
        case 'create_task':
          return await this.handleCreateTask(connection, parsedArgs);
          
        case 'get_patient_info':
          return await this.handleGetPatientInfo(connection, parsedArgs);
          
        case 'get_tasks':
          return await this.handleGetTasks(connection, parsedArgs);
          
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
      const feedbackData = {
        message: args.message,
        category: args.category || 'general',
        userId: connection.user._id,
        userName: connection.user.name,
        userRole: connection.user.role,
        companyName: connection.user.companyName,
        createdAt: new Date()
      };

      if (args.workerId) {
        feedbackData.workerId = args.workerId;
      }

      const feedback = new Feedback(feedbackData);
      await feedback.save();

      return {
        actionPerformed: true,
        response: `Thank you! I've successfully submitted your ${args.category} feedback. Your input helps us improve our service.`
      };
    } catch (error) {
      console.error('Submit feedback error:', error);
      return {
        actionPerformed: false,
        response: "I'm sorry, I couldn't submit your feedback right now. Please try again later."
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

      const taskData = {
        title: args.title,
        description: args.description,
        patientId: args.patientId,
        assignedTo: connection.user._id,
        priority: args.priority || 'medium',
        status: 'pending',
        createdBy: connection.user._id,
        companyName: connection.user.companyName,
        createdAt: new Date()
      };

      if (args.dueDate) {
        taskData.dueDate = new Date(args.dueDate);
      }

      const task = new Task(taskData);
      await task.save();

      return {
        actionPerformed: true,
        response: `Perfect! I've created the task "${args.title}" for the patient. The task has been set to ${args.priority} priority and is now pending.`
      };
    } catch (error) {
      console.error('Create task error:', error);
      return {
        actionPerformed: false,
        response: "I couldn't create the task right now. Please make sure all the information is correct and try again."
      };
    }
  }

  async handleGetPatientInfo(connection, args) {
    try {
      // Verify user has permission
      if (connection.user.role === 'patient') {
        return {
          actionPerformed: false,
          response: "I'm sorry, I can't access patient information. Is there something else I can help you with?"
        };
      }

      let query = { companyName: connection.user.companyName };
      
      if (args.patientId) {
        query._id = args.patientId;
      } else if (args.patientName) {
        query.name = new RegExp(args.patientName, 'i');
      }

      const patients = await User.find({
        ...query,
        role: 'patient'
      }).select('name email phone createdAt').limit(5);

      if (patients.length === 0) {
        return {
          actionPerformed: true,
          response: "I couldn't find any patients matching that criteria. Could you please check the name or ID and try again?"
        };
      }

      const patientInfo = patients.map(p => 
        `${p.name} (${p.email}) - Joined ${p.createdAt.toLocaleDateString()}`
      ).join(', ');

      return {
        actionPerformed: true,
        response: `I found ${patients.length} patient${patients.length > 1 ? 's' : ''}: ${patientInfo}. What would you like to know about ${patients.length > 1 ? 'them' : 'this patient'}?`
      };
    } catch (error) {
      console.error('Get patient info error:', error);
      return {
        actionPerformed: false,
        response: "I had trouble retrieving patient information. Please try again."
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

      let query = { companyName: connection.user.companyName };
      
      if (args.patientId) {
        query.patientId = args.patientId;
      }
      if (args.status) {
        query.status = args.status;
      }
      if (args.assignedTo) {
        query.assignedTo = args.assignedTo;
      }

      const tasks = await Task.find(query)
        .populate('patientId', 'name')
        .populate('assignedTo', 'name')
        .limit(10)
        .sort({ createdAt: -1 });

      if (tasks.length === 0) {
        return {
          actionPerformed: true,
          response: "I didn't find any tasks matching those criteria. Would you like me to search with different parameters?"
        };
      }

      const taskSummary = tasks.map(task => 
        `"${task.title}" for ${task.patientId?.name || 'Unknown Patient'} - Status: ${task.status}, Priority: ${task.priority}`
      ).join('; ');

      return {
        actionPerformed: true,
        response: `I found ${tasks.length} task${tasks.length > 1 ? 's' : ''}: ${taskSummary}. Would you like me to provide more details about any specific task?`
      };
    } catch (error) {
      console.error('Get tasks error:', error);
      return {
        actionPerformed: false,
        response: "I had trouble retrieving the tasks. Please try again."
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
