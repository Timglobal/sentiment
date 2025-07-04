import User from '../models/User.js'
import jwt from 'jsonwebtoken'

export const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' })

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body

  try {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const newUser = new User({ name, email, password, role })
    await newUser.save()

    res.status(201).json({ message: 'User created' })
    } catch (err) {
    res.status(500).json({ message: 'Error registering user' })
  }
}