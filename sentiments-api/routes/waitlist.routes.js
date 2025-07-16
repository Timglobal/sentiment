import express from 'express'
import { joinWaitlist, getWaitlist} from '../controllers/waitlist.controller.js'

const router = express.Router()

router.post('/waitlist', joinWaitlist)
router.get('/waitlist', getWaitlist)

export default router