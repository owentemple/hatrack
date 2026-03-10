import type { Hat, FocusSessionData, SessionRecord } from './api'

const KEYS = {
  hats: 'hatrack-local-hats',
  sessions: 'hatrack-local-sessions',
  nextId: 'hatrack-local-next-id',
  started: 'hatrack-started',
}

interface LocalHat extends Hat {
  doneAt: string | null
  deletedAt: string | null
}

interface LocalSession {
  id: number
  durationSeconds: number
  score: number
  hatId: number
  hatName: string
  createdAt: string
}

function nextId(): number {
  const current = parseInt(localStorage.getItem(KEYS.nextId) || '0', 10)
  const id = current + 1
  localStorage.setItem(KEYS.nextId, String(id))
  return id
}

function readHats(): LocalHat[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.hats) || '[]')
  } catch {
    return []
  }
}

function writeHats(hats: LocalHat[]) {
  localStorage.setItem(KEYS.hats, JSON.stringify(hats))
}

function readSessions(): LocalSession[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.sessions) || '[]')
  } catch {
    return []
  }
}

function writeSessions(sessions: LocalSession[]) {
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions))
}

function getLocalMidnight(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// Public API — mirrors api.ts signatures

export function getHats(): Hat[] {
  const all = readHats()
  const midnight = getLocalMidnight()

  // Auto-reset hats done before today
  let changed = false
  for (const hat of all) {
    if (hat.done && hat.doneAt && new Date(hat.doneAt) < midnight) {
      hat.done = false
      hat.doneAt = null
      changed = true
    }
  }
  if (changed) writeHats(all)

  return all.filter(h => !h.deletedAt).map(({ deletedAt, doneAt, ...h }) => h)
}

export function createHat(name: string): Hat {
  const all = readHats()
  const hat: LocalHat = {
    id: nextId(),
    name,
    done: false,
    userId: 0,
    doneAt: null,
    deletedAt: null,
  }
  all.push(hat)
  writeHats(all)
  return { id: hat.id, name: hat.name, done: hat.done, userId: hat.userId }
}

export function updateHat(id: number, data: Partial<Hat>): Hat {
  const all = readHats()
  const hat = all.find(h => h.id === id)
  if (!hat) throw new Error('Hat not found')

  if (data.name !== undefined) hat.name = data.name
  if (data.done !== undefined) {
    hat.done = data.done
    hat.doneAt = data.done ? new Date().toISOString() : null
  }

  writeHats(all)
  return { id: hat.id, name: hat.name, done: hat.done, userId: hat.userId }
}

export function deleteHat(id: number): { ok: boolean } {
  const all = readHats()
  const hat = all.find(h => h.id === id)
  if (hat) {
    hat.deletedAt = new Date().toISOString()
    writeHats(all)
  }
  return { ok: true }
}

export function createSession(durationSeconds: number, score: number, hatId: number): FocusSessionData {
  const sessions = readSessions()
  const allHats = readHats()
  const hat = allHats.find(h => h.id === hatId)
  const session: LocalSession = {
    id: nextId(),
    durationSeconds,
    score,
    hatId,
    hatName: hat?.name || 'Unknown',
    createdAt: new Date().toISOString(),
  }
  sessions.push(session)
  writeSessions(sessions)
  return { id: session.id, durationSeconds, score, hatId }
}

export function getSessions(): SessionRecord[] {
  const sessions = readSessions()
  return sessions
    .map(s => ({
      id: s.id,
      durationSeconds: s.durationSeconds,
      score: s.score,
      hatId: s.hatId,
      createdAt: s.createdAt,
      hat: { name: s.hatName },
    }))
    .reverse()
}

export function getScore(): { totalScore: number; todayScore: number; streak: number } {
  const sessions = readSessions()
  const midnight = getLocalMidnight()

  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0)
  const todayScore = sessions
    .filter(s => new Date(s.createdAt) >= midnight)
    .reduce((sum, s) => sum + s.score, 0)

  // Streak: consecutive days with score > 0, going backwards, forgiving today
  const dayScores = new Map<string, number>()
  for (const s of sessions) {
    const d = new Date(s.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    dayScores.set(key, (dayScores.get(key) || 0) + s.score)
  }

  let streak = 0
  const now = new Date()
  // Start from yesterday (forgive today)
  const check = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)

  for (let i = 0; i < 365; i++) {
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`
    const dayScore = dayScores.get(key)
    if (dayScore && dayScore > 0) {
      streak++
      check.setDate(check.getDate() - 1)
    } else {
      break
    }
  }

  // If today has score, add it to streak
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  if (dayScores.has(todayKey) && (dayScores.get(todayKey) || 0) > 0) {
    streak++
  }

  return { totalScore, todayScore, streak }
}

// For migration — returns all hats including soft-deleted
export function getAllHatsForMigration(): Array<{ name: string; done: boolean; doneAt: string | null; deletedAt: string | null }> {
  return readHats().map(h => ({ name: h.name, done: h.done, doneAt: h.doneAt, deletedAt: h.deletedAt }))
}

// For migration — returns raw sessions with hat names
export function getAllSessionsForMigration(): Array<{ hatName: string; durationSeconds: number; score: number; createdAt: string }> {
  return readSessions().map(s => ({ hatName: s.hatName, durationSeconds: s.durationSeconds, score: s.score, createdAt: s.createdAt }))
}

export function getSessionCount(): number {
  return readSessions().filter(s => s.score > 0).length
}

export function hasLocalData(): boolean {
  return !!localStorage.getItem(KEYS.hats) || !!localStorage.getItem(KEYS.started)
}

export function seedStarterHats() {
  const existing = readHats()
  if (existing.length > 0) return // Don't overwrite existing hats
  const names = ['Reading', 'Writing', 'Meditating']
  const hats: LocalHat[] = names.map(name => ({
    id: nextId(),
    name,
    done: false,
    userId: 0,
    doneAt: null,
    deletedAt: null,
  }))
  writeHats(hats)
  localStorage.setItem(KEYS.started, 'true')
}

export function clear() {
  localStorage.removeItem(KEYS.hats)
  localStorage.removeItem(KEYS.sessions)
  localStorage.removeItem(KEYS.nextId)
  localStorage.removeItem(KEYS.started)
}
