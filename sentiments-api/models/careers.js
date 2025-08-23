import mongoose from "mongoose";

const careerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  whatsapp: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  coverletter:{
    type: String,
    required: true,
  },
  cv: {
    type: String, // file path or Cloudinary URL
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Career", careerSchema);
