import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { getStripe } from '../services/stripe'
import prisma from '../db'

const router = Router()
router.use(authMiddleware)

const APP_URL = process.env.APP_URL || 'http://localhost:5173'

// Get premium status
router.get('/status', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { isPremium: true, subscriptionExpiresAt: true },
  })
  if (!user) { res.status(404).json({ error: 'User not found' }); return }
  res.json({ isPremium: user.isPremium, expiresAt: user.subscriptionExpiresAt })
})

// Create checkout session
router.post('/checkout', async (req: AuthRequest, res: Response) => {
  const stripe = getStripe()
  const user = await prisma.user.findUnique({ where: { id: req.userId! } })
  if (!user) { res.status(404).json({ error: 'User not found' }); return }

  // Create or reuse Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId: String(user.id) } })
    customerId = customer.id
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${APP_URL}/settings?upgraded=1`,
    cancel_url: `${APP_URL}/settings`,
  })

  res.json({ url: session.url })
})

// Create customer portal session
router.post('/portal', async (req: AuthRequest, res: Response) => {
  const stripe = getStripe()
  const user = await prisma.user.findUnique({ where: { id: req.userId! } })
  if (!user?.stripeCustomerId) { res.status(400).json({ error: 'No subscription found' }); return }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${APP_URL}/settings`,
  })

  res.json({ url: session.url })
})

export default router
