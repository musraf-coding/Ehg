
import 'dotenv/config'
import pool from './db.js'

const initializeDatabase = async () => {
  let connection

  try {
    connection = await pool.getConnection()

    console.log('Creating EHG Holdings core database tables...')

    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        phone VARCHAR(30) NULL,
        password_hash VARCHAR(255) NOT NULL,
        role_id INT UNSIGNED NOT NULL,
        department VARCHAR(100) NULL,
        status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
        last_login_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_users_role
          FOREIGN KEY (role_id)
          REFERENCES roles(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,

        INDEX idx_users_role_id (role_id),
        INDEX idx_users_status (status),
        INDEX idx_users_department (department)
      )
    `)

    await connection.query(`
  CREATE TABLE IF NOT EXISTS tenders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reference_no VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NULL,
    description TEXT NULL,
    status ENUM(
      'DRAFT',
      'PREPARATION',
      'IN_PROGRESS',
      'REVIEW',
      'SUBMITTED',
      'COMPLETED',
      'CANCELLED'
    ) NOT NULL DEFAULT 'DRAFT',
    progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
    start_date DATE NULL,
    deadline DATE NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tenders_created_by
      FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,

    INDEX idx_tenders_status (status),
    INDEX idx_tenders_deadline (deadline),
    INDEX idx_tenders_created_by (created_by)
  )
`)

await connection.query(`
  CREATE TABLE IF NOT EXISTS assignments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tender_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    assigned_by INT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignments_tender
      FOREIGN KEY (tender_id)
      REFERENCES tenders(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,

    CONSTRAINT fk_assignments_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,

    CONSTRAINT fk_assignments_assigned_by
      FOREIGN KEY (assigned_by)
      REFERENCES users(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,

    UNIQUE KEY uq_assignment_tender_user (tender_id, user_id),

    INDEX idx_assignments_user_id (user_id),
    INDEX idx_assignments_tender_id (tender_id)
  )
`)

    await connection.query(`
      INSERT IGNORE INTO roles (name)
      VALUES
        ('ADMIN'),
        ('MANAGER'),
        ('EMPLOYEE')
    `)

    console.log(
  'Core database tables created successfully: roles, users, tenders, assignments.'
)
    console.log('Roles seeded successfully.')
  } catch (error) {
    console.error('Database initialization failed:', error.message)
    process.exitCode = 1
  } finally {
    if (connection) {
      connection.release()
    }

    await pool.end()
  }
}

initializeDatabase()