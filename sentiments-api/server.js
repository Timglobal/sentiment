import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Routes (we'll create them shortly)
import authRoutes from './routes/auth.routes.js'
import contactRoutes from './routes/contact.routes.js'

app.use('/api/auth', authRoutes)
app.use('/api/contact', contactRoutes)

const PORT = process.env.PORT || 8000

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch(err => console.error('❌ DB Connection Error:', err))
