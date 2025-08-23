import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import dotenv from 'dotenv'
import http from 'http'


dotenv.config({ path: path.resolve('./.env') })

console.log('🌍 ENV EMAIL_USER:', process.env.EMAIL_USER);
console.log('🌍 ENV EMAIL_PASS:', process.env.EMAIL_PASS);

const app = express()
const server = http.createServer(app)

app.use(cors({
  origin: ["http://localhost:3001"],   // allow your frontend dev server
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())

import authRoutes from './routes/auth.routes.js'
import contactRoutes from './routes/contact.routes.js'
import careerRoutes from './routes/careers.routes.js'
import feedbackRoutes from './routes/feedback.routes.js'
import workerRoutes from './routes/worker.routes.js'
import momentRoutes from './routes/moment.routes.js'
import roomRoutes from './routes/room.routes.js'
import tenantRoutes from './routes/tenants.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import assignmentRoutes from './routes/assignment.routes.js'
import treatmentScheduleRoutes from './routes/treatmentSchedule.routes.js'
import patientRecordRoutes from './routes/patientRecord.routes.js'
import { startRoomMonitor } from './utils/scheduler.js'
import { startAgenda, stopAgenda } from './utils/jobScheduler.js'
import { startTaskScheduler, stopTaskScheduler } from './utils/taskScheduler.js'
import waitlistRoutes from './routes/waitlist.routes.js'
import taskRoutes from './routes/task.routes.js'
import aiAssistantRoutes from './routes/ai-assistant.routes.js'

// Import AI Voice Stream Handler
import AIVoiceStreamHandler from './services/aiVoiceStreamHandler.js'

app.use('/api/auth', authRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/workers', workerRoutes)
app.use('/api/moments', momentRoutes)
app.use('/api/careers', careerRoutes)

// Serve static files from uploads directory
const uploadsPath = path.join(process.cwd(), 'uploads')
console.log('📁 Uploads path:', uploadsPath)
app.use('/uploads', express.static(uploadsPath))

app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/treatment-schedule', treatmentScheduleRoutes)
app.use('/api/patients', patientRecordRoutes)
app.use('/api/waitlist', waitlistRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/ai-assistant', aiAssistantRoutes)

app.get("/",(req, res) => {
  res.json({ message: "Welcome to Sentiment API" })
})
app.use((req, res, next) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});


const PORT = process.env.PORT || 8000


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ MongoDB connected')
    
    // Start Agenda job scheduler
    await startAgenda()
    
    // Start task scheduler for email notifications
    await startTaskScheduler()
    
    // Initialize AI Voice Stream Handler
    const aiVoiceHandler = new AIVoiceStreamHandler(server)
    console.log('🎙️ AI Voice Stream Handler initialized')
    // aiVoiceHandler.wss.
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🎙️ WebSocket endpoint: ws://localhost:${PORT}/ai-voice-stream`)
    })
    startRoomMonitor();
  })
  .catch(err => console.error('❌ DB Connection Error:', err))

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...')
  await stopAgenda()
  await stopTaskScheduler()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...')
  await stopAgenda()
  await stopTaskScheduler()
  process.exit(0)
})

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Rejection:', err)
})
