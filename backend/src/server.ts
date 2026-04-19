import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { runMigrations } from './infrastructure/database/connection'
import questionsRoutes from './presentation/routes/questions.routes'
import studyPlanRoutes from './presentation/routes/study-plan.routes'
import essayRoutes from './presentation/routes/essay.routes'
import progressRoutes from './presentation/routes/progress.routes'
import { errorHandler } from './presentation/middleware/errorHandler'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '5mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/questions', questionsRoutes)
app.use('/api/study-plans', studyPlanRoutes)
app.use('/api/essays', essayRoutes)
app.use('/api/progress', progressRoutes)

app.use(errorHandler)

const PORT = parseInt(process.env.PORT ?? '3000', 10)

async function start() {
  await runMigrations()
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

export { app }
