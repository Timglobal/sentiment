import Analysis from '../models/Analysis.js'
import Feedback from '../models/Feedback.js'
import Moment from '../models/Moment.js'
import User from '../models/User.js'

function simulateAnalysis(worker, feedbacks, moments) {
  const keywords = []
  let score = 50

  feedbacks.forEach(fb => {
    const msg = fb.message.toLowerCase()
    if (msg.includes('late') || msg.includes('rude') || msg.includes('sad') || msg.includes('angry') || msg.includes('terrible') || msg.includes('bad') || msg.includes('negative') || msg.includes('poor') || msg.includes('unprofessional')) {
      score -= 15
      keywords.push('negative')
    }
    if (msg.includes('excellent') || msg.includes('good') || msg.includes('compassionate') || msg.includes('helpful') || msg.includes('kind') || msg.includes('positive') || msg.includes('professional') || msg.includes('great') || msg.includes('amazing') || msg.includes('outstanding') || msg.includes('dutiful') || msg.includes('dedicated')) {
      score += 10
      keywords.push('positive')
    }
  })

  const risk = score < 40 ? 'high' : score < 70 ? 'medium' : 'low'
  return {
    sentimentScore: Math.max(0, Math.min(100, score)),
    riskLevel: risk,
    keywordSummary: [...new Set(keywords)]
  }
}

export async function generateAnalysis(req, res) {
  try {
    console.log('🔄 Starting sentiment analysis generation...')
    
    const workers = await User.find({ role: { $ne: 'admin' } })
    console.log(`📊 Found ${workers.length} workers to analyze`)

    for (const worker of workers) {
      const feedbacks = await Feedback.find({ workerId: worker._id })
      const moments = await Moment.find({ workerId: worker._id })

      console.log(`📈 Analyzing worker ${worker.name}: ${feedbacks.length} feedbacks, ${moments.length} moments`)

      // Update feedbacks with sentiment scores
      for (const feedback of feedbacks) {
        if (!feedback.sentimentScore && feedback.message) {
          const { sentimentScore } = simulateAnalysis(worker, [feedback], [])
          feedback.sentimentScore = sentimentScore
          await feedback.save()
        }
      }

      // Update moments with sentiment scores  
      for (const moment of moments) {
        if (!moment.sentimentScore) {
          // Simulate sentiment for moments based on media type
          let score = 50 + (Math.random() - 0.5) * 40 // Random between 30-70
          if (moment.mediaType === 'video') score += 10 // Videos tend to be more positive
          moment.sentimentScore = Math.max(0, Math.min(100, score))
          await moment.save()
        }
      }

      const { sentimentScore, riskLevel, keywordSummary } = simulateAnalysis(worker, feedbacks, moments)

      const existing = await Analysis.findOne({ workerId: worker._id })

      const newStats = {
        feedbackCount: feedbacks.length,
        momentCount: moments.length,
        videoCount: moments.filter(m => m.mediaType === 'video').length,
        keywordSummary
      }

      if (existing) {
        existing.sentimentScore = sentimentScore
        existing.riskLevel = riskLevel
        existing.stats = newStats
        existing.lastAnalysis = new Date()
        await existing.save()
      } else {
        await Analysis.create({
          workerId: worker._id,
          sentimentScore,
          riskLevel,
          stats: newStats
        })
      }
    }

    console.log('✅ Sentiment analysis completed for all workers')
    res.status(200).json({ 
      message: 'Analysis updated for all workers',
      workersAnalyzed: workers.length 
    })
  } catch (err) {
    console.error('❌ Error running analysis:', err)
    res.status(500).json({ message: 'Failed to run analysis', error: err.message })
  }
}

export async function getAllAnalyses(req, res) {
  try {
    const data = await Analysis.find().populate('workerId', 'name role')
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analysis', error: err.message })
  }
}
