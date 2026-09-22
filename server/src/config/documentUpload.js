import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import multer from 'multer'

const storageRoot = path.resolve(
  process.env.DOCUMENT_STORAGE_PATH || './storage'
)

const sanitizeFileName = (fileName) => {
  const extension = path.extname(fileName)
  const baseName = path.basename(fileName, extension)

  const safeBaseName = baseName
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80)

  return {
    safeBaseName: safeBaseName || 'document',
    extension: extension.toLowerCase(),
  }
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    try {
      const tenderId = String(req.params.tenderId || '')

      if (!/^\d+$/.test(tenderId)) {
        return callback(
          new Error('Invalid tender ID for document upload.')
        )
      }

      const documentType = req.body.documentType

      let folderName

      if (documentType === 'ORIGINAL_TENDER') {
        folderName = 'original'
      } else if (
        documentType === 'INTERNAL_SUBMISSION'
      ) {
        folderName = 'submissions'
      } else {
        return callback(
          new Error('Invalid document type.')
        )
      }

      const destinationPath = path.join(
        storageRoot,
        'tenders',
        tenderId,
        folderName
      )

      fs.mkdirSync(destinationPath, {
        recursive: true,
      })

      callback(null, destinationPath)
    } catch (error) {
      callback(error)
    }
  },

  filename: (req, file, callback) => {
    const { safeBaseName, extension } =
      sanitizeFileName(file.originalname)

    const uniquePart = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`

    callback(
      null,
      `${safeBaseName}-${uniquePart}${extension}`
    )
  },
})

const allowedMimeTypes = new Set([
  'application/pdf',

  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  'image/jpeg',
  'image/png',

  'text/plain',
  'text/csv',
])

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(
      new Error(
        'Unsupported file type. Allowed files include PDF, Word, Excel, PowerPoint, JPG, PNG, TXT and CSV.'
      )
    )
  }

  callback(null, true)
}

export const tenderDocumentUpload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1,
  },

  fileFilter,
})

export const getDocumentStorageRoot = () =>
  storageRoot