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
    </div>
  )
}
