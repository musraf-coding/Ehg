import {
  getTenderById,
  isUserAssignedToTender,
} from '../models/tenderModel.js'

export const requireTenderAccess = async (
  req,
  res,
  next
) => {
  try {
    const tenderId = Number(
      req.params.tenderId || req.params.id
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

    const tender = await getTenderById(tenderId)

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found.',
      })
    }

    // Management roles can continue.
    // Individual routes still decide what each role
    // is allowed to view or modify.
    if (
      ['ADMIN', 'CEO', 'MANAGER'].includes(
        req.user.role
      )
    ) {
      req.tender = tender
      return next()
    }

    // Employees may access only tenders
    // to which they are assigned.
    if (req.user.role === 'EMPLOYEE') {
      const assigned =
        await isUserAssignedToTender({
          tenderId,
          userId: req.user.id,
        })

      if (!assigned) {
        return res.status(403).json({
          success: false,
          message:
            'You do not have access to this tender.',
        })
      }

      req.tender = tender
      return next()
    }

    return res.status(403).json({
      success: false,
      message:
        'You do not have permission to access this tender.',
    })
  } catch (error) {
    next(error)
  }
}