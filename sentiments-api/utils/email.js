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
