import prisma from '../db'
import { sendSms } from './twilio'

const messages = [
  (streak: number) => streak >= 2
    ? `${streak} days in a row. Keep it going — https://hatrack.it`
    : 'Your hats are waiting. Tap to start — https://hatrack.it',
  () => 'Got a few minutes? Pick a hat — https://hatrack.it',
  () => 'Time to wear a hat. https://hatrack.it',
  (streak: number) => streak >= 2
    ? `Day ${streak}. Don't break the chain — https://hatrack.it`
    : 'Small sessions add up. Start one — https://hatrack.it',
]

function pickMessage(userId: number, streak: number): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const index = (userId + dayOfYear) % messages.length
  return messages[index](streak)
}

async function getStreak(userId: number, timezone: string): Promise<number> {
  const sessions = await prisma.focusSession.findMany({
    where: { userId, score: { gt: 0 } },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  if (sessions.length === 0) return 0

  const activeDays = new Set<string>()
  for (const s of sessions) {
    const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(s.createdAt)
    activeDays.add(dayKey)
  }

  const now = new Date()
  let streak = 0
  for (let i = 1; i < 365; i++) {
    const checkDate = new Date(now.getTime() - i * 86400000)
    const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(checkDate)
    if (activeDays.has(dayKey)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

async function sendDueReminders() {
  const users = await prisma.user.findMany({
    where: {
      smsEnabled: true,
      smsPhone: { not: null },
      smsOptedOutAt: null,
      smsTimezone: { not: null },
    },
  })

  const now = new Date()
  let sent = 0

  for (const user of users) {
    try {
      const tz = user.smsTimezone!
      const localHour = parseInt(
        new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(now)
      )
      const reminderHour = user.smsReminderHour ?? 9

      if (localHour !== reminderHour) continue

      // Check frequency-based cooldown
      if (user.smsLastSentAt) {
        const lastSent = user.smsLastSentAt.getTime()
        const freq = user.smsFrequency || 'daily'
        if (freq === 'daily') {
          const lastSentDay = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(user.smsLastSentAt)
          const todayDay = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)
          if (lastSentDay === todayDay) continue
        } else if (freq === 'weekly') {
          if (now.getTime() - lastSent < 7 * 86400000) continue
        } else if (freq === 'monthly') {
          if (now.getTime() - lastSent < 30 * 86400000) continue
        }
      }

      // Skip if user already has a session today
      const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)
      const todayStart = new Date(`${todayStr}T00:00:00`)
      // Convert local midnight to UTC by finding the offset
      const offsetMs = now.getTime() - new Date(
        new Intl.DateTimeFormat('en-US', {
          timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        }).format(now).replace(/(\d{2})\/(\d{2})\/(\d{4}), /, '$3-$1-$2T')
      ).getTime()

      const todaySession = await prisma.focusSession.findFirst({
        where: {
          userId: user.id,
          score: { gt: 0 },
          createdAt: { gte: new Date(todayStart.getTime() + offsetMs) },
        },
      })
      if (todaySession) continue

      // Safety cap
      if (sent >= 100) break

      const message = user.smsCustomMessage
        ? `${user.smsCustomMessage} — https://hatrack.it`
        : pickMessage(user.id, await getStreak(user.id, tz))
      await sendSms(user.smsPhone!, message)

      await prisma.user.update({
        where: { id: user.id },
        data: { smsLastSentAt: now },
      })

      sent++
      console.log(`SMS reminder sent to user ${user.id}`)
    } catch (err) {
      console.error(`SMS reminder failed for user ${user.id}:`, (err as Error).message)
    }
  }
}

export function startReminderScheduler() {
  console.log('SMS reminder scheduler started (15-minute interval)')
  setInterval(() => {
    sendDueReminders().catch((err) => console.error('Reminder scheduler error:', err.message))
  }, 15 * 60 * 1000)

  // Run once after a short startup delay
  setTimeout(() => {
    sendDueReminders().catch((err) => console.error('Reminder scheduler initial run error:', err.message))
  }, 10_000)
}
