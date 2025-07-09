import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

export const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2d' })

    res.json({ token, user: { id: user._id, email: user.email, name: user.name , role: user.role} })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body
    const avatar = req.file ? `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}` : ''

  try {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const newUser = new User({ name, email, password, role, avatar })
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