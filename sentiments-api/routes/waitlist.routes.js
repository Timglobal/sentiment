import express from 'express'
import { joinWaitlist, getWaitlist} from '../controllers/waitlist.controller.js'

const router = express.Router()

router.post('/', joinWaitlist)
router.get('/', getWaitlist)

export default router