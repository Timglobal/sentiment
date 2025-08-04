import express from 'express'
import { submitFeedback, getAllFeedbacks, getFeedbackStats } from '../controllers/feedback.controller.js'
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.middleware.js'


const router = express.Router()

// Public route with optional auth (to capture user ID if logged in)
router.post('/', optionalAuth, submitFeedback)
router.get('/', verifyToken, requireAdmin, getAllFeedbacks)
router.get('/stats', verifyToken, requireAdmin, getFeedbackStats)

export default router
