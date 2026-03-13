import type { SessionRecord } from './api'

export type TabView = 'day' | 'week' | 'month' | 'year'

export interface BarData {
  label: string
  value: number
}

export interface SubPeriod {
  label: string
  value: number
}

// Helpers
function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function startOfWeek(d: Date): Date {
  const day = d.getDay() // 0=Sun
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// Build a map of dateKey -> total score
function buildDayMap(sessions: SessionRecord[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of sessions) {
    if (s.score <= 0) continue
    const key = toDateKey(new Date(s.createdAt))
    map.set(key, (map.get(key) || 0) + s.score)
  }
  return map
}

// Build a map of "YYYY-MM" -> total score
function buildMonthMap(sessions: SessionRecord[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of sessions) {
    if (s.score <= 0) continue
    const d = new Date(s.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, (map.get(key) || 0) + s.score)
  }
  return map
}

// Build a map of hour (0-23) -> total score for a specific day
function buildHourMap(sessions: SessionRecord[], dayKey: string): Map<number, number> {
  const map = new Map<number, number>()
  for (const s of sessions) {
    if (s.score <= 0) continue
    const d = new Date(s.createdAt)
    if (toDateKey(d) !== dayKey) continue
    const hour = d.getHours()
    map.set(hour, (map.get(hour) || 0) + s.score)
  }
  return map
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function getChartData(sessions: SessionRecord[], tab: TabView, anchor: Date): {
  bars: BarData[]
  total: number
  average: number
  summaryText: string
  subPeriods: SubPeriod[]
} {
  const dayMap = buildDayMap(sessions)

  if (tab === 'day') {
    const dayKey = toDateKey(anchor)
    const hourMap = buildHourMap(sessions, dayKey)
    const bars: BarData[] = []
    let total = 0
    for (let h = 0; h < 24; h++) {
      const val = hourMap.get(h) || 0
      total += val
      // Show label for every 3 hours
      const label = h % 3 === 0 ? `${h === 0 ? '12a' : h <= 11 ? (h > 9 ? h : ' ' + h) + 'a' : h === 12 ? '12p' : (h - 12 > 9 ? h - 12 : ' ' + (h - 12)) + 'p'}` : ''
      bars.push({ label, value: val })
    }
    const sessionCount = sessions.filter(s => s.score > 0 && toDateKey(new Date(s.createdAt)) === dayKey).length
    return {
      bars,
      total,
      average: total,
      summaryText: `${sessionCount} completed session${sessionCount !== 1 ? 's' : ''}`,
      subPeriods: [],
    }
  }

  if (tab === 'week') {
    const ws = startOfWeek(anchor)
    const bars: BarData[] = []
    let total = 0
    let daysWithSessions = 0
    const subPeriods: SubPeriod[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + i)
      const key = toDateKey(d)
      const val = dayMap.get(key) || 0
      total += val
      if (val > 0) daysWithSessions++
      bars.push({ label: DAY_LABELS[i], value: val })
      subPeriods.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        value: val,
      })
    }
    const avg = daysWithSessions > 0 ? Math.round(total / 7) : 0
    return {
      bars,
      total,
      average: avg,
      summaryText: `${total} total minutes this week`,
      subPeriods,
    }
  }

  if (tab === 'month') {
    const year = anchor.getFullYear()
    const month = anchor.getMonth()
    const numDays = daysInMonth(year, month)
    const bars: BarData[] = []
    let total = 0
    let daysWithSessions = 0
    for (let day = 1; day <= numDays; day++) {
      const d = new Date(year, month, day)
      const key = toDateKey(d)
      const val = dayMap.get(key) || 0
      total += val
      if (val > 0) daysWithSessions++
      const label = day === 1 || day % 5 === 0 ? String(day) : ''
      bars.push({ label, value: val })
    }
    // Sub-periods: weeks within the month
    const subPeriods: SubPeriod[] = []
    let weekStart = 1
    while (weekStart <= numDays) {
      const weekEnd = Math.min(weekStart + 6, numDays)
      let weekTotal = 0
      for (let d = weekStart; d <= weekEnd; d++) {
        const key = toDateKey(new Date(year, month, d))
        weekTotal += dayMap.get(key) || 0
      }
      const startDate = new Date(year, month, weekStart)
      const endDate = new Date(year, month, weekEnd)
      subPeriods.push({
        label: weekStart === weekEnd
          ? startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${endDate.getDate()}`,
        value: weekTotal,
      })
      weekStart = weekEnd + 1
    }
    const avg = numDays > 0 ? Math.round(total / numDays) : 0
    return {
      bars,
      total,
      average: avg,
      summaryText: `Sessions on ${daysWithSessions} day${daysWithSessions !== 1 ? 's' : ''} this month`,
      subPeriods,
    }
  }

  // Year
  const year = anchor.getFullYear()
  const monthMap = buildMonthMap(sessions)
  const bars: BarData[] = []
  let total = 0
  const subPeriods: SubPeriod[] = []
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  for (let m = 0; m < 12; m++) {
    const key = `${year}-${String(m + 1).padStart(2, '0')}`
    const val = monthMap.get(key) || 0
    total += val
    bars.push({ label: MONTH_LABELS[m], value: val })
    subPeriods.push({ label: monthNames[m], value: val })
  }
  // Count days in year so far for average
  const now = new Date()
  const isCurrentYear = year === now.getFullYear()
  const daysSoFar = isCurrentYear
    ? Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : (new Date(year + 1, 0, 1).getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24)
  const avg = daysSoFar > 0 ? Math.round(total / daysSoFar) : 0
  return {
    bars,
    total,
    average: avg,
    summaryText: `${total} total minutes${isCurrentYear ? ' so far this year' : ' in ' + year}`,
    subPeriods: subPeriods.filter(sp => sp.value > 0),
  }
}

export function getPeriodLabel(tab: TabView, anchor: Date): string {
  const now = new Date()
  const today = startOfDay(now)

  if (tab === 'day') {
    const anchorDay = startOfDay(anchor)
    if (anchorDay.getTime() === today.getTime()) return 'Today'
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
    if (anchorDay.getTime() === yesterday.getTime()) return 'Yesterday'
    return anchor.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  }

  if (tab === 'week') {
    const ws = startOfWeek(anchor)
    const currentWs = startOfWeek(now)
    if (ws.getTime() === currentWs.getTime()) return 'This week'
    const lastWs = new Date(currentWs.getFullYear(), currentWs.getMonth(), currentWs.getDate() - 7)
    if (ws.getTime() === lastWs.getTime()) return 'Last week'
    const we = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6)
    return `${ws.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${we.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  }

  if (tab === 'month') {
    if (anchor.getFullYear() === now.getFullYear() && anchor.getMonth() === now.getMonth()) return 'This month'
    return anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }

  // Year
  if (anchor.getFullYear() === now.getFullYear()) return 'This year'
  return String(anchor.getFullYear())
}

export function navigatePeriod(anchor: Date, tab: TabView, direction: -1 | 1): Date {
  if (tab === 'day') {
    return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + direction)
  }
  if (tab === 'week') {
    return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + direction * 7)
  }
  if (tab === 'month') {
    return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1)
  }
  // Year
  return new Date(anchor.getFullYear() + direction, 0, 1)
}

export function canGoForward(anchor: Date, tab: TabView): boolean {
  const now = new Date()
  if (tab === 'day') return startOfDay(anchor).getTime() < startOfDay(now).getTime()
  if (tab === 'week') return startOfWeek(anchor).getTime() < startOfWeek(now).getTime()
  if (tab === 'month') return anchor.getFullYear() < now.getFullYear() || (anchor.getFullYear() === now.getFullYear() && anchor.getMonth() < now.getMonth())
  return anchor.getFullYear() < now.getFullYear()
}

// Streak calendar: get set of date keys with completed sessions
export function getSessionDays(sessions: SessionRecord[]): Set<string> {
  const days = new Set<string>()
  for (const s of sessions) {
    if (s.score > 0) {
      days.add(toDateKey(new Date(s.createdAt)))
    }
  }
  return days
}

// Get 6 weeks of dates for streak calendar: 3 weeks before current week, current week, 2 weeks after
export function getCalendarWeeks(today: Date): Date[][] {
  const currentWeekStart = startOfWeek(today)
  const calStart = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() - 21) // 3 weeks back
  const weeks: Date[][] = []
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d
      week.push(new Date(calStart.getFullYear(), calStart.getMonth(), calStart.getDate() + dayOffset))
    }
    weeks.push(week)
  }
  return weeks
}

export { toDateKey }
