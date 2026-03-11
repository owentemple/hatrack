import { Router, Response } from 'express'
import prisma from '../db'
import { AuthRequest, authMiddleware } from '../middleware/auth'
import { sendSms, validateE164, formatPhoneInput } from '../services/twilio'

const router = Router()

router.use(authMiddleware)

router.get('/beeminder', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { beeminderUsername: true, beeminderGoalSlug: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({
    connected: !!(user.beeminderUsername && user.beeminderGoalSlug),
    username: user.beeminderUsername,
    goalSlug: user.beeminderGoalSlug,
  })
})

router.put('/beeminder', async (req: AuthRequest, res: Response) => {
  const { username, authToken, goalSlug } = req.body

  if (!username || !authToken || !goalSlug) {
    res.status(400).json({ error: 'username, authToken, and goalSlug are required' })
    return
  }

  await prisma.user.update({
    where: { id: req.userId! },
    data: {
      beeminderUsername: username,
      beeminderAuthToken: authToken,
      beeminderGoalSlug: goalSlug,
    },
  })

  res.json({ connected: true, username, goalSlug })
})

router.delete('/beeminder', async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.userId! },
    data: {
      beeminderUsername: null,
      beeminderAuthToken: null,
      beeminderGoalSlug: null,
    },
  })

  res.json({ connected: false })
})

// SMS reminders
router.get('/sms', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { smsPhone: true, smsEnabled: true, smsTimezone: true, smsReminderHour: true, smsOptedOutAt: true, smsFrequency: true, smsCustomMessage: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({
    enabled: user.smsEnabled,
    phone: user.smsPhone ? `•••••••${user.smsPhone.slice(-4)}` : null,
    timezone: user.smsTimezone,
    reminderHour: user.smsReminderHour,
    frequency: user.smsFrequency,
    customMessage: user.smsCustomMessage,
    optedOut: !!user.smsOptedOutAt,
  })
})

router.put('/sms', async (req: AuthRequest, res: Response) => {
  const { phone, timezone, frequency, customMessage } = req.body

  if (!phone || !timezone) {
    res.status(400).json({ error: 'phone and timezone are required' })
    return
  }

  const validFrequencies = ['daily', 'weekly', 'monthly']
  const freq = validFrequencies.includes(frequency) ? frequency : 'daily'

  const formatted = formatPhoneInput(phone)
  if (!formatted || !validateE164(formatted)) {
    res.status(400).json({ error: 'Please enter a valid US phone number' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { smsOptedOutAt: true },
  })

  if (user?.smsOptedOutAt) {
    res.status(400).json({ error: 'You previously opted out via STOP. Text START to the HatRack number to re-enable.' })
    return
  }

  // Compute initial reminder hour from session history
  const reminderHour = await computePreferredHour(req.userId!, timezone)

  await prisma.user.update({
    where: { id: req.userId! },
    data: {
      smsPhone: formatted,
      smsEnabled: true,
      smsTimezone: timezone,
      smsReminderHour: reminderHour,
      smsFrequency: freq,
      smsCustomMessage: customMessage?.trim()?.slice(0, 160) || null,
      smsOptedOutAt: null,
    },
  })

  // Send welcome SMS (fire-and-forget)
  const freqLabel = freq === 'daily' ? 'daily' : freq === 'weekly' ? 'weekly' : 'monthly'
  sendSms(formatted, `HatRack: ${freqLabel.charAt(0).toUpperCase() + freqLabel.slice(1)} reminders enabled! Reply STOP to opt out.`)
    .catch((err) => console.error('Welcome SMS failed:', err.message))

  res.json({
    enabled: true,
    phone: `•••••••${formatted.slice(-4)}`,
    timezone,
    reminderHour,
    frequency: freq,
    customMessage: customMessage?.trim()?.slice(0, 160) || null,
    optedOut: false,
  })
})

router.delete('/sms', async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.userId! },
    data: {
      smsPhone: null,
      smsEnabled: false,
      smsTimezone: null,
      smsReminderHour: null,
    },
  })

  res.json({ enabled: false })
})

async function computePreferredHour(userId: number, timezone: string): Promise<number> {
  const sessions = await prisma.focusSession.findMany({
    where: { userId, score: { gt: 0 } },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  if (sessions.length < 5) return 9 // default 9 AM local

  const hourCounts = new Map<number, number>()
  for (const s of sessions) {
    const localHour = parseInt(
      new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }).format(s.createdAt)
    )
    hourCounts.set(localHour, (hourCounts.get(localHour) || 0) + 1)
  }

  let peakHour = 9
  let maxCount = 0
  for (const [hour, count] of hourCounts) {
    if (count > maxCount) {
      maxCount = count
      peakHour = hour
    }
  }

  return peakHour
}

export { computePreferredHour }
export default router
