import {
  findAssignedTendersByUserId,
} from '../models/tenderModel.js'

export const getMyAssignedTenders = async (req, res, next) => {
  try {
    const tenders = await findAssignedTendersByUserId(
      req.user.id
    )

    return res.status(200).json({
      success: true,
      count: tenders.length,
      tenders: tenders.map((tender) => ({
        id: tender.id,
        referenceNo: tender.reference_no,
        title: tender.title,
        clientName: tender.client_name,
        description: tender.description,
        status: tender.status,
        progress: tender.progress,
        startDate: tender.start_date,
        deadline: tender.deadline,
        assignedAt: tender.assigned_at,
      })),
    })
  } catch (error) {
    next(error)
  }
}