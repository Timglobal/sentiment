import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type:String,
    required: true,
    unique:true
  },
  password: String,
  role: String,
  department:String,
  note:String,
  avatar: String,
  resetToken: String,
  resetTokenExpires: Date,
  acceptedTermsAndConditionAndPrivacyAndPolicy:{
    type: Boolean,
    default: false
  },
  company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companys'
  }
})

export default mongoose.model('User', userSchema)
