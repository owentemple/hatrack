import { Router, Response } from 'express'
import prisma from '../db'
import { AuthRequest, authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response) => {
  const hats = await prisma.hat.findMany({
    where: { userId: req.userId! },
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
  const hat = await prisma.hat.findFirst({ where: { id, userId: req.userId! } })
  if (!hat) {
    res.status(404).json({ error: 'Hat not found' })
    return
  }

  const updated = await prisma.hat.update({
    where: { id },
    data: req.body,
  })
  res.json(updated)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id as string)
  const hat = await prisma.hat.findFirst({ where: { id, userId: req.userId! } })
  if (!hat) {
    res.status(404).json({ error: 'Hat not found' })
    return
  }

  await prisma.hat.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
