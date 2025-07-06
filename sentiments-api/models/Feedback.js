import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true},
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  workerName: { type: String, required: true },
  source: String, // e.g., "patient", "colleague"
  message: String,
  timestamp: { type: Date, default: Date.now }
})

export default mongoose.model('Feedback', feedbackSchema)
