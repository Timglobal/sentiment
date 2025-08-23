import Contact from '../models/Contact.js'
import { isValidPhoneNumber } from 'libphonenumber-js';
import { sendWhatsAppMessage } from '../utils/whatsapp.js';
import { sendContactNotification, sendUserConfirmation } from '../utils/email.js';

export const submitMessage = async (req, res) => {
  const { name, email, company, whatsapp, message } = req.body;

  try {
    // ✅ Validate phone number format
    if (!isValidPhoneNumber(whatsapp)) {
      return res.status(400).json({ message: 'Invalid WhatsApp number format' });
    }

    // ✅ Save to DB
    const newMessage = new Contact({ name, email, company, whatsapp, message });
    await newMessage.save();

    // ✅ Run notifications in parallel and ignore individual failures
    await Promise.allSettled([
      sendWhatsAppMessage(
        whatsapp,
        `Hello ${name} from ${company}, concerning this "${message}", let's continue conversation here.`
      ),
      sendContactNotification({ name, email, company, whatsapp, message }),
      sendUserConfirmation({ name, email, message })
    ]);


    res.status(201).json({
      message: 'Message submitted, WhatsApp reply sent, and email notification delivered',
    });
    } catch (err) {
    console.error("Error in submitMessage:", err);
    res.status(500).json({ message: err.message || "Error submitting message" });
  }

};


export const getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve messages' })
  }
}