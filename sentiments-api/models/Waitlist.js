// models/Waitlist.js
import mongoose from 'mongoose'

const waitlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  company: { type: String },
  purpose: { type: String },
  feedback: { type: String },
  joinedAt: { type: Date, default: Date.now }
}, {timestamps: true})

export default mongoose.model('Waitlist', waitlistSchema)
