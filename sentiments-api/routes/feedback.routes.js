import express from 'express'
import { submitFeedback, getAllFeedbacks } from '../controllers/feedback.controller.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'


const router = express.Router()

router.post('/', submitFeedback)
router.get('/', verifyToken, requireAdmin, getAllFeedbacks)

export default router
