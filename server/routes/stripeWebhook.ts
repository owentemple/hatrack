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
    console.log(`Stripe webhook: ${event.type}`, { customer: obj.customer })

    switch (event.type) {
      case 'checkout.session.completed': {
        const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id
        const subscription = await stripe.subscriptions.retrieve(obj.subscription as string) as any
        const periodEnd = subscription.current_period_end
          ?? subscription.items?.data?.[0]?.current_period_end

        const data: any = { isPremium: true }
        if (periodEnd) {
          data.subscriptionExpiresAt = new Date(periodEnd * 1000)
        }

        const result = await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data,
        })
        console.log(`Stripe webhook: isPremium=true for ${customerId}, rows: ${result.count}`)
        break
      }
      case 'customer.subscription.updated': {
        const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id
        const active = ['active', 'trialing'].includes(obj.status)
        const periodEnd = obj.current_period_end ?? obj.items?.data?.[0]?.current_period_end

        const data: any = { isPremium: active }
        if (periodEnd) {
          data.subscriptionExpiresAt = new Date(periodEnd * 1000)
        }

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data,
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
