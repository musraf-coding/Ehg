import pool from '../config/db.js'

export const getDefaultComplianceTemplate = async () => {
  const [rows] = await pool.query(`
    SELECT
      id,
      name,
      description,
      status,
      is_default,
      created_by,
      created_at,
      updated_at
    FROM compliance_templates
    WHERE status = 'ACTIVE'
      AND is_default = 1
    ORDER BY id
    LIMIT 1
  `)

  return rows[0] || null
}

export const getComplianceTemplateItems = async (
  templateId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        template_id,
        category,
        title,
        description,
        is_mandatory,
        sort_order,
        is_active,
        created_at,
        updated_at
      FROM compliance_template_items
      WHERE template_id = ?
        AND is_active = 1
      ORDER BY sort_order ASC, id ASC
    `,
    [templateId]
  )

  return rows
}

export const getTenderComplianceItems = async (
  tenderId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        tci.id,
        tci.tender_id,
        tci.source_template_item_id,
        tci.category,
        tci.title,
        tci.description,
        tci.is_mandatory,
        tci.status,
        tci.assigned_user_id,
        assigned_user.name
          AS assigned_user_name,
        assigned_user.email
          AS assigned_user_email,
        tci.due_date,
        tci.notes,
        tci.sort_order,
        tci.is_active,
        tci.created_by,
        creator.name
          AS created_by_name,
        tci.completed_by,
        completer.name
          AS completed_by_name,
        tci.completed_at,
        tci.created_at,
        tci.updated_at
      FROM tender_compliance_items tci

      LEFT JOIN users assigned_user
        ON assigned_user.id =
          tci.assigned_user_id

      LEFT JOIN users creator
        ON creator.id =
          tci.created_by

      LEFT JOIN users completer
        ON completer.id =
          tci.completed_by

      WHERE tci.tender_id = ?
        AND tci.is_active = 1

      ORDER BY
        tci.sort_order ASC,
        tci.id ASC
    `,
    [tenderId]
  )

  return rows
}

export const getTenderComplianceItemById = async (
  tenderId,
  complianceItemId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        tci.id,
        tci.tender_id,
        tci.source_template_item_id,
        tci.category,
        tci.title,
        tci.description,
        tci.is_mandatory,
        tci.status,
        tci.assigned_user_id,
        assigned_user.name
          AS assigned_user_name,
        tci.due_date,
        tci.notes,
        tci.sort_order,
        tci.is_active,
        tci.created_by,
        creator.name
          AS created_by_name,
        tci.completed_by,
        completer.name
          AS completed_by_name,
        tci.completed_at,
        tci.created_at,
        tci.updated_at
      FROM tender_compliance_items tci

      LEFT JOIN users assigned_user
        ON assigned_user.id =
          tci.assigned_user_id

      LEFT JOIN users creator
        ON creator.id =
          tci.created_by

      LEFT JOIN users completer
        ON completer.id =
          tci.completed_by

      WHERE tci.tender_id = ?
        AND tci.id = ?
        AND tci.is_active = 1

      LIMIT 1
    `,
    [tenderId, complianceItemId]
  )

  return rows[0] || null
}

export const getTenderComplianceSummary = async (
  tenderId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        COUNT(*) AS total,

        SUM(
          CASE
            WHEN status = 'NOT_STARTED'
            THEN 1
            ELSE 0
          END
        ) AS notStarted,

        SUM(
          CASE
            WHEN status = 'IN_PROGRESS'
            THEN 1
            ELSE 0
          END
        ) AS inProgress,

        SUM(
          CASE
            WHEN status = 'COMPLETED'
            THEN 1
            ELSE 0
          END
        ) AS completed,

        SUM(
          CASE
            WHEN status = 'NOT_APPLICABLE'
            THEN 1
            ELSE 0
          END
        ) AS notApplicable,

        SUM(
          CASE
            WHEN is_mandatory = 1
            THEN 1
            ELSE 0
          END
        ) AS mandatory,

        SUM(
          CASE
            WHEN due_date < CURDATE()
              AND status NOT IN (
                'COMPLETED',
                'NOT_APPLICABLE'
              )
            THEN 1
            ELSE 0
          END
        ) AS overdue

      FROM tender_compliance_items
      WHERE tender_id = ?
        AND is_active = 1
    `,
    [tenderId]
  )

  const summary = rows[0] || {}

  return {
    total: Number(summary.total || 0),
    notStarted: Number(
      summary.notStarted || 0
    ),
    inProgress: Number(
      summary.inProgress || 0
    ),
    completed: Number(
      summary.completed || 0
    ),
    notApplicable: Number(
      summary.notApplicable || 0
    ),
    mandatory: Number(
      summary.mandatory || 0
    ),
    overdue: Number(
      summary.overdue || 0
    ),
  }
}

export const applyComplianceTemplateToTender =
  async ({
    tenderId,
    templateId,
    createdBy,
  }) => {
    const connection =
      await pool.getConnection()

    try {
      await connection.beginTransaction()

      /*
       * Copy template items into this tender.
       *
       * NOT EXISTS prevents the same template item
       * from being copied twice to the same tender.
       */
      const [result] = await connection.query(
        `
          INSERT INTO tender_compliance_items (
            tender_id,
            source_template_item_id,
            category,
            title,
            description,
            is_mandatory,
            status,
            assigned_user_id,
            due_date,
            notes,
            sort_order,
            is_active,
            created_by
          )

          SELECT
            ?,
            cti.id,
            cti.category,
            cti.title,
            cti.description,
            cti.is_mandatory,
            'NOT_STARTED',
            NULL,
            NULL,
            NULL,
            cti.sort_order,
            1,
            ?

          FROM compliance_template_items cti

          WHERE cti.template_id = ?
            AND cti.is_active = 1

            AND NOT EXISTS (
              SELECT 1
              FROM tender_compliance_items tci

              WHERE tci.tender_id = ?
                AND tci.source_template_item_id =
                  cti.id
            )

          ORDER BY
            cti.sort_order ASC,
            cti.id ASC
        `,
        [
          tenderId,
          createdBy,
          templateId,
          tenderId,
        ]
      )

      await connection.commit()

      return {
        insertedCount:
          Number(result.affectedRows || 0),
      }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

export const createTenderComplianceItem = async ({
  tenderId,
  category,
  title,
  description,
  isMandatory,
  status,
  assignedUserId,
  dueDate,
  notes,
  sortOrder,
  createdBy,
}) => {
  const [result] = await pool.query(
    `
      INSERT INTO tender_compliance_items (
        tender_id,
        source_template_item_id,
        category,
        title,
        description,
        is_mandatory,
        status,
        assigned_user_id,
        due_date,
        notes,
        sort_order,
        is_active,
        created_by
      )
      VALUES (
        ?,
        NULL,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        1,
        ?
      )
    `,
    [
      tenderId,
      category,
      title,
      description,
      isMandatory ? 1 : 0,
      status,
      assignedUserId,
      dueDate,
      notes,
      sortOrder,
      createdBy,
    ]
  )

  return getTenderComplianceItemById(
    tenderId,
    result.insertId
  )
}

export const updateTenderComplianceItemById =
  async ({
    tenderId,
    complianceItemId,
    category,
    title,
    description,
    isMandatory,
    status,
    assignedUserId,
    dueDate,
    notes,
    sortOrder,
    completedBy,
    completedAt,
  }) => {
    await pool.query(
      `
        UPDATE tender_compliance_items
        SET
          category = ?,
          title = ?,
          description = ?,
          is_mandatory = ?,
          status = ?,
          assigned_user_id = ?,
          due_date = ?,
          notes = ?,
          sort_order = ?,
          completed_by = ?,
          completed_at = ?
        WHERE id = ?
          AND tender_id = ?
          AND is_active = 1
      `,
      [
        category,
        title,
        description,
        isMandatory ? 1 : 0,
        status,
        assignedUserId,
        dueDate,
        notes,
        sortOrder,
        completedBy,
        completedAt,
        complianceItemId,
        tenderId,
      ]
    )

    return getTenderComplianceItemById(
      tenderId,
      complianceItemId
    )
  }

export const deactivateTenderComplianceItem =
  async (
    tenderId,
    complianceItemId
  ) => {
    const [result] = await pool.query(
      `
        UPDATE tender_compliance_items
        SET is_active = 0
        WHERE id = ?
          AND tender_id = ?
          AND is_active = 1
      `,
      [complianceItemId, tenderId]
    )

    return result.affectedRows > 0
  }