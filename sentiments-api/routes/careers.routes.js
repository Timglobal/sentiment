import express from 'express'
import multer from 'multer'
import { applyCareer, getAllApplications } from '../controllers/careers.controller.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// 📂 Configure Multer for CV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cvs') // store in /uploads/cvs
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // unique filename
  }
})
const upload = multer({ storage })

// 👤 Applicant submits a career application
router.post('/', upload.single('cv'), applyCareer)

// 🔒 Admin views all applications
router.get('/', verifyToken, requireAdmin, getAllApplications)

export default router
