import User from '../models/User.js'
import Moment from '../models/Moment.js'
import Feedback from '../models/Feedback.js'
import mongoose from 'mongoose'

// Get sentiment overview analytics
const getSentimentOverview = async () => {
  console.log('📊 Fetching sentiment overview...')
  
  // Get total counts for all data
  const [totalFeedbacks, totalMoments] = await Promise.all([
    Feedback.countDocuments(),
    Moment.countDocuments()
  ])
  
  console.log(`📋 Database totals: ${totalFeedbacks} feedbacks, ${totalMoments} moments`)
  
  // Get analytics for items with sentiment scores
  const [momentsStats, feedbacksStats] = await Promise.all([
    Moment.aggregate([
      { $match: { sentimentScore: { $ne: null, $exists: true } } },
      {
        $group: {
          _id: null,
          totalMoments: { $sum: 1 },
          averageSentiment: { $avg: '$sentimentScore' },
          positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      }
    ]),
    Feedback.aggregate([
      { $match: { sentimentScore: { $ne: null, $exists: true } } },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageSentiment: { $avg: '$sentimentScore' },
          positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      }
    ])
  ])

  console.log(`📈 Sentiment analysis: ${momentsStats.length ? momentsStats[0].totalMoments : 0} moments, ${feedbacksStats.length ? feedbacksStats[0].totalFeedbacks : 0} feedbacks`)

  // Return both total counts and sentiment analysis
  const moments = {
    totalMoments: totalMoments,
    totalWithSentiment: momentsStats[0]?.totalMoments || 0,
    averageSentiment: momentsStats[0]?.averageSentiment || 0,
    positive: momentsStats[0]?.positive || 0,
    neutral: momentsStats[0]?.neutral || 0,
    negative: momentsStats[0]?.negative || 0
  }

  const feedbacks = {
    totalFeedbacks: totalFeedbacks,
    totalWithSentiment: feedbacksStats[0]?.totalFeedbacks || 0,
    averageSentiment: feedbacksStats[0]?.averageSentiment || 0,
    positive: feedbacksStats[0]?.positive || 0,
    neutral: feedbacksStats[0]?.neutral || 0,
    negative: feedbacksStats[0]?.negative || 0
  }

  const combined = {
    total: totalMoments + totalFeedbacks,
    totalWithSentiment: (momentsStats[0]?.totalMoments || 0) + (feedbacksStats[0]?.totalFeedbacks || 0),
    averageSentiment: feedbacksStats[0] && momentsStats[0] 
      ? (momentsStats[0].averageSentiment + feedbacksStats[0].averageSentiment) / 2
      : feedbacksStats[0]?.averageSentiment || momentsStats[0]?.averageSentiment || 0,
    positive: (momentsStats[0]?.positive || 0) + (feedbacksStats[0]?.positive || 0),
    neutral: (momentsStats[0]?.neutral || 0) + (feedbacksStats[0]?.neutral || 0),
    negative: (momentsStats[0]?.negative || 0) + (feedbacksStats[0]?.negative || 0)
  }

  console.log(`✅ Overview complete - Total: ${combined.total}, With sentiment: ${combined.totalWithSentiment}`)

  return { moments, feedbacks, combined }
}

// Get moments sentiment trend (last 30 days)
const getMomentsSentimentTrend = async (additionalFilters = {}) => {
  console.log('📊 Fetching moments sentiment trend...')
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // First get all moments in date range
  const allMatchConditions = {
    timestamp: { $gte: thirtyDaysAgo },
    ...additionalFilters
  }

  const sentimentMatchConditions = {
    sentimentScore: { $ne: null, $exists: true },
    timestamp: { $gte: thirtyDaysAgo },
    ...additionalFilters
  }

  const [allMoments, sentimentMoments] = await Promise.all([
    Moment.aggregate([
      { $match: allMatchConditions },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Moment.aggregate([
      { $match: sentimentMatchConditions },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          averageSentiment: { $avg: '$sentimentScore' },
          count: { $sum: 1 },
          positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ])

  // Merge the results, preferring sentiment data when available
  const result = allMoments.map(dayData => {
    const sentimentData = sentimentMoments.find(s => s._id === dayData._id)
    return {
      date: dayData._id,
      averageSentiment: sentimentData ? Math.round(sentimentData.averageSentiment * 10) / 10 : 0,
      count: sentimentData ? sentimentData.count : dayData.count,
      positive: sentimentData ? sentimentData.positive : 0,
      neutral: sentimentData ? sentimentData.neutral : 0,
      negative: sentimentData ? sentimentData.negative : 0,
      _id: 0
    }
  })

  console.log(`📊 Moments trend: ${result.length} days, ${sentimentMoments.length} with sentiment`)
  return result
}

// Get feedback sentiment trend (last 30 days)
const getFeedbackSentimentTrend = async (additionalFilters = {}) => {
  console.log('📊 Fetching feedback sentiment trend...')
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get all feedbacks and sentiment-analyzed feedbacks separately
  const allMatchConditions = {
    timestamp: { $gte: thirtyDaysAgo },
    ...additionalFilters
  }

  const sentimentMatchConditions = {
    sentimentScore: { $ne: null, $exists: true },
    timestamp: { $gte: thirtyDaysAgo },
    ...additionalFilters
  }

  const [allFeedbacks, sentimentFeedbacks] = await Promise.all([
    Feedback.aggregate([
      { $match: allMatchConditions },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Feedback.aggregate([
      { $match: sentimentMatchConditions },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          averageSentiment: { $avg: '$sentimentScore' },
          count: { $sum: 1 },
          positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ])

  // Merge the results
  const result = allFeedbacks.map(dayData => {
    const sentimentData = sentimentFeedbacks.find(s => s._id === dayData._id)
    return {
      date: dayData._id,
      averageSentiment: sentimentData ? Math.round(sentimentData.averageSentiment * 10) / 10 : 0,
      count: sentimentData ? sentimentData.count : dayData.count,
      positive: sentimentData ? sentimentData.positive : 0,
      neutral: sentimentData ? sentimentData.neutral : 0,
      negative: sentimentData ? sentimentData.negative : 0,
      _id: 0
    }
  })

  console.log(`📋 Feedback trend: ${result.length} days, ${sentimentFeedbacks.length} with sentiment`)
  return result
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
              positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } }
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
              positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } }
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
        boundaries: [0, 40, 60, 100],
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
        boundaries: [0, 40, 60, 100],
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

export {
  getAnalyticsData,
  getFilteredAnalytics
}
