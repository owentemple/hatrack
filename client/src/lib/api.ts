const API_BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data as T
}

// Auth
export interface AuthResponse {
  token: string
  user: { id: number; email: string; name: string }
}

export function signup(email: string, password: string, name: string, template?: string) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, template }),
  })
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function forgotPassword(email: string) {
  return request<{ ok: boolean }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token: string, password: string) {
  return request<{ ok: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

// Hats
export interface Hat {
  id: number
  name: string
  why?: string | null
  done: boolean
  userId: number
}

export function getHats() {
  const tz = new Date().getTimezoneOffset()
  return request<Hat[]>(`/hats?tz=${tz}`)
}

export function createHat(name: string) {
  return request<Hat>('/hats', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function updateHat(id: number, data: Partial<Hat>) {
  return request<Hat>(`/hats/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteHat(id: number) {
  return request<{ ok: boolean }>(`/hats/${id}`, { method: 'DELETE' })
}

// Sessions
export interface FocusSessionData {
  id: number
  durationSeconds: number
  score: number
  hatId: number
}

export interface SessionRecord {
  id: number
  durationSeconds: number
  score: number
  hatId: number
  createdAt: string
  hat: { name: string }
}

export function getSessions() {
  return request<SessionRecord[]>('/sessions')
}

export function createSession(durationSeconds: number, score: number, hatId: number) {
  return request<FocusSessionData>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ durationSeconds, score, hatId }),
  })
}

export function getScore() {
  const tz = new Date().getTimezoneOffset()
  return request<{ totalScore: number; todayScore: number; streak: number }>(`/sessions/score?tz=${tz}`)
}

// Migration
export function migrateLocalData(
  hats: Array<{ name: string; done: boolean; doneAt: string | null; deletedAt: string | null }>,
  sessions: Array<{ hatName: string; durationSeconds: number; score: number; createdAt: string }>
) {
  return request<{ ok: boolean }>('/auth/migrate', {
    method: 'POST',
    body: JSON.stringify({ hats, sessions }),
  })
}

// Beeminder settings
export interface BeeminderSettings {
  connected: boolean
  username: string | null
  goalSlug: string | null
}

export function getBeeminderSettings() {
  return request<BeeminderSettings>('/settings/beeminder')
}

export function saveBeeminderSettings(username: string, authToken: string, goalSlug: string) {
  return request<BeeminderSettings>('/settings/beeminder', {
    method: 'PUT',
    body: JSON.stringify({ username, authToken, goalSlug }),
  })
}

export function disconnectBeeminder() {
  return request<{ connected: false }>('/settings/beeminder', { method: 'DELETE' })
}

// SMS settings
export interface SmsSettings {
  enabled: boolean
  phone: string | null
  timezone: string | null
  reminderHour: number | null
  frequency: string
  customMessage: string | null
  optedOut: boolean
}

export function getSmsSettings() {
  return request<SmsSettings>('/settings/sms')
}

export function saveSmsSettings(phone: string, timezone: string, frequency: string, customMessage: string) {
  return request<SmsSettings>('/settings/sms', {
    method: 'PUT',
    body: JSON.stringify({ phone, timezone, frequency, customMessage }),
  })
}

export function disconnectSms() {
  return request<{ enabled: false }>('/settings/sms', { method: 'DELETE' })
}

// Billing / Premium
export interface PremiumStatus {
  isPremium: boolean
  expiresAt: string | null
}

export function getPremiumStatus() {
  return request<PremiumStatus>('/billing/status')
}

export function createCheckoutSession() {
  return request<{ url: string }>('/billing/checkout', { method: 'POST' })
}

export function createPortalSession() {
  return request<{ url: string }>('/billing/portal', { method: 'POST' })
}
