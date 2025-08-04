import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department:String,
  note:String,
  avatar: String,
  resetToken: String,
  resetTokenExpires: Date,
  company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companys'
  }
})

export default mongoose.model('User', userSchema)
