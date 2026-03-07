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

function playChime(ctx: AudioContext) {
  // Resume in case the context was suspended (mobile Safari)
  if (ctx.state === 'suspended') {
    ctx.resume()
  }

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
}

export function useChime() {
  const [enabled, setEnabled] = useState(getInitialEnabled)
  const ctxRef = useRef<AudioContext | null>(null)

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const play = useCallback(() => {
    if (!enabled || !ctxRef.current) return
    try {
      playChime(ctxRef.current)
    } catch {
      // Web Audio not supported
    }
  }, [enabled])

  // Create and retain AudioContext on first user interaction (required by mobile Safari)
  const warmUp = useCallback(() => {
    if (ctxRef.current) return
    try {
      ctxRef.current = new AudioContext()
    } catch {}
  }, [])

  return { enabled, toggle, play, warmUp }
}
