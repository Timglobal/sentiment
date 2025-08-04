import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import Company from '../models/Company.js'
import { sendCompanyRegistrationEmail } from '../utils/email.js'

export const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user ) {
      return res.status(401).json({ message: 'Invalid credentials' })
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
    const { name, email, password, role } = req.body
    let companyId;
    let company;

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
    const newUser = new User({ name, email, password: hashedPassword, role, avatar,company })
    await newUser.save()

    res.status(201).json({ message: 'User created' })
    } catch (err) {
    res.status(500).json({ message: 'Error registering user' })
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
    if (!user) return res.status(404).json({ message: 'User not found' })

    const token = crypto.randomBytes(32).toString('hex')
    const expiry = Date.now() + 1000 * 60 * 15 // 15 minutes

    user.resetToken = token
    user.resetTokenExpires = expiry
    await user.save()

    const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${email}`
    console.log('Password reset link:', resetLink)

     res.json({ message: 'Password reset link generated. Check console.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body

  try {
    const user = await User.findOne({ email })

    if (
      !user ||
      user.resetToken !== token ||
      user.resetTokenExpires < Date.now()
      ) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    
     const hashedPassword = await bcrypt.hash(newPassword, 10)
     user.password = hashedPassword

    user.resetToken = undefined
    user.resetTokenExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password' })
  }
}