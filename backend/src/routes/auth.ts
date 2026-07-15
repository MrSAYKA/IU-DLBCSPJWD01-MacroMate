import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../database'

const router = Router()

router.post('/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' })
    return
  }
  const hashedPassword = bcrypt.hashSync(password, 10)
  try {
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword)
    const token = jwt.sign({ userId: result.lastInsertRowid }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    res.status(201).json({ token })
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Username already exists' })
      return
    }
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' })
    return
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; password: string }
    | undefined
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  res.json({ token })
})

export default router
