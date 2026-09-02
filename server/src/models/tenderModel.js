import pool from '../config/db.js'

export const findAssignedTendersByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
      SELECT
        t.id,
        t.reference_no,
        t.title,
        t.client_name,
        t.description,
        t.status,
        t.progress,
        t.start_date,
        t.deadline,
        a.assigned_at
      FROM assignments a
      INNER JOIN tenders t
        ON a.tender_id = t.id
      WHERE a.user_id = ?
      ORDER BY
        CASE
          WHEN t.deadline IS NULL THEN 1
          ELSE 0
        END,
        t.deadline ASC,
        t.created_at DESC
    `,
    [userId]
  )

  return rows
}