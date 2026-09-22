import {
  getTenderRequirements,
  getTenderRequirementById,
  createTenderRequirement,
  updateTenderRequirementById,
  deactivateTenderRequirement,
  isUserAssignedToTender,
  getTenderRequirementSummary,
} from '../models/tenderRequirementModel.js'

import { getTenderById } from '../models/tenderModel.js'

import pool from '../config/db.js'

import { findUserById } from '../models/userModel.js'

const allowedRequirementStatuses = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'NOT_APPLICABLE',
]

const normalizeNullableText = (value) => {
  if (typeof value !== 'string') {
    return value ?? null
  }

  const trimmed = value.trim()

  return trimmed === '' ? null : trimmed
}

const normalizeNullableId = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null
  }

  const number = Number(value)

  if (!Number.isInteger(number) || number <= 0) {
    return null
  }

  return number
}

/* =========================================================
   LIST REQUIREMENTS
========================================================= */

export const listTenderRequirements = async (
  req,
  res,
  next
) => {
  try {
    const tenderId = Number(req.params.tenderId)

    if (
      !Number.isInteger(tenderId) ||
      tenderId <= 0
    ) {
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

    const requirements =
      await getTenderRequirements(tenderId)

    const summary =
      await getTenderRequirementSummary(tenderId)

    return res.status(200).json({
      success: true,
      count: requirements.length,
      summary,
      data: requirements,
    })
  } catch (error) {
    next(error)
  }
}

/* =========================================================
   CREATE REQUIREMENT
========================================================= */

export const createRequirement = async (
  req,
  res,
  next
) => {
  try {
    const tenderId = Number(req.params.tenderId)

    if (
      !Number.isInteger(tenderId) ||
      tenderId <= 0
    ) {
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

    const {
      category = 'OTHER',
      title,
      description,
      isMandatory = true,
      status = 'NOT_STARTED',
      assignedUserId,
      dueDate,
      sortOrder = 0,
    } = req.body

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Requirement title is required.',
      })
    }

    if (!allowedRequirementStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid requirement status.',
      })
    }

    const numericSortOrder = Number(sortOrder)

    if (
      !Number.isInteger(numericSortOrder) ||
      numericSortOrder < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Sort order must be a non-negative integer.',
      })
    }

    let numericAssignedUserId = null

    if (
      assignedUserId !== undefined &&
      assignedUserId !== null &&
      assignedUserId !== ''
    ) {
      numericAssignedUserId =
        normalizeNullableId(assignedUserId)

      if (!numericAssignedUserId) {
        return res.status(400).json({
          success: false,
          message:
            'Assigned employee ID is invalid.',
        })
      }

      const employee = await findUserById(
        numericAssignedUserId
      )

      if (!employee) {
        return res.status(404).json({
          success: false,
          message:
            'Assigned employee does not exist.',
        })
      }

      if (employee.role !== 'EMPLOYEE') {
        return res.status(400).json({
          success: false,
          message:
            'Requirement can only be assigned to an employee.',
        })
      }

      if (employee.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message:
            'Requirement cannot be assigned to an inactive employee.',
        })
      }

      const assignedToTender =
        await isUserAssignedToTender(
          tenderId,
          numericAssignedUserId
        )

      if (!assignedToTender) {
        return res.status(400).json({
          success: false,
          message:
            'Employee must be assigned to the tender before assigning this requirement.',
        })
      }
    }

    const requirementId =
      await createTenderRequirement({
        tenderId,
        category:
          normalizeNullableText(category) || 'OTHER',
        title: String(title).trim(),
        description:
          normalizeNullableText(description),
        isMandatory: Boolean(isMandatory),
        status,
        assignedUserId: numericAssignedUserId,
        dueDate: dueDate || null,
        sortOrder: numericSortOrder,
        createdBy: req.user.id,
      })

    const requirement =
      await getTenderRequirementById(
        tenderId,
        requirementId
      )

    return res.status(201).json({
      success: true,
      message:
        'Tender requirement created successfully.',
      data: requirement,
    })
  } catch (error) {
    next(error)
  }
}

/* =========================================================
   UPDATE REQUIREMENT
========================================================= */

export const updateRequirement = async (
  req,
  res,
  next
) => {
  try {
    const tenderId = Number(req.params.tenderId)

    const requirementId = Number(
      req.params.requirementId
    )

    if (
      !Number.isInteger(tenderId) ||
      tenderId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender ID.',
      })
    }

    if (
      !Number.isInteger(requirementId) ||
      requirementId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid requirement ID.',
      })
    }

    const tender = await getTenderById(tenderId)

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      })
    }

    const existingRequirement =
      await getTenderRequirementById(
        tenderId,
        requirementId
      )

    if (!existingRequirement) {
      return res.status(404).json({
        success: false,
        message: 'Tender requirement not found.',
      })
    }

    const {
      category = existingRequirement.category,
      title = existingRequirement.title,
      description =
        existingRequirement.description,
      isMandatory =
        Boolean(existingRequirement.is_mandatory),
      status = existingRequirement.status,
      assignedUserId =
        existingRequirement.assigned_user_id,
      dueDate = existingRequirement.due_date,
      sortOrder = existingRequirement.sort_order,
    } = req.body

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Requirement title is required.',
      })
    }

    if (!allowedRequirementStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid requirement status.',
      })
    }

    const numericSortOrder = Number(sortOrder)

    if (
      !Number.isInteger(numericSortOrder) ||
      numericSortOrder < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Sort order must be a non-negative integer.',
      })
    }

    let numericAssignedUserId = null

    if (
      assignedUserId !== undefined &&
      assignedUserId !== null &&
      assignedUserId !== ''
    ) {
      numericAssignedUserId =
        normalizeNullableId(assignedUserId)

      if (!numericAssignedUserId) {
        return res.status(400).json({
          success: false,
          message:
            'Assigned employee ID is invalid.',
        })
      }

      const employee = await findUserById(
        numericAssignedUserId
      )

      if (!employee) {
        return res.status(404).json({
          success: false,
          message:
            'Assigned employee does not exist.',
        })
      }

      if (employee.role !== 'EMPLOYEE') {
        return res.status(400).json({
          success: false,
          message:
            'Requirement can only be assigned to an employee.',
        })
      }

      if (employee.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message:
            'Requirement cannot be assigned to an inactive employee.',
        })
      }

      const assignedToTender =
        await isUserAssignedToTender(
          tenderId,
          numericAssignedUserId
        )

      if (!assignedToTender) {
        return res.status(400).json({
          success: false,
          message:
            'Employee must be assigned to the tender before assigning this requirement.',
        })
      }
    }

    let completedBy =
      existingRequirement.completed_by

    let completedAt =
      existingRequirement.completed_at

    if (
      status === 'COMPLETED' &&
      existingRequirement.status !== 'COMPLETED'
    ) {
      completedBy = req.user.id
      completedAt = new Date()
    }

    if (
      status !== 'COMPLETED' &&
      existingRequirement.status === 'COMPLETED'
    ) {
      completedBy = null
      completedAt = null
    }

    await updateTenderRequirementById(
      tenderId,
      requirementId,
      {
        category:
          normalizeNullableText(category) || 'OTHER',
        title: String(title).trim(),
        description:
          normalizeNullableText(description),
        isMandatory: Boolean(isMandatory),
        status,
        assignedUserId:
          numericAssignedUserId,
        dueDate: dueDate || null,
        sortOrder: numericSortOrder,
        completedBy,
        completedAt,
      }
    )

    const updatedRequirement =
      await getTenderRequirementById(
        tenderId,
        requirementId
      )

    return res.status(200).json({
      success: true,
      message:
        'Tender requirement updated successfully.',
      data: updatedRequirement,
    })
  } catch (error) {
    next(error)
  }
}


export const updateEmployeeRequirementProgress = async (
  req,
  res,
  next
) => {
  try {
    const tenderId = Number(req.params.tenderId)

    const requirementId = Number(
      req.params.requirementId
    )

    if (
      !Number.isInteger(tenderId) ||
      tenderId <= 0 ||
      !Number.isInteger(requirementId) ||
      requirementId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender or requirement ID.',
      })
    }

    const requirement =
      await getTenderRequirementById(
        tenderId,
        requirementId
      )

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Tender requirement not found.',
      })
    }

    // Employee can update only a requirement
    // specifically assigned to them.
    if (
      Number(requirement.assigned_user_id) !==
      Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You can only update requirements assigned to you.',
      })
    }

    const { status } = req.body

    const employeeAllowedStatuses = [
      'NOT_STARTED',
      'IN_PROGRESS',
      'COMPLETED',
    ]

    if (!employeeAllowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Employees can only set Not Started, In Progress, or Completed.',
      })
    }

    let completedBy =
      requirement.completed_by

    let completedAt =
      requirement.completed_at

    if (
      status === 'COMPLETED' &&
      requirement.status !== 'COMPLETED'
    ) {
      completedBy = req.user.id
      completedAt = new Date()
    }

    if (
      status !== 'COMPLETED' &&
      requirement.status === 'COMPLETED'
    ) {
      completedBy = null
      completedAt = null
    }

    await updateTenderRequirementById(
      tenderId,
      requirementId,
      {
        category: requirement.category,
        title: requirement.title,
        description: requirement.description,
        isMandatory:
          Boolean(requirement.is_mandatory),
        status,
        assignedUserId:
          requirement.assigned_user_id,
        dueDate: requirement.due_date || null,
        sortOrder: requirement.sort_order,
        completedBy,
        completedAt,
      }
    )

    const updatedRequirement =
      await getTenderRequirementById(
        tenderId,
        requirementId
      )

    return res.status(200).json({
      success: true,
      message:
        'Requirement progress updated successfully.',
      data: updatedRequirement,
    })
  } catch (error) {
    next(error)
  }
}

/* =========================================================
   REMOVE REQUIREMENT
========================================================= */

export const removeRequirement = async (
  req,
  res,
  next
) => {
  try {
    const tenderId = Number(req.params.tenderId)

    const requirementId = Number(
      req.params.requirementId
    )

    if (
      !Number.isInteger(tenderId) ||
      tenderId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tender ID.',
      })
    }

    if (
      !Number.isInteger(requirementId) ||
      requirementId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid requirement ID.',
      })
    }

    const tender = await getTenderById(tenderId)

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      })
    }

    const requirement =
      await getTenderRequirementById(
        tenderId,
        requirementId
      )

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Tender requirement not found.',
      })
    }

   await deactivateTenderRequirement(
  tenderId,
  requirementId
)

// Archive all active documents linked to this requirement.
// Physical files are intentionally retained for audit/history.
await pool.execute(
  `
    UPDATE tender_documents
    SET is_active = 0
    WHERE tender_id = ?
      AND requirement_id = ?
      AND is_active = 1
  `,
  [tenderId, requirementId]
)

    return res.status(200).json({
      success: true,
      message:
        'Tender requirement removed successfully.',
    })
  } catch (error) {
    next(error)
  }
}