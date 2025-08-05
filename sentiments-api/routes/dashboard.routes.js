import express from 'express'
import { getDashboardOverview, getUserProfile, getQuickActions } from '../controllers/dashboard.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

// Dashboard overview (requires authentication)
router.get('/overview', verifyToken, getDashboardOverview)

// User profile for dashboard (requires authentication)
router.get('/profile', verifyToken, getUserProfile)

// Quick actions for dashboard (requires authentication)
router.get('/quick-actions', verifyToken, getQuickActions)

export default router
