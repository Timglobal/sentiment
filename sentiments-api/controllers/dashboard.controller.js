import User from '../models/User.js'
import Moment from '../models/Moment.js'
import Feedback from '../models/Feedback.js'
import Company from '../models/Company.js'

// Get dashboard overview data
export const getDashboardOverview = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard overview for user:', req.user.id)
    
    const userId = req.user.id
    const user = await User.findById(userId).populate('company')
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // For admin users, get company-wide data; for staff/patients, get personal data
    const isAdmin = user.role === 'admin'
    const companyId = user.company?._id
    
    let feedbackFilter = {}
    let momentFilter = {}
    let userFilter = {}
    
    if (isAdmin && companyId) {
      // Admin sees company-wide data
      const companyUsers = await User.find({ company: companyId }, '_id')
      const userIds = companyUsers.map(u => u._id)
      
      feedbackFilter = { workerId: { $in: userIds } }
      momentFilter = { workerId: { $in: userIds } }
      userFilter = { company: companyId, role: { $ne: 'admin' } }
    } else {
      // Staff/Patient sees only their own data
      feedbackFilter = { workerId: userId }
      momentFilter = { workerId: userId }
      userFilter = { _id: userId }
    }
    
    // Get total counts
    const [totalFeedbacks, totalMoments, totalUsers] = await Promise.all([
      Feedback.countDocuments(feedbackFilter),
      Moment.countDocuments(momentFilter),
      User.countDocuments(userFilter)
    ])
    
    // Get sentiment analysis for feedbacks
    const feedbackSentimentStats = await Feedback.aggregate([
      { $match: { ...feedbackFilter, sentimentScore: { $ne: null, $exists: true } } },
      {
        $group: {
          _id: null,
          averageSentiment: { $avg: '$sentimentScore' },
          total: { $sum: 1 },
          positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      }
    ])
    
    // Get moment sentiment analysis
    const momentSentimentStats = await Moment.aggregate([
      { $match: { ...momentFilter, sentimentScore: { $ne: null, $exists: true } } },
      {
        $group: {
          _id: null,
          averageSentiment: { $avg: '$sentimentScore' },
          total: { $sum: 1 },
          positive: { $sum: { $cond: [{ $gte: ['$sentimentScore', 60] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $and: [{ $gte: ['$sentimentScore', 40] }, { $lt: ['$sentimentScore', 60] }] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $lt: ['$sentimentScore', 40] }, 1, 0] } }
        }
      }
    ])
    
    // Calculate combined sentiment
    const feedbackSentiment = feedbackSentimentStats[0] || { averageSentiment: 0, positive: 0, total: 0 }
    const momentSentiment = momentSentimentStats[0] || { averageSentiment: 0, positive: 0, total: 0 }
    
    const totalWithSentiment = feedbackSentiment.total + momentSentiment.total
    const totalPositive = feedbackSentiment.positive + momentSentiment.positive
    const positivePercentage = totalWithSentiment > 0 ? Math.round((totalPositive / totalWithSentiment) * 100) : 0
    
    const combinedAverageSentiment = totalWithSentiment > 0 
      ? ((feedbackSentiment.averageSentiment * feedbackSentiment.total) + (momentSentiment.averageSentiment * momentSentiment.total)) / totalWithSentiment
      : 0
    
    // Get recent activities (last 10 feedbacks and moments)
    const [recentFeedbacks, recentMoments] = await Promise.all([
      Feedback.find(feedbackFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('workerId', 'name')
        .select('message sentimentScore createdAt workerId'),
      Moment.find(momentFilter)
        .sort({ timestamp: -1 })
        .limit(5)
        .populate('workerId', 'name')
        .select('description sentimentScore timestamp workerId mediaType')
    ])
    
    // Format recent activities
    const recentActivities = [
      ...recentFeedbacks.map(feedback => ({
        id: feedback._id,
        type: 'feedback',
        title: `${feedback.workerId?.name || 'Someone'} submitted feedback`,
        description: feedback.message?.substring(0, 100) + (feedback.message?.length > 100 ? '...' : '') || 'Feedback submitted',
        time: feedback.createdAt,
        sentiment: feedback.sentimentScore,
        userInfo: feedback.workerId
      })),
      ...recentMoments.map(moment => ({
        id: moment._id,
        type: 'moment',
        title: `${moment.workerId?.name || 'Someone'} shared a moment`,
        description: moment.description?.substring(0, 100) + (moment.description?.length > 100 ? '...' : '') || `${moment.mediaType || 'Media'} moment shared`,
        time: moment.timestamp,
        sentiment: moment.sentimentScore,
        userInfo: moment.workerId
      }))
    ]
    
    // Sort by time and take latest 10
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time))
    const latestActivities = recentActivities.slice(0, 10)
    
    // Get additional metrics
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - 7)
    
    const [weeklyFeedbacks, weeklyMoments] = await Promise.all([
      Feedback.countDocuments({ ...feedbackFilter, createdAt: { $gte: thisWeekStart } }),
      Moment.countDocuments({ ...momentFilter, timestamp: { $gte: thisWeekStart } })
    ])
    
    const dashboardData = {
      statistics: {
        totalFeedbacks,
        totalMoments,
        totalUsers: isAdmin ? totalUsers : 1, // For non-admin, just show 1 (themselves)
        totalWorkers: totalUsers, // Keep this for backward compatibility
        positivePercentage,
        averageSentiment: Math.round(combinedAverageSentiment * 10) / 10,
        weeklyFeedbacks,
        weeklyMoments,
        sentimentAnalysis: {
          feedbacks: feedbackSentiment,
          moments: momentSentiment,
          combined: {
            total: totalWithSentiment,
            positive: totalPositive,
            neutral: (feedbackSentiment.neutral || 0) + (momentSentiment.neutral || 0),
            negative: (feedbackSentiment.negative || 0) + (momentSentiment.negative || 0)
          }
        }
      },
      recentActivities: latestActivities,
      userContext: {
        isAdmin,
        companyName: user.company?.companyName || 'Your Organization',
        companyId: user.company?._id
      }
    }
    
    console.log('✅ Dashboard overview fetched successfully')
    res.json(dashboardData)
    
  } catch (error) {
    console.error('❌ Error fetching dashboard overview:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard overview', details: error.message })
  }
}

// Get user profile data for dashboard
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    console.log('👤 Fetching user profile for dashboard:', userId)
    
    const user = await User.findById(userId)
      .select('-password -resetToken -resetTokenExpires')
      .populate('company', 'companyName companyAddress companyId')
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Add additional profile information
    const profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      note: user.note,
      avatar: user.avatar,
      company: user.company ? {
        _id: user.company._id,
        name: user.company.companyName,
        address: user.company.companyAddress,
        companyId: user.company.companyId
      } : null,
      // Add user-specific stats
      personalStats: {
        feedbacksSubmitted: await Feedback.countDocuments({ workerId: userId }),
        momentsShared: await Moment.countDocuments({ workerId: userId }),
        lastActivity: await getLastActivity(userId)
      }
    }
    
    console.log('✅ User profile fetched successfully')
    res.json(profileData)
    
  } catch (error) {
    console.error('❌ Error fetching user profile:', error)
    res.status(500).json({ error: 'Failed to fetch user profile', details: error.message })
  }
}

// Helper function to get user's last activity
const getLastActivity = async (userId) => {
  try {
    const [lastFeedback, lastMoment] = await Promise.all([
      Feedback.findOne({ workerId: userId }).sort({ createdAt: -1 }).select('createdAt'),
      Moment.findOne({ workerId: userId }).sort({ timestamp: -1 }).select('timestamp')
    ])
    
    const feedbackTime = lastFeedback?.createdAt
    const momentTime = lastMoment?.timestamp
    
    if (!feedbackTime && !momentTime) return null
    if (!feedbackTime) return momentTime
    if (!momentTime) return feedbackTime
    
    return feedbackTime > momentTime ? feedbackTime : momentTime
  } catch (error) {
    console.error('Error getting last activity:', error)
    return null
  }
}

// Get quick actions data (for action cards)
export const getQuickActions = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const actions = []
    
    // Always available actions
    actions.push({
      id: 'submit-feedback',
      title: 'Submit Feedback',
      description: 'Share your thoughts and experiences',
      icon: 'MessageSquare',
      route: '/dashboard/submit-feedback',
      color: 'blue',
      available: true
    })
    
    actions.push({
      id: 'upload-moment',
      title: 'Upload Moment',
      description: 'Share a special moment with your team',
      icon: 'Plus',
      route: '/dashboard/upload-moment',
      color: 'green',
      available: true
    })
    
    // Admin-only actions
    if (user.role === 'admin') {
      actions.push({
        id: 'manage-workers',
        title: 'Manage Workers',
        description: 'Add, edit, or remove team members',
        icon: 'Users',
        route: '/dashboard/manage-workers',
        color: 'purple',
        available: true
      })
      
      actions.push({
        id: 'view-analytics',
        title: 'View Analytics',
        description: 'Analyze sentiment and performance',
        icon: 'BarChart3',
        route: '/dashboard/analytics',
        color: 'orange',
        available: true
      })
    }
    
    res.json({ actions })
    
  } catch (error) {
    console.error('❌ Error fetching quick actions:', error)
    res.status(500).json({ error: 'Failed to fetch quick actions' })
  }
}
