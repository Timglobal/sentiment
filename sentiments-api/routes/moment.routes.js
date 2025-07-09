import express from 'express'
import { createMoment, getAllMoments } from '../controllers/moment.controller.js'
import { getUploader } from '../middleware/upload.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'
const momentUpload = getUploader('moments')

const router = express.Router()

router.post('/', verifyToken, requireAdmin, momentUpload.single('media'), createMoment)
router.get('/', verifyToken, requireAdmin, getAllMoments)

export default router
