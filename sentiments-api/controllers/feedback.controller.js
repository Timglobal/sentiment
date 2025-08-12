import Feedback from '../models/Feedback.js'
import Worker from '../models/User.js'
import mongoose from 'mongoose'
import { getSentimentScore } from '../utils/getSentiment.js'

export async function submitFeedback(req, res) {
  try {
    const { name, email, message, workerId, source } = req.body
    
    // Validate required fields
    if (!name || !email || !message || !workerId || !source) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, message, workerId, and source are required' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }
    
    const worker = await Worker.findById(workerId)
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' })
    }

    // If user is authenticated, ensure worker is in the same company
    if (req.user?.id) {
      const currentUser = await Worker.findById(req.user.id).populate('company')
      if (currentUser && currentUser.company && worker.company) {
        if (currentUser.company._id.toString() !== worker.company.toString()) {
          return res.status(403).json({ message: 'Cannot submit feedback for workers outside your company' })
        }
      }
    }

    // Get sentiment score
    const sentimentScore = await getSentimentScore(message);
    
    // Create new feedback with authenticated user ID if available
    const newFeedback = new Feedback({
        senderName: name.trim(),
        workerName: worker.name,
        senderEmail: email.trim().toLowerCase(),
        userId: req.user?.id || null, // Will be set if user is authenticated
        workerId,
        source: source.trim(),
        message: message.trim(),
        sentimentScore: sentimentScore >= 0 ? sentimentScore : null, // Store null if sentiment analysis fails
    })
    
    await newFeedback.save()
    
    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedback: {
        id: newFeedback._id,
        workerName: worker.name,
        sentimentScore: newFeedback.sentimentScore
      }
    })
  } catch (error) {
    console.error('❌ Feedback submission error:', error)
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      })
    }
    
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message })
  }
}

export async function getFeedbackStats(req, res) {
  try {
    const { workerId, dateFrom, dateTo } = req.query
    
    // Get current user and their company to filter feedbacks by company
    const userId = req.user.id
    const user = await Worker.findById(userId).populate('company')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Build match query with company filtering
    const matchQuery = {}
    
    // Only show feedbacks for workers in the same company
    if (user.company) {
      const companyUsers = await Worker.find({ company: user.company._id }, '_id')
      const companyUserIds = companyUsers.map(u => u._id)
      matchQuery.workerId = { $in: companyUserIds }
    }
    
    // Additional workerId filter if specified
    if (workerId) {
      if (matchQuery.workerId) {
        // Ensure the specific workerId is also in the company
        matchQuery.workerId = { 
          $in: matchQuery.workerId.$in.filter(id => id.toString() === workerId) 
        }
      } else {
        matchQuery.workerId = new mongoose.Types.ObjectId(workerId)
      }
    }
    
    if (dateFrom || dateTo) {
      matchQuery.timestamp = {}
      if (dateFrom) matchQuery.timestamp.$gte = new Date(dateFrom)
      if (dateTo) matchQuery.timestamp.$lte = new Date(dateTo)
    }

    const stats = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageSentiment: { $avg: '$sentimentScore' },
          positiveCount: {
            $sum: {
              $cond: [{ $gte: ['$sentimentScore', 70] }, 1, 0]
            }
          },
          neutralCount: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$sentimentScore', 30] }, { $lt: ['$sentimentScore', 70] }] },
                1,
                0
              ]
            }
          },
          negativeCount: {
            $sum: {
              $cond: [{ $lt: ['$sentimentScore', 30] }, 1, 0]
            }
          }
        }
      }
    ])

    const result = stats[0] || {
      totalFeedbacks: 0,
      averageSentiment: null,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0
    }

    res.json(result)
  } catch (error) {
    console.error('❌ Failed to fetch feedback stats:', error)
    res.status(500).json({ message: 'Failed to fetch feedback statistics', error: error.message })
  }
}

export async function getAllFeedbacks(req, res) {
  try {
    const { page = 1, limit = 10, sortBy = 'timestamp', sortOrder = 'desc', workerId, sentimentFilter } = req.query
    
    // Get current user and their company to filter feedbacks by company
    const userId = req.user.id
    const user = await Worker.findById(userId).populate('company')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Build query filters with company filtering
    const query = {}
    
    // Only show feedbacks for workers in the same company
    if (user.company) {
      const companyUsers = await Worker.find({ company: user.company._id }, '_id')
      const companyUserIds = companyUsers.map(u => u._id)
      query.workerId = { $in: companyUserIds }
    }
    
    // Additional workerId filter if specified
    if (workerId) {
      if (query.workerId) {
        // Ensure the specific workerId is also in the company
        query.workerId = { 
          $in: query.workerId.$in.filter(id => id.toString() === workerId) 
        }
      } else {
        query.workerId = workerId
      }
    }
    
    if (sentimentFilter) {
      if (sentimentFilter === 'positive') {
        query.sentimentScore = { $gte: 70 }
      } else if (sentimentFilter === 'negative') {
        query.sentimentScore = { $lt: 30 }
      } else if (sentimentFilter === 'neutral') {
        query.sentimentScore = { $gte: 30, $lt: 70 }
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortDirection = sortOrder === 'desc' ? -1 : 1
    
    // Execute query with pagination and population
    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .populate('workerId', 'name role department avatar')
        .populate('userId', 'name email')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Use lean() for better performance
      Feedback.countDocuments(query)
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit))
    const hasNextPage = parseInt(page) < totalPages
    const hasPrevPage = parseInt(page) > 1
    
    res.json({
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('❌ Failed to fetch feedbacks:', error)
    res.status(500).json({ message: 'Failed to fetch feedbacks', error: error.message })
  }
}
