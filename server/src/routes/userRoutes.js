import express from 'express'

import {
  listUsers,
  createNewUser,
} from '../controllers/userController.js'

import { protect } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/', requireRole('ADMIN'), listUsers)

router.post('/', requireRole('ADMIN'), createNewUser)

export default router