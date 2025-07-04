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
