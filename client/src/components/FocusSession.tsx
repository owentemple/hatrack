import { useState, useEffect, useCallback } from 'react'
import { Hat, createSession, getScore } from '../lib/api'
import { useTimer } from '../hooks/useTimer'
import Timer from './Timer'
import ScoreDisplay from './ScoreDisplay'

type Phase = 'idle' | 'reveal-hat' | 'reveal-time' | 'running' | 'complete' | 'stopped-early'

interface Props {
  hats: Hat[]
  onSessionEnd: () => void
}

export default function FocusSession({ hats, onSessionEnd }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentHat, setCurrentHat] = useState<Hat | null>(null)
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [todayScore, setTodayScore] = useState(0)
  const timer = useTimer()

  // Load score on mount
  useEffect(() => {
    getScore().then((d) => setTodayScore(d.todayScore)).catch(() => {})
  }, [])

  const activeHats = hats.filter((h) => !h.done)

  function startSession() {
    if (activeHats.length === 0) return
    const hat = activeHats[Math.floor(Math.random() * activeHats.length)]
    setCurrentHat(hat)
    setPhase('reveal-hat')
  }

  function rollTimer() {
    const mins = Math.floor(Math.random() * 25) + 1
    setTimerMinutes(mins)
    setPhase('reveal-time')
  }

  function startTimer() {
    timer.start(timerMinutes * 60)
    setPhase('running')
  }

  const handleTimerEnd = useCallback(async () => {
    if (!currentHat) return
    const earned = timerMinutes
    setPhase('complete')
    try {
      await createSession(timer.totalSeconds, earned, currentHat.id)
      const s = await getScore()
      setTodayScore(s.todayScore)
    } catch {
      setTodayScore((prev) => prev + earned)
    }
  }, [currentHat, timer.totalSeconds, timerMinutes])

  async function handleStopEarly() {
    timer.stop()
    if (!currentHat) return
    setPhase('stopped-early')
    try {
      await createSession(timer.totalSeconds, 0, currentHat.id)
    } catch {
      // score unchanged
    }
  }

  function anotherSession() {
    setPhase('idle')
    setCurrentHat(null)
    onSessionEnd()
  }

  function endSessions() {
    setPhase('idle')
    setCurrentHat(null)
    onSessionEnd()
  }

  // Watch for timer completion
  useEffect(() => {
    if (timer.isComplete && phase === 'running') {
      handleTimerEnd()
    }
  }, [timer.isComplete, phase, handleTimerEnd])

  return (
    <div>
      {phase === 'idle' && (
        <button
          className="btn-primary btn-block"
          onClick={startSession}
          disabled={activeHats.length === 0}
        >
          Focus Session
        </button>
      )}

      {phase === 'reveal-hat' && currentHat && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Your next hat:</h3>
            <p><strong>{currentHat.name}</strong></p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={rollTimer}>
                Roll the dice!
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'reveal-time' && currentHat && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>You rolled {timerMinutes}!</h3>
            <p>
              Focus on <strong>{currentHat.name}</strong> for{' '}
              {timerMinutes} minute{timerMinutes !== 1 ? 's' : ''}.
            </p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={startTimer}>
                Start timer
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'running' && currentHat && (
        <Timer
          minutes={timer.minutes}
          seconds={timer.seconds}
          hatName={currentHat.name}
          onStop={handleStopEarly}
        />
      )}

      {phase === 'complete' && currentHat && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>+{timerMinutes} point{timerMinutes !== 1 ? 's' : ''}!</h3>
            <p>
              Great work on <strong>{currentHat.name}</strong>.
              Want another session?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={anotherSession}>
                Yes
              </button>
              <button className="btn-danger" onClick={endSessions}>
                No, I'm done
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'stopped-early' && currentHat && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Session ended early</h3>
            <p>
              No points earned. Want to try another session?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={anotherSession}>
                Yes
              </button>
              <button className="btn-danger" onClick={endSessions}>
                No, I'm done
              </button>
            </div>
          </div>
        </div>
      )}

      <ScoreDisplay score={todayScore} />
    </div>
  )
}
