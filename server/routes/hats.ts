import { Router, Response } from 'express'
import prisma from '../db'
import { AuthRequest, authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response) => {
  const now = new Date()
  const tzOffset = parseInt(req.query.tz as string) || 0 // minutes from UTC
  const offsetMs = tzOffset * 60 * 1000
  const localNow = new Date(now.getTime() - offsetMs)
  const todayStart = new Date(
    Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()) + offsetMs
  )

  await prisma.hat.updateMany({
    where: {
      userId: req.userId!,
      deletedAt: null,
      done: true,
      doneAt: { lt: todayStart },
    },
    data: { done: false, doneAt: null },
  })

  const hats = await prisma.hat.findMany({
    where: { userId: req.userId!, deletedAt: null },
    orderBy: { id: 'asc' },
  })
  res.json(hats)
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name } = req.body
  if (!name) {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  const hat = await prisma.hat.create({
    data: { name, userId: req.userId! },
  })
  res.status(201).json(hat)
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id as string)
  const hat = await prisma.hat.findFirst({ where: { id, userId: req.userId!, deletedAt: null } })
  if (!hat) {
    res.status(404).json({ error: 'Hat not found' })
    return
  }

  const { name, done } = req.body
  const updated = await prisma.hat.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name) }),
      ...(done !== undefined && { done: Boolean(done), doneAt: Boolean(done) ? new Date() : null }),
    },
  })
  res.json(updated)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id as string)
  const hat = await prisma.hat.findFirst({ where: { id, userId: req.userId!, deletedAt: null } })
  if (!hat) {
    res.status(404).json({ error: 'Hat not found' })
    return
  }

  await prisma.hat.update({ where: { id }, data: { deletedAt: new Date() } })
  res.json({ ok: true })
})

export default router
