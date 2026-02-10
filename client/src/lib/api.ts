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

export function signup(email: string, password: string, name: string) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// Hats
export interface Hat {
  id: number
  name: string
  done: boolean
  userId: number
}

export function getHats() {
  return request<Hat[]>('/hats')
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
  return request<{ totalScore: number; todayScore: number }>('/sessions/score')
}
