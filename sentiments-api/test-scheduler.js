import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import Task from './models/Task.js'
import User from './models/User.js'
import { scheduleTaskReminders } from './utils/taskScheduler.js'

dotenv.config({ path: path.resolve('./.env') })

async function testTaskScheduler() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    })
    console.log('✅ Connected to MongoDB for testing')

    // Find a test user
    const testUser = await User.findOne().limit(1)
    if (!testUser) {
      console.log('❌ No users found for testing')
      return
    }

    console.log(`👤 Using test user: ${testUser.name} (${testUser.email})`)

    // Create a test task with due date 2 minutes from now
    const testDueDate = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes from now

    const testTask = new Task({
      title: '🧪 Test Task for Email Scheduler',
      description: 'This is a test task to verify the email automation system works correctly.',
      priority: 'high',
      category: 'Testing',
      dueDate: testDueDate,
      estimatedHours: 1,
      tags: ['test', 'automation', 'email'],
      userId: testUser._id,
      assignedTo: testUser._id,
      company: testUser.company,
      emailNotifications: {
        enabled: true,
        dueDateReminder: {
          enabled: true,
          hoursBefore: 0.03, // 1.8 minutes (for testing)
          sent: false
        },
        overdueNotification: {
          enabled: true,
          sent: false
        }
      }
    })

    const savedTask = await testTask.save()
    console.log(`📋 Created test task: ${savedTask.title}`)
    console.log(`⏰ Due date: ${savedTask.dueDate}`)

    // Schedule reminders
    await scheduleTaskReminders(savedTask._id)
    console.log('✅ Email reminders scheduled for test task')

    console.log('\n🔍 Test Summary:')
    console.log(`- Task ID: ${savedTask._id}`)
    console.log(`- Due date: ${savedTask.dueDate}`)
    console.log(`- Email reminder scheduled for: ${new Date(testDueDate.getTime() - (0.03 * 60 * 60 * 1000))}`)
    console.log(`- Overdue notification scheduled for: ${new Date(testDueDate.getTime() + (60 * 60 * 1000))}`)
    console.log(`- User email: ${testUser.email}`)
    
    console.log('\n📧 Check your email for notifications in the next few minutes!')
    console.log('💡 You can monitor the server logs to see when emails are sent.')

  } catch (error) {
    console.error('❌ Error during test:', error)
  } finally {
    // Don't close the connection - let the scheduler keep running
    console.log('🔄 Keeping connection open for scheduler to run...')
    console.log('Press Ctrl+C to stop the test')
  }
}

// Run the test
testTaskScheduler()
