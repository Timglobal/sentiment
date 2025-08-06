import Moment from '../models/Moment.js'
import User from '../models/User.js'
import { queueSentimentAnalysis, isAgendaRunning, isAgendaIdle } from '../utils/jobScheduler.js'
import { getSentimentScore } from '../utils/getSentiment.js'
import { analyzeImageText } from '../utils/imageToText.js'
import path from 'path'

// Helper function to process image immediately
async function processImageImmediately(filePath, momentId) {
  try {
    console.log(`🖼️ Processing image immediately for moment ${momentId}...`)
    
    // Extract text from image using OCR/Vision API
    const textContent = await analyzeImageText(filePath)
    console.log(`🖼️ Image text: ${textContent?.substring(0, 100)}...`)
    
    if (!textContent || textContent.trim().length === 0) {
      console.log(`⚠️ No text content found in image for moment ${momentId}`)
      await Moment.findByIdAndUpdate(momentId, {
        extractedText: 'No content could be extracted from this image',
        sentimentScore: null
      })
      return { extractedText: 'No content could be extracted from this image', sentimentScore: null }
    }
    
    // Get sentiment score from extracted text
    const sentimentScore = await getSentimentScore(textContent)
    
    if (sentimentScore !== null && sentimentScore >= 0) {
      // Update the moment with sentiment score and extracted text
      await Moment.findByIdAndUpdate(momentId, {
        sentimentScore,
        extractedText: textContent.substring(0, 500) // Store first 500 chars
      })
      
      console.log(`✅ Image sentiment analysis completed immediately for moment ${momentId}: ${sentimentScore}%`)
      return { extractedText: textContent.substring(0, 500), sentimentScore }
    } else {
      console.log(`❌ Image sentiment analysis failed for moment ${momentId}`)
      await Moment.findByIdAndUpdate(momentId, {
        extractedText: textContent.substring(0, 500),
        sentimentScore: null
      })
      return { extractedText: textContent.substring(0, 500), sentimentScore: null }
    }
    
  } catch (error) {
    console.error(`❌ Error processing image immediately for moment ${momentId}:`, error)
    await Moment.findByIdAndUpdate(momentId, {
      extractedText: 'Error processing image',
      sentimentScore: null
    })
    return { extractedText: 'Error processing image', sentimentScore: null }
  }
}

export async function createMoment(req, res) {
  try {
    const { workerId, mediaType, submittedBy } = req.body
    
    // Validate required fields (removed description)
    if (!workerId || !mediaType || !submittedBy) {
      return res.status(400).json({ 
        message: 'Missing required fields: workerId, mediaType, and submittedBy are required' 
      })
    }

    // Validate worker exists
    const worker = await User.findById(workerId)
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' })
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ message: 'Media file is required' })
    }

    // Validate media type
    if (!['image', 'video'].includes(mediaType)) {
      return res.status(400).json({ message: 'Media type must be either "image" or "video"' })
    }

    const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/moments/${req.file.filename}`
    const filePath = req.file.path
    
    // Create moment without sentiment score (will be processed asynchronously)
    const moment = new Moment({ 
      workerId, 
      mediaUrl, 
      mediaType, 
      submittedBy: submittedBy.trim(),
      extractedText: null, // Will be filled by background job
      sentimentScore: null // Will be filled by background job
    })
    
    await moment.save()

    let processingResult = null
    let isProcessedImmediately = false

    // Check if agenda is running and idle for images
    const agendaRunning = isAgendaRunning()
    
    if (mediaType === 'image') {
      // For images, check if we should process immediately
      let shouldProcessImmediately = false
      
      if (!agendaRunning) {
        // Agenda not running at all - process immediately
        console.log(`📋 Agenda not running, processing image immediately...`)
        shouldProcessImmediately = true
      } else {
        // Agenda is running - check if it's idle
        const agendaIdle = await isAgendaIdle()
        if (agendaIdle) {
          console.log(`📋 Agenda is idle, processing image immediately...`)
          shouldProcessImmediately = true
        } else {
          console.log(`📋 Agenda is busy, queueing image for background processing...`)
        }
      }
      
      if (shouldProcessImmediately) {
        processingResult = await processImageImmediately(filePath, moment._id.toString())
        isProcessedImmediately = true
      } else {
        // Queue for background processing
        try {
          await queueSentimentAnalysis(moment._id.toString(), filePath, mediaType)
          console.log(`📋 Queued ${mediaType} for background processing`)
        } catch (jobError) {
          console.warn('⚠️ Failed to queue sentiment analysis job:', jobError.message)
          // Fallback to immediate processing if queuing fails
          console.log(`📋 Fallback: processing image immediately due to queue failure...`)
          processingResult = await processImageImmediately(filePath, moment._id.toString())
          isProcessedImmediately = true
        }
      }
    } else {
      // For videos, always queue for background processing
      try {
        await queueSentimentAnalysis(moment._id.toString(), filePath, mediaType)
        console.log(`📋 Queued ${mediaType} for background processing`)
      } catch (jobError) {
        console.warn('⚠️ Failed to queue sentiment analysis job:', jobError.message)
        // Don't fail the request if job queuing fails for videos
      }
    }

    // Populate worker info for response
    await moment.populate('workerId', 'name role department')

    const responseMessage = isProcessedImmediately 
      ? `Moment uploaded and processed successfully ✅ ${mediaType === 'image' ? 'Image analysis completed immediately.' : 'Processing completed immediately.'}`
      : `Moment uploaded successfully ✅ Sentiment analysis is being processed in the background.`

    res.status(201).json({ 
      message: responseMessage,
      moment: {
        ...moment.toObject(),
        ...(processingResult && {
          extractedText: processingResult.extractedText,
          sentimentScore: processingResult.sentimentScore
        }),
        workerName: worker.name,
        processingStatus: isProcessedImmediately ? 'completed' : 'queued'
      }
    })
  } catch (err) {
    console.error('❌ Moment creation error:', err)
    
    // Handle specific mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(err.errors).map(error => error.message)
      })
    }
    
    res.status(500).json({ message: 'Failed to upload moment', error: err.message })
  }
}

export async function getAllMoments(req, res) {
  try {
    const { page = 1, limit = 10, sortBy = 'timestamp', sortOrder = 'desc', workerId } = req.query
    
    // Build query filters
    const query = {}
    if (workerId) {
      query.workerId = workerId
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortDirection = sortOrder === 'desc' ? -1 : 1
    
    // Execute query with pagination and population
    const [moments, total] = await Promise.all([
      Moment.find(query)
        .populate('workerId', 'name role department avatar')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit))
        .select('workerId extractedText sentimentScore mediaUrl mediaType submittedBy timestamp') // Include extractedText
        .lean(), // Use lean() for better performance
      Moment.countDocuments(query)
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit))
    const hasNextPage = parseInt(page) < totalPages
    const hasPrevPage = parseInt(page) > 1
    
    res.json({
      moments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (err) {
    console.error('❌ Failed to fetch moments:', err)
    res.status(500).json({ message: 'Failed to fetch moments', error: err.message })
  }
}
