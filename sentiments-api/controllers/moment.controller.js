import Moment from '../models/Moment.js'
import User from '../models/User.js'
import { queueSentimentAnalysis } from '../utils/jobScheduler.js'
import path from 'path'

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

    const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
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

    // Queue background job for sentiment analysis
    try {
      await queueSentimentAnalysis(moment._id.toString(), filePath, mediaType)
    } catch (jobError) {
      console.warn('⚠️ Failed to queue sentiment analysis job:', jobError.message)
      // Don't fail the request if job queuing fails
    }

    // Populate worker info for response
    await moment.populate('workerId', 'name role department')

    res.status(201).json({ 
      message: 'Moment uploaded successfully ✅ Sentiment analysis is being processed in the background.', 
      moment: {
        ...moment.toObject(),
        workerName: worker.name,
        processingStatus: 'queued' // Indicate that processing is queued
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
