import express from 'express'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'
import tenderRoutes from './routes/tenderRoutes.js'
import userRoutes from './routes/userRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import {
  notFound,
  errorHandler,
} from './middleware/errorMiddleware.js'

const app = express()

app.disable('x-powered-by')

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)

app.use(express.json({ limit: '10kb' }))
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EHG Holdings API is running.',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/tenders', tenderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/companies', companyRoutes)

app.use(notFound)
app.use(errorHandler)

export default app