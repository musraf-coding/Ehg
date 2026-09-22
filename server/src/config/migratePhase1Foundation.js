import 'dotenv/config'
import pool from './db.js'

const migratePhase1Foundation = async () => {
  let connection

  try {
    connection = await pool.getConnection()

    console.log('Starting Phase 1 foundation migration...')

    await connection.beginTransaction()

    // --------------------------------------------------
    // 1. Add CEO role
    // --------------------------------------------------
    await connection.query(`
      INSERT IGNORE INTO roles (name)
      VALUES ('CEO')
    `)

    console.log('✓ CEO role ready')

    // --------------------------------------------------
    // 2. Companies
    // --------------------------------------------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(191) NOT NULL,
        code VARCHAR(50) NULL,

        description TEXT NULL,

        status ENUM(
          'ACTIVE',
          'INACTIVE'
        ) NOT NULL DEFAULT 'ACTIVE',

        created_by INT UNSIGNED NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_companies_created_by
          FOREIGN KEY (created_by)
          REFERENCES users(id)
          ON UPDATE CASCADE
          ON DELETE SET NULL,

        UNIQUE KEY uq_companies_name (name),
        UNIQUE KEY uq_companies_code (code),

        INDEX idx_companies_status (status)
      )
    `)

    console.log('✓ companies table ready')

    // --------------------------------------------------
    // 3. User ↔ Company membership
    //
    // Supports:
    // - employee working for multiple companies
    // - primary company
    // - employee movement/history
    // --------------------------------------------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_companies (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        user_id INT UNSIGNED NOT NULL,
        company_id INT UNSIGNED NOT NULL,

        is_primary BOOLEAN NOT NULL DEFAULT FALSE,

        active_from DATE NULL,
        active_to DATE NULL,

        status ENUM(
          'ACTIVE',
          'INACTIVE'
        ) NOT NULL DEFAULT 'ACTIVE',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_user_companies_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,

        CONSTRAINT fk_user_companies_company
          FOREIGN KEY (company_id)
          REFERENCES companies(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,

        INDEX idx_user_companies_user (user_id),
        INDEX idx_user_companies_company (company_id),
        INDEX idx_user_companies_status (status)
      )
    `)

    console.log('✓ user_companies table ready')

    // --------------------------------------------------
    // 4. Company access / delegation
    //
    // Membership and permission are deliberately
    // separated.
    // --------------------------------------------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_company_permissions (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        user_id INT UNSIGNED NOT NULL,
        company_id INT UNSIGNED NOT NULL,

        can_view BOOLEAN NOT NULL DEFAULT TRUE,
        can_manage BOOLEAN NOT NULL DEFAULT FALSE,
        can_view_metrics BOOLEAN NOT NULL DEFAULT FALSE,

        granted_by INT UNSIGNED NULL,

        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        revoked_at DATETIME NULL,

        CONSTRAINT fk_company_permissions_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,

        CONSTRAINT fk_company_permissions_company
          FOREIGN KEY (company_id)
          REFERENCES companies(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,

        CONSTRAINT fk_company_permissions_granted_by
          FOREIGN KEY (granted_by)
          REFERENCES users(id)
          ON UPDATE CASCADE
          ON DELETE SET NULL,

        UNIQUE KEY uq_user_company_permission (
          user_id,
          company_id
        ),

        INDEX idx_company_permissions_user (user_id),
        INDEX idx_company_permissions_company (company_id)
      )
    `)

    console.log('✓ user_company_permissions table ready')

    await connection.commit()

    console.log('')
    console.log('Phase 1 foundation migration completed successfully.')
    console.log('')
    console.log('Added:')
    console.log('- CEO role')
    console.log('- companies')
    console.log('- user_companies')
    console.log('- user_company_permissions')
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    console.error(
      'Phase 1 foundation migration failed:',
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

migratePhase1Foundation()