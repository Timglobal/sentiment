import Agenda from 'agenda'
import nodemailer from 'nodemailer'
import Task from '../models/Task.js'
import User from '../models/User.js'
import mongoose from 'mongoose'

// Configure agenda for job scheduling
const mongoConnectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/timglobal'
const agenda = new Agenda({ db: { address: mongoConnectionString } })

// Load and verify environment variables
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@timglobal.uk'

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❗ Missing EMAIL_USER or EMAIL_PASS in environment — task reminder emails will NOT be sent.')
}

console.log('✅ Preparing task reminder email scheduler...')

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  logger: false,
  debug: false
})

// Verify transporter setup
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error.message)
  } else {
    console.log('✅ SMTP server is ready to send task reminder emails.')
  }
})

// Email templates for task notifications
const taskEmailTemplates = {
  due_date_reminder: {
    subject: '⏰ Task Due Date Reminder - TimGlobal Healthcare',
    text: (data) => {
      const dueDate = new Date(data.dueDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      return `
Dear ${data.userName},

This is a friendly reminder about your upcoming task that's due soon.

Task Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Task: ${data.title}
📝 Description: ${data.description}
🏷️ Category: ${data.category}
⚡ Priority: ${data.priority.toUpperCase()}
📅 Due Date: ${dueDate}
⏱️ Estimated Time: ${data.estimatedHours ? `${data.estimatedHours} hours` : 'Not specified'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please make sure to complete this task on time. If you need any assistance or have questions, please don't hesitate to contact your supervisor or the administration team.

Best regards,
TimGlobal Healthcare System

---
This is an automated reminder. Please do not reply to this email.
      `.trim()
    },
    html: (data) => {
      const dueDate = new Date(data.dueDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const priorityColor = {
        low: '#10B981',
        medium: '#F59E0B',
        high: '#EF4444',
        urgent: '#DC2626'
      }[data.priority] || '#6B7280'

      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Due Date Reminder</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .task-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${priorityColor}; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; background-color: ${priorityColor}; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 10px 10px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Task Due Date Reminder</h1>
            <p>TimGlobal Healthcare System</p>
        </div>
        <div class="content">
            <p>Dear <strong>${data.userName}</strong>,</p>
            <p>This is a friendly reminder about your upcoming task that's due soon.</p>
            
            <div class="task-details">
                <h3>📋 Task Details</h3>
                <p><strong>Task:</strong> ${data.title}</p>
                <p><strong>Description:</strong> ${data.description}</p>
                <p><strong>Category:</strong> ${data.category}</p>
                <p><strong>Priority:</strong> <span class="priority-badge">${data.priority.toUpperCase()}</span></p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                ${data.estimatedHours ? `<p><strong>Estimated Time:</strong> ${data.estimatedHours} hours</p>` : ''}
            </div>
            
            <p>Please make sure to complete this task on time. If you need any assistance or have questions, please don't hesitate to contact your supervisor or the administration team.</p>
            
            <p>Best regards,<br><strong>TimGlobal Healthcare System</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
      `
    }
  },
  
  overdue_notification: {
    subject: '🚨 Task Overdue Notification - TimGlobal Healthcare',
    text: (data) => {
      const dueDate = new Date(data.dueDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const overdueDays = Math.ceil((new Date() - new Date(data.dueDate)) / (1000 * 60 * 60 * 24))
      
      return `
Dear ${data.userName},

URGENT: Your task is now overdue and requires immediate attention.

Task Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Task: ${data.title}
📝 Description: ${data.description}
🏷️ Category: ${data.category}
⚡ Priority: ${data.priority.toUpperCase()}
📅 Due Date: ${dueDate}
🚨 Overdue by: ${overdueDays} day(s)
⏱️ Estimated Time: ${data.estimatedHours ? `${data.estimatedHours} hours` : 'Not specified'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This task is now overdue. Please complete it as soon as possible or contact your supervisor if there are any issues preventing completion.

Best regards,
TimGlobal Healthcare System

---
This is an automated notification. Please do not reply to this email.
      `.trim()
    },
    html: (data) => {
      const dueDate = new Date(data.dueDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const overdueDays = Math.ceil((new Date() - new Date(data.dueDate)) / (1000 * 60 * 60 * 24))
      
      const priorityColor = {
        low: '#10B981',
        medium: '#F59E0B',
        high: '#EF4444',
        urgent: '#DC2626'
      }[data.priority] || '#6B7280'

      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Overdue Notification</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .task-details { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; background-color: ${priorityColor}; }
        .overdue-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; background-color: #dc2626; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 10px 10px; }
        .urgent { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Task Overdue Notification</h1>
            <p>TimGlobal Healthcare System</p>
        </div>
        <div class="content">
            <p>Dear <strong>${data.userName}</strong>,</p>
            <p class="urgent">URGENT: Your task is now overdue and requires immediate attention.</p>
            
            <div class="task-details">
                <h3>📋 Task Details</h3>
                <p><strong>Task:</strong> ${data.title}</p>
                <p><strong>Description:</strong> ${data.description}</p>
                <p><strong>Category:</strong> ${data.category}</p>
                <p><strong>Priority:</strong> <span class="priority-badge">${data.priority.toUpperCase()}</span></p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Overdue by:</strong> <span class="overdue-badge">${overdueDays} day(s)</span></p>
                ${data.estimatedHours ? `<p><strong>Estimated Time:</strong> ${data.estimatedHours} hours</p>` : ''}
            </div>
            
            <p class="urgent">This task is now overdue. Please complete it as soon as possible or contact your supervisor if there are any issues preventing completion.</p>
            
            <p>Best regards,<br><strong>TimGlobal Healthcare System</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
      `
    }
  }
}

// Function to send email notification
async function sendTaskEmail(type, taskData, userData) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('❗ Email credentials not configured, skipping email send')
    return { success: false, message: 'Email not configured' }
  }

  try {
    const template = taskEmailTemplates[type]
    if (!template) {
      throw new Error(`Unknown email template type: ${type}`)
    }

    const emailData = {
      ...taskData,
      userName: userData.name || userData.email
    }

    const mailOptions = {
      from: `"TimGlobal Healthcare" <${FROM_EMAIL}>`,
      to: userData.email,
      subject: template.subject,
      text: template.text(emailData),
      html: template.html(emailData)
    }

    const info = await emailTransporter.sendMail(mailOptions)
    console.log(`✅ ${type} email sent to ${userData.email} for task: ${taskData.title}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`❌ Failed to send ${type} email:`, error.message)
    return { success: false, message: error.message }
  }
}

// Define agenda jobs
agenda.define('send task due date reminder', async (job) => {
  const { taskId } = job.attrs.data
  
  try {
    const task = await Task.findById(taskId).populate('userId', 'name email')
    if (!task || !task.userId) {
      console.log(`Task ${taskId} not found or user not found`)
      return
    }

    // Check if reminder already sent
    if (task.emailNotifications?.dueDateReminder?.sent) {
      console.log(`Due date reminder already sent for task ${taskId}`)
      return
    }

    // Send email
    const result = await sendTaskEmail('due_date_reminder', task, task.userId)
    
    if (result.success) {
      // Mark reminder as sent
      await Task.findByIdAndUpdate(taskId, {
        'emailNotifications.dueDateReminder.sent': true,
        'emailNotifications.dueDateReminder.sentAt': new Date()
      })
    }
  } catch (error) {
    console.error('Error sending due date reminder:', error)
  }
})

agenda.define('send overdue notification', async (job) => {
  const { taskId } = job.attrs.data
  
  try {
    const task = await Task.findById(taskId).populate('userId', 'name email')
    if (!task || !task.userId) {
      console.log(`Task ${taskId} not found or user not found`)
      return
    }

    // Check if task is actually overdue
    if (new Date(task.dueDate) > new Date() || task.status === 'completed') {
      console.log(`Task ${taskId} is not overdue or already completed`)
      return
    }

    // Check if notification already sent
    if (task.emailNotifications?.overdueNotification?.sent) {
      console.log(`Overdue notification already sent for task ${taskId}`)
      return
    }

    // Send email
    const result = await sendTaskEmail('overdue_notification', task, task.userId)
    
    if (result.success) {
      // Mark notification as sent and update task status
      await Task.findByIdAndUpdate(taskId, {
        'emailNotifications.overdueNotification.sent': true,
        'emailNotifications.overdueNotification.sentAt': new Date(),
        status: 'overdue'
      })
    }
  } catch (error) {
    console.error('Error sending overdue notification:', error)
  }
})

// Job to update overdue tasks (runs every hour)
agenda.define('update overdue tasks', async () => {
  try {
    console.log('🔍 Checking for overdue tasks...')
    
    const now = new Date()
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'overdue'] },
      isArchived: false
    })

    if (overdueTasks.length > 0) {
      const result = await Task.updateMany(
        {
          dueDate: { $lt: now },
          status: { $nin: ['completed', 'overdue'] },
          isArchived: false
        },
        { status: 'overdue' }
      )

      console.log(`✅ Updated ${result.modifiedCount} tasks to overdue status`)

      // Schedule overdue notifications for tasks that haven't been notified yet
      for (const task of overdueTasks) {
        if (!task.emailNotifications?.overdueNotification?.sent && 
            task.emailNotifications?.enabled !== false) {
          await agenda.schedule('in 5 minutes', 'send overdue notification', { taskId: task._id })
        }
      }
    } else {
      console.log('✅ No overdue tasks found')
    }
  } catch (error) {
    console.error('Error updating overdue tasks:', error)
  }
})

// Function to schedule reminders for a task
export async function scheduleTaskReminders(taskId) {
  try {
    const task = await Task.findById(taskId)
    if (!task) {
      console.error(`Task ${taskId} not found when scheduling reminders`)
      return
    }

    const dueDate = new Date(task.dueDate)
    const now = new Date()

    // Skip if task is already overdue or completed
    if (dueDate <= now || task.status === 'completed') {
      return
    }

    // Schedule due date reminder
    if (task.emailNotifications?.enabled !== false && 
        task.emailNotifications?.dueDateReminder?.enabled !== false) {
      
      const reminderHours = task.emailNotifications?.dueDateReminder?.hoursBefore || 24
      const reminderTime = new Date(dueDate.getTime() - (reminderHours * 60 * 60 * 1000))
      
      if (reminderTime > now) {
        const job = await agenda.schedule(reminderTime, 'send task due date reminder', { taskId: task._id })
        
        // Save job reference to task
        await Task.findByIdAndUpdate(taskId, {
          $push: {
            scheduledReminders: {
              type: 'due_date_reminder',
              scheduledFor: reminderTime,
              jobId: job.attrs._id.toString()
            }
          }
        })
        
        console.log(`📅 Due date reminder scheduled for task ${taskId} at ${reminderTime}`)
      }
    }

    // Schedule overdue notification (1 hour after due date)
    if (task.emailNotifications?.enabled !== false && 
        task.emailNotifications?.overdueNotification?.enabled !== false) {
      
      const overdueTime = new Date(dueDate.getTime() + (60 * 60 * 1000)) // 1 hour after due date
      
      if (overdueTime > now) {
        const job = await agenda.schedule(overdueTime, 'send overdue notification', { taskId: task._id })
        
        // Save job reference to task
        await Task.findByIdAndUpdate(taskId, {
          $push: {
            scheduledReminders: {
              type: 'overdue_notification',
              scheduledFor: overdueTime,
              jobId: job.attrs._id.toString()
            }
          }
        })
        
        console.log(`⏰ Overdue notification scheduled for task ${taskId} at ${overdueTime}`)
      }
    }
  } catch (error) {
    console.error('Error scheduling task reminders:', error)
  }
}

// Function to cancel scheduled reminders for a task
export async function cancelTaskReminders(taskId) {
  try {
    const task = await Task.findById(taskId)
    if (!task || !task.scheduledReminders) {
      return
    }

    // Cancel all scheduled jobs for this task
    for (const reminder of task.scheduledReminders) {
      try {
        await agenda.cancel({ _id: new mongoose.Types.ObjectId(reminder.jobId) })
        console.log(`✅ Cancelled ${reminder.type} for task ${taskId}`)
      } catch (error) {
        console.log(`⚠️ Could not cancel job ${reminder.jobId}:`, error.message)
      }
    }

    // Clear scheduled reminders from task
    await Task.findByIdAndUpdate(taskId, {
      $unset: { scheduledReminders: 1 }
    })
  } catch (error) {
    console.error('Error cancelling task reminders:', error)
  }
}

// Start the agenda scheduler
export async function startTaskScheduler() {
  try {
    await agenda.start()
    console.log('📋 Task scheduler started successfully')

    // Schedule recurring job to check for overdue tasks every hour
    await agenda.every('1 hour', 'update overdue tasks')
    console.log('⏰ Overdue tasks check scheduled to run every hour')
    
    return agenda
  } catch (error) {
    console.error('❌ Failed to start task scheduler:', error)
    throw error
  }
}

// Stop the agenda scheduler
export async function stopTaskScheduler() {
  try {
    await agenda.stop()
    console.log('📋 Task scheduler stopped')
  } catch (error) {
    console.error('❌ Error stopping task scheduler:', error)
  }
}

export { agenda }
