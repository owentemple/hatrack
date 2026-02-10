import { useState, useEffect, useRef, useCallback } from 'react'

interface TimerState {
  minutes: string
  seconds: string
  isRunning: boolean
  isComplete: boolean
  totalSeconds: number
  start: (durationSeconds: number) => void
  stop: () => void
}

export function useTimer(): TimerState {
  const [remaining, setRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const start = useCallback((durationSeconds: number) => {
    stop()
    setRemaining(durationSeconds)
    setTotalSeconds(durationSeconds)
    setIsRunning(true)
    setIsComplete(false)
  }, [stop])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          setIsRunning(false)
          setIsComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return {
    minutes: mins < 10 ? `0${mins}` : `${mins}`,
    seconds: secs < 10 ? `0${secs}` : `${secs}`,
    isRunning,
    isComplete,
    totalSeconds,
    start,
    stop,
  }
}
