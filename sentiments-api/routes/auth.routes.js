import express from 'express'
import { loginUser, registerUser, getAllUsers } from '../controllers/auth.controller.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'
import { forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import { getUploader } from '../middleware/upload.js'

const avatarUpload = getUploader('avatars')
const router = express.Router()

router.post('/login', loginUser)
router.post('/register', avatarUpload.single('avatar'), registerUser)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.get('/users', verifyToken, requireAdmin, getAllUsers)

export default router
