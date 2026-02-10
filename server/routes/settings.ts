import { Router, Response } from 'express'
import prisma from '../db'
import { AuthRequest, authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/beeminder', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { beeminderUsername: true, beeminderGoalSlug: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({
    connected: !!(user.beeminderUsername && user.beeminderGoalSlug),
    username: user.beeminderUsername,
    goalSlug: user.beeminderGoalSlug,
  })
})

router.put('/beeminder', async (req: AuthRequest, res: Response) => {
  const { username, authToken, goalSlug } = req.body

  if (!username || !authToken || !goalSlug) {
    res.status(400).json({ error: 'username, authToken, and goalSlug are required' })
    return
  }

  await prisma.user.update({
    where: { id: req.userId! },
    data: {
      beeminderUsername: username,
      beeminderAuthToken: authToken,
      beeminderGoalSlug: goalSlug,
    },
  })

  res.json({ connected: true, username, goalSlug })
})

router.delete('/beeminder', async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.userId! },
    data: {
      beeminderUsername: null,
      beeminderAuthToken: null,
      beeminderGoalSlug: null,
    },
  })

  res.json({ connected: false })
})

export default router
