import pool from '../config/db.js'

export const getAllCompanies = async () => {
  const [rows] = await pool.query(`
    SELECT
      companies.id,
      companies.name,
      companies.code,
      companies.description,
      companies.status,
      companies.created_by,
      companies.created_at,
      companies.updated_at,
      creator.name AS created_by_name
    FROM companies
    LEFT JOIN users AS creator
      ON companies.created_by = creator.id
    ORDER BY companies.name ASC
  `)

  return rows
}

export const findCompanyById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        companies.id,
        companies.name,
        companies.code,
        companies.description,
        companies.status,
        companies.created_by,
        companies.created_at,
        companies.updated_at,
        creator.name AS created_by_name
      FROM companies
      LEFT JOIN users AS creator
        ON companies.created_by = creator.id
      WHERE companies.id = ?
      LIMIT 1
    `,
    [id]
  )

  return rows[0] || null
}

export const findCompanyByName = async (name) => {
  const [rows] = await pool.query(
    `
      SELECT id, name
      FROM companies
      WHERE LOWER(name) = LOWER(?)
      LIMIT 1
    `,
    [name]
  )

  return rows[0] || null
}

export const findCompanyByCode = async (code) => {
  const [rows] = await pool.query(
    `
      SELECT id, code
      FROM companies
      WHERE code = ?
      LIMIT 1
    `,
    [code]
  )

  return rows[0] || null
}

export const createCompany = async ({
  name,
  code = null,
  description = null,
  status = 'ACTIVE',
  createdBy = null,
}) => {
  const [result] = await pool.query(
    `
      INSERT INTO companies (
        name,
        code,
        description,
        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      name,
      code,
      description,
      status,
      createdBy,
    ]
  )

  return result.insertId
}

export const updateCompanyById = async (
  id,
  {
    name,
    code = null,
    description = null,
    status,
  }
) => {
  const [result] = await pool.query(
    `
      UPDATE companies
      SET
        name = ?,
        code = ?,
        description = ?,
        status = ?
      WHERE id = ?
    `,
    [
      name,
      code,
      description,
      status,
      id,
    ]
  )

  return result.affectedRows
}