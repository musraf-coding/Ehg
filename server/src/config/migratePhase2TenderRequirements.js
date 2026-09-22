
import 'dotenv/config'
import pool, {
  testDatabaseConnection,
} from './db.js'

const migratePhase2TenderRequirements =
  async () => {
    let connection

    try {
      await testDatabaseConnection()

      connection = await pool.getConnection()

      console.log(
        'Starting Phase 2B Tender Requirements migration...'
      )

      await connection.beginTransaction()

      await connection.query(`
        CREATE TABLE IF NOT EXISTS tender_requirements (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,

          tender_id INT UNSIGNED NOT NULL,

          category VARCHAR(100) NOT NULL DEFAULT 'OTHER',

          title VARCHAR(255) NOT NULL,

          description TEXT NULL,

          is_mandatory TINYINT(1) NOT NULL DEFAULT 1,

          status ENUM(
            'NOT_STARTED',
            'IN_PROGRESS',
            'COMPLETED',
            'NOT_APPLICABLE'
          ) NOT NULL DEFAULT 'NOT_STARTED',

          assigned_user_id INT UNSIGNED NULL,

          due_date DATE NULL,

          sort_order INT UNSIGNED NOT NULL DEFAULT 0,

          is_active TINYINT(1) NOT NULL DEFAULT 1,

          created_by INT UNSIGNED NOT NULL,

          completed_by INT UNSIGNED NULL,

          completed_at DATETIME NULL,

          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

          updated_at TIMESTAMP NOT NULL
            DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

          PRIMARY KEY (id),

          INDEX idx_tender_requirements_tender_id (
            tender_id
          ),

          INDEX idx_tender_requirements_status (
            status
          ),

          INDEX idx_tender_requirements_assigned_user (
            assigned_user_id
          ),

          INDEX idx_tender_requirements_due_date (
            due_date
          ),

          INDEX idx_tender_requirements_category (
            category
          ),

          INDEX idx_tender_requirements_active (
            is_active
          ),

          CONSTRAINT fk_tender_requirements_tender
            FOREIGN KEY (tender_id)
            REFERENCES tenders(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,

          CONSTRAINT fk_tender_requirements_assigned_user
            FOREIGN KEY (assigned_user_id)
            REFERENCES users(id)
            ON UPDATE CASCADE
            ON DELETE SET NULL,

          CONSTRAINT fk_tender_requirements_created_by
            FOREIGN KEY (created_by)
            REFERENCES users(id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT,

          CONSTRAINT fk_tender_requirements_completed_by
            FOREIGN KEY (completed_by)
            REFERENCES users(id)
            ON UPDATE CASCADE
            ON DELETE SET NULL
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
      `)

      await connection.commit()

      console.log(
        'Phase 2B migration completed successfully.'
      )

      console.log(
        'Created/verified table: tender_requirements'
      )
    } catch (error) {
      if (connection) {
        await connection.rollback()
      }

      console.error(
        'Phase 2B migration failed:',
        error.message
      )

      throw error
    } finally {
      if (connection) {
        connection.release()
      }

      await pool.end()
    }
  }

migratePhase2TenderRequirements()
  .then(() => {
    console.log(
      'Phase 2B database migration finished.'
    )
  })
  .catch(() => {
    process.exitCode = 1
  })