import express from 'express'
import { submitMessage , getAllMessages} from '../controllers/contact.controller.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', submitMessage)
router.get('/', verifyToken, requireAdmin, getAllMessages)

export default router
