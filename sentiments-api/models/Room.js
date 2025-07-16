// models/Room.js
import mongoose from 'mongoose';

const occupantSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  reason: String,
  illness: String,
  email: String,
});

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    enum: ['healthcare', 'landlord'],
    required: true,
  },

  imagePath: {
    type: String, // stores local path or cloud URL (if uploaded to S3 later)
    required: false,
  },

  price: Number,
  occupant: occupantSchema,

  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available',
  },

  startTime: Date,
  endTime: Date,

  notifySent: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
