
import 'dotenv/config'
import pool from './db.js'


const migrateTenderSoftDelete = async () => {
  try {
    console.log(
      'Starting tender soft-delete migration...'
    )

    const [columns] = await pool.query(`
      SHOW COLUMNS FROM tenders
      LIKE 'is_active'
    `)

    if (columns.length === 0) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN is_active TINYINT(1)
        NOT NULL DEFAULT 1
        AFTER updated_at
      `)

      console.log(
        'Added is_active column to tenders.'
      )
    } else {
      console.log(
        'is_active column already exists.'
      )
    }

    console.log(
      'Tender soft-delete migration completed.'
    )

    process.exit(0)
  } catch (error) {
    console.error(
      'Tender soft-delete migration failed:',
      error
    )

    process.exit(1)
  }
}

migrateTenderSoftDelete()