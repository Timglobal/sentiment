import express from 'express'
import { createMoment, getAllMoments } from '../controllers/moment.controller.js'
import { upload } from '../middleware/upload.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', verifyToken, requireAdmin, upload.single('media'), createMoment)
router.get('/', verifyToken, requireAdmin, getAllMoments)

export default router
