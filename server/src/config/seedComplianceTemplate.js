import 'dotenv/config'
import pool from './db.js'

const seedComplianceTemplate = async () => {
  const connection = await pool.getConnection()

  try {
    console.log('Seeding standard compliance template...')

    await connection.beginTransaction()

    const [adminRows] = await connection.query(`
      SELECT users.id
      FROM users
      INNER JOIN roles
        ON roles.id = users.role_id
      WHERE roles.name = 'ADMIN'
        AND users.status = 'ACTIVE'
      ORDER BY users.id
      LIMIT 1
    `)

    if (adminRows.length === 0) {
      throw new Error(
        'No active ADMIN user found for template creation.'
      )
    }

    const adminUserId = adminRows[0].id

    const [existingTemplates] = await connection.query(
      `
        SELECT id
        FROM compliance_templates
        WHERE name = ?
        LIMIT 1
      `,
      ['Standard Tender Compliance Template']
    )

    let templateId

    if (existingTemplates.length > 0) {
      templateId = existingTemplates[0].id

      console.log(
        `Template already exists with ID ${templateId}.`
      )
    } else {
      const [templateResult] = await connection.query(
        `
          INSERT INTO compliance_templates (
            name,
            description,
            status,
            is_default,
            created_by
          )
          VALUES (?, ?, 'ACTIVE', 1, ?)
        `,
        [
          'Standard Tender Compliance Template',
          'Baseline compliance checklist for common tender documentation. Items may be customized after being applied to a tender.',
          adminUserId,
        ]
      )

      templateId = templateResult.insertId

      console.log(
        `Created template with ID ${templateId}.`
      )
    }

    const items = [
      {
        category: 'REGISTRATION',
        title: 'Company Registration Documents',
        description:
          'Valid company registration and incorporation documents.',
      },
      {
        category: 'TAX',
        title: 'Tax / VAT Documents',
        description:
          'Current tax and VAT registration or clearance documentation where applicable.',
      },
      {
        category: 'SOCIAL_SECURITY',
        title: 'Social Security Good Standing',
        description:
          'Current Social Security registration and good standing documentation.',
      },
      {
        category: 'GOOD_STANDING',
        title: 'Good Standing Certificate',
        description:
          'Valid company good standing certificate where required.',
      },
      {
        category: 'BANKING',
        title: 'Bank Confirmation',
        description:
          'Current bank confirmation letter or required banking documentation.',
      },
      {
        category: 'OWNERSHIP',
        title: 'Ownership Documents',
        description:
          'Ownership, shareholder or beneficial ownership documentation as required.',
      },
      {
        category: 'EXPERIENCE',
        title: 'Relevant Experience',
        description:
          'Evidence of relevant previous projects, contracts or tender experience.',
      },
      {
        category: 'COMPANY_PROFILE',
        title: 'Company Profile',
        description:
          'Current company profile suitable for tender submission.',
      },
      {
        category: 'REFERENCES',
        title: 'Client References',
        description:
          'Required references or reference letters from previous clients.',
      },
      {
        category: 'PERSONNEL',
        title: 'CVs / Key Personnel',
        description:
          'CVs and supporting information for required key personnel.',
      },
      {
        category: 'TECHNICAL',
        title: 'Technical Proposal',
        description:
          'Completed technical proposal addressing the tender requirements.',
      },
      {
        category: 'PRICING',
        title: 'Pricing Schedule',
        description:
          'Completed pricing schedule, quotation, BOQ or financial proposal.',
      },
      {
        category: 'FORMS',
        title: 'Signed Tender Forms',
        description:
          'All required tender forms completed and signed.',
      },
      {
        category: 'DECLARATIONS',
        title: 'Required Declarations',
        description:
          'All declarations, undertakings and disclosure forms required by the tender.',
      },
      {
        category: 'CERTIFICATES',
        title: 'Required Certificates / Licences',
        description:
          'Applicable certificates, licences, permits or professional registrations.',
      },
      {
        category: 'ATTACHMENTS',
        title: 'Supporting Attachments',
        description:
          'Any additional supporting attachments required by the tender.',
      },
    ]

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]

      const [existingItems] = await connection.query(
        `
          SELECT id
          FROM compliance_template_items
          WHERE template_id = ?
            AND title = ?
          LIMIT 1
        `,
        [templateId, item.title]
      )

      if (existingItems.length > 0) {
        continue
      }

      await connection.query(
        `
          INSERT INTO compliance_template_items (
            template_id,
            category,
            title,
            description,
            is_mandatory,
            sort_order,
            is_active
          )
          VALUES (?, ?, ?, ?, 1, ?, 1)
        `,
        [
          templateId,
          item.category,
          item.title,
          item.description,
          index + 1,
        ]
      )
    }

    await connection.commit()

    console.log(
      'Standard compliance template seeded successfully.'
    )
  } catch (error) {
    await connection.rollback()

    console.error(
      'Compliance template seed failed:',
      error.message
    )

    throw error
  } finally {
    connection.release()
    await pool.end()
  }
}

seedComplianceTemplate()