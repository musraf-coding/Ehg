import express from 'express'

import {
  getMyAssignedTenders,
} from '../controllers/tenderController.js'

import {
  protect,
} from '../middleware/authMiddleware.js'

import {
  requireRole,
} from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get(
  '/assigned',
  protect,
  requireRole('EMPLOYEE'),
  getMyAssignedTenders
)

export default router