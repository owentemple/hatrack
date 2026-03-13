import * as api from './api'
import * as localStore from './localStore'
import type { Hat, FocusSessionData, SessionRecord } from './api'

function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}

export type { Hat, FocusSessionData, SessionRecord }

export function getHats(): Promise<Hat[]> {
  if (isAuthenticated()) return api.getHats()
  return Promise.resolve(localStore.getHats())
}

export function createHat(name: string): Promise<Hat> {
  if (isAuthenticated()) return api.createHat(name)
  return Promise.resolve(localStore.createHat(name))
}

export function updateHat(id: number, data: Partial<Hat>): Promise<Hat> {
  if (isAuthenticated()) return api.updateHat(id, data)
  return Promise.resolve(localStore.updateHat(id, data))
}

export function deleteHat(id: number): Promise<{ ok: boolean }> {
  if (isAuthenticated()) return api.deleteHat(id)
  return Promise.resolve(localStore.deleteHat(id))
}

export function createSession(durationSeconds: number, score: number, hatId: number): Promise<FocusSessionData> {
  if (isAuthenticated()) return api.createSession(durationSeconds, score, hatId)
  return Promise.resolve(localStore.createSession(durationSeconds, score, hatId))
}

export function getSessions(): Promise<SessionRecord[]> {
  if (isAuthenticated()) return api.getSessions()
  return Promise.resolve(localStore.getSessions())
}

export function getScore(): Promise<{ totalScore: number; todayScore: number; streak: number }> {
  if (isAuthenticated()) return api.getScore()
  return Promise.resolve(localStore.getScore())
}

export function getPremiumStatus(): Promise<{ isPremium: boolean; expiresAt: string | null }> {
  if (isAuthenticated()) return api.getPremiumStatus()
  return Promise.resolve({ isPremium: false, expiresAt: null })
}
