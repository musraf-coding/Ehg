import 'dotenv/config'
import pool from './db.js'
import { findUserByEmail } from '../models/userModel.js'

const tenders = [
  {
    referenceNo: 'EHG-TND-001',
    title: 'Facilities Maintenance Tender',
    clientName: 'Government Department',
    description:
      'Facilities maintenance tender covering scheduled maintenance and operational support services.',
    status: 'IN_PROGRESS',
    progress: 72,
    startDate: '2026-08-15',
    deadline: '2026-09-08',
  },
  {
    referenceNo: 'EHG-TND-003',
    title: 'Cleaning Services Tender',
    clientName: 'Public Sector',
    description:
      'Cleaning services tender covering routine cleaning and facility hygiene services.',
    status: 'PREPARATION',
    progress: 45,
    startDate: '2026-08-20',
    deadline: '2026-09-12',
  },
  {
    referenceNo: 'EHG-TND-005',
    title: 'Security Services Contract',
    clientName: 'Corporate Client',
    description:
      'Security services tender covering site monitoring and operational security requirements.',
    status: 'REVIEW',
    progress: 88,
    startDate: '2026-08-10',
    deadline: '2026-09-18',
  },
]

const seedTenders = async () => {
  let connection

  try {
    connection = await pool.getConnection()

    console.log('Seeding EHG Holdings tender data...')

    const admin = await findUserByEmail('admin@ehgholdings.com')
    const employee = await findUserByEmail('employee@ehgholdings.com')

    if (!admin) {
      throw new Error(
        'Admin user not found. Run npm run db:seed first.'
      )
    }

    if (!employee) {
      throw new Error(
        'Employee user not found. Run npm run db:seed first.'
      )
    }

    for (const tender of tenders) {
      const [existingRows] = await connection.query(
        `
          SELECT id
          FROM tenders
          WHERE reference_no = ?
          LIMIT 1
        `,
        [tender.referenceNo]
      )

      let tenderId

      if (existingRows.length > 0) {
        tenderId = existingRows[0].id

        console.log(
          `Skipped existing tender: ${tender.referenceNo}`
        )
      } else {
        const [result] = await connection.query(
          `
            INSERT INTO tenders (
              reference_no,
              title,
              client_name,
              description,
              status,
              progress,
              start_date,
              deadline,
              created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            tender.referenceNo,
            tender.title,
            tender.clientName,
            tender.description,
            tender.status,
            tender.progress,
            tender.startDate,
            tender.deadline,
            admin.id,
          ]
        )

        tenderId = result.insertId

        console.log(
          `Created tender: ${tender.referenceNo}`
        )
      }

      await connection.query(
        `
          INSERT IGNORE INTO assignments (
            tender_id,
            user_id,
            assigned_by
          )
          VALUES (?, ?, ?)
        `,
        [
          tenderId,
          employee.id,
          admin.id,
        ]
      )

      console.log(
        `Assigned ${tender.referenceNo} to ${employee.email}`
      )
    }

    console.log('Tender seed completed successfully.')
  } catch (error) {
    console.error(
      'Tender seeding failed:',
      error.message
    )

    process.exitCode = 1
  } finally {
    if (connection) {
      connection.release()
    }

    await pool.end()
  }
}

seedTenders()