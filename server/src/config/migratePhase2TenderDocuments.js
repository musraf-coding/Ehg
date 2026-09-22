import 'dotenv/config'
import pool from './db.js'

const migratePhase2TenderDocuments = async () => {
  let connection

  try {
    connection = await pool.getConnection()

    console.log(
      'Starting Phase 2D Tender Documents migration...'
    )

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tender_documents (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        tender_id INT UNSIGNED NOT NULL,

        document_type ENUM(
          'ORIGINAL_TENDER',
          'INTERNAL_SUBMISSION'
        ) NOT NULL,

        title VARCHAR(255) NOT NULL,

        description TEXT NULL,

        file_name VARCHAR(255) NOT NULL,

        stored_file_name VARCHAR(255) NULL,

        file_path VARCHAR(500) NOT NULL,

        file_url VARCHAR(1000) NULL,

        mime_type VARCHAR(150) NULL,

        file_size BIGINT UNSIGNED NULL,

        requirement_id INT UNSIGNED NULL,

        compliance_item_id INT UNSIGNED NULL,

        uploaded_by INT UNSIGNED NOT NULL,

        is_active TINYINT(1) NOT NULL DEFAULT 1,

        created_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_tender_documents_tender (
          tender_id
        ),

        INDEX idx_tender_documents_type (
          document_type
        ),

        INDEX idx_tender_documents_requirement (
          requirement_id
        ),

        INDEX idx_tender_documents_compliance (
          compliance_item_id
        ),

        INDEX idx_tender_documents_uploaded_by (
          uploaded_by
        ),

        CONSTRAINT fk_tender_documents_tender
          FOREIGN KEY (tender_id)
          REFERENCES tenders(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_tender_documents_requirement
          FOREIGN KEY (requirement_id)
          REFERENCES tender_requirements(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_tender_documents_compliance
          FOREIGN KEY (compliance_item_id)
          REFERENCES tender_compliance_items(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_tender_documents_uploaded_by
          FOREIGN KEY (uploaded_by)
          REFERENCES users(id)
          ON DELETE RESTRICT
      )
    `)

    console.log(
      'tender_documents table created/verified.'
    )

    console.log(
      'Phase 2D Tender Documents migration completed successfully.'
    )
  } catch (error) {
    console.error(
      'Phase 2D Tender Documents migration failed:',
      error
    )

    process.exitCode = 1
  } finally {
    if (connection) {
      connection.release()
    }

    await pool.end()
  }
}

migratePhase2TenderDocuments()