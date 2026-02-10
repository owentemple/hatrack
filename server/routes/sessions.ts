import { Router, Response } from 'express'
import prisma from '../db'
import { AuthRequest, authMiddleware } from '../middleware/auth'

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
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const sessions = await prisma.focusSession.findMany({
    where: { userId: req.userId! },
    include: { hat: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(sessions)
})

router.get('/score', async (req: AuthRequest, res: Response) => {
  const result = await prisma.focusSession.aggregate({
    where: { userId: req.userId! },
    _sum: { score: true },
  })
  res.json({ totalScore: result._sum.score || 0 })
})

export default router
