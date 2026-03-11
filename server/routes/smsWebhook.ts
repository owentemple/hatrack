import { Router, Request, Response } from 'express'
import twilio from 'twilio'
import prisma from '../db'

const router = Router()

router.post('/twilio', async (req: Request, res: Response) => {
  // Validate request is from Twilio
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (authToken) {
    const signature = req.headers['x-twilio-signature'] as string
    const protocol = req.headers['x-forwarded-proto'] || req.protocol
    const url = `${protocol}://${req.headers.host}${req.originalUrl}`
    const valid = twilio.validateRequest(authToken, signature, url, req.body)
    if (!valid) {
      res.status(403).send('Invalid signature')
      return
    }
  }

  const from = req.body.From
  const body = (req.body.Body || '').trim().toUpperCase()

  if (!from) {
    res.status(400).send('Missing From')
    return
  }

  const user = await prisma.user.findFirst({
    where: { smsPhone: from },
  })

  if (!user) {
    res.type('text/xml').send('<Response></Response>')
    return
  }

  if (body === 'STOP' || body === 'UNSUBSCRIBE') {
    await prisma.user.update({
      where: { id: user.id },
      data: { smsEnabled: false, smsOptedOutAt: new Date() },
    })
  } else if (body === 'START' || body === 'SUBSCRIBE') {
    await prisma.user.update({
      where: { id: user.id },
      data: { smsEnabled: true, smsOptedOutAt: null },
    })
  }

  // Twilio expects TwiML response
  res.type('text/xml').send('<Response></Response>')
})

export default router
