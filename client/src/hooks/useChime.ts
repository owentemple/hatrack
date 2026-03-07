import { useState, useCallback, useRef } from 'react'

const STORAGE_KEY = 'hatrack-chime-enabled'

function getInitialEnabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

function playChimeSound() {
  const ctx = new AudioContext()
  const now = ctx.currentTime

  // Pleasant pentatonic chime: three notes in sequence
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq

    gain.gain.setValueAtTime(0, now + i * 0.15)
    gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.15)
    osc.stop(now + i * 0.15 + 0.8)
  })

  // Clean up after sounds finish
  setTimeout(() => ctx.close(), 2000)
}

export function useChime() {
  const [enabled, setEnabled] = useState(getInitialEnabled)
  const hasInteracted = useRef(false)

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const play = useCallback(() => {
    if (!enabled) return
    try {
      playChimeSound()
    } catch {
      // Web Audio not supported
    }
  }, [enabled])

  // Warm up AudioContext on first user interaction (needed for mobile Safari)
  const warmUp = useCallback(() => {
    if (hasInteracted.current) return
    hasInteracted.current = true
    try {
      const ctx = new AudioContext()
      ctx.close()
    } catch {}
  }, [])

  return { enabled, toggle, play, warmUp }
}
