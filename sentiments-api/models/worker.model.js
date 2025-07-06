import mongoose from 'mongoose'

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }, // doctor, nurse, cleaner, etc.
  position: { type: String },
  strengths: { type: String },
  weaknesses: { type: String },
}, { timestamps: true })

export default mongoose.model('Worker', workerSchema)
