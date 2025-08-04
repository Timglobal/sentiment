import mongoose from 'mongoose'

const momentSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  extractedText: { type: String, required: false }, // Text extracted from media
  sentimentScore: { type: Number, required: false }, // 1 to 100
  mediaUrl: { type: String, required: true }, // ✅ NOT optional
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  submittedBy: { type: String, required: true }, // Admin name/email
  timestamp: { type: Date, default: Date.now }
})

export default mongoose.model('Moment', momentSchema)
