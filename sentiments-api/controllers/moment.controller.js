import Moment from '../models/Moment.js'

export async function createMoment(req, res) {
  try {
    const { workerId, description, mediaType, submittedBy } = req.body
    const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    
    const moment = new Moment({ workerId, description, mediaUrl, mediaType, submittedBy })
    await moment.save()

    res.status(201).json({ message: 'Moment recorded successfully ✅', moment })
  } catch (err) {
    console.error('❌ Moment creation error:', err)
    res.status(500).json({ message: 'Failed to record moment', error: err.message })
  }
}

export async function getAllMoments(req, res) {
  try {
    const moments = await Moment.find().populate('workerId', 'name role')
    res.json(moments)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch moments', error: err.message })
  }
}
