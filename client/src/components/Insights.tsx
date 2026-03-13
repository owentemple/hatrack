import type { SessionRecord } from '../lib/dataService'

interface Props {
  sessions: SessionRecord[]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

function daysAgo(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  return `${diff} days ago`
}

export default function Insights({ sessions }: Props) {
  const completed = sessions.filter(s => s.score > 0)
  if (completed.length < 3) return null

  // Highest scoring day
  const dayScores = new Map<string, { date: Date; score: number }>()
  for (const s of completed) {
    const d = new Date(s.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const existing = dayScores.get(key)
    if (existing) {
      existing.score += s.score
    } else {
      dayScores.set(key, { date: d, score: s.score })
    }
  }
  let bestDay = { date: new Date(), score: 0 }
  for (const entry of dayScores.values()) {
    if (entry.score > bestDay.score) bestDay = entry
  }

  // Most common hour
  const hourCounts = new Map<number, number>()
  for (const s of completed) {
    const h = new Date(s.createdAt).getHours()
    hourCounts.set(h, (hourCounts.get(h) || 0) + 1)
  }
  let peakHour = 0
  let peakHourCount = 0
  for (const [h, count] of hourCounts) {
    if (count > peakHourCount) { peakHour = h; peakHourCount = count }
  }

  // Most common day of week
  const dayCounts = new Map<number, number>()
  for (const s of completed) {
    const dow = new Date(s.createdAt).getDay()
    dayCounts.set(dow, (dayCounts.get(dow) || 0) + 1)
  }
  let peakDay = 0
  let peakDayCount = 0
  for (const [d, count] of dayCounts) {
    if (count > peakDayCount) { peakDay = d; peakDayCount = count }
  }

  // Hat-level stats
  const hatMinutes = new Map<string, number>()
  const hatSessions = new Map<string, number>()
  const hatLastSeen = new Map<string, Date>()
  for (const s of completed) {
    const name = s.hat.name
    hatMinutes.set(name, (hatMinutes.get(name) || 0) + Math.round(s.durationSeconds / 60))
    hatSessions.set(name, (hatSessions.get(name) || 0) + 1)
    const prev = hatLastSeen.get(name)
    const d = new Date(s.createdAt)
    if (!prev || d > prev) hatLastSeen.set(name, d)
  }

  // Most-worn hat (by total minutes)
  let topHat = ''
  let topMinutes = 0
  for (const [name, mins] of hatMinutes) {
    if (mins > topMinutes) { topHat = name; topMinutes = mins }
  }

  // Least-worn hat (by total minutes, only if 2+ hats)
  let leastHat = ''
  let leastMinutes = Infinity
  if (hatMinutes.size >= 2) {
    for (const [name, mins] of hatMinutes) {
      if (mins < leastMinutes) { leastHat = name; leastMinutes = mins }
    }
  }

  // Longest gap — hat not seen for the most days (only if 2+ hats)
  let neglectedHat = ''
  let neglectedDate: Date | null = null
  if (hatLastSeen.size >= 2) {
    let oldestTime = Infinity
    for (const [name, date] of hatLastSeen) {
      if (date.getTime() < oldestTime) {
        oldestTime = date.getTime()
        neglectedHat = name
        neglectedDate = date
      }
    }
    // Don't show if the "neglected" hat was used today
    if (neglectedDate) {
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - neglectedDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 0) {
        neglectedHat = ''
        neglectedDate = null
      }
    }
  }

  return (
    <div className="insights">
      <h3 className="insights-title">Insights</h3>
      <div className="insights-list">
        <div className="insights-item">
          <span className="insights-label">Best day</span>
          <span className="insights-value">
            {bestDay.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {bestDay.score} pts
          </span>
        </div>
        <div className="insights-item">
          <span className="insights-label">Peak hour</span>
          <span className="insights-value">{formatHour(peakHour)}</span>
        </div>
        <div className="insights-item">
          <span className="insights-label">Most active day</span>
          <span className="insights-value">{DAY_NAMES[peakDay]}s</span>
        </div>
      </div>

      <h3 className="insights-title" style={{ marginTop: '20px' }}>Hats</h3>
      <div className="insights-list">
        <div className="insights-item">
          <span className="insights-label">Most worn</span>
          <span className="insights-value">{topHat} — {topMinutes}m</span>
        </div>
        {leastHat && (
          <div className="insights-item">
            <span className="insights-label">Least worn</span>
            <span className="insights-value">{leastHat} — {leastMinutes}m</span>
          </div>
        )}
        {neglectedHat && neglectedDate && (
          <div className="insights-item">
            <span className="insights-label">Needs attention</span>
            <span className="insights-value">{neglectedHat} — {daysAgo(neglectedDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
