import {
  getAllTenders,
  getTenderById,
  createTender,
  updateTenderById,
  assignTenderToEmployee,
  getTenderAssignments,
  getAssignedTendersByUserId,
} from '../models/tenderModel.js'

import { findUserById } from '../models/userModel.js'
import { getActiveEmployees } from '../models/userModel.js'

const allowedStatuses = [
  'DRAFT',
  'PREPARATION',
  'IN_PROGRESS',
  'REVIEW',
  'SUBMITTED',
  'COMPLETED',
  'CANCELLED',
]

const allowedPriorities = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]

const normalizeNullableText = (value) => {
  if (typeof value !== 'string') {
    return value ?? null
  }

  const trimmed = value.trim()

  return trimmed === '' ? null : trimmed
}

export const listTenders = async (req, res, next) => {
  try {
    const tenders = await getAllTenders()

    return res.status(200).json({
      success: true,
      count: tenders.length,
      data: tenders,
    })
  } catch (error) {
    next(error)
  }
}

export const getTenderDetails = async (req, res, next) => {
  try {
    const tenderId = Number(req.params.id)

    if (!Number.isInteger(tenderId) || tenderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender ID.',
      })
    }

    const tender = await getTenderById(tenderId)

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      })
    }

    const assignments = await getTenderAssignments(tenderId)

    return res.status(200).json({
      success: true,
      data: {
        ...tender,
        assignments,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const createNewTender = async (req, res, next) => {
  try {
    const {
      referenceNo,
      title,
      clientName,
      description,
      status = 'DRAFT',
      priority = 'MEDIUM',
      progress = 0,
      startDate,
      deadline,
    } = req.body

    if (!referenceNo || !referenceNo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tender reference number is required.',
      })
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tender title is required.',
      })
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender status.',
      })
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender priority.',
      })
    }

    const numericProgress = Number(progress)

    if (
      !Number.isInteger(numericProgress) ||
      numericProgress < 0 ||
      numericProgress > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be an integer between 0 and 100.',
      })
    }

    if (
      startDate &&
      deadline &&
      new Date(deadline) < new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Deadline cannot be earlier than start date.',
      })
    }

    const tenderId = await createTender({
      referenceNo: referenceNo.trim(),
      title: title.trim(),
      clientName: normalizeNullableText(clientName),
      description: normalizeNullableText(description),
      status,
      priority,
      progress: numericProgress,
      startDate: startDate || null,
      deadline: deadline || null,
      createdBy: req.user.id,
    })

    const tender = await getTenderById(tenderId)

    return res.status(201).json({
      success: true,
      message: 'Tender created successfully.',
      data: tender,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Tender reference number already exists.',
      })
    }

    next(error)
  }
}

export const updateTender = async (req, res, next) => {
  try {
    const tenderId = Number(req.params.id)

    if (!Number.isInteger(tenderId) || tenderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender ID.',
      })
    }

    const existingTender = await getTenderById(tenderId)

    if (!existingTender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      })
    }

    const {
      referenceNo = existingTender.reference_no,
      title = existingTender.title,
      clientName = existingTender.client_name,
      description = existingTender.description,
      status = existingTender.status,
      priority = existingTender.priority,
      progress = existingTender.progress,
      startDate = existingTender.start_date,
      deadline = existingTender.deadline,
    } = req.body

    if (!referenceNo || !String(referenceNo).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tender reference number is required.',
      })
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tender title is required.',
      })
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender status.',
      })
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender priority.',
      })
    }

    const numericProgress = Number(progress)

    if (
      !Number.isInteger(numericProgress) ||
      numericProgress < 0 ||
      numericProgress > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be an integer between 0 and 100.',
      })
    }

    if (
      startDate &&
      deadline &&
      new Date(deadline) < new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Deadline cannot be earlier than start date.',
      })
    }

    await updateTenderById(tenderId, {
      referenceNo: String(referenceNo).trim(),
      title: String(title).trim(),
      clientName: normalizeNullableText(clientName),
      description: normalizeNullableText(description),
      status,
      priority,
      progress: numericProgress,
      startDate: startDate || null,
      deadline: deadline || null,
    })

    const updatedTender = await getTenderById(tenderId)

    return res.status(200).json({
      success: true,
      message: 'Tender updated successfully.',
      data: updatedTender,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Tender reference number already exists.',
      })
    }

    next(error)
  }
}

export const assignTender = async (req, res, next) => {
  try {
    const tenderId = Number(req.params.id)
    const userId = Number(req.body.userId)

    if (!Number.isInteger(tenderId) || tenderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender ID.',
      })
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid employee user ID is required.',
      })
    }

    const tender = await getTenderById(tenderId)

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      })
    }

    const employee = await findUserById(userId)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Selected user does not exist.',
      })
    }

    if (employee.role !== 'EMPLOYEE') {
      return res.status(400).json({
        success: false,
        message: 'Tenders can only be assigned to employees.',
      })
    }

    if (employee.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Tender cannot be assigned to an inactive employee.',
      })
    }

    const assignmentId = await assignTenderToEmployee({
      tenderId,
      userId,
      assignedBy: req.user.id,
    })

    const assignments = await getTenderAssignments(tenderId)

    return res.status(201).json({
      success: true,
      message: 'Tender assigned successfully.',
      data: {
        assignmentId,
        tenderId,
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          department: employee.department,
        },
        assignedBy: req.user.id,
        assignments,
      },
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This employee is already assigned to this tender.',
      })
    }

    next(error)
  }
}


export const listAssignableEmployees = async (req, res) => {
  try {
    const employees = await getActiveEmployees()

    return res.status(200).json({
      success: true,
      employees,
    })
  } catch (error) {
    console.error(
      'List assignable employees error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to load assignable employees.',
    })
  }
}

export const listMyAssignedTenders = async (req, res) => {
  try {
    const tenders =
      await getAssignedTendersByUserId(req.user.id)

    return res.status(200).json({
      success: true,
      tenders,
    })
  } catch (error) {
    console.error(
      'List assigned tenders error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to load assigned tenders.',
    })
  }
}