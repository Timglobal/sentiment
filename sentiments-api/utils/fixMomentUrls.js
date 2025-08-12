// Migration script to fix moment URLs
import mongoose from 'mongoose'
import Moment from '../models/Moment.js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') })

async function fixMomentUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    })
    console.log('✅ Connected to MongoDB')

    // Find all moments with incorrect URLs
    const moments = await Moment.find({
      mediaUrl: { $regex: /\/uploads\/[^\/]+\.(jpg|jpeg|png|gif|mp4|avi|mov)$/i }
    })

    console.log(`📊 Found ${moments.length} moments with incorrect URLs`)

    if (moments.length === 0) {
      console.log('✅ No moments need URL fixing')
      return
    }

    // Fix each moment URL
    for (const moment of moments) {
      const oldUrl = moment.mediaUrl
      
      // Extract the filename from the old URL
      const filename = oldUrl.split('/').pop()
      
      // Create the new correct URL
      const baseUrl = oldUrl.substring(0, oldUrl.lastIndexOf('/uploads/'))
      const newUrl = `${baseUrl}/uploads/moments/${filename}`
      
      // Update the moment
      await Moment.findByIdAndUpdate(moment._id, { mediaUrl: newUrl })
      
      console.log(`🔧 Fixed: ${oldUrl} → ${newUrl}`)
    }

    console.log(`✅ Successfully fixed ${moments.length} moment URLs`)

  } catch (error) {
    console.error('❌ Error fixing moment URLs:', error)
  } finally {
    // Close the connection
    await mongoose.connection.close()
    console.log('🔌 MongoDB connection closed')
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixMomentUrls()
}

export default fixMomentUrls
