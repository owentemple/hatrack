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

async function playChime(ctx: AudioContext) {
  // Resume in case the context was suspended (mobile Safari suspends after inactivity)
  if (ctx.state === 'suspended') {
    await ctx.resume()
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
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const play = useCallback(() => {
    if (!enabledRef.current || !ctxRef.current) return
    try {
      playChime(ctxRef.current)
    } catch {
      // Web Audio not supported
    }
  }, [])

  // Create and retain AudioContext on first user interaction (required by mobile Safari)
  const warmUp = useCallback(() => {
    if (ctxRef.current) return
    try {
      ctxRef.current = new AudioContext()
    } catch {}
  }, [])

  // Ping AudioContext with a silent buffer to prevent mobile Safari from suspending it
  const keepAlive = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start()
  }, [])

  return { enabled, toggle, play, warmUp, keepAlive }
}
