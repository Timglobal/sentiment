import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    unique: true // Ensure only one analysis per worker
  },
  sentimentScore: { type: Number, required: true }, // 0 - 100
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  lastAnalysis: { type: Date, default: Date.now },
  stats: {
    feedbackCount: { type: Number, default: 0 },
    momentCount: { type: Number, default: 0 },
    videoCount: { type: Number, default: 0 },
    keywordSummary: [String], // e.g. ['rude', 'excellent', 'late']
  }
}, { timestamps: true })

export default mongoose.model('Analysis', analysisSchema)
