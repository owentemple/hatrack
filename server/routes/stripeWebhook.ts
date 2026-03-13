import { Router, Request, Response } from 'express'
import { getStripe } from '../services/stripe'
import prisma from '../db'

const router = Router()

router.post('/stripe', async (req: Request, res: Response) => {
  const stripe = getStripe()
  const sig = req.headers['stripe-signature'] as string

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    res.status(400).send('Invalid signature')
    return
  }

  // Use `any` for webhook event objects — Stripe's types don't match the runtime shape well
  const obj = event.data.object as any

  switch (event.type) {
    case 'checkout.session.completed': {
      const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id
      const subscription = await stripe.subscriptions.retrieve(obj.subscription as string)
      const expiresAt = new Date((subscription as any).current_period_end * 1000)

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { isPremium: true, subscriptionExpiresAt: expiresAt },
      })
      break
    }
    case 'customer.subscription.updated': {
      const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id
      const active = ['active', 'trialing'].includes(obj.status)
      const expiresAt = new Date(obj.current_period_end * 1000)

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { isPremium: active, subscriptionExpiresAt: expiresAt },
      })
      break
    }
    case 'customer.subscription.deleted': {
      const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { isPremium: false, subscriptionExpiresAt: null },
      })
      break
    }
  }

  res.json({ received: true })
})

export default router
