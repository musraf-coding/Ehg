import express from 'express'

import {
  listTenders,
  getTenderDetails,
  createNewTender,
  updateTender,
  assignTender,
   listAssignableEmployees,
   listMyAssignedTenders,
} from '../controllers/tenderController.js'


import { protect } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

// All tender routes require authentication
router.use(protect)

router.get(
  '/assignable-employees',
  requireRole('ADMIN', 'MANAGER'),
  listAssignableEmployees
)

router.get(
  '/assigned',
  requireRole('EMPLOYEE'),
  listMyAssignedTenders
)

// ADMIN + MANAGER can view all tenders
router.get(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  listTenders
)


// ADMIN + MANAGER can view tender details
router.get(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  getTenderDetails
)

// ADMIN + MANAGER can create tenders
router.post(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  createNewTender
)

// ADMIN + MANAGER can update tenders
router.put(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  updateTender
)

// ADMIN + MANAGER can assign employees
router.post(
  '/:id/assign',
  requireRole('ADMIN', 'MANAGER'),
  assignTender
)

export default router