import express from 'express'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'
import { 
  getAnalyticsData, 
  getFilteredAnalytics 
} from '../controllers/analytics.controller.js'

const router = express.Router()

// Admin-only analytics routes
router.get('/', verifyToken, requireAdmin, getAnalyticsData)
router.get('/filtered', verifyToken, requireAdmin, getFilteredAnalytics)

export default router
