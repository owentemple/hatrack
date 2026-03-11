import { Router, Response } from 'express'
import prisma from '../db'
import { AuthRequest, authMiddleware } from '../middleware/auth'
import { isBeeminderConfigured, sendDatapoint } from '../services/beeminder'
import { computePreferredHour } from './settings'

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

  // Fire-and-forget: recalculate SMS reminder hour every 10 sessions
  if (score > 0) {
    prisma.focusSession.count({ where: { userId: req.userId!, score: { gt: 0 } } })
      .then(async (count) => {
        if (count % 10 === 0) {
          const u = await prisma.user.findUnique({
            where: { id: req.userId! },
            select: { smsEnabled: true, smsTimezone: true },
          })
          if (u?.smsEnabled && u.smsTimezone) {
            const hour = await computePreferredHour(req.userId!, u.smsTimezone)
            await prisma.user.update({ where: { id: req.userId! }, data: { smsReminderHour: hour } })
          }
        }
      })
      .catch(err => console.error('SMS hour recalc failed:', err.message))
  }

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

  // Calculate streak: consecutive days with score > 0, going backwards from today
  const sessions = await prisma.focusSession.findMany({
    where: { userId: req.userId!, score: { gt: 0 } },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  let streak = 0
  if (sessions.length > 0) {
    // Build set of active days in user's local timezone
    const activeDays = new Set<string>()
    for (const s of sessions) {
      const localTime = new Date(s.createdAt.getTime() - offsetMs)
      const dayKey = `${localTime.getUTCFullYear()}-${localTime.getUTCMonth()}-${localTime.getUTCDate()}`
      activeDays.add(dayKey)
    }

    // Walk backwards from today
    const checkDate = new Date(localNow)
    for (let i = 0; i < 365; i++) {
      const dayKey = `${checkDate.getUTCFullYear()}-${checkDate.getUTCMonth()}-${checkDate.getUTCDate()}`
      if (activeDays.has(dayKey)) {
        streak++
      } else if (i === 0) {
        // Today doesn't count against you — maybe they haven't started yet
        // Just skip today and check yesterday
      } else {
        break
      }
      checkDate.setUTCDate(checkDate.getUTCDate() - 1)
    }
  }

  res.json({
    totalScore: total._sum.score || 0,
    todayScore: today._sum.score || 0,
    streak,
  })
})

export default router
