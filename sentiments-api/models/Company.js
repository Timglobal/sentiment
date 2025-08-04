import mongoose from 'mongoose'

const generateCompanyId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

const analysisSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    unique: true,
    default: generateCompanyId
  },
    companyName: {
        type: String,
        required: true,
    },
    companyAddress: {
        type: String,
        required: true,
    },


}, { timestamps: true })

export default mongoose.model('Companys', analysisSchema)
