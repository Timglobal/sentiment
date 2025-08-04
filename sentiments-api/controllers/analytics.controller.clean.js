const User = require('../models/User')
const Moment = require('../models/Moment')
const Feedback = require('../models/Feedback')
const mongoose = require('mongoose')

// Get sentiment overview analytics
const getSentimentOverview = async () => {
  console.log('📊 Fetching sentiment overview...')
  
  const [momentsStats, feedbacksStats] = await Promise.all([
    Moment.aggregate([
      { $match: { sentimentScore: { $ne: null } } },
      {
        $group: {
          _id: null,
          totalMoments: { $sum: 1 },
          averageSentiment: { $avg: '$sentimentScore' },
          positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 20] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', -20] }, { $lt: ['$sentimentScore', 20] }] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', -20] }, 1, 0] } }
        }
      }
    ]),
    Feedback.aggregate([
      { $match: { sentimentScore: { $ne: null } } },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageSentiment: { $avg: '$sentimentScore' },
          positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 20] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', -20] }, { $lt: ['$sentimentScore', 20] }] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', -20] }, 1, 0] } }
        }
      }
    ])
  ])

  const moments = momentsStats[0] || { totalMoments: 0, averageSentiment: 0, positive: 0, neutral: 0, negative: 0 }
  const feedbacks = feedbacksStats[0] || { totalFeedbacks: 0, averageSentiment: 0, positive: 0, neutral: 0, negative: 0 }

  const combined = {
    total: moments.totalMoments + feedbacks.totalFeedbacks,
    averageSentiment: (moments.averageSentiment + feedbacks.averageSentiment) / 2,
    positive: moments.positive + feedbacks.positive,
    neutral: moments.neutral + feedbacks.neutral,
    negative: moments.negative + feedbacks.negative
  }

  return { moments, feedbacks, combined }
}

// Get moments sentiment trend (last 30 days)
const getMomentsSentimentTrend = async (additionalFilters = {}) => {
  console.log('📊 Fetching moments sentiment trend...')
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const matchConditions = {
    sentimentScore: { $ne: null },
    timestamp: { $gte: thirtyDaysAgo },
    ...additionalFilters
  }

  return await Moment.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        averageSentiment: { $avg: '$sentimentScore' },
        count: { $sum: 1 },
        positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 20] }, 1, 0] } },
        neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', -20] }, { $lt: ['$sentimentScore', 20] }] }, 1, 0] } },
        negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', -20] }, 1, 0] } }
      }
    },
    {
      $project: {
        date: '$_id',
        averageSentiment: { $round: ['$averageSentiment', 1] },
        count: 1,
        positive: 1,
        neutral: 1,
        negative: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ])
}

// Get feedback sentiment trend (last 30 days)
const getFeedbackSentimentTrend = async (additionalFilters = {}) => {
  console.log('📊 Fetching feedback sentiment trend...')
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const matchConditions = {
    sentimentScore: { $ne: null },
    timestamp: { $gte: thirtyDaysAgo },
    ...additionalFilters
  }

  return await Feedback.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        averageSentiment: { $avg: '$sentimentScore' },
        count: { $sum: 1 },
        positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 20] }, 1, 0] } },
        neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', -20] }, { $lt: ['$sentimentScore', 20] }] }, 1, 0] } },
        negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', -20] }, 1, 0] } }
      }
    },
    {
      $project: {
        date: '$_id',
        averageSentiment: { $round: ['$averageSentiment', 1] },
        count: 1,
        positive: 1,
        neutral: 1,
        negative: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ])
}

// Get department analytics
const getDepartmentAnalytics = async () => {
  console.log('📊 Fetching department analytics...')
  
  return await User.aggregate([
    { $match: { role: { $ne: 'admin' } } },
    {
      $group: {
        _id: '$department',
        workerCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'moments',
        let: { department: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'workerId',
              foreignField: '_id',
              as: 'worker'
            }
          },
          {
            $match: {
              $expr: { $eq: [{ $arrayElemAt: ['$worker.department', 0] }, '$$department'] },
              sentimentScore: { $ne: null }
            }
          }
        ],
        as: 'moments'
      }
    },
    {
      $lookup: {
        from: 'feedbacks',
        let: { department: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'workerId',
              foreignField: '_id',
              as: 'worker'
            }
          },
          {
            $match: {
              $expr: { $eq: [{ $arrayElemAt: ['$worker.department', 0] }, '$$department'] },
              sentimentScore: { $ne: null }
            }
          }
        ],
        as: 'feedbacks'
      }
    },
    {
      $addFields: {
        totalMoments: { $size: '$moments' },
        totalFeedbacks: { $size: '$feedbacks' },
        momentsSentiment: {
          $avg: {
            $cond: [
              { $gt: [{ $size: '$moments' }, 0] },
              { $avg: '$moments.sentimentScore' },
              null
            ]
          }
        },
        feedbacksSentiment: {
          $avg: {
            $cond: [
              { $gt: [{ $size: '$feedbacks' }, 0] },
              { $avg: '$feedbacks.sentimentScore' },
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        department: '$_id',
        workerCount: 1,
        totalMoments: 1,
        totalFeedbacks: 1,
        momentsSentiment: { $round: [{ $ifNull: ['$momentsSentiment', 0] }, 1] },
        feedbacksSentiment: { $round: [{ $ifNull: ['$feedbacksSentiment', 0] }, 1] },
        overallSentiment: {
          $round: [{
            $cond: [
              { $and: [{ $ne: ['$momentsSentiment', null] }, { $ne: ['$feedbacksSentiment', null] }] },
              { $avg: ['$momentsSentiment', '$feedbacksSentiment'] },
              { $ifNull: ['$momentsSentiment', { $ifNull: ['$feedbacksSentiment', 0] }] }
            ]
          }, 1]
        },
        _id: 0
      }
    },
    { $sort: { overallSentiment: -1 } }
  ])
}

// Get worker performance analytics
const getWorkerPerformance = async () => {
  console.log('📊 Fetching worker performance analytics...')
  
  return await User.aggregate([
    { $match: { role: { $ne: 'admin' } } },
    {
      $lookup: {
        from: 'moments',
        let: { workerId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$workerId', '$$workerId'] }, sentimentScore: { $ne: null } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avgSentiment: { $avg: '$sentimentScore' },
              positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 20] }, 1, 0] } }
            }
          }
        ],
        as: 'momentsData'
      }
    },
    {
      $lookup: {
        from: 'feedbacks',
        let: { workerId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$workerId', '$$workerId'] }, sentimentScore: { $ne: null } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avgSentiment: { $avg: '$sentimentScore' },
              positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 20] }, 1, 0] } }
            }
          }
        ],
        as: 'feedbacksData'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        department: 1,
        totalMoments: { $ifNull: [{ $arrayElemAt: ['$momentsData.count', 0] }, 0] },
        totalFeedbacks: { $ifNull: [{ $arrayElemAt: ['$feedbacksData.count', 0] }, 0] },
        momentsSentiment: { $round: [{ $ifNull: [{ $arrayElemAt: ['$momentsData.avgSentiment', 0] }, 0] }, 1] },
        feedbacksSentiment: { $round: [{ $ifNull: [{ $arrayElemAt: ['$feedbacksData.avgSentiment', 0] }, 0] }, 1] },
        positiveMoments: { $ifNull: [{ $arrayElemAt: ['$momentsData.positive', 0] }, 0] },
        positiveFeedbacks: { $ifNull: [{ $arrayElemAt: ['$feedbacksData.positive', 0] }, 0] },
        overallSentiment: {
          $round: [{
            $avg: [
              { $ifNull: [{ $arrayElemAt: ['$momentsData.avgSentiment', 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ['$feedbacksData.avgSentiment', 0] }, 0] }
            ]
          }, 1]
        },
        totalPositive: {
          $add: [
            { $ifNull: [{ $arrayElemAt: ['$momentsData.positive', 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ['$feedbacksData.positive', 0] }, 0] }
          ]
        }
      }
    },
    { $sort: { overallSentiment: -1 } }
  ])
}

// Get sentiment comparison analytics
const getSentimentComparison = async () => {
  console.log('📊 Fetching sentiment comparison data...')
  
  const moments = await Moment.aggregate([
    { $match: { sentimentScore: { $ne: null } } },
    {
      $bucket: {
        groupBy: '$sentimentScore',
        boundaries: [-100, -20, 20, 100],
        default: 'other',
        output: {
          count: { $sum: 1 },
          avgScore: { $avg: '$sentimentScore' }
        }
      }
    }
  ])

  const feedbacks = await Feedback.aggregate([
    { $match: { sentimentScore: { $ne: null } } },
    {
      $bucket: {
        groupBy: '$sentimentScore',
        boundaries: [-100, -20, 20, 100],
        default: 'other',
        output: {
          count: { $sum: 1 },
          avgScore: { $avg: '$sentimentScore' }
        }
      }
    }
  ])

  return { moments, feedbacks }
}

// Get recent activity analytics
const getRecentActivity = async () => {
  console.log('📊 Fetching recent activity...')
  
  const recentMoments = await Moment.find({ sentimentScore: { $ne: null } })
    .populate('workerId', 'name department role')
    .sort({ timestamp: -1 })
    .limit(10)
    .lean()

  const recentFeedbacks = await Feedback.find({ sentimentScore: { $ne: null } })
    .populate('workerId', 'name department role')
    .sort({ timestamp: -1 })
    .limit(10)
    .lean()

  return {
    moments: recentMoments,
    feedbacks: recentFeedbacks
  }
}

// Main analytics controller function
const getAnalyticsData = async (req, res) => {
  try {
    console.log('📊 Starting comprehensive analytics data fetch...')
    
    // Execute all analytics functions in parallel for optimal performance
    const [
      sentimentOverview,
      momentsSentimentTrend,
      feedbackSentimentTrend,
      departmentAnalytics,
      workerPerformance,
      sentimentComparison,
      recentActivity,
      totalWorkers
    ] = await Promise.all([
      getSentimentOverview(),
      getMomentsSentimentTrend(),
      getFeedbackSentimentTrend(),
      getDepartmentAnalytics(),
      getWorkerPerformance(),
      getSentimentComparison(),
      getRecentActivity(),
      User.countDocuments({ role: { $ne: 'admin' } })
    ])

    console.log('✅ All analytics data fetched successfully')

    res.json({
      success: true,
      data: {
        sentimentOverview,
        momentsSentimentTrend,
        feedbackSentimentTrend,
        departmentAnalytics,
        workerPerformance,
        sentimentComparison,
        recentActivity,
        lastUpdated: new Date().toISOString(),
        totalWorkers
      }
    })
  } catch (error) {
    console.error('❌ Error fetching analytics data:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    })
  }
}

// Filtered analytics controller function
const getFilteredAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, department, workerId } = req.query
    console.log('📊 Fetching filtered analytics:', { startDate, endDate, department, workerId })
    
    // Build date filter
    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.timestamp = {}
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate)
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate)
    }
    
    // Build additional filters
    const filters = { ...dateFilter }
    if (department && department !== 'all') {
      // Get users in department first
      const deptUsers = await User.find({ department }, '_id')
      filters.workerId = { $in: deptUsers.map(u => u._id) }
    }
    if (workerId && workerId !== 'all') {
      filters.workerId = mongoose.Types.ObjectId(workerId)
    }

    // Get filtered moments and feedbacks trends
    const [momentsTrend, feedbacksTrend] = await Promise.all([
      getMomentsSentimentTrend(filters),
      getFeedbackSentimentTrend(filters)
    ])

    res.json({
      success: true,
      data: {
        moments: momentsTrend,
        feedbacks: feedbacksTrend,
        filters: { startDate, endDate, department, workerId }
      }
    })
  } catch (error) {
    console.error('❌ Error fetching filtered analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filtered analytics data',
      error: error.message
    })
  }
}

module.exports = {
  getAnalyticsData,
  getFilteredAnalytics
}
