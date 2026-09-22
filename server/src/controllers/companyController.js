import {
  getAllCompanies,
  findCompanyById,
  findCompanyByName,
  findCompanyByCode,
  createCompany,
  updateCompanyById,
} from '../models/companyModel.js'

const ALLOWED_STATUSES = ['ACTIVE', 'INACTIVE']

// --------------------------------------------------
// GET /api/companies
// Authenticated management users
// --------------------------------------------------
export const listCompanies = async (req, res) => {
  try {
    const companies = await getAllCompanies()

    return res.status(200).json({
      success: true,
      companies,
    })
  } catch (error) {
    console.error('List companies error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve companies.',
    })
  }
}

// --------------------------------------------------
// GET /api/companies/:id
// --------------------------------------------------
export const getCompanyDetails = async (req, res) => {
  try {
    const companyId = Number(req.params.id)

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID.',
      })
    }

    const company = await findCompanyById(companyId)

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      })
    }

    return res.status(200).json({
      success: true,
      company,
    })
  } catch (error) {
    console.error('Get company error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve company.',
    })
  }
}

// --------------------------------------------------
// POST /api/companies
// ADMIN only
// --------------------------------------------------
export const createNewCompany = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      status = 'ACTIVE',
    } = req.body

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required.',
      })
    }

    const normalizedName = name.trim()

    const normalizedCode = code?.trim()
      ? code.trim().toUpperCase()
      : null

    const normalizedDescription =
      description?.trim() || null

    const normalizedStatus = String(status)
      .trim()
      .toUpperCase()

    if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be ACTIVE or INACTIVE.',
      })
    }

    const existingName =
      await findCompanyByName(normalizedName)

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: 'A company with this name already exists.',
      })
    }

    if (normalizedCode) {
      const existingCode =
        await findCompanyByCode(normalizedCode)

      if (existingCode) {
        return res.status(409).json({
          success: false,
          message: 'A company with this code already exists.',
        })
      }
    }

    const companyId = await createCompany({
      name: normalizedName,
      code: normalizedCode,
      description: normalizedDescription,
      status: normalizedStatus,
      createdBy: req.user.id,
    })

    const company = await findCompanyById(companyId)

    return res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      company,
    })
  } catch (error) {
    console.error('Create company error:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message:
          'A company with this name or code already exists.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to create company.',
    })
  }
}

// --------------------------------------------------
// PUT /api/companies/:id
// ADMIN only
// --------------------------------------------------
export const updateCompany = async (req, res) => {
  try {
    const companyId = Number(req.params.id)

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID.',
      })
    }

    const existingCompany =
      await findCompanyById(companyId)

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      })
    }

    const {
      name = existingCompany.name,
      code = existingCompany.code,
      description = existingCompany.description,
      status = existingCompany.status,
    } = req.body

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required.',
      })
    }

    const normalizedName = name.trim()

    const normalizedCode = code?.trim()
      ? code.trim().toUpperCase()
      : null

    const normalizedDescription =
      description?.trim() || null

    const normalizedStatus = String(status)
      .trim()
      .toUpperCase()

    if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be ACTIVE or INACTIVE.',
      })
    }

    const duplicateName =
      await findCompanyByName(normalizedName)

    if (
      duplicateName &&
      duplicateName.id !== companyId
    ) {
      return res.status(409).json({
        success: false,
        message: 'A company with this name already exists.',
      })
    }

    if (normalizedCode) {
      const duplicateCode =
        await findCompanyByCode(normalizedCode)

      if (
        duplicateCode &&
        duplicateCode.id !== companyId
      ) {
        return res.status(409).json({
          success: false,
          message: 'A company with this code already exists.',
        })
      }
    }

    await updateCompanyById(companyId, {
      name: normalizedName,
      code: normalizedCode,
      description: normalizedDescription,
      status: normalizedStatus,
    })

    const updatedCompany =
      await findCompanyById(companyId)

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully.',
      company: updatedCompany,
    })
  } catch (error) {
    console.error('Update company error:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message:
          'A company with this name or code already exists.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to update company.',
    })
  }
}