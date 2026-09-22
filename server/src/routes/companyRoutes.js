import express from 'express'

import {
  listCompanies,
  getCompanyDetails,
  createNewCompany,
  updateCompany,
} from '../controllers/companyController.js'

import { protect } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(protect)

// Admin, CEO and Manager may view companies
router.get(
  '/',
  requireRole('ADMIN', 'CEO', 'MANAGER'),
  listCompanies
)

router.get(
  '/:id',
  requireRole('ADMIN', 'CEO', 'MANAGER'),
  getCompanyDetails
)

// Only Admin manages company records for now
router.post(
  '/',
  requireRole('ADMIN'),
  createNewCompany
)

router.put(
  '/:id',
  requireRole('ADMIN'),
  updateCompany
)

export default router