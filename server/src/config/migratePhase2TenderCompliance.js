import 'dotenv/config'
import pool from './db.js'

const migrate = async () => {
  const connection = await pool.getConnection()

  try {
    console.log(
      'Starting Phase 2 compliance migration...'
    )

    await connection.beginTransaction()

    // Reusable compliance templates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS compliance_templates (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT NULL,
        status ENUM('ACTIVE', 'INACTIVE')
          NOT NULL DEFAULT 'ACTIVE',
        is_default TINYINT(1)
          NOT NULL DEFAULT 0,
        created_by INT UNSIGNED NOT NULL,
        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_compliance_templates_status (
          status
        ),

        CONSTRAINT fk_compliance_templates_created_by
          FOREIGN KEY (created_by)
          REFERENCES users(id)
          ON DELETE RESTRICT
      )
    `)

    // Reusable items inside a template
    await connection.query(`
      CREATE TABLE IF NOT EXISTS compliance_template_items (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        template_id INT UNSIGNED NOT NULL,
        category VARCHAR(100)
          NOT NULL DEFAULT 'GENERAL',
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        is_mandatory TINYINT(1)
          NOT NULL DEFAULT 1,
        sort_order INT UNSIGNED
          NOT NULL DEFAULT 0,
        is_active TINYINT(1)
          NOT NULL DEFAULT 1,
        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_compliance_template_items_template (
          template_id
        ),

        INDEX idx_compliance_template_items_active (
          is_active
        ),

        CONSTRAINT fk_compliance_template_items_template
          FOREIGN KEY (template_id)
          REFERENCES compliance_templates(id)
          ON DELETE CASCADE
      )
    `)

    // Tender-specific copied/customized compliance items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tender_compliance_items (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        tender_id INT UNSIGNED NOT NULL,

        source_template_item_id INT UNSIGNED NULL,

        category VARCHAR(100)
          NOT NULL DEFAULT 'GENERAL',

        title VARCHAR(255) NOT NULL,
        description TEXT NULL,

        is_mandatory TINYINT(1)
          NOT NULL DEFAULT 1,

        status ENUM(
          'NOT_STARTED',
          'IN_PROGRESS',
          'COMPLETED',
          'NOT_APPLICABLE'
        )
          NOT NULL DEFAULT 'NOT_STARTED',

        assigned_user_id INT UNSIGNED NULL,

        due_date DATE NULL,

        notes TEXT NULL,

        sort_order INT UNSIGNED
          NOT NULL DEFAULT 0,

        is_active TINYINT(1)
          NOT NULL DEFAULT 1,

        created_by INT UNSIGNED NOT NULL,

        completed_by INT UNSIGNED NULL,
        completed_at DATETIME NULL,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_tender_compliance_tender (
          tender_id
        ),

        INDEX idx_tender_compliance_status (
          status
        ),

        INDEX idx_tender_compliance_assigned_user (
          assigned_user_id
        ),

        INDEX idx_tender_compliance_due_date (
          due_date
        ),

        INDEX idx_tender_compliance_active (
          is_active
        ),

        CONSTRAINT fk_tender_compliance_tender
          FOREIGN KEY (tender_id)
          REFERENCES tenders(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_tender_compliance_source_item
          FOREIGN KEY (source_template_item_id)
          REFERENCES compliance_template_items(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_tender_compliance_assigned_user
          FOREIGN KEY (assigned_user_id)
          REFERENCES users(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_tender_compliance_created_by
          FOREIGN KEY (created_by)
          REFERENCES users(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_tender_compliance_completed_by
          FOREIGN KEY (completed_by)
          REFERENCES users(id)
          ON DELETE SET NULL
      )
    `)

    await connection.commit()

    console.log(
      'Phase 2 compliance migration completed successfully.'
    )
  } catch (error) {
    await connection.rollback()

    console.error(
      'Phase 2 compliance migration failed:',
      error.message
    )

    throw error
  } finally {
    connection.release()
    await pool.end()
  }
}

migrate()