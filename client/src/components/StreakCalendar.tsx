import type { SessionRecord } from '../lib/dataService'
import { getSessionDays, getCalendarWeeks, toDateKey } from '../lib/statsUtils'

interface Props {
  sessions: SessionRecord[]
  streak: number
}

function TopHatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#333" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="4" width="10" height="12" rx="1" />
      <rect x="3" y="16" width="18" height="3" rx="1.5" />
    </svg>
  )
}

export default function StreakCalendar({ sessions, streak }: Props) {
  const today = new Date()
  const todayKey = toDateKey(today)
  const sessionDays = getSessionDays(sessions)
  const weeks = getCalendarWeeks(today)
  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="streak-calendar">
      {streak >= 2 && (
        <div className="streak-header">
          {streak} day streak
        </div>
      )}
      <div className="streak-grid">
        {dayHeaders.map((d, i) => (
          <div key={`h-${i}`} className="streak-day-header">{d}</div>
        ))}
        {weeks.flat().map((date, i) => {
          const key = toDateKey(date)
          const isToday = key === todayKey
          const isFuture = date > today && !isToday
          const hasSession = sessionDays.has(key)
          return (
            <div
              key={i}
              className={`streak-day${isToday ? ' streak-day--today' : ''}${isFuture ? ' streak-day--future' : ''}`}
            >
              {hasSession ? (
                <TopHatIcon />
              ) : (
                <span className="streak-day-number">{date.getDate()}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
