import Career from "../models/careers.js";
import { isValidPhoneNumber } from "libphonenumber-js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";
import { sendCareerNotification, sendCareerConfirmation } from "../utils/email.js";

// POST /api/careers
export const applyCareer = async (req, res) => {
  try {
    const { name, email, whatsapp, role, level, coverletter } = req.body;
    const cvFile = req.file; // uploaded CV file

    if (!cvFile) {
      return res.status(400).json({ error: "CV file is required" });
    }

    // ✅ Validate phone number format
    if (!isValidPhoneNumber(whatsapp)) {
      return res.status(400).json({ message: "Invalid WhatsApp number format" });
    }

    // ✅ Save applicant in DB
    const newCareer = new Career({
    name,
    email,
    whatsapp,
    role,
    level,
    coverletter,
    cv: cvFile.filename,
    });

    await newCareer.save();

    // ✅ Run notifications in parallel (only once)
    await Promise.allSettled([
    sendWhatsAppMessage(
        whatsapp,
        `Hi ${name}, we received your application for "${role}" (${level}). Our team will contact you soon.`
    ),
    sendCareerNotification({
        name,
        email,
        whatsapp,
        role,
        level,
        coverletter,
        cv: cvFile.path, // use file path here for attachment
    }),
    sendCareerConfirmation({ name, email, role, level })
    ]);


    res.status(201).json({
      message: "Application submitted, WhatsApp reply sent, and emails delivered",
    });
  } catch (err) {
    console.error("Career application error:", err.response?.data || err.message);
    res.status(500).json({ error: "Server error, please try again later." });
  }
};

// GET /api/careers
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Career.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve applications" });
  }
};

