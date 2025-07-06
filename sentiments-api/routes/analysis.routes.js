import express from 'express'
import { generateAnalysis, getAllAnalyses } from '../controllers/analysis.controller.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Protected routes
router.post('/run', verifyToken, requireAdmin, generateAnalysis)
router.get('/', verifyToken, requireAdmin, getAllAnalyses)

export default router
