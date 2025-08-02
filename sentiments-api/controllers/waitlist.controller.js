// controllers/waitlist.controller.js
import Waitlist from '../models/Waitlist.js'
import { sendRoomNotification } from '../utils/email.js'

console.log('🔔 joinWaitlist API HIT');

export const joinWaitlist = async (req, res) => {
  const { name, email, company, purpose, feedback } = req.body

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and Email are required.' })
  }

  try {
    const newEntry = new Waitlist({ name, email, company, purpose, feedback })
    await newEntry.save()
    console.log('🧾 Saved to DB: ', newEntry)

    console.log('✅ New waitlist entry saved, preparing to send email...');

    const subject = "You're on the Timglobal Waitlist!"
    const message = `Hello ${name},\n\nThanks for joining the Timglobal waitlist! We’ll let you know as soon as our app is ready.\n\n— The Timglobal Team`


    console.log('🟡 About to call sendRoomNotification with:', email, subject)
    await sendRoomNotification(email, subject, message)
    console.log('✅ Finished calling sendRoomNotification')


    res.status(201).json({ message: 'Successfully added to waitlist!' })
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'You are already on the waitlist.' })
    } else {
      console.error(err)
      res.status(500).json({ message: 'Server error.' })
    }
  }
}
export const getWaitlist = async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ createdAt: -1 }) // latest first
    res.status(200).json(entries)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch waitlist' })
  }
}
