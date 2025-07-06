import express from 'express'
import { loginUser, registerUser, getAllUsers } from '../controllers/auth.controller.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'
const router = express.Router()

router.post('/login', loginUser)
router.post('/register', registerUser)

router.get('/users', verifyToken, requireAdmin, getAllUsers)

export default router
