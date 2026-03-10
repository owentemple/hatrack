import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import prisma from '../db'
import { signToken, authMiddleware, AuthRequest } from '../middleware/auth'
import { sendPasswordResetEmail } from '../services/email'

const router = Router()

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body
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

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) {
      res.status(400).json({ error: 'Email is required' })
      return
    }

    // Always return success to avoid leaking whether email exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.json({ ok: true })
      return
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    })

    try {
      await sendPasswordResetEmail(email, token)
    } catch (emailErr) {
      console.error('Failed to send password reset email:', emailErr)
    }

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      res.status(400).json({ error: 'Token and password are required' })
      return
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token } })
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      res.status(400).json({ error: 'Invalid or expired reset link' })
      return
    }

    const hash = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: reset.userId },
      data: { password: hash },
    })

    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    })

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/migrate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { hats, sessions } = req.body as {
      hats: Array<{ name: string; done: boolean; doneAt: string | null; deletedAt: string | null }>
      sessions: Array<{ hatName: string; durationSeconds: number; score: number; createdAt: string }>
    }

    // Create hats and build name-to-id mapping
    const hatMap = new Map<string, number>()

    if (hats && hats.length > 0) {
      for (const h of hats) {
        const created = await prisma.hat.create({
          data: {
            name: h.name,
            done: h.done,
            doneAt: h.doneAt ? new Date(h.doneAt) : null,
            deletedAt: h.deletedAt ? new Date(h.deletedAt) : null,
            userId,
          },
        })
        hatMap.set(h.name, created.id)
      }
    }

    // Create sessions linked to the new hat IDs
    if (sessions && sessions.length > 0) {
      for (const s of sessions) {
        let hatId = hatMap.get(s.hatName)
        // If hat was deleted and not in migration, create a soft-deleted placeholder
        if (!hatId) {
          const placeholder = await prisma.hat.create({
            data: {
              name: s.hatName,
              done: false,
              deletedAt: new Date(),
              userId,
            },
          })
          hatId = placeholder.id
          hatMap.set(s.hatName, hatId)
        }
        await prisma.focusSession.create({
          data: {
            durationSeconds: s.durationSeconds,
            score: s.score,
            hatId,
            userId,
            createdAt: new Date(s.createdAt),
          },
        })
      }
    }

    res.json({ ok: true })
  } catch (err) {
    console.error('Migration error:', err)
    res.status(500).json({ error: 'Migration failed' })
  }
})

export default router
