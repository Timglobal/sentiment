import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})


export const sendRoomNotification = async (to, subject, message) => {
  const mailOptions = {
    from: `"Sentiment App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: message,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('📧 Email sent:', info.response)
  } catch (error) {
    console.error('❌ Email error:', error.message)
  }
}