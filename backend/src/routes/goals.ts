import { Router, Response } from 'express'
import db from '../database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/', (req: AuthRequest, res: Response) => {
  const goals = db
    .prepare('SELECT calories, protein, carbs, fat FROM goals WHERE user_id = ?')
    .get(req.userId) as { calories: number; protein: number; carbs: number; fat: number } | undefined
  res.json(goals ?? { calories: null, protein: null, carbs: null, fat: null })
})

router.put('/', (req: AuthRequest, res: Response) => {
  const { calories, protein, carbs, fat } = req.body
  db.prepare(`
    INSERT INTO goals (user_id, calories, protein, carbs, fat)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      calories = excluded.calories,
      protein = excluded.protein,
      carbs = excluded.carbs,
      fat = excluded.fat
  `).run(req.userId, calories ?? null, protein ?? null, carbs ?? null, fat ?? null)
  res.json({ success: true })
})

export default router
