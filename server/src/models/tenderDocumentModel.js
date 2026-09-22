import pool from '../config/db.js'

export const getTenderDocuments = async (tenderId) => {
  const [rows] = await pool.query(
    `
      SELECT
        td.*,

        uploader.name AS uploaded_by_name,
        uploader.email AS uploaded_by_email,

        tr.title AS requirement_title,
        tci.title AS compliance_item_title

      FROM tender_documents td

      LEFT JOIN users uploader
        ON uploader.id = td.uploaded_by

      LEFT JOIN tender_requirements tr
        ON tr.id = td.requirement_id

      LEFT JOIN tender_compliance_items tci
        ON tci.id = td.compliance_item_id

      WHERE td.tender_id = ?
        AND td.is_active = 1

      ORDER BY
        CASE td.document_type
          WHEN 'ORIGINAL_TENDER' THEN 1
          WHEN 'INTERNAL_SUBMISSION' THEN 2
          ELSE 3
        END,
        td.created_at DESC,
        td.id DESC
    `,
    [tenderId]
  )

  return rows
}

export const getTenderDocumentById = async (
  documentId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        td.*,

        uploader.name AS uploaded_by_name,
        uploader.email AS uploaded_by_email,

        tr.title AS requirement_title,
        tci.title AS compliance_item_title

      FROM tender_documents td

      LEFT JOIN users uploader
        ON uploader.id = td.uploaded_by

      LEFT JOIN tender_requirements tr
        ON tr.id = td.requirement_id

      LEFT JOIN tender_compliance_items tci
        ON tci.id = td.compliance_item_id

      WHERE td.id = ?
        AND td.is_active = 1

      LIMIT 1
    `,
    [documentId]
  )

  return rows[0] || null
}

export const createTenderDocument = async ({
  tenderId,
  documentType,
  title,
  description = null,
  fileName,
  storedFileName = null,
  filePath,
  fileUrl = null,
  mimeType = null,
  fileSize = null,
  requirementId = null,
  complianceItemId = null,
  uploadedBy,
}) => {
  const [result] = await pool.query(
    `
      INSERT INTO tender_documents (
        tender_id,
        document_type,
        title,
        description,
        file_name,
        stored_file_name,
        file_path,
        file_url,
        mime_type,
        file_size,
        requirement_id,
        compliance_item_id,
        uploaded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      tenderId,
      documentType,
      title,
      description,
      fileName,
      storedFileName,
      filePath,
      fileUrl,
      mimeType,
      fileSize,
      requirementId,
      complianceItemId,
      uploadedBy,
    ]
  )

  return getTenderDocumentById(result.insertId)
}

export const updateTenderDocument = async (
  documentId,
  {
    documentType,
    title,
    description,
    requirementId,
    complianceItemId,

    // Optional replacement file
    fileName = null,
    storedFileName = null,
    filePath = null,
    fileUrl = null,
    mimeType = null,
    fileSize = null,
  }
) => {
  if (fileName && filePath) {
    // A new physical file was selected.
    await pool.query(
      `
        UPDATE tender_documents
        SET
          document_type = ?,
          title = ?,
          description = ?,
          requirement_id = ?,
          compliance_item_id = ?,
          file_name = ?,
          stored_file_name = ?,
          file_path = ?,
          file_url = ?,
          mime_type = ?,
          file_size = ?
        WHERE id = ?
          AND is_active = 1
      `,
      [
        documentType,
        title,
        description,
        requirementId,
        complianceItemId,
        fileName,
        storedFileName,
        filePath,
        fileUrl,
        mimeType,
        fileSize,
        documentId,
      ]
    )
  } else {
    // No replacement file selected.
    // Keep the existing physical file unchanged.
    await pool.query(
      `
        UPDATE tender_documents
        SET
          document_type = ?,
          title = ?,
          description = ?,
          requirement_id = ?,
          compliance_item_id = ?
        WHERE id = ?
          AND is_active = 1
      `,
      [
        documentType,
        title,
        description,
        requirementId,
        complianceItemId,
        documentId,
      ]
    )
  }

  return getTenderDocumentById(documentId)
}


export const deactivateTenderDocument = async (
  documentId
) => {
  const [result] = await pool.query(
    `
      UPDATE tender_documents
      SET is_active = 0
      WHERE id = ?
        AND is_active = 1
    `,
    [documentId]
  )

  return result.affectedRows > 0
}

export const getTenderDocumentSummary = async (
  tenderId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        COUNT(*) AS total,

        SUM(
          CASE
            WHEN document_type = 'ORIGINAL_TENDER'
            THEN 1
            ELSE 0
          END
        ) AS originalTender,

        SUM(
          CASE
            WHEN document_type = 'INTERNAL_SUBMISSION'
            THEN 1
            ELSE 0
          END
        ) AS internalSubmission,

        SUM(
          CASE
            WHEN requirement_id IS NOT NULL
            THEN 1
            ELSE 0
          END
        ) AS requirementEvidence,

        SUM(
          CASE
            WHEN compliance_item_id IS NOT NULL
            THEN 1
            ELSE 0
          END
        ) AS complianceEvidence

      FROM tender_documents

      WHERE tender_id = ?
        AND is_active = 1
    `,
    [tenderId]
  )

  const summary = rows[0] || {}

  return {
    total: Number(summary.total || 0),

    originalTender: Number(
      summary.originalTender || 0
    ),

    internalSubmission: Number(
      summary.internalSubmission || 0
    ),

    requirementEvidence: Number(
      summary.requirementEvidence || 0
    ),

    complianceEvidence: Number(
      summary.complianceEvidence || 0
    ),
  }
}

export const tenderDocumentBelongsToTender = async (
  documentId,
  tenderId
) => {
  const [rows] = await pool.query(
    `
      SELECT id
      FROM tender_documents
      WHERE id = ?
        AND tender_id = ?
        AND is_active = 1
      LIMIT 1
    `,
    [documentId, tenderId]
  )

  return rows.length > 0
}