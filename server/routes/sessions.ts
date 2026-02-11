import { Router, Response } from 'express'
import prisma from '../db'
import { AuthRequest, authMiddleware } from '../middleware/auth'
import { isBeeminderConfigured, sendDatapoint } from '../services/beeminder'

const router = Router()

router.use(authMiddleware)

router.post('/', async (req: AuthRequest, res: Response) => {
  const { durationSeconds, score, hatId } = req.body

  const hat = await prisma.hat.findFirst({ where: { id: hatId, userId: req.userId! } })
  if (!hat) {
    res.status(404).json({ error: 'Hat not found' })
    return
  }

  const session = await prisma.focusSession.create({
    data: {
      durationSeconds,
      score,
      hatId,
      userId: req.userId!,
    },
  })
  res.status(201).json(session)

  // Fire-and-forget: send score to Beeminder if configured
  if (score > 0) {
    prisma.user.findUnique({
      where: { id: req.userId! },
      select: { beeminderUsername: true, beeminderAuthToken: true, beeminderGoalSlug: true },
    }).then((user) => {
      if (user && isBeeminderConfigured(user)) {
        const minutes = Math.round(durationSeconds / 60)
        sendDatapoint(
          { username: user.beeminderUsername, authToken: user.beeminderAuthToken, goalSlug: user.beeminderGoalSlug },
          { value: score, comment: `${hat!.name} ${minutes}min via HatRack`, requestid: `hatrack-session-${session.id}` },
        ).catch((err) => console.error('Beeminder sync failed:', err.message))
      }
    }).catch((err) => console.error('Beeminder user lookup failed:', err.message))
  }
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const sessions = await prisma.focusSession.findMany({
    where: { userId: req.userId! },
    include: { hat: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(sessions)
})

router.delete('/', async (req: AuthRequest, res: Response) => {
  const result = await prisma.focusSession.deleteMany({
    where: { userId: req.userId! },
  })
  res.json({ deleted: result.count })
})

router.get('/score', async (req: AuthRequest, res: Response) => {
  const now = new Date()
  const tzOffset = parseInt(req.query.tz as string) || 0 // minutes from UTC (e.g. 360 for CST)
  const offsetMs = tzOffset * 60 * 1000
  // Find midnight in the client's local timezone, expressed as UTC
  const localNow = new Date(now.getTime() - offsetMs)
  const todayStart = new Date(
    Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()) + offsetMs
  )

  const [total, today] = await Promise.all([
    prisma.focusSession.aggregate({
      where: { userId: req.userId! },
      _sum: { score: true },
    }),
    prisma.focusSession.aggregate({
      where: { userId: req.userId!, createdAt: { gte: todayStart } },
      _sum: { score: true },
    }),
  ])
  res.json({
    totalScore: total._sum.score || 0,
    todayScore: today._sum.score || 0,
  })
})

export default router
