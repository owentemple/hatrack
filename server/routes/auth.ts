import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../db'
import { signToken } from '../middleware/auth'

const router = Router()

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, template } = req.body
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' })
      return
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: 'Email already in use' })
      return
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hash, name },
    })

    // Seed starter hats based on chosen template
    const starterHats = template === 'songwriter'
      ? [
          { name: 'Writing', userId: user.id },
          { name: 'Reading', userId: user.id },
          { name: 'Listening', userId: user.id },
          { name: 'Performing', userId: user.id },
        ]
      : [
          { name: 'Writing', userId: user.id },
          { name: 'Meditating', userId: user.id },
        ]
    await prisma.hat.createMany({ data: starterHats })

    const token = signToken(user.id)
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = signToken(user.id)
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
