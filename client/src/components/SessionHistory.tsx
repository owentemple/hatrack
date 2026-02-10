import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSessions, getScore, SessionRecord } from '../lib/api'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface DayGroup {
  date: string
  sessions: SessionRecord[]
  dayScore: number
}

function groupByDay(sessions: SessionRecord[]): DayGroup[] {
  const groups: Map<string, SessionRecord[]> = new Map()
  for (const s of sessions) {
    const date = formatDate(s.createdAt)
    const existing = groups.get(date)
    if (existing) {
      existing.push(s)
    } else {
      groups.set(date, [s])
    }
  }
  return Array.from(groups.entries()).map(([date, sessions]) => ({
    date,
    sessions,
    dayScore: sessions.reduce((sum, s) => sum + s.score, 0),
  }))
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSessions(), getScore()])
      .then(([s, sc]) => {
        setSessions(s)
        setTotalScore(sc.totalScore)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  const days = groupByDay(sessions)

  return (
    <div className="session-history">
      <div className="history-header">
        <Link to="/" className="back-link">&larr; Back to rack</Link>
        <h2>Session History</h2>
        <h3 className="score">Total: {totalScore}</h3>
      </div>

      {sessions.length === 0 ? (
        <p className="empty-state">
          No sessions yet. Complete a focus session to see your history here.
        </p>
      ) : (
        <>
          <div className="history-stats">
            <div className="stat">
              <span className="stat-value">{sessions.length}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat">
              <span className="stat-value">{days.length}</span>
              <span className="stat-label">Days Active</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {formatDuration(sessions.reduce((sum, s) => sum + s.durationSeconds, 0))}
              </span>
              <span className="stat-label">Total Focus</span>
            </div>
          </div>

          {days.map((day) => (
            <div key={day.date} className="day-group">
              <div className="day-header">
                <span className="day-date">{day.date}</span>
                <span className="day-score">+{day.dayScore}</span>
              </div>
              <ul className="session-list">
                {day.sessions.map((s) => (
                  <li key={s.id} className="session-item">
                    <span className="session-hat">{s.hat.name}</span>
                    <span className="session-duration">{formatDuration(s.durationSeconds)}</span>
                    <span className="session-time">{formatTime(s.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
