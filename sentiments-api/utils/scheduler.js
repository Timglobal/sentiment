// utils/scheduler.js
import Room from '../models/Room.js';
import TreatmentSchedule from '../models/TreatmentSchedule.js';
import User from '../models/User.js';
import { sendRoomNotification } from './email.js';
import Agenda from 'agenda';
import nodemailer from 'nodemailer';

// Configure agenda for job scheduling
const mongoConnectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/timglobal';
const agenda = new Agenda({ db: { address: mongoConnectionString } });

// Load and verify environment variables - Following email.js pattern
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FROM_EMAIL = 'admin@timglobal.uk';

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❗ Missing EMAIL_USER or EMAIL_PASS in environment — treatment reminder emails will NOT be sent.');
}

console.log('✅ Preparing treatment reminder email scheduler...');

// Configure email transporter - Following email.js configuration
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  logger: true,
  debug: true
});

// Verify transporter setup - Following email.js pattern
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error.message);
  } else {
    console.log('✅ SMTP server is ready to send treatment reminder emails.');
  }
});

// Email templates for treatment scheduling - Following email.js format patterns
const treatmentEmailTemplates = {
  patient_treatment_reminder: {
    subject: '🏥 Treatment Appointment Reminder - TimGlobal Healthcare',
    text: (data) => {
      const appointmentDate = new Date(data.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
Dear ${data.patientName},

This is a friendly reminder about your upcoming treatment appointment.

Your Appointment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 Treatment Type: ${data.treatmentType}
📅 Date & Time: ${appointmentDate}
👩‍⚕️ Healthcare Provider: ${data.workerName || 'Your assigned healthcare provider'}${data.location?.room ? `
📍 Location: ${data.location.room}${data.location.floor ? `, Floor ${data.location.floor}` : ''}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT REMINDERS:
• Please arrive 15 minutes before your appointment time
• Bring any required medical documents or insurance information
• If you need to reschedule or cancel, please contact us as soon as possible
• Contact your healthcare provider if you have any questions

We look forward to providing you with excellent care.

Best regards,
${data.companyName || 'Your Healthcare Team'}
TimGlobal Healthcare Platform

This is an automated reminder. Please do not reply to this email.
      `.trim();
    },
    html: (data) => {
      const appointmentDate = new Date(data.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Treatment Appointment Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-details { background: #f0fdf4; border: 1px solid #059669; color: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
            .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 Treatment Appointment Reminder</h1>
            <p>TimGlobal Healthcare Platform</p>
          </div>
          
          <div class="content">
            <h2>Dear ${data.patientName},</h2>
            
            <p>This is a friendly reminder about your upcoming treatment appointment.</p>
            
            <div class="appointment-details">
              <h3>📋 Your Appointment Details</h3>
              <p><strong>🏥 Treatment Type:</strong> ${data.treatmentType}</p>
              <p><strong>📅 Date & Time:</strong> ${appointmentDate}</p>
              <p><strong>👩‍⚕️ Healthcare Provider:</strong> ${data.workerName || 'Your assigned healthcare provider'}</p>
              ${data.location?.room ? `<p><strong>📍 Location:</strong> ${data.location.room}${data.location.floor ? `, Floor ${data.location.floor}` : ''}</p>` : ''}
            </div>
            
            <div class="reminder-box">
              <strong>⚠️ Important Reminders:</strong>
              <ul>
                <li>Please arrive 15 minutes before your appointment time</li>
                <li>Bring any required medical documents or insurance information</li>
                <li>If you need to reschedule or cancel, please contact us as soon as possible</li>
                <li>Contact your healthcare provider if you have any questions</li>
              </ul>
            </div>
            
            <p>We look forward to providing you with excellent care.</p>
            
            <p>Best regards,<br>
            <strong>${data.companyName || 'Your Healthcare Team'}</strong><br>
            TimGlobal Healthcare Platform</p>
          </div>
          
          <div class="footer">
            <p>© 2025 TimGlobal Healthcare Platform. All rights reserved.</p>
            <p>This is an automated reminder, please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `;
    }
  },
  staff_treatment_reminder: {
    subject: '👩‍⚕️ Treatment Appointment - Staff Reminder',
    text: (data) => {
      const appointmentDate = new Date(data.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
Dear ${data.workerName},

This is a reminder about the upcoming treatment appointment you're scheduled to conduct.

Appointment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Patient: ${data.patientName}
🏥 Treatment Type: ${data.treatmentType}
📅 Date & Time: ${appointmentDate}${data.location?.room ? `
📍 Location: ${data.location.room}${data.location.floor ? `, Floor ${data.location.floor}` : ''}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAFF PREPARATION CHECKLIST:
• Review the patient's medical history and current treatment plan
• Ensure all necessary equipment and materials are ready
• Prepare the treatment room according to protocol
• Verify patient identity upon arrival
• Document the treatment session thoroughly

If you have any questions about this appointment or need to make changes, please contact the scheduling team immediately.

Best regards,
${data.companyName || 'Healthcare Management Team'}
TimGlobal Healthcare Platform

This is an automated reminder. Please do not reply to this email.
      `.trim();
    },
    html: (data) => {
      const appointmentDate = new Date(data.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Staff Treatment Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-details { background: #eff6ff; border: 1px solid #3b82f6; color: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .checklist-box { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>👩‍⚕️ Treatment Appointment - Staff Reminder</h1>
            <p>TimGlobal Healthcare Platform</p>
          </div>
          
          <div class="content">
            <h2>Dear ${data.workerName},</h2>
            
            <p>This is a reminder about the upcoming treatment appointment you're scheduled to conduct.</p>
            
            <div class="appointment-details">
              <h3>📋 Appointment Details</h3>
              <p><strong>👤 Patient:</strong> ${data.patientName}</p>
              <p><strong>🏥 Treatment Type:</strong> ${data.treatmentType}</p>
              <p><strong>📅 Date & Time:</strong> ${appointmentDate}</p>
              ${data.location?.room ? `<p><strong>📍 Location:</strong> ${data.location.room}${data.location.floor ? `, Floor ${data.location.floor}` : ''}</p>` : ''}
            </div>
            
            <div class="checklist-box">
              <strong>✅ Staff Preparation Checklist:</strong>
              <ul>
                <li>Review the patient's medical history and current treatment plan</li>
                <li>Ensure all necessary equipment and materials are ready</li>
                <li>Prepare the treatment room according to protocol</li>
                <li>Verify patient identity upon arrival</li>
                <li>Document the treatment session thoroughly</li>
              </ul>
            </div>
            
            <p>If you have any questions about this appointment or need to make changes, please contact the scheduling team immediately.</p>
            
            <p>Best regards,<br>
            <strong>${data.companyName || 'Healthcare Management Team'}</strong><br>
            TimGlobal Healthcare Platform</p>
          </div>
          
          <div class="footer">
            <p>© 2025 TimGlobal Healthcare Platform. All rights reserved.</p>
            <p>This is an automated reminder, please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `;
    }
  }
};

// Define treatment reminder jobs
agenda.define('send treatment reminder email', async (job) => {
  const { 
    type, 
    scheduleId, 
    recipientId, 
    data 
  } = job.attrs.data;

  // Check credentials - Following email.js pattern
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❗ Cannot send treatment reminder email — missing credentials.');
    return;
  }

  console.log(`🏥 Sending treatment reminder (${type}) for schedule:`, scheduleId);

  try {
    // Get recipient details
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.error(`❌ Recipient not found: ${recipientId}`);
      return;
    }

    // Get schedule details to check if still valid
    const schedule = await TreatmentSchedule.findById(scheduleId);
    if (!schedule || schedule.status === 'cancelled') {
      console.log(`Schedule cancelled or not found: ${scheduleId}`);
      return;
    }

    // Get email template
    const template = treatmentEmailTemplates[type];
    if (!template) {
      console.error(`❌ Email template not found: ${type}`);
      return;
    }

    console.log(`📧 Sending ${type} email to:`, recipient.email);

    // Send email - Following email.js format patterns
    const mailOptions = {
      from: `"TimGlobal Healthcare Platform" <${process.env.SMTP_FROM || process.env.EMAIL_USER}>`,
      to: recipient.email,
      subject: template.subject,
      text: template.text ? template.text(data) : undefined,
      html: template.html(data)
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Treatment email sent successfully: ${type} -`, info.response);

    // Update reminder status in database
    if (type === 'patient_treatment_reminder') {
      await TreatmentSchedule.findByIdAndUpdate(scheduleId, {
        'reminders.patient.email.sent': true,
        'reminders.patient.email.sentAt': new Date()
      });
      console.log(`📋 Updated patient reminder status for schedule: ${scheduleId}`);
    } else if (type === 'staff_treatment_reminder') {
      await TreatmentSchedule.findByIdAndUpdate(scheduleId, {
        'reminders.staff.email.sent': true,
        'reminders.staff.email.sentAt': new Date()
      });
      console.log(`👩‍⚕️ Updated staff reminder status for schedule: ${scheduleId}`);
    }
  } catch (error) {
    console.error(`❌ Failed to send treatment reminder email (${type}):`, error.message);
    throw error; // Re-throw to handle in calling function if needed
  }
});

// Helper functions for treatment scheduling
export const scheduleEmailReminder = async (options) => {
  const { type, scheduleId, recipientId, scheduledFor, data } = options;
  
  try {
    await agenda.schedule(scheduledFor, 'send treatment reminder email', {
      type,
      scheduleId,
      recipientId,
      data
    });
    
    console.log(`Email reminder scheduled: ${type} for ${scheduledFor}`);
  } catch (error) {
    console.error('Failed to schedule email reminder:', error);
    throw error;
  }
};

export const cancelScheduledEmail = async (type, scheduleId) => {
  try {
    await agenda.cancel({
      'name': 'send treatment reminder email',
      'data.type': type,
      'data.scheduleId': scheduleId
    });
    
    console.log(`Cancelled scheduled email: ${type} for schedule ${scheduleId}`);
  } catch (error) {
    console.error('Failed to cancel scheduled email:', error);
  }
};

export const startTreatmentScheduler = async () => {
  try {
    await agenda.start();
    console.log('Treatment scheduler started successfully');
  } catch (error) {
    console.error('Failed to start treatment scheduler:', error);
  }
};

// This runs every 10 seconds and checks room durations
export const startRoomMonitor = () => {
  setInterval(async () => {
    const now = new Date();

    try {
      const rooms = await Room.find({ status: 'occupied', notifySent: false });

      for (const room of rooms) {
        if (!room.startTime || !room.endTime) continue

        const now = new Date();
        const start = new Date(room.startTime)
        const end = new Date(room.endTime)
        const totalTime = end - start
        const timeLeft = end - now
        const percentLeft = (timeLeft / totalTime) * 100

        if (timeLeft <= 0) {
          room.status = 'available'
          room.occupant = null
          room.startTime = null
          room.endTime = null
          room.notifySent = false
          await room.save()
          console.log(`✅ Room ${room.roomNumber} is now available.`)
          continue
        }

        if (percentLeft <= 20 && !room.notifySent) {
          const email = room.occupant?.email

          if (email) {
            let message = ''
            if (room.roomType === 'healthcare') {
              message = `Your healthcare room ${room.roomNumber} will soon become available.`
            } else {
              const baseURL = 'https://sentiment-tg-globaluk.onrender.com';

                message = `
                Hello,

                Your stay in Room ${room.roomNumber} is almost over. Do you want to extend it?

                👉 Yes: ${baseURL}/extend/${room._id}?decision=yes
                ❌ No: ${baseURL}/extend/${room._id}?decision=no

                Thanks,
                Sentiment Health
                `
            }

            await sendRoomNotification(email, 'Room Duration Alert', message)
          }

          room.notifySent = true
          await room.save()
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error.message);
    }
  }, 10000); // every 10 seconds
}
