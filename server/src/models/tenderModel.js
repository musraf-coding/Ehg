import pool from '../config/db.js'
export const getAllTenders = async () => {
  // 1. Get all tenders
  const [tenders] = await pool.query(`
    SELECT
      t.id,
      t.reference_no,
      t.title,
      t.client_name,
      t.description,
      t.status,
      t.priority,
      t.progress,
      t.start_date,
      t.deadline,
      t.created_by,
      t.created_at,
      t.updated_at,
      u.name AS created_by_name
    FROM tenders t
    LEFT JOIN users u
      ON t.created_by = u.id
    ORDER BY t.created_at DESC
  `)

  if (tenders.length === 0) {
    return []
  }

  // 2. Get employee assignments for all tenders
  const tenderIds = tenders.map((tender) => tender.id)

  const placeholders = tenderIds
    .map(() => '?')
    .join(',')

  const [assignments] = await pool.query(
    `
    SELECT
      a.id,
      a.tender_id,
      a.user_id,
      a.assigned_by,
      a.assigned_at,
      employee.name AS employee_name,
      employee.email AS employee_email,
      employee.department AS employee_department,
      employee.status AS employee_status,
      assigner.name AS assigned_by_name
    FROM assignments a
    INNER JOIN users employee
      ON a.user_id = employee.id
    INNER JOIN users assigner
      ON a.assigned_by = assigner.id
    WHERE a.tender_id IN (${placeholders})
    ORDER BY a.assigned_at ASC
    `,
    tenderIds
  )

  // 3. Attach assigned employees to each tender
  return tenders.map((tender) => ({
    ...tender,

    assignments: assignments
      .filter(
        (assignment) =>
          assignment.tender_id === tender.id
      )
      .map((assignment) => ({
        id: assignment.id,
        user_id: assignment.user_id,
        employee_name:
          assignment.employee_name,
        employee_email:
          assignment.employee_email,
        department:
          assignment.employee_department,
        status:
          assignment.employee_status,
        assigned_by:
          assignment.assigned_by,
        assigned_by_name:
          assignment.assigned_by_name,
        assigned_at:
          assignment.assigned_at,
      })),
  }))
}
export const getTenderById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      t.id,
      t.reference_no,
      t.title,
      t.client_name,
      t.description,
      t.status,
      t.priority,
      t.progress,
      t.start_date,
      t.deadline,
      t.created_by,
      t.created_at,
      t.updated_at,
      u.name AS created_by_name
    FROM tenders t
    LEFT JOIN users u
      ON t.created_by = u.id
    WHERE t.id = ?
    LIMIT 1
    `,
    [id]
  )

  return rows[0] || null
}

export const createTender = async ({
  referenceNo,
  title,
  clientName,
  description,
  status,
  priority,
  progress,
  startDate,
  deadline,
  createdBy,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO tenders (
      reference_no,
      title,
      client_name,
      description,
      status,
      priority,
      progress,
      start_date,
      deadline,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      referenceNo,
      title,
      clientName || null,
      description || null,
      status || 'DRAFT',
      priority || 'MEDIUM',
      progress ?? 0,
      startDate || null,
      deadline || null,
      createdBy,
    ]
  )

  return result.insertId
}

export const updateTenderById = async (
  id,
  {
    referenceNo,
    title,
    clientName,
    description,
    status,
    priority,
    progress,
    startDate,
    deadline,
  }
) => {
  const [result] = await pool.query(
    `
    UPDATE tenders
    SET
      reference_no = ?,
      title = ?,
      client_name = ?,
      description = ?,
      status = ?,
      priority = ?,
      progress = ?,
      start_date = ?,
      deadline = ?
    WHERE id = ?
    `,
    [
      referenceNo,
      title,
      clientName || null,
      description || null,
      status,
      priority,
      progress,
      startDate || null,
      deadline || null,
      id,
    ]
  )

  return result.affectedRows
}

export const assignTenderToEmployee = async ({
  tenderId,
  userId,
  assignedBy,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO assignments (
      tender_id,
      user_id,
      assigned_by
    )
    VALUES (?, ?, ?)
    `,
    [tenderId, userId, assignedBy]
  )

  return result.insertId
}

export const getTenderAssignments = async (tenderId) => {
  const [rows] = await pool.query(
    `
    SELECT
      a.id,
      a.tender_id,
      a.user_id,
      a.assigned_by,
      a.assigned_at,
      employee.name AS employee_name,
      employee.email AS employee_email,
      assigner.name AS assigned_by_name
    FROM assignments a
    INNER JOIN users employee
      ON a.user_id = employee.id
    INNER JOIN users assigner
      ON a.assigned_by = assigner.id
    WHERE a.tender_id = ?
    ORDER BY a.assigned_at DESC
    `,
    [tenderId]
  )

  return rows
}

export const getAssignedTendersByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      t.id,
      t.reference_no AS referenceNo,
      t.title,
      t.client_name AS clientName,
      t.description,
      t.status,
      t.priority,
      t.progress,
      t.start_date AS startDate,
      t.deadline,
      a.assigned_at AS assignedAt,
      assigner.name AS assignedByName
    FROM assignments a

    INNER JOIN tenders t
      ON a.tender_id = t.id

    INNER JOIN users assigner
      ON a.assigned_by = assigner.id

    WHERE a.user_id = ?

    ORDER BY
      CASE
        WHEN t.deadline IS NULL THEN 1
        ELSE 0
      END,
      t.deadline ASC,
      a.assigned_at DESC
    `,
    [userId]
  )

  return rows
}