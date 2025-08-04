import Agenda from 'agenda'
import mongoose from 'mongoose'
import Moment from '../models/Moment.js'
import { getSentimentScore } from './getSentiment.js'
import { getTranscript } from './videoToText.js'
import { analyzeImageText } from './imageToText.js'
import { analyzeVideoFrames, checkFFmpegAvailable } from './videoToImage.js'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Agenda with MongoDB connection
const agenda = new Agenda({
  db: { address: process.env.MONGO_URI || 'mongodb://localhost:27017/sentiments' }
})

// Define job to process media sentiment analysis
agenda.define('process media sentiment', async (job) => {
  const { momentId, mediaPath, mediaType } = job.attrs.data
  
  try {
    console.log(`🔄 Processing sentiment for moment ${momentId}...`)
    
    let textContent = ''
    
    if (mediaType === 'video') {
      // First try to extract audio transcript using Whisper API
      textContent = await getTranscript(mediaPath)
      console.log(`📝 Video transcript: ${textContent?.substring(0, 100)}...`)
      
      // If no audio content found, try analyzing video frames
      if (!textContent || textContent.trim().length === 0) {
        console.log(`🎬 No audio found in video, analyzing frames...`)
        
        // Check if ffmpeg is available for frame extraction
        const ffmpegAvailable = await checkFFmpegAvailable()
        if (ffmpegAvailable) {
          textContent = await analyzeVideoFrames(mediaPath)
          console.log(`🎬 Video frame analysis: ${textContent?.substring(0, 100)}...`)
        } else {
          console.warn(`⚠️ FFmpeg not available, cannot analyze video frames`)
        }
      }
    } else if (mediaType === 'image') {
      // Extract text from image using OCR/Vision API
      textContent = await analyzeImageText(mediaPath)
      console.log(`🖼️ Image text: ${textContent?.substring(0, 100)}...`)
    }
    
    if (!textContent || textContent.trim().length === 0) {
      console.log(`⚠️ No text content found for moment ${momentId}`)
      // Still save the moment without sentiment analysis
      await Moment.findByIdAndUpdate(momentId, {
        extractedText: 'No content could be extracted from this media',
        sentimentScore: null
      })
      return
    }
    
    // Get sentiment score from extracted text
    const sentimentScore = await getSentimentScore(textContent)
    
    if (sentimentScore !== null && sentimentScore >= 0) {
      // Update the moment with sentiment score and extracted text
      await Moment.findByIdAndUpdate(momentId, {
        sentimentScore,
        extractedText: textContent.substring(0, 500) // Store first 500 chars
      })
      
      console.log(`✅ Sentiment analysis completed for moment ${momentId}: ${sentimentScore}%`)
    } else {
      console.log(`❌ Sentiment analysis failed for moment ${momentId}`)
    }
    
  } catch (error) {
    console.error(`❌ Error processing sentiment for moment ${momentId}:`, error)
    throw error
  }
})

// Define cleanup job for old processed files
agenda.define('cleanup processed files', async (job) => {
  const { filePath } = job.attrs.data
  
  try {
    if (fs.existsSync(filePath)) {
      // Keep files for 24 hours after processing
      const stats = fs.statSync(filePath)
      const now = new Date()
      const fileAge = now - stats.mtime
      const hoursSinceModified = fileAge / (1000 * 60 * 60)
      
      if (hoursSinceModified > 24) {
        fs.unlinkSync(filePath)
        console.log(`🗑️ Cleaned up processed file: ${filePath}`)
      }
    }
  } catch (error) {
    console.error(`❌ Error cleaning up file ${filePath}:`, error)
  }
})

// Start the agenda
async function startAgenda() {
  await agenda.start()
  console.log('📋 Agenda job scheduler started')
  
  // Schedule cleanup job to run every hour
  await agenda.every('1 hour', 'cleanup processed files')
}

// Graceful shutdown
async function stopAgenda() {
  await agenda.stop()
  console.log('📋 Agenda job scheduler stopped')
}

// Helper function to queue sentiment analysis job
export async function queueSentimentAnalysis(momentId, mediaPath, mediaType) {
  try {
    await agenda.now('process media sentiment', {
      momentId,
      mediaPath,
      mediaType
    })
    console.log(`📋 Queued sentiment analysis for moment ${momentId}`)
  } catch (error) {
    console.error('❌ Error queuing sentiment analysis job:', error)
    throw error
  }
}

// Helper function to queue file cleanup
export async function queueFileCleanup(filePath, delayHours = 24) {
  try {
    await agenda.schedule(`in ${delayHours} hours`, 'cleanup processed files', {
      filePath
    })
    console.log(`📋 Queued file cleanup for ${filePath} in ${delayHours} hours`)
  } catch (error) {
    console.error('❌ Error queuing file cleanup:', error)
  }
}

export { agenda, startAgenda, stopAgenda }
