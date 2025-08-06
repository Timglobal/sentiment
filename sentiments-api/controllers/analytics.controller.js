import User from '../models/User.js'
import Moment from '../models/Moment.js'
import Feedback from '../models/Feedback.js'
import mongoose from 'mongoose'

// Get comprehensive analytics data for admin dashboard
export const getComprehensiveAnalytics = async (req, res) => {
  try {
    console.log('📊 Fetching comprehensive analytics for user:', req.user.id)
    
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' })
    }

    const companyId = user.company?._id
    if (!companyId) {
      return res.status(400).json({ error: 'User not associated with any company' })
    }

    // Get all users in the company
    const companyUsers = await User.find({ company: companyId }, '_id name email role department')
    const userIds = companyUsers.map(u => u._id)

    // Date range filters
    const { startDate, endDate, timeRange = '30d' } = req.query
    let dateFilter = {}
    
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    } else {
      // Default time ranges
      const now = new Date()
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[timeRange] || 30

      dateFilter = {
        timestamp: {
          $gte: new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
        }
      }
    }

    // Base filters for company data
    const feedbackFilter = { workerId: { $in: userIds }, ...dateFilter }
    const momentFilter = { workerId: { $in: userIds }, ...dateFilter }

    // 1. EXECUTIVE SUMMARY
    const [totalFeedbacks, totalMoments, totalUsers] = await Promise.all([
      Feedback.countDocuments(feedbackFilter),
      Moment.countDocuments(momentFilter),
      User.countDocuments({ company: companyId, role: { $ne: 'admin' } })
    ])

    // 2. SENTIMENT OVERVIEW WITH DETAILED BREAKDOWN
    const [feedbackSentimentStats, momentSentimentStats] = await Promise.all([
      Feedback.aggregate([
        { $match: { ...feedbackFilter, sentimentScore: { $ne: null, $exists: true } } },
        {
          $group: {
            _id: null,
            avgSentiment: { $avg: '$sentimentScore' },
            totalAnalyzed: { $sum: 1 },
            excellent: { $sum: { $cond: [{ $gte: ['$sentimentScore', 90] }, 1, 0] } },
            veryPositive: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 75] }, { $lt: ['$sentimentScore', 90] }] }, 1, 0] } },
            positive: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 60] }, { $lt: ['$sentimentScore', 75] }] }, 1, 0] } },
            neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 25] }, { $lt: ['$sentimentScore', 40] }] }, 1, 0] } },
            veryNegative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 25] }, 1, 0] } },
            maxSentiment: { $max: '$sentimentScore' },
            minSentiment: { $min: '$sentimentScore' }
          }
        }
      ]),
      Moment.aggregate([
        { $match: { ...momentFilter, sentimentScore: { $ne: null, $exists: true } } },
        {
          $group: {
            _id: null,
            avgSentiment: { $avg: '$sentimentScore' },
            totalAnalyzed: { $sum: 1 },
            excellent: { $sum: { $cond: [{ $gte: ['$sentimentScore', 90] }, 1, 0] } },
            veryPositive: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 75] }, { $lt: ['$sentimentScore', 90] }] }, 1, 0] } },
            positive: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 60] }, { $lt: ['$sentimentScore', 75] }] }, 1, 0] } },
            neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 25] }, { $lt: ['$sentimentScore', 40] }] }, 1, 0] } },
            veryNegative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 25] }, 1, 0] } },
            maxSentiment: { $max: '$sentimentScore' },
            minSentiment: { $min: '$sentimentScore' }
          }
        }
      ])
    ])
    // Sentiment breakdown data
    const sentimentBreakdown = {
      feedback: feedbackSentimentStats[0] || {},
      moments: momentSentimentStats[0] || {}
    }

    // 3. DAILY SENTIMENT TRENDS (last 90 days)
    const dailyTrends = await Feedback.aggregate([
      { $match: { ...feedbackFilter, sentimentScore: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          avgSentiment: { $avg: '$sentimentScore' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // 4. DEPARTMENT ANALYTICS
    const departmentAnalytics = await User.aggregate([
      { $match: { company: companyId, role: { $ne: 'admin' } } },
      {
        $lookup: {
          from: 'feedbacks',
          localField: '_id',
          foreignField: 'workerId',
          as: 'feedbacks'
        }
      },
      {
        $group: {
          _id: '$department',
          totalWorkers: { $sum: 1 },
          totalFeedbacks: { $sum: { $size: '$feedbacks' } },
          avgSentiment: {
            $avg: {
              $avg: {
                $map: {
                  input: '$feedbacks',
                  as: 'feedback',
                  in: '$$feedback.sentimentScore'
                }
              }
            }
          }
        }
      },
      { $sort: { totalFeedbacks: -1 } }
    ])

    // 5. WORKER PERFORMANCE (top performers and those needing attention)
    const workerPerformance = await User.aggregate([
      { $match: { company: companyId, role: { $ne: 'admin' } } },
      {
        $lookup: {
          from: 'feedbacks',
          localField: '_id',
          foreignField: 'workerId',
          as: 'feedbacks'
        }
      },
      {
        $addFields: {
          feedbackCount: { $size: '$feedbacks' },
          avgSentiment: {
            $avg: {
              $map: {
                input: '$feedbacks',
                as: 'feedback',
                in: '$$feedback.sentimentScore'
              }
            }
          }
        }
      },
      { $match: { feedbackCount: { $gt: 0 } } },
      { $sort: { avgSentiment: -1 } }
    ])

    // 6. SENTIMENT SOURCE ANALYSIS
    const sourceAnalysis = await Feedback.aggregate([
      { $match: feedbackFilter },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          avgSentiment: { $avg: '$sentimentScore' }
        }
      }
    ])

    // 7. WEEKLY COMPARISON
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const previousWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

    const [currentWeekStats, previousWeekStats] = await Promise.all([
      Feedback.aggregate([
        { $match: { ...feedbackFilter, timestamp: { $gte: lastWeek } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgSentiment: { $avg: '$sentimentScore' }
          }
        }
      ]),
      Feedback.aggregate([
        { $match: { ...feedbackFilter, timestamp: { $gte: previousWeek, $lt: lastWeek } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgSentiment: { $avg: '$sentimentScore' }
          }
        }
      ])
    ])

    // 8. HOURLY ACTIVITY PATTERN
    const hourlyActivity = await Feedback.aggregate([
      { $match: feedbackFilter },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 },
          avgSentiment: { $avg: '$sentimentScore' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // 9. AUTOMATED INSIGHTS
    const insights = []
    
    // Calculate overall sentiment trend - only consider non-zero values
    const feedbackAvg = feedbackSentimentStats[0]?.avgSentiment || 0
    const momentAvg = momentSentimentStats[0]?.avgSentiment || 0
    const feedbackCount = feedbackSentimentStats[0]?.totalAnalyzed || 0
    const momentCount = momentSentimentStats[0]?.totalAnalyzed || 0
    
    let overallAvgSentiment = 0
    let totalAnalyzed = 0
    
    if (feedbackCount > 0 && momentCount > 0) {
      // Both feedback and moments available
      overallAvgSentiment = (feedbackAvg + momentAvg) / 2
      totalAnalyzed = feedbackCount + momentCount
    } else if (feedbackCount > 0) {
      // Only feedback available
      overallAvgSentiment = feedbackAvg
      totalAnalyzed = feedbackCount
    } else if (momentCount > 0) {
      // Only moments available
      overallAvgSentiment = momentAvg
      totalAnalyzed = momentCount
    }

    // Only generate insights if we have actual data
    if (totalAnalyzed > 0) {
      if (overallAvgSentiment >= 75) {
        insights.push({
          type: 'positive',
          message: `Excellent overall sentiment! Your team is performing exceptionally well with ${Math.round(overallAvgSentiment)}% positive sentiment across ${totalAnalyzed} analyzed items.`,
          value: Math.round(overallAvgSentiment)
        })
      } else if (overallAvgSentiment >= 60) {
        insights.push({
          type: 'info',
          message: `Good sentiment levels with ${Math.round(overallAvgSentiment)}% positive sentiment. There's room for improvement to reach excellence.`,
          value: Math.round(overallAvgSentiment)
        })
      } else if (overallAvgSentiment >= 40) {
        insights.push({
          type: 'warning',
          message: `Neutral sentiment levels at ${Math.round(overallAvgSentiment)}%. Consider reviewing feedback patterns to improve team satisfaction.`,
          value: Math.round(overallAvgSentiment)
        })
      } else {
        insights.push({
          type: 'negative',
          message: `Sentiment levels need attention at ${Math.round(overallAvgSentiment)}%. Immediate action recommended to address team concerns.`,
          value: Math.round(overallAvgSentiment)
        })
      }
    }

    // Weekly growth insight
    const currentWeekCount = currentWeekStats[0]?.count || 0
    const previousWeekCount = previousWeekStats[0]?.count || 0
    const weeklyGrowth = previousWeekCount > 0 
      ? ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100 
      : 0

    if (weeklyGrowth > 10) {
      insights.push({
        type: 'positive',
        message: `Feedback engagement increased by ${Math.round(weeklyGrowth)}% this week!`,
        value: Math.round(weeklyGrowth)
      })
    }

    // Return comprehensive analytics
    const analytics = {
      executiveSummary: {
        totalFeedbacks,
        totalMoments,
        totalUsers,
        overallSentiment: Math.round(overallAvgSentiment)
      },
      sentimentOverview: {
        breakdown: sentimentBreakdown,
        combined: {
          avgSentiment: overallAvgSentiment,
          totalAnalyzed: (feedbackSentimentStats[0]?.totalAnalyzed || 0) + (momentSentimentStats[0]?.totalAnalyzed || 0)
        }
      },
      trends: {
        daily: dailyTrends,
        weekly: {
          current: currentWeekStats[0] || { count: 0, avgSentiment: 0 },
          previous: previousWeekStats[0] || { count: 0, avgSentiment: 0 },
          growth: weeklyGrowth
        },
        hourly: hourlyActivity
      },
      performance: {
        departments: departmentAnalytics,
        workers: {
          topPerformers: workerPerformance.slice(0, 5),
          needsAttention: workerPerformance.filter(worker => worker.overallSentiment < 60 && (worker.totalMoments > 0 || worker.totalFeedbacks > 0)).slice(0, 3)
        }
      },
      sources: sourceAnalysis,
      insights,
      metadata: {
        generatedAt: new Date(),
        timeRange: timeRange,
        companyId: companyId.toString(),
        dateFilter
      }
    }

    console.log('✅ Comprehensive analytics generated successfully')
    res.json({ success: true, data: analytics })

  } catch (error) {
    console.error('❌ Error in getComprehensiveAnalytics:', error)
    res.status(500).json({ 
      error: 'Failed to fetch comprehensive analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
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
// Filtered analytics controller function
const getFilteredAnalytics = async (req, res) => {
  try {
    console.log('📊 Fetching filtered analytics for user:', req.user.id)
    
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.' 
      })
    }

    const companyId = user.company?._id
    if (!companyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not associated with any company' 
      })
    }

    // Get filters from query
    const { startDate, endDate, department, workerId, timeRange = '30d', source = 'all' } = req.query
    console.log('📊 Filter parameters:', { startDate, endDate, department, workerId, timeRange, source })

    // Get all users in the company
    let companyUsers = await User.find({ company: companyId }, '_id name email role department')
    
    // Apply department filter if specified
    if (department && department !== 'all') {
      companyUsers = companyUsers.filter(u => u.department === department)
    }
    
    // Apply worker filter if specified
    if (workerId && workerId !== 'all') {
      companyUsers = companyUsers.filter(u => u._id.toString() === workerId)
    }
    
    const userIds = companyUsers.map(u => u._id)

    // Date range filters
    let dateFilter = {}
    
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    } else {
      // Use timeRange
      const now = new Date()
      let daysBack = 30
      
      switch (timeRange) {
        case '7d': daysBack = 7; break
        case '30d': daysBack = 30; break
        case '90d': daysBack = 90; break
        case '1y': daysBack = 365; break
      }
      
      dateFilter = {
        timestamp: {
          $gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
        }
      }
    }

    // Base filters for company data with source filtering
    const feedbackFilter = { workerId: { $in: userIds }, ...dateFilter }
    const momentFilter = { workerId: { $in: userIds }, ...dateFilter }

    // 1. EXECUTIVE SUMMARY - based on source filter
    let totalFeedbacks = 0, totalMoments = 0, totalUsers = companyUsers.length

    if (source === 'all' || source === 'feedback') {
      totalFeedbacks = await Feedback.countDocuments(feedbackFilter)
    }
    if (source === 'all' || source === 'moments') {
      totalMoments = await Moment.countDocuments(momentFilter)
    }

    // 2. SENTIMENT OVERVIEW WITH DETAILED BREAKDOWN - based on source filter
    let feedbackSentimentStats = [], momentSentimentStats = []
    
    if (source === 'all' || source === 'feedback') {
      feedbackSentimentStats = await Feedback.aggregate([
        { $match: { ...feedbackFilter, sentimentScore: { $ne: null, $exists: true } } },
        {
          $group: {
            _id: null,
            avgSentiment: { $avg: '$sentimentScore' },
            totalAnalyzed: { $sum: 1 },
            excellent: { $sum: { $cond: [{ $gte: ['$sentimentScore', 90] }, 1, 0] } },
            veryPositive: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 75] }, { $lt: ['$sentimentScore', 90] }] }, 1, 0] } },
            positive: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 60] }, { $lt: ['$sentimentScore', 75] }] }, 1, 0] } },
            neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 25] }, { $lt: ['$sentimentScore', 40] }] }, 1, 0] } },
            veryNegative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 25] }, 1, 0] } },
            maxSentiment: { $max: '$sentimentScore' },
            minSentiment: { $min: '$sentimentScore' }
          }
        }
      ])
    }
    
    if (source === 'all' || source === 'moments') {
      momentSentimentStats = await Moment.aggregate([
        { $match: { ...momentFilter, sentimentScore: { $ne: null, $exists: true } } },
        {
          $group: {
            _id: null,
            avgSentiment: { $avg: '$sentimentScore' },
            totalAnalyzed: { $sum: 1 },
            excellent: { $sum: { $cond: [{ $gte: ['$sentimentScore', 90] }, 1, 0] } },
            veryPositive: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 75] }, { $lt: ['$sentimentScore', 90] }] }, 1, 0] } },
            positive: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 60] }, { $lt: ['$sentimentScore', 75] }] }, 1, 0] } },
            neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 25] }, { $lt: ['$sentimentScore', 40] }] }, 1, 0] } },
            veryNegative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 25] }, 1, 0] } },
            maxSentiment: { $max: '$sentimentScore' },
            minSentiment: { $min: '$sentimentScore' }
          }
        }
      ])
    }

    // Sentiment breakdown data
    const sentimentBreakdown = {
      feedback: feedbackSentimentStats[0] || {},
      moments: momentSentimentStats[0] || {}
    }

    // 3. DEPARTMENT ANALYTICS (filtered) - based on source filter
    let departmentAnalytics = []
    
    if (source === 'feedback') {
      // Only feedback-based department analytics
      departmentAnalytics = await User.aggregate([
        { $match: { _id: { $in: userIds }, role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'feedbacks',
            localField: '_id',
            foreignField: 'workerId',
            as: 'feedbacks'
          }
        },
        {
          $addFields: {
            feedbacks: {
              $filter: {
                input: '$feedbacks',
                as: 'feedback',
                cond: {
                  $and: [
                    { $gte: ['$$feedback.timestamp', dateFilter.timestamp.$gte] },
                    ...(dateFilter.timestamp.$lte ? [{ $lte: ['$$feedback.timestamp', dateFilter.timestamp.$lte] }] : []),
                    { $ne: ['$$feedback.sentimentScore', null] }
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            feedbackSentiments: {
              $map: {
                input: '$feedbacks',
                as: 'feedback',
                in: '$$feedback.sentimentScore'
              }
            }
          }
        },
        {
          $group: {
            _id: '$department',
            totalWorkers: { $sum: 1 },
            totalFeedbacks: { $sum: { $size: '$feedbacks' } },
            allSentiments: { $push: '$feedbackSentiments' }
          }
        },
        {
          $addFields: {
            flattenedSentiments: {
              $reduce: {
                input: '$allSentiments',
                initialValue: [],
                in: { $concatArrays: ['$$value', '$$this'] }
              }
            }
          }
        },
        {
          $addFields: {
            avgSentiment: {
              $cond: {
                if: { $gt: [{ $size: '$flattenedSentiments' }, 0] },
                then: { $avg: '$flattenedSentiments' },
                else: 0
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            totalWorkers: 1,
            totalFeedbacks: 1,
            avgSentiment: 1
          }
        },
        { $match: { totalFeedbacks: { $gt: 0 } } },
        { $sort: { totalFeedbacks: -1 } }
      ])
    } else if (source === 'moments') {
      // Only moments-based department analytics
      departmentAnalytics = await User.aggregate([
        { $match: { _id: { $in: userIds }, role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'moments',
            localField: '_id',
            foreignField: 'workerId',
            as: 'moments'
          }
        },
        {
          $addFields: {
            moments: {
              $filter: {
                input: '$moments',
                as: 'moment',
                cond: {
                  $and: [
                    { $gte: ['$$moment.timestamp', dateFilter.timestamp.$gte] },
                    ...(dateFilter.timestamp.$lte ? [{ $lte: ['$$moment.timestamp', dateFilter.timestamp.$lte] }] : []),
                    { $ne: ['$$moment.sentimentScore', null] }
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            momentSentiments: {
              $map: {
                input: '$moments',
                as: 'moment',
                in: '$$moment.sentimentScore'
              }
            }
          }
        },
        {
          $group: {
            _id: '$department',
            totalWorkers: { $sum: 1 },
            totalMoments: { $sum: { $size: '$moments' } },
            allSentiments: { $push: '$momentSentiments' }
          }
        },
        {
          $addFields: {
            flattenedSentiments: {
              $reduce: {
                input: '$allSentiments',
                initialValue: [],
                in: { $concatArrays: ['$$value', '$$this'] }
              }
            }
          }
        },
        {
          $addFields: {
            avgSentiment: {
              $cond: {
                if: { $gt: [{ $size: '$flattenedSentiments' }, 0] },
                then: { $avg: '$flattenedSentiments' },
                else: 0
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            totalWorkers: 1,
            totalMoments: 1,
            avgSentiment: 1
          }
        },
        { $match: { totalMoments: { $gt: 0 } } },
        { $sort: { totalMoments: -1 } }
      ])
    } else {
      // Combined department analytics from both feedback and moments
      departmentAnalytics = await User.aggregate([
        { $match: { _id: { $in: userIds }, role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'feedbacks',
            localField: '_id',
            foreignField: 'workerId',
            as: 'feedbacks'
          }
        },
        {
          $lookup: {
            from: 'moments',
            localField: '_id',
            foreignField: 'workerId',
            as: 'moments'
          }
        },
        {
          $addFields: {
            feedbacks: {
              $filter: {
                input: '$feedbacks',
                as: 'feedback',
                cond: {
                  $and: [
                    { $gte: ['$$feedback.timestamp', dateFilter.timestamp.$gte] },
                    ...(dateFilter.timestamp.$lte ? [{ $lte: ['$$feedback.timestamp', dateFilter.timestamp.$lte] }] : []),
                    { $ne: ['$$feedback.sentimentScore', null] }
                  ]
                }
              }
            },
            moments: {
              $filter: {
                input: '$moments',
                as: 'moment',
                cond: {
                  $and: [
                    { $gte: ['$$moment.timestamp', dateFilter.timestamp.$gte] },
                    ...(dateFilter.timestamp.$lte ? [{ $lte: ['$$moment.timestamp', dateFilter.timestamp.$lte] }] : []),
                    { $ne: ['$$moment.sentimentScore', null] }
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            feedbackSentiments: {
              $map: {
                input: '$feedbacks',
                as: 'feedback',
                in: '$$feedback.sentimentScore'
              }
            },
            momentSentiments: {
              $map: {
                input: '$moments',
                as: 'moment',
                in: '$$moment.sentimentScore'
              }
            }
          }
        },
        {
          $group: {
            _id: '$department',
            totalWorkers: { $sum: 1 },
            totalFeedbacks: { $sum: { $size: '$feedbacks' } },
            totalMoments: { $sum: { $size: '$moments' } },
            allFeedbackSentiments: { $push: '$feedbackSentiments' },
            allMomentSentiments: { $push: '$momentSentiments' }
          }
        },
        {
          $addFields: {
            flattenedFeedbackSentiments: {
              $reduce: {
                input: '$allFeedbackSentiments',
                initialValue: [],
                in: { $concatArrays: ['$$value', '$$this'] }
              }
            },
            flattenedMomentSentiments: {
              $reduce: {
                input: '$allMomentSentiments',
                initialValue: [],
                in: { $concatArrays: ['$$value', '$$this'] }
              }
            }
          }
        },
        {
          $addFields: {
            combinedSentiments: {
              $concatArrays: ['$flattenedFeedbackSentiments', '$flattenedMomentSentiments']
            }
          }
        },
        {
          $addFields: {
            avgSentiment: {
              $cond: {
                if: { $gt: [{ $size: '$combinedSentiments' }, 0] },
                then: { $avg: '$combinedSentiments' },
                else: 0
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            totalWorkers: 1,
            totalFeedbacks: 1,
            totalMoments: 1,
            avgSentiment: 1
          }
        },
        { $match: { $or: [{ totalFeedbacks: { $gt: 0 } }, { totalMoments: { $gt: 0 } }] } },
        { $sort: { avgSentiment: -1 } }
      ])
    }

    // 4. WORKER PERFORMANCE (filtered) - based on source filter
    let workerPerformance = []
    
    if (source === 'feedback') {
      // Only feedback-based performance
      workerPerformance = await User.aggregate([
        { $match: { _id: { $in: userIds }, role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'feedbacks',
            localField: '_id',
            foreignField: 'workerId',
            as: 'feedbacks'
          }
        },
        {
          $addFields: {
            feedbacks: {
              $filter: {
                input: '$feedbacks',
                as: 'feedback',
                cond: {
                  $and: [
                    { $gte: ['$$feedback.timestamp', dateFilter.timestamp.$gte] },
                    ...(dateFilter.timestamp.$lte ? [{ $lte: ['$$feedback.timestamp', dateFilter.timestamp.$lte] }] : []),
                    ...(department ? [{ $eq: ['$$feedback.department', department] }] : [])
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            feedbackCount: { $size: '$feedbacks' },
            avgSentiment: {
              $avg: {
                $map: {
                  input: '$feedbacks',
                  as: 'feedback',
                  in: '$$feedback.sentimentScore'
                }
              }
            }
          }
        },
        { $match: { feedbackCount: { $gt: 0 } } },
        { $sort: { avgSentiment: -1 } }
      ])
    } else if (source === 'moments') {
      // Only moments-based performance
      workerPerformance = await User.aggregate([
        { $match: { _id: { $in: userIds }, role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'moments',
            localField: '_id',
            foreignField: 'workerId',
            as: 'moments'
          }
        },
        {
          $addFields: {
            moments: {
              $filter: {
                input: '$moments',
                as: 'moment',
                cond: {
                  $and: [
                    { $gte: ['$$moment.timestamp', dateFilter.timestamp.$gte] },
                    ...(dateFilter.timestamp.$lte ? [{ $lte: ['$$moment.timestamp', dateFilter.timestamp.$lte] }] : []),
                    ...(department ? [{ $eq: ['$$moment.department', department] }] : [])
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            momentCount: { $size: '$moments' },
            avgSentiment: {
              $avg: {
                $map: {
                  input: '$moments',
                  as: 'moment',
                  in: '$$moment.sentimentScore'
                }
              }
            }
          }
        },
        { $match: { momentCount: { $gt: 0 } } },
        { $sort: { avgSentiment: -1 } }
      ])
    } else {
      // Combined performance from both feedback and moments
      workerPerformance = await User.aggregate([
        { $match: { _id: { $in: userIds }, role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'feedbacks',
            localField: '_id',
            foreignField: 'workerId',
            as: 'feedbacks'
          }
        },
        {
          $lookup: {
            from: 'moments',
            localField: '_id',
            foreignField: 'workerId',
            as: 'moments'
          }
        },
        {
          $addFields: {
            feedbacks: {
              $filter: {
                input: '$feedbacks',
                as: 'feedback',
                cond: {
                  $and: [
                    { $gte: ['$$feedback.timestamp', dateFilter.timestamp.$gte] },
                    ...(dateFilter.timestamp.$lte ? [{ $lte: ['$$feedback.timestamp', dateFilter.timestamp.$lte] }] : []),
                    ...(department ? [{ $eq: ['$$feedback.department', department] }] : [])
                  ]
                }
              }
            },
            moments: {
              $filter: {
                input: '$moments',
                as: 'moment',
                cond: {
                  $and: [
                    { $gte: ['$$moment.timestamp', dateFilter.timestamp.$gte] },
                    ...(dateFilter.timestamp.$lte ? [{ $lte: ['$$moment.timestamp', dateFilter.timestamp.$lte] }] : []),
                    ...(department ? [{ $eq: ['$$moment.department', department] }] : [])
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            feedbackCount: { $size: '$feedbacks' },
            momentCount: { $size: '$moments' },
            totalDataPoints: { $add: [{ $size: '$feedbacks' }, { $size: '$moments' }] },
            avgSentiment: {
              $cond: {
                if: { $gt: [{ $add: [{ $size: '$feedbacks' }, { $size: '$moments' }] }, 0] },
                then: {
                  $avg: {
                    $concatArrays: [
                      {
                        $map: {
                          input: '$feedbacks',
                          as: 'feedback',
                          in: '$$feedback.sentimentScore'
                        }
                      },
                      {
                        $map: {
                          input: '$moments',
                          as: 'moment',
                          in: '$$moment.sentimentScore'
                        }
                      }
                    ]
                  }
                },
                else: 0
              }
            }
          }
        },
        { $match: { totalDataPoints: { $gt: 0 } } },
        { $sort: { avgSentiment: -1 } }
      ])
    }

    // Calculate overall sentiment based on source filter
    const feedbackAvg = feedbackSentimentStats[0]?.avgSentiment || 0
    const momentAvg = momentSentimentStats[0]?.avgSentiment || 0
    const feedbackCount = feedbackSentimentStats[0]?.totalAnalyzed || 0
    const momentCount = momentSentimentStats[0]?.totalAnalyzed || 0
    
    let overallAvgSentiment = 0
    let totalAnalyzed = 0
    
    if (source === 'feedback') {
      // Only use feedback data
      overallAvgSentiment = feedbackAvg
      totalAnalyzed = feedbackCount
    } else if (source === 'moments') {
      // Only use moments data
      overallAvgSentiment = momentAvg
      totalAnalyzed = momentCount
    } else {
      // Combined data from both sources
      if (feedbackCount > 0 && momentCount > 0) {
        // Both feedback and moments available
        overallAvgSentiment = (feedbackAvg + momentAvg) / 2
        totalAnalyzed = feedbackCount + momentCount
      } else if (feedbackCount > 0) {
        // Only feedback available
        overallAvgSentiment = feedbackAvg
        totalAnalyzed = feedbackCount
      } else if (momentCount > 0) {
        // Only moments available
        overallAvgSentiment = momentAvg
        totalAnalyzed = momentCount
      }
    }

    // 3. DAILY SENTIMENT TRENDS (filtered data) - based on source filter
    let dailyTrends = []
    
    if (source === 'feedback') {
      // Only feedback trends
      dailyTrends = await Feedback.aggregate([
        { $match: { ...feedbackFilter, sentimentScore: { $ne: null } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            avgSentiment: { $avg: '$sentimentScore' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    } else if (source === 'moments') {
      // Only moments trends
      dailyTrends = await Moment.aggregate([
        { $match: { ...momentFilter, sentimentScore: { $ne: null } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            avgSentiment: { $avg: '$sentimentScore' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    } else {
      // Combined trends for both feedback and moments
      const [feedbackTrends, momentTrends] = await Promise.all([
        Feedback.aggregate([
          { $match: { ...feedbackFilter, sentimentScore: { $ne: null } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              avgSentiment: { $avg: '$sentimentScore' },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        Moment.aggregate([
          { $match: { ...momentFilter, sentimentScore: { $ne: null } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              avgSentiment: { $avg: '$sentimentScore' },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ])
      
      // Combine trends by date
      const trendsMap = new Map()
      
      feedbackTrends.forEach(trend => {
        trendsMap.set(trend._id, {
          _id: trend._id,
          avgSentiment: trend.avgSentiment,
          count: trend.count,
          feedbackCount: trend.count,
          momentCount: 0
        })
      })
      
      momentTrends.forEach(trend => {
        if (trendsMap.has(trend._id)) {
          const existing = trendsMap.get(trend._id)
          existing.avgSentiment = (existing.avgSentiment * existing.feedbackCount + trend.avgSentiment * trend.count) / (existing.feedbackCount + trend.count)
          existing.count += trend.count
          existing.momentCount = trend.count
        } else {
          trendsMap.set(trend._id, {
            _id: trend._id,
            avgSentiment: trend.avgSentiment,
            count: trend.count,
            feedbackCount: 0,
            momentCount: trend.count
          })
        }
      })
      
      dailyTrends = Array.from(trendsMap.values()).sort((a, b) => a._id.localeCompare(b._id))
    }

    // 4. AUTOMATED INSIGHTS
    const insights = []
    
    // Only generate insights if we have actual data
    if (totalAnalyzed > 0) {
      if (overallAvgSentiment >= 75) {
        insights.push({
          type: 'positive',
          message: `Excellent sentiment performance across selected filters with ${Math.round(overallAvgSentiment)}% positive sentiment from ${totalAnalyzed} analyzed items.`
        })
      } else if (overallAvgSentiment >= 60) {
        insights.push({
          type: 'info',
          message: `Good sentiment performance with ${Math.round(overallAvgSentiment)}% positive sentiment across filters. Room for improvement to reach excellence.`
        })
      } else if (overallAvgSentiment >= 40) {
        insights.push({
          type: 'warning',
          message: `Neutral sentiment levels at ${Math.round(overallAvgSentiment)}% across selected filters. Consider targeted improvements.`
        })
      } else {
        insights.push({
          type: 'attention',
          message: `Sentiment analysis shows areas for improvement with ${Math.round(overallAvgSentiment)}% sentiment score across selected filters.`
        })
      }
      
      // Add filter-specific insights
      if (department && department !== 'all') {
        insights.push({
          type: 'info',
          message: `Analysis focused on ${department} department with ${totalAnalyzed} data points.`
        })
      }
    } else {
      insights.push({
        type: 'info',
        message: 'No sentiment data available for the selected filters. Try adjusting your filter criteria.'
      })
    }

    // Return comprehensive filtered analytics
    res.json({
      success: true,
      data: {
        executiveSummary: {
          totalFeedbacks,
          totalMoments,
          totalUsers,
          overallSentiment: Math.round(overallAvgSentiment)
        },
        sentimentOverview: {
          breakdown: sentimentBreakdown
        },
        trends: {
          daily: dailyTrends
        },
        performance: {
          departments: departmentAnalytics,
          workers: {
            topPerformers: workerPerformance.slice(0, 5),
            needsAttention: workerPerformance.filter(worker => worker.overallSentiment < 60 && (worker.totalMoments > 0 || worker.totalFeedbacks > 0)).slice(0, 3)
          }
        },
        insights,
        metadata: {
          generatedAt: new Date().toISOString(),
          timeRange,
          companyId: companyId.toString(),
          dateFilter,
          appliedFilters: {
            department: department || 'all',
            workerId: workerId || 'all',
            startDate,
            endDate
          }
        }
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

// Get real-time analytics data (lighter version for frequent updates)
export const getRealTimeAnalytics = async (req, res) => {
  try {
    console.log('⚡ Fetching real-time analytics for user:', req.user.id)
    
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' })
    }

    const companyId = user.company?._id
    if (!companyId) {
      return res.status(400).json({ error: 'User not associated with any company' })
    }

    // Get all users in the company
    const companyUsers = await User.find({ company: companyId }, '_id')
    const userIds = companyUsers.map(u => u._id)

    // Get real-time counts and averages (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const [recentFeedbacks, recentMoments, avgSentiment] = await Promise.all([
      Feedback.countDocuments({ 
        workerId: { $in: userIds }, 
        timestamp: { $gte: last24Hours } 
      }),
      Moment.countDocuments({ 
        workerId: { $in: userIds }, 
        timestamp: { $gte: last24Hours } 
      }),
      Feedback.aggregate([
        { 
          $match: { 
            workerId: { $in: userIds }, 
            timestamp: { $gte: last24Hours },
            sentimentScore: { $ne: null, $exists: true }
          } 
        },
        {
          $group: {
            _id: null,
            avgSentiment: { $avg: '$sentimentScore' },
            count: { $sum: 1 }
          }
        }
      ])
    ])

    const realTimeData = {
      recent24h: {
        feedbacks: recentFeedbacks,
        moments: recentMoments,
        avgSentiment: avgSentiment[0]?.avgSentiment || 0,
        totalWithSentiment: avgSentiment[0]?.count || 0
      },
      lastUpdated: new Date(),
      status: 'active'
    }

    console.log('✅ Real-time analytics generated successfully')
    res.json({ success: true, data: realTimeData })

  } catch (error) {
    console.error('❌ Error in getRealTimeAnalytics:', error)
    res.status(500).json({ 
      error: 'Failed to fetch real-time analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Export analytics data in CSV or JSON format
export const exportAnalyticsData = async (req, res) => {
  try {
    console.log('📤 Exporting analytics data for user:', req.user.id)
    
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' })
    }

    const companyId = user.company?._id
    if (!companyId) {
      return res.status(400).json({ error: 'User not associated with any company' })
    }

    const { format = 'json', type = 'summary' } = req.query

    // Get all users in the company
    const companyUsers = await User.find({ company: companyId })
    const userIds = companyUsers.map(u => u._id)

    let exportData = {}

    if (type === 'detailed') {
      // Export detailed data
      const [feedbacks, moments] = await Promise.all([
        Feedback.find({ workerId: { $in: userIds } })
          .populate('workerId', 'name email department')
          .sort({ timestamp: -1 })
          .lean(),
        Moment.find({ workerId: { $in: userIds } })
          .populate('workerId', 'name email department') 
          .sort({ timestamp: -1 })
          .lean()
      ])

      exportData = {
        feedbacks: feedbacks.map(f => ({
          id: f._id,
          worker: f.workerId?.name || 'Unknown',
          department: f.workerId?.department || 'N/A',
          feedback: f.feedback,
          sentimentScore: f.sentimentScore,
          sentimentLabel: f.sentimentLabel,
          timestamp: f.timestamp,
          source: f.source
        })),
        moments: moments.map(m => ({
          id: m._id,
          worker: m.workerId?.name || 'Unknown',
          department: m.workerId?.department || 'N/A',
          title: m.title,
          content: m.content,
          sentimentScore: m.sentimentScore,
          sentimentLabel: m.sentimentLabel,
          timestamp: m.timestamp
        }))
      }
    } else {
      // Export summary data
      const summary = await Feedback.aggregate([
        { $match: { workerId: { $in: userIds } } },
        {
          $group: {
            _id: null,
            totalFeedbacks: { $sum: 1 },
            avgSentiment: { $avg: '$sentimentScore' },
            positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
            neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
          }
        }
      ])

      exportData = {
        summary: summary[0] || {},
        exportedAt: new Date(),
        companyId: companyId.toString(),
        totalUsers: companyUsers.length
      }
    }

    if (format === 'csv') {
      // Convert to CSV format
      let csvData = ''
      if (type === 'detailed') {
        // CSV headers for feedbacks
        csvData = 'Type,Worker,Department,Content,Sentiment Score,Sentiment Label,Timestamp,Source\n'
        
        exportData.feedbacks.forEach(f => {
          csvData += `Feedback,"${f.worker}","${f.department}","${f.feedback}",${f.sentimentScore},"${f.sentimentLabel}","${f.timestamp}","${f.source}"\n`
        })
        
        exportData.moments.forEach(m => {
          csvData += `Moment,"${m.worker}","${m.department}","${m.title}: ${m.content}",${m.sentimentScore},"${m.sentimentLabel}","${m.timestamp}","App"\n`
        })
      } else {
        csvData = 'Metric,Value\n'
        csvData += `Total Feedbacks,${exportData.summary.totalFeedbacks || 0}\n`
        csvData += `Average Sentiment,${exportData.summary.avgSentiment || 0}\n`
        csvData += `Positive,${exportData.summary.positive || 0}\n`
        csvData += `Neutral,${exportData.summary.neutral || 0}\n`
        csvData += `Negative,${exportData.summary.negative || 0}\n`
        csvData += `Total Users,${exportData.totalUsers}\n`
      }

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${Date.now()}.csv"`)
      res.send(csvData)
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${Date.now()}.json"`)
      res.json({ success: true, data: exportData })
    }

    console.log('✅ Analytics data exported successfully')

  } catch (error) {
    console.error('❌ Error in exportAnalyticsData:', error)
    res.status(500).json({ 
      error: 'Failed to export analytics data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export {
  getAnalyticsData,
  getFilteredAnalytics
}
