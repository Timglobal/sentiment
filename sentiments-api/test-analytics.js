// Simple test to check analytics without auth
import User from './models/User.js'
import Moment from './models/Moment.js'
import Feedback from './models/Feedback.js'
import mongoose from 'mongoose'

async function testAnalytics() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sentiment', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('✅ Connected to MongoDB')
    
    // Check if we have any data
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } })
    const momentCount = await Moment.countDocuments({ sentimentScore: { $ne: null } })
    const feedbackCount = await Feedback.countDocuments({ sentimentScore: { $ne: null } })
    
    console.log('📊 Database stats:')
    console.log('- Workers:', userCount)
    console.log('- Moments with sentiment:', momentCount)
    console.log('- Feedbacks with sentiment:', feedbackCount)
    
    if (momentCount === 0 && feedbackCount === 0) {
      console.log('⚠️  No sentiment data found - this explains the analytics error!')
      console.log('💡 Consider running analysis generation to populate sentiment scores')
    }
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testAnalytics()
