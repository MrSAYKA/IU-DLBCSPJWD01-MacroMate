import { Router, Response } from 'express'
import db from '../database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/summary', (req: AuthRequest, res: Response) => {
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10)
  const summary = db
    .prepare(
      `SELECT
        COALESCE(SUM(calories * quantity), 0) AS calories,
        COALESCE(SUM(protein * quantity), 0)  AS protein,
        COALESCE(SUM(carbs * quantity), 0)    AS carbs,
        COALESCE(SUM(fat * quantity), 0)      AS fat
      FROM food_logs
      WHERE user_id = ? AND date(logged_at) = ?`,
    )
    .get(req.userId, date)
  res.json(summary)
})

router.get('/', (req: AuthRequest, res: Response) => {
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10)
  const logs = db
    .prepare(
      `SELECT id, food_name, calories, protein, carbs, fat, quantity, unit, logged_at
      FROM food_logs
      WHERE user_id = ? AND date(logged_at) = ?
      ORDER BY logged_at ASC`,
    )
    .all(req.userId, date)
  res.json({ logs })
})

router.post('/', (req: AuthRequest, res: Response) => {
  const { food_name, calories, protein, carbs, fat, quantity = 1, unit = 'serving' } = req.body
  if (!food_name) {
    res.status(400).json({ error: 'food_name is required' })
    return
  }
  const result = db
    .prepare(
      `INSERT INTO food_logs (user_id, food_name, calories, protein, carbs, fat, quantity, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(req.userId, food_name, calories ?? null, protein ?? null, carbs ?? null, fat ?? null, quantity, unit)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const result = db
    .prepare('DELETE FROM food_logs WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId)
  if (result.changes === 0) {
    res.status(404).json({ error: 'Log not found' })
    return
  }
  res.json({ success: true })
})

export default router
