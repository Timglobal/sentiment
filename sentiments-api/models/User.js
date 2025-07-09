import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  avatar: String,
  resetToken: String,
  resetTokenExpires: Date,
})

export default mongoose.model('User', userSchema)
