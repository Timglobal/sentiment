import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import path from 'path';
import fs from "fs";

// 🌐 Load and verify environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FROM_EMAIL = 'admin@timglobal.uk';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim()
const HR_EMAIL    = (process.env.HR_EMAIL    || '').trim()

console.log("ENV HR_EMAIL:", process.env.HR_EMAIL);
console.log("ENV ADMIN_EMAIL:", process.env.ADMIN_EMAIL);


if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❗ Missing EMAIL_USER or EMAIL_PASS in environment — emails will NOT be sent.');
}

if (!ADMIN_EMAIL) {
  console.error('❗ ADMIN_EMAIL is missing from .env — admin notifications will NOT be sent.')
}
if (!HR_EMAIL) {
  console.error('❗ HR_EMAIL is missing from .env — HR notifications will NOT be sent.')
}


// 🚚 Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: process.env.NODE_ENV === 'production' ? 465 : 587, // use 465 in prod, 587 locally
  secure: process.env.NODE_ENV === 'production', // true only in prod
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  pool: true,            
  maxConnections: 3,    
  maxMessages: 10,       
  logger: true,
  debug: true,
});


// ✅ Verify transporter setup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error.message);
  } else {
    console.log('✅ SMTP server is ready to send emails.');
  }
});

console.log('✅ Preparing to send email...');
export const sendRoomNotification = async (to, subject, message) => {
  console.log('💌 sendRoomNotification called with:', to, subject);
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❗ Cannot send email — missing credentials.');
    return;
  }

  const mailOptions = {
    from: `"Spotlight App" <${FROM_EMAIL}>`,
    to,
    subject,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.response);
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
};

export const sendContactNotification = async ({ name, email, company, whatsapp, message }) => {
  if (!EMAIL_USER || !EMAIL_PASS || !ADMIN_EMAIL) {
    console.error('❗ Cannot send email — missing credentials.');
    return;
  }

  const mailOptions = {
    from: `"Spotlight App" <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,  // 👈 who should receive it (set in .env)
    subject: `📩 New Contact Form Message from ${name}`,
    text: `
You received a new contact form submission:

Name: ${name}
Email: ${email}
Company: ${company}
WhatsApp: ${whatsapp}
Message: ${message}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Contact form email sent:', info.response);
  } catch (error) {
    console.error('❌ Contact form email error:', error.message);
  }
};

export const sendUserConfirmation = async ({ name, email, message }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❗ Cannot send email — missing credentials.');
    return;
  }

  const mailOptions = {
    from: `"Spotlight App" <${FROM_EMAIL}>`,
    to: email,  // 👈 send directly to the user
    subject: '✅ We received your message!',
    text: `
Hello ${name},

Thank you for reaching out to us! 🎉
We have received your message and will get back to you shortly.

Here’s a copy of your message:
"${message}"

Best regards,  
The Timglobal Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 User confirmation email sent:', info.response);
  } catch (error) {
    console.error('❌ User confirmation email error:', error.message);
  }
};

export const sendCareerNotification = async ({ name, email, whatsapp, role, level, coverletter, cv }) => {
  if (!EMAIL_USER || !EMAIL_PASS  || !HR_EMAIL) {
    console.error('❗ Cannot send email — missing credentials.');
    return;
  }

try {

  if (!fs.existsSync(cv)) {
      console.error("❌ CV file not found:", cv);
      return;
    }

  console.log("📎 Attaching CV file:", cv);

  const mailOptions = {
    from: `"Spotlight App" <${FROM_EMAIL}>`,
    to: HR_EMAIL, // 👈 HR email in .env
    cc: email,
    subject: `📩 New Career Application: ${role} (${level})`,
    text: `
You received a new career application:

Name: ${name}
Email: ${email}
WhatsApp: ${whatsapp}
Role: ${role}
Level: ${level}
Cover Letter: ${coverletter}
`,
  attachments: [
    {
      filename: path.basename(cv), // or .docx depending on upload
      path: cv, // 👈 actual file path saved by multer
    },
  ],
  };
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Career notification email sent:', info.response);
  } catch (error) {
    console.error('❌ Career notification email error:', error.message);
  }
};

export const sendCareerConfirmation = async ({ name, email, role, level }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❗ Cannot send email — missing credentials.');
    return;
  }

  const mailOptions = {
    from: `"Spotlight App" <${FROM_EMAIL}>`,
    to: email, // 👈 applicant’s email
    subject: '✅ We received your job application!',
    text: `
Hello ${name},

Thank you for applying for the position of "${role}" (${level}).

Our HR team has received your application and will review it soon, but send your details to ${HR_EMAIL} to be very sure of your application being reviewed.  
We will contact you if you are shortlisted.

Best regards,  
The Timglobal Careers Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Career confirmation email sent:', info.response);
  } catch (error) {
    console.error('❌ Career confirmation email error:', error.message);
  }
};


export const sendCompanyRegistrationEmail = async (to, companyName, companyId) => {
  console.log('🏢 sendCompanyRegistrationEmail called for:', to);
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❗ Cannot send email — missing credentials.');
    return;
  }

  const subject = 'Welcome! Your Company Registration is Complete';
  const message = `
Dear Administrator,

Congratulations! Your company "${companyName}" has been successfully registered on our healthcare platform.

Here are your company details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 Company Name: ${companyName}
🆔 Company ID: ${companyId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: Please save your Company ID (${companyId}) securely. 

Your staff members and patients will need this Company ID to join your organization during their registration process.

Next Steps:
• Share the Company ID with your team members
• Staff and patients can now register using this Company ID
• Access your admin dashboard to manage your organization

If you have any questions or need assistance, please don't hesitate to contact our support team.

Welcome to our healthcare platform!

Best regards,
The Sentiment Healthcare Team
  `.trim();

  const mailOptions = {
    from: `"Sentiment Healthcare Platform" <${FROM_EMAIL}>`,
    to,
    subject,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('🏢 Company registration email sent:', info.response);
  } catch (error) {
    console.error('❌ Company registration email error:', error.message);
  }
};

export const sendMemberWelcomeEmail = async (to, memberName, role, password, companyId, companyName, department = null) => {
  console.log(`👤 sendMemberWelcomeEmail called for ${role}:`, to);
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❗ Cannot send email — missing credentials.');
    return;
  }

  const roleTitle = role === 'staff' ? 'Staff Member' : 'Patient';
  const subject = `Welcome to ${companyName} - Your Account is Ready!`;
  
  // Role-specific content
  let roleSpecificContent = '';
  if (role === 'staff' && department) {
    roleSpecificContent = `
🏥 Department: ${department}
As a staff member, you'll have access to administrative features and can help manage patient care within your department.`;
  } else if (role === 'staff') {
    roleSpecificContent = `
As a staff member, you'll have access to administrative features and can help manage patient care.`;
  } else if (role === 'patient') {
    roleSpecificContent = `
As a patient, you'll have access to your personal health dashboard where you can track your care and communicate with your healthcare team.`;
  }

  const message = `
Dear ${memberName},

Welcome to ${companyName}! Your account has been successfully created on our healthcare platform.

Here are your account details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${memberName}
📧 Email: ${to}
🔐 Temporary Password: ${password}
🏢 Company: ${companyName}
🆔 Company ID: ${companyId}
👥 Role: ${roleTitle}${roleSpecificContent}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT SECURITY NOTICE:
• Please change your password after your first login
• Keep your login credentials secure and confidential
• Your Company ID is: ${companyId}

Next Steps:
1. Visit our platform login page
2. Use your email (${to}) and temporary password
3. Change your password to something secure
4. Complete your profile setup
5. Start using the platform features

Login Instructions:
• Go to the login page
• Enter your email: ${to}
• Enter your temporary password: ${password}
• Enter the Company ID: ${companyId}
• Click "Sign In"

If you have any questions or need assistance, please don't hesitate to contact our support team or your administrator.

Welcome aboard!

Best regards,
${companyName} Team
Timglobal Healthcare Platform
  `.trim();

  const mailOptions = {
    from: `"${companyName} via Timglobal Healthcare" <${FROM_EMAIL}>`,
    to,
    subject,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`👤 ${roleTitle} welcome email sent:`, info.response);
  } catch (error) {
    console.error(`❌ ${roleTitle} welcome email error:`, error.message);
  }
};

// 🔐 Send password reset email
export const sendPasswordResetEmail = async (to, resetLink, userName = 'User') => {
  console.log('🔐 sendPasswordResetEmail called for:', to);
  
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❗ Cannot send password reset email — missing credentials.');
    return;
  }

  const subject = '🔐 Reset Your Password - TimGlobal Sentiment App';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reset-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .reset-button:hover { background: #ff5252; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Password Reset Request</h1>
        <p>TimGlobal Healthcare Sentiment Platform</p>
      </div>
      
      <div class="content">
        <h2>Hello ${userName},</h2>
        
        <p>We received a request to reset your password for your TimGlobal Sentiment App account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" class="reset-button">Reset My Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #667eea;"><a href="${resetLink}">${resetLink}</a></p>
        
        <div class="warning">
          <strong>⚠️ Important Security Information:</strong>
          <ul>
            <li>This link will expire in 15 minutes for security</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Never share this link with anyone else</li>
            <li>Change your password to something strong and unique</li>
          </ul>
        </div>
        
        <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
        
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <p>Best regards,<br>
        <strong>TimGlobal Sentiment Team</strong></p>
      </div>
      
      <div class="footer">
        <p>© 2025 TimGlobal Healthcare Platform. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
🔐 Password Reset Request - TimGlobal Sentiment App

Hello ${userName},

We received a request to reset your password for your TimGlobal Sentiment App account.

Reset your password by clicking this link:
${resetLink}

⚠️ Important:
• This link expires in 15 minutes
• If you didn't request this reset, ignore this email
• Never share this link with anyone

If you're having trouble, copy and paste the link into your browser.

Best regards,
TimGlobal Sentiment Team

© 2025 TimGlobal Healthcare Platform
This is an automated message, please do not reply.
  `;

  const mailOptions = {
    from: `"TimGlobal Sentiment App" <${EMAIL_USER}>`,
    to,
    subject,
    text: textContent,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Password reset email error:', error.message);
    return false;
  }
};
