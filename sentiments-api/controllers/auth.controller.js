import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import Company from '../models/Company.js'
import { sendCompanyRegistrationEmail, sendPasswordResetEmail } from '../utils/email.js'

export const loginUser = async (req, res) => {
  const { email, password, companyId,acceptedTermsAndConditionAndPrivacyAndPolicy } = req.body

  try {
    const user = await User.findOne({ email }).populate('company')
    // console.log({user})

    if (!user ) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    if (user.company && user.company.companyId.toString() !== companyId) {
      return res.status(401).json({ message: 'Invalid credentials for this company' })
    }

    if(!acceptedTermsAndConditionAndPrivacyAndPolicy){
      return res.status(401).json({ message: 'You must accept the terms and conditions and privacy policy' })
    }

    if(!user.acceptedTermsAndConditionAndPrivacyAndPolicy){
      //update usee to accept terms and condions and privacy and policy
      await User.updateOne({ _id: user._id }, { acceptedTermsAndConditionAndPrivacyAndPolicy: true })
    }


    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2d' })

    res.json({ token, user: { id: user._id, email: user.email, name: user.name , role: user.role}, })
  } catch (err) {
    res.status(500).json({ message: 'Server error: '+ err.message })
  }
}

export const registerUser = async (req, res) => {
  try {
    console.log("recieved error")
    const { name, email, password, role } = req.body
    let companyId;
    let company;

    const acceptedTermsAndConditionAndPrivacyAndPolicy = (req.body.hasOwnProperty("acceptedTermsAndConditionAndPrivacyAndPolicy") && req.body.acceptedTermsAndConditionAndPrivacyAndPolicy === "true")?true:false;
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'User already exists' })
    }
    if(role === 'admin'){
      let companyName = req.body.companyName;
      let companyAddress = req.body.companyAddress;
      const newCompany = new Company({
        companyName: companyName,
        companyAddress: companyAddress
      })
      let companyDetail = await newCompany.save();
      company = companyDetail._id;
      
      // Send email with company ID to the administrator
      try {
        await sendCompanyRegistrationEmail(email, companyName, companyDetail.companyId);
        console.log('✅ Company registration email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send company registration email:', emailError.message);
        // Don't fail the registration if email fails
      }
    }else if(role === 'staff' || role === 'patient'){
      companyId = req.body.companyId;
      const getCompany = await Company.findOne({companyId: companyId}).select('_id');
      if(!getCompany){
        return res.status(404).json({ message: 'Company not found' })
      }
      company = getCompany._id;
    }

    
  const avatar = req.file ? `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}` : ''

  
   

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ name, email, password: hashedPassword, role, avatar,company,acceptedTermsAndConditionAndPrivacyAndPolicy })
    await newUser.save()

    res.status(201).json({ message: 'User created' })
    } catch (err) {
    res.status(500).json({ message: 'Error registering user'+err?.message })
  }
}


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password') // exclude passwords
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' })
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address' })
    }

    // Generate secure reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = Date.now() + 1000 * 60 * 15 // 15 minutes

    user.resetToken = token
    user.resetTokenExpires = expiry
    await user.save()

    // Create reset link (use environment variable for frontend URL in production)
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetLink = `${frontendURL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    
    console.log('🔐 Password reset link generated:', resetLink)

    // Send email with reset link
    const emailSent = await sendPasswordResetEmail(email, resetLink, user.name)
    
    if (emailSent) {
      res.json({ 
        message: 'Password reset instructions have been sent to your email address',
        success: true
      })
    } else {
      res.status(500).json({ 
        message: 'Failed to send reset email. Please try again later.',
        success: false
      })
    }
  } catch (err) {
    console.error('❌ Forgot password error:', err)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
}

export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body

  try {
    // Validate input
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset request' })
    }

    if (!user.resetToken || user.resetToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    if (user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'Reset token has expired. Please request a new password reset.' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword

    // Clear reset token fields
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    await user.save()

    console.log('✅ Password reset successful for user:', email)

    res.json({ 
      message: 'Password has been reset successfully. You can now login with your new password.',
      success: true
    })
  } catch (err) {
    console.error('❌ Reset password error:', err)
    res.status(500).json({ message: 'Failed to reset password. Please try again.' })
  }
}