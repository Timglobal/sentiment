import express from 'express'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'
import { 
  getComprehensiveAnalytics,
  getFilteredAnalytics,
  getRealTimeAnalytics,
  exportAnalyticsData
} from '../controllers/analytics.controller.js'

const router = express.Router()

// Admin-only analytics routes
router.get('/', verifyToken, requireAdmin, getComprehensiveAnalytics)
router.get('/filtered', verifyToken, requireAdmin, getFilteredAnalytics)
router.get('/realtime', verifyToken, requireAdmin, getRealTimeAnalytics)
router.get('/export', verifyToken, requireAdmin, exportAnalyticsData)

export default router
