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

    // 3. TREND ANALYSIS - Daily sentiment trends over time
    const sentimentTrends = await Feedback.aggregate([
      { $match: feedbackFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          avgSentiment: { $avg: '$sentimentScore' },
          count: { $sum: 1 },
          positiveCount: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutralCount: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negativeCount: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      },
      { $sort: { '_id.date': 1 } },
      { $limit: 90 } // Last 90 days max
    ])

    // 4. DEPARTMENT ANALYSIS
    const departmentAnalysis = await Feedback.aggregate([
      { $match: feedbackFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'workerId',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: '$worker' },
      {
        $group: {
          _id: '$worker.department',
          avgSentiment: { $avg: '$sentimentScore' },
          totalFeedbacks: { $sum: 1 },
          positiveCount: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutralCount: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negativeCount: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } },
          workers: { $addToSet: '$workerId' }
        }
      },
      {
        $addFields: {
          workerCount: { $size: '$workers' },
          positivePercentage: { $multiply: [{ $divide: ['$positiveCount', '$totalFeedbacks'] }, 100] },
          negativePercentage: { $multiply: [{ $divide: ['$negativeCount', '$totalFeedbacks'] }, 100] }
        }
      },
      { $sort: { avgSentiment: -1 } }
    ])

    // 5. TOP AND BOTTOM PERFORMERS
    const workerPerformance = await Feedback.aggregate([
      { $match: feedbackFilter },
      {
        $group: {
          _id: '$workerId',
          avgSentiment: { $avg: '$sentimentScore' },
          totalFeedbacks: { $sum: 1 },
          positiveCount: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          negativeCount: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: '$worker' },
      {
        $project: {
          _id: 1,
          name: '$worker.name',
          department: '$worker.department',
          role: '$worker.role',
          avgSentiment: 1,
          totalFeedbacks: 1,
          positiveCount: 1,
          negativeCount: 1,
          positivePercentage: { $multiply: [{ $divide: ['$positiveCount', '$totalFeedbacks'] }, 100] }
        }
      },
      { $match: { totalFeedbacks: { $gte: 3 } } }, // Only workers with at least 3 feedbacks
      { $sort: { avgSentiment: -1 } }
    ])

    // 6. SENTIMENT SOURCE ANALYSIS (patient vs colleague feedback)
    const sourceAnalysis = await Feedback.aggregate([
      { $match: feedbackFilter },
      {
        $group: {
          _id: '$source',
          avgSentiment: { $avg: '$sentimentScore' },
          totalFeedbacks: { $sum: 1 },
          positiveCount: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutralCount: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negativeCount: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          positivePercentage: { $multiply: [{ $divide: ['$positiveCount', '$totalFeedbacks'] }, 100] }
        }
      }
    ])

    // 7. WEEKLY COMPARISON
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))

    const [thisWeekStats, lastWeekStats] = await Promise.all([
      Feedback.aggregate([
        { 
          $match: { 
            workerId: { $in: userIds },
            timestamp: { $gte: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: null,
            avgSentiment: { $avg: '$sentimentScore' },
            totalFeedbacks: { $sum: 1 },
            positiveCount: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } }
          }
        }
      ]),
      Feedback.aggregate([
        { 
          $match: { 
            workerId: { $in: userIds },
            timestamp: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: null,
            avgSentiment: { $avg: '$sentimentScore' },
            totalFeedbacks: { $sum: 1 },
            positiveCount: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } }
          }
        }
      ])
    ])

    // 8. HOURLY ANALYSIS for peak times
    const hourlyAnalysis = await Feedback.aggregate([
      { $match: feedbackFilter },
      {
        $group: {
          _id: { hour: { $hour: '$timestamp' } },
          avgSentiment: { $avg: '$sentimentScore' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.hour': 1 } }
    ])

    // Calculate growth metrics
    const thisWeek = thisWeekStats[0] || { avgSentiment: 0, totalFeedbacks: 0, positiveCount: 0 }
    const lastWeek = lastWeekStats[0] || { avgSentiment: 0, totalFeedbacks: 0, positiveCount: 0 }
    
    const sentimentGrowth = lastWeek.avgSentiment > 0 
      ? ((thisWeek.avgSentiment - lastWeek.avgSentiment) / lastWeek.avgSentiment * 100) 
      : 0
    const feedbackGrowth = lastWeek.totalFeedbacks > 0 
      ? ((thisWeek.totalFeedbacks - lastWeek.totalFeedbacks) / lastWeek.totalFeedbacks * 100) 
      : 0

    // Prepare response
    const analytics = {
      summary: {
        totalFeedbacks,
        totalMoments,
        totalUsers,
        companyName: user.company?.name || 'Company',
        analysisTimeRange: timeRange,
        generatedAt: new Date().toISOString()
      },
      sentimentOverview: {
        feedbacks: feedbackSentimentStats[0] || null,
        moments: momentSentimentStats[0] || null,
        combined: {
          avgSentiment: feedbackSentimentStats[0] && momentSentimentStats[0] 
            ? (feedbackSentimentStats[0].avgSentiment + momentSentimentStats[0].avgSentiment) / 2
            : feedbackSentimentStats[0]?.avgSentiment || momentSentimentStats[0]?.avgSentiment || 0,
          totalAnalyzed: (feedbackSentimentStats[0]?.totalAnalyzed || 0) + (momentSentimentStats[0]?.totalAnalyzed || 0)
        }
      },
      trends: {
        daily: sentimentTrends,
        weekly: {
          thisWeek,
          lastWeek,
          sentimentGrowth: Math.round(sentimentGrowth * 100) / 100,
          feedbackGrowth: Math.round(feedbackGrowth * 100) / 100
        },
        hourly: hourlyAnalysis
      },
      departmentAnalysis,
      workerPerformance: {
        topPerformers: workerPerformance.slice(0, 5),
        needsAttention: workerPerformance.slice(-5).reverse(),
        all: workerPerformance
      },
      sourceAnalysis,
      insights: generateInsights(feedbackSentimentStats[0], departmentAnalysis, workerPerformance, sourceAnalysis)
    }

    res.json(analytics)

  } catch (error) {
    console.error('❌ Analytics fetch error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      message: error.message 
    })
  }
}

// Generate actionable insights from the data
function generateInsights(sentimentStats, departmentStats, workerStats, sourceStats) {
  const insights = []
  
  if (sentimentStats) {
    const avgSentiment = sentimentStats.avgSentiment || 0
    
    if (avgSentiment >= 75) {
      insights.push({
        type: 'positive',
        title: 'Excellent Overall Sentiment',
        description: `Your team maintains an excellent sentiment score of ${Math.round(avgSentiment)}%. Keep up the great work!`,
        priority: 'low'
      })
    } else if (avgSentiment <= 50) {
      insights.push({
        type: 'warning',
        title: 'Sentiment Needs Attention',
        description: `Overall sentiment is at ${Math.round(avgSentiment)}%. Consider team meetings or feedback sessions.`,
        priority: 'high'
      })
    }
  }

  // Department insights
  if (departmentStats.length > 1) {
    const bestDept = departmentStats[0]
    const worstDept = departmentStats[departmentStats.length - 1]
    
    if (bestDept.avgSentiment - worstDept.avgSentiment > 20) {
      insights.push({
        type: 'info',
        title: 'Department Performance Variance',
        description: `${bestDept._id} (${Math.round(bestDept.avgSentiment)}%) significantly outperforms ${worstDept._id} (${Math.round(worstDept.avgSentiment)}%). Consider sharing best practices.`,
        priority: 'medium'
      })
    }
  }

  // Worker performance insights
  if (workerStats.length > 0) {
    const needsAttention = workerStats.filter(w => w.avgSentiment < 50)
    if (needsAttention.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Staff Requiring Support',
        description: `${needsAttention.length} team member(s) have sentiment scores below 50%. Consider one-on-one meetings.`,
        priority: 'high'
      })
    }
  }

  // Source analysis insights
  if (sourceStats.length > 1) {
    const patientFeedback = sourceStats.find(s => s._id === 'patient')
    const colleagueFeedback = sourceStats.find(s => s._id === 'colleague')
    
    if (patientFeedback && colleagueFeedback) {
      const diff = patientFeedback.avgSentiment - colleagueFeedback.avgSentiment
      if (Math.abs(diff) > 15) {
        insights.push({
          type: 'info',
          title: 'Feedback Source Variance',
          description: `${diff > 0 ? 'Patient' : 'Colleague'} feedback is significantly more positive. This indicates ${diff > 0 ? 'strong patient relations' : 'good team dynamics'}.`,
          priority: 'medium'
        })
      }
    }
  }

  return insights
}

// Get real-time analytics updates
export const getRealTimeAnalytics = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const companyId = user.company?._id
    const companyUsers = await User.find({ company: companyId }, '_id')
    const userIds = companyUsers.map(u => u._id)

    // Get recent data (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const [recentFeedbacks, recentMoments] = await Promise.all([
      Feedback.find({ 
        workerId: { $in: userIds },
        timestamp: { $gte: oneDayAgo }
      }).populate('workerId', 'name department').sort({ timestamp: -1 }).limit(10),
      
      Moment.find({ 
        workerId: { $in: userIds },
        timestamp: { $gte: oneDayAgo }
      }).populate('workerId', 'name department').sort({ timestamp: -1 }).limit(10)
    ])

    // Calculate recent sentiment averages
    const recentAvgSentiment = recentFeedbacks.length > 0 
      ? recentFeedbacks.reduce((sum, f) => sum + (f.sentimentScore || 0), 0) / recentFeedbacks.length
      : 0

    res.json({
      timestamp: new Date().toISOString(),
      recentFeedbacks,
      recentMoments,
      recentAvgSentiment: Math.round(recentAvgSentiment * 100) / 100,
      totalRecentActivities: recentFeedbacks.length + recentMoments.length
    })

  } catch (error) {
    console.error('❌ Real-time analytics error:', error)
    res.status(500).json({ error: 'Failed to fetch real-time data' })
  }
}

// Export analytics data
export const exportAnalyticsData = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { format = 'json', startDate, endDate } = req.query
    const companyId = user.company?._id
    const companyUsers = await User.find({ company: companyId }, '_id')
    const userIds = companyUsers.map(u => u._id)

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    }

    const [feedbacks, moments] = await Promise.all([
      Feedback.find({ workerId: { $in: userIds }, ...dateFilter })
        .populate('workerId', 'name department role')
        .sort({ timestamp: -1 }),
      Moment.find({ workerId: { $in: userIds }, ...dateFilter })
        .populate('workerId', 'name department role')
        .sort({ timestamp: -1 })
    ])

    const exportData = {
      company: user.company?.name || 'Company',
      exportDate: new Date().toISOString(),
      dateRange: { startDate, endDate },
      feedbacks: feedbacks.map(f => ({
        id: f._id,
        workerName: f.workerId?.name,
        department: f.workerId?.department,
        senderName: f.senderName,
        source: f.source,
        message: f.message,
        sentimentScore: f.sentimentScore,
        timestamp: f.timestamp
      })),
      moments: moments.map(m => ({
        id: m._id,
        workerName: m.workerId?.name,
        department: m.workerId?.department,
        mediaType: m.mediaType,
        extractedText: m.extractedText,
        sentimentScore: m.sentimentScore,
        timestamp: m.timestamp
      }))
    }

    if (format === 'csv') {
      // Convert to CSV format
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv')
      
      let csv = 'Type,Worker Name,Department,Sentiment Score,Timestamp,Content\n'
      
      exportData.feedbacks.forEach(f => {
        csv += `Feedback,"${f.workerName}","${f.department}",${f.sentimentScore},"${f.timestamp}","${f.message?.replace(/"/g, '""')}"\n`
      })
      
      exportData.moments.forEach(m => {
        csv += `Moment,"${m.workerName}","${m.department}",${m.sentimentScore},"${m.timestamp}","${m.extractedText?.replace(/"/g, '""')}"\n`
      })
      
      res.send(csv)
    } else {
      res.json(exportData)
    }

  } catch (error) {
    console.error('❌ Export error:', error)
    res.status(500).json({ error: 'Failed to export data' })
  }
}
