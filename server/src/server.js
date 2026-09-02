import 'dotenv/config'

import app from './app.js'
import { testDatabaseConnection } from './config/db.js'

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await testDatabaseConnection()

    app.listen(PORT, () => {
      console.log(`EHG Holdings API running on port ${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error(
      'Server startup failed because the database connection could not be established.'
    )

    process.exit(1)
  }
}

startServer()