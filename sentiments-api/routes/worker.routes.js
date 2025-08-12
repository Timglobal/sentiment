import express from 'express'
import {
  createWorker,
  getWorkers,
  updateWorker,
  deleteWorker
} from '../controllers/worker.controller.js'

import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'


const router = express.Router()

router.get('/', verifyToken, getWorkers)

// Admin-only routes
router.post('/', verifyToken, requireAdmin, createWorker)
router.put('/:id', verifyToken, requireAdmin, updateWorker)
router.delete('/:id', verifyToken, requireAdmin, deleteWorker)

export default router
