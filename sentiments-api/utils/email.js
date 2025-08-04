import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// 🌐 Load and verify environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❗ Missing EMAIL_USER or EMAIL_PASS in environment — emails will NOT be sent.');
}

// 🚚 Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
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
    from: `"Sentiment App" <${EMAIL_USER}>`,
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
    from: `"Sentiment Healthcare Platform" <${EMAIL_USER}>`,
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
Sentiment Healthcare Platform
  `.trim();

  const mailOptions = {
    from: `"${companyName} via Sentiment Healthcare" <${EMAIL_USER}>`,
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
