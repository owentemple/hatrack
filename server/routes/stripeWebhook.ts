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

  try {
    // Use `any` for webhook event objects — Stripe's types don't match the runtime shape well
    const obj = event.data.object as any
    console.log(`Stripe webhook: ${event.type}`, { customer: obj.customer, subscription: obj.subscription })

    switch (event.type) {
      case 'checkout.session.completed': {
        const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id
        const subscription = await stripe.subscriptions.retrieve(obj.subscription as string) as any
        console.log('Stripe webhook: subscription object keys:', Object.keys(subscription))
        // current_period_end may be top-level or nested depending on API version
        const periodEnd = subscription.current_period_end
          ?? subscription.items?.data?.[0]?.current_period_end
          ?? subscription.latest_invoice?.period_end
        console.log('Stripe webhook: period_end value:', periodEnd)

        const data: any = { isPremium: true }
        if (periodEnd) {
          data.subscriptionExpiresAt = new Date(periodEnd * 1000)
        }

        const result = await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data,
        })
        console.log(`Stripe webhook: set isPremium=true for customer ${customerId}, rows updated: ${result.count}`)
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
  } catch (err) {
    console.error(`Stripe webhook error processing ${event.type}:`, err)
    res.status(500).json({ error: 'Webhook handler failed' })
    return
  }

  res.json({ received: true })
})

export default router
