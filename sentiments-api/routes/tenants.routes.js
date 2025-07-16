import express from 'express'
import { getTenantsByRoom } from '../controllers/tenant.controller.js'

const router = express.Router();

router.get('/', getTenantsByRoom)

export default router