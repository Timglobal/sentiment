import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  email: String,
  reason: String,
  illness: String,
  roomNumber: String,
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  assignedAt: { type: Date, default: Date.now },
  startTime: Date,
  endTime: Date,
});

export default mongoose.model('Tenant', tenantSchema);
