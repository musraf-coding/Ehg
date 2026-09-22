import 'dotenv/config'
import pool from './db.js'

const columnExists = async (tableName, columnName) => {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  )

  return Number(rows[0].count) > 0
}

const indexExists = async (tableName, indexName) => {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND INDEX_NAME = ?
    `,
    [tableName, indexName]
  )

  return Number(rows[0].count) > 0
}

const foreignKeyExists = async (
  tableName,
  constraintName
) => {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND CONSTRAINT_NAME = ?
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `,
    [tableName, constraintName]
  )

  return Number(rows[0].count) > 0
}

const migrate = async () => {
  try {
    console.log(
      'Starting Phase 2A tender foundation migration...'
    )

    if (!(await columnExists('tenders', 'company_id'))) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN company_id INT UNSIGNED NULL
        AFTER id
      `)

      console.log('Added tenders.company_id')
    }

    if (!(await columnExists('tenders', 'category'))) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN category VARCHAR(150) NULL
        AFTER description
      `)

      console.log('Added tenders.category')
    }

    if (!(await columnExists('tenders', 'tender_value'))) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN tender_value DECIMAL(15, 2) NULL
        AFTER priority
      `)

      console.log('Added tenders.tender_value')
    }

    if (!(await columnExists('tenders', 'closing_time'))) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN closing_time TIME NULL
        AFTER deadline
      `)

      console.log('Added tenders.closing_time')
    }

    if (
      !(await columnExists(
        'tenders',
        'internal_deadline'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN internal_deadline DATETIME NULL
        AFTER closing_time
      `)

      console.log('Added tenders.internal_deadline')
    }

    if (
      !(await columnExists(
        'tenders',
        'submission_method'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN submission_method VARCHAR(150) NULL
        AFTER internal_deadline
      `)

      console.log('Added tenders.submission_method')
    }

    if (
      !(await columnExists(
        'tenders',
        'submission_location'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN submission_location VARCHAR(255) NULL
        AFTER submission_method
      `)

      console.log('Added tenders.submission_location')
    }

    if (
      !(await columnExists(
        'tenders',
        'internal_owner_id'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN internal_owner_id INT UNSIGNED NULL
        AFTER submission_location
      `)

      console.log('Added tenders.internal_owner_id')
    }

    if (!(await columnExists('tenders', 'result'))) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN result ENUM(
          'PENDING',
          'WON',
          'LOST',
          'CANCELLED'
        ) NOT NULL DEFAULT 'PENDING'
        AFTER internal_owner_id
      `)

      console.log('Added tenders.result')
    }

    if (!(await columnExists('tenders', 'submitted_at'))) {
      await pool.query(`
        ALTER TABLE tenders
        ADD COLUMN submitted_at DATETIME NULL
        AFTER result
      `)

      console.log('Added tenders.submitted_at')
    }

    if (
      !(await indexExists(
        'tenders',
        'idx_tenders_company_id'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD INDEX idx_tenders_company_id (company_id)
      `)

      console.log('Added company index')
    }

    if (
      !(await indexExists(
        'tenders',
        'idx_tenders_internal_owner_id'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD INDEX idx_tenders_internal_owner_id (
          internal_owner_id
        )
      `)

      console.log('Added internal owner index')
    }

    if (
      !(await indexExists(
        'tenders',
        'idx_tenders_internal_deadline'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD INDEX idx_tenders_internal_deadline (
          internal_deadline
        )
      `)

      console.log('Added internal deadline index')
    }

    if (
      !(await foreignKeyExists(
        'tenders',
        'fk_tenders_company'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD CONSTRAINT fk_tenders_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
      `)

      console.log('Added company foreign key')
    }

    if (
      !(await foreignKeyExists(
        'tenders',
        'fk_tenders_internal_owner'
      ))
    ) {
      await pool.query(`
        ALTER TABLE tenders
        ADD CONSTRAINT fk_tenders_internal_owner
        FOREIGN KEY (internal_owner_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
      `)

      console.log('Added internal owner foreign key')
    }

    console.log(
      'Phase 2A tender foundation migration completed successfully.'
    )
  } catch (error) {
    console.error(
      'Phase 2A migration failed:',
      error.message
    )

    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

migrate()