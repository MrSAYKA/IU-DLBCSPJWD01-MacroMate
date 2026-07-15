import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import './databaseinit'

import authRoutes from './routes/auth'
import foodRoutes from './routes/food'
import goalsRoutes from './routes/goals'
import logsRoutes from './routes/logs'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/food', foodRoutes)
app.use('/api/goals', goalsRoutes)
app.use('/api/logs', logsRoutes)

app.listen(port, () => {
  console.log(`Running on Port ${port}`)
})
