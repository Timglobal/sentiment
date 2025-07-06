import Contact from '../models/Contact.js'

export const submitMessage = async (req, res) => {
  const { name, email, message } = req.body

  try {
    const newMessage = new Contact({ name, email, message })
    await newMessage.save()
    res.status(201).json({ message: 'Message submitted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error submitting message' })
  }
}

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve messages' })
  }
}