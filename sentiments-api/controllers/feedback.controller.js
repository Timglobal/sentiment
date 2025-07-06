import Feedback from '../models/Feedback.js'
import Worker from '../models/worker.model.js'

export async function submitFeedback(req, res) {
  try {
    const { name, email, message, workerId, source } = req.body

    const worker = await Worker.findById(workerId)
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' })
    }

    const newFeedback = new Feedback( {
        senderName: name,
        workerName: worker.name,
        senderEmail: email,
        userId: null, // We'll add this later for authenticated users
        workerId,
        source,
        message
    })
    await newFeedback.save()
    res.status(201).json({ message: 'Feedback submitted successfully' })
  } catch (error) {
    console.error('❌ Feedback submission error:', error)
    res.status(500).json({ message: 'Failed to submit feedback', error })
  }
}

export async function getAllFeedbacks(req, res) {
  try {
    const feedbacks = await Feedback.find().populate('workerId', 'name role')
    .sort({ timestamp: -1})
    res.json(feedbacks)
  } catch (error) {
    console.error('❌ Failed to fetch feedbacks:', error)
    res.status(500).json({ message: 'Failed to fetch feedbacks' })
  }
}
