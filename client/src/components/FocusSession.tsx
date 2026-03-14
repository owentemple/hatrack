import { useState, useEffect, useCallback } from 'react'
import { Hat, createSession, getScore } from '../lib/dataService'
import { useTimer } from '../hooks/useTimer'
import { useChime } from '../hooks/useChime'
import Timer from './Timer'
import ScoreDisplay from './ScoreDisplay'

type Phase = 'idle' | 'reveal-hat' | 'reveal-time' | 'running' | 'prompt-why' | 'complete' | 'stopped-early'

interface Props {
  hats: Hat[]
  onSessionEnd: () => void
  onHatDone?: (id: number) => void
  isPremium?: boolean
  onUpdateHatWhy?: (id: number, why: string | null) => void
}

export default function FocusSession({ hats, onSessionEnd, onHatDone, isPremium, onUpdateHatWhy }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentHat, setCurrentHat] = useState<Hat | null>(null)
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [todayScore, setTodayScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [whyInput, setWhyInput] = useState('')
  const [editingWhy, setEditingWhy] = useState(false)
  const [miniMode, setMiniMode] = useState(() => {
    try { return localStorage.getItem('hatrack-mini-mode') === 'true' } catch { return false }
  })
  const timer = useTimer()
  const chime = useChime()

  function toggleMini() {
    setMiniMode((prev) => {
      const next = !prev
      localStorage.setItem('hatrack-mini-mode', String(next))
      return next
    })
  }

  // Load score on mount
  useEffect(() => {
    getScore().then((d) => { setTodayScore(d.todayScore); setStreak(d.streak) }).catch(() => {})
  }, [])

  const activeHats = hats.filter((h) => !h.done)

  function startSession() {
    chime.warmUp()
    if (activeHats.length === 0) return
    const hat = activeHats[Math.floor(Math.random() * activeHats.length)]
    setCurrentHat(hat)
    setPhase('reveal-hat')
  }

  function rollTimer() {
    const maxMinutes = miniMode ? 5 : 25
    const mins = Math.floor(Math.random() * maxMinutes) + 1
    setTimerMinutes(mins)
    setPhase('reveal-time')
  }

  function startTimer() {
    timer.start(timerMinutes * 60)
    setPhase('running')
  }

  const handleTimerEnd = useCallback(async () => {
    if (!currentHat) return
    chime.play()
    const earned = timerMinutes
    try { localStorage.setItem('hatrack-has-session', 'true') } catch {}
    try {
      await createSession(timer.totalSeconds, earned, currentHat.id)
      const s = await getScore()
      setTodayScore(s.todayScore)
      setStreak(s.streak)
    } catch {
      setTodayScore((prev) => prev + earned)
    }
    if (isPremium && !currentHat.why) {
      setPhase('prompt-why')
    } else {
      setPhase('complete')
    }
  }, [currentHat, timer.totalSeconds, timerMinutes, isPremium])

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

  function endSessions(markDone = false) {
    if (markDone && currentHat && onHatDone) {
      onHatDone(currentHat.id)
    }
    setPhase('idle')
    setCurrentHat(null)
    onSessionEnd()
  }

  function saveWhy() {
    if (currentHat && whyInput.trim() && onUpdateHatWhy) {
      onUpdateHatWhy(currentHat.id, whyInput.trim())
      currentHat.why = whyInput.trim()
    }
    setWhyInput('')
    setPhase('complete')
  }

  // Keep AudioContext alive during timer (mobile Safari suspends after ~30s of silence)
  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => chime.keepAlive(), 15000)
    return () => clearInterval(id)
  }, [phase, chime.keepAlive])

  // Keep screen awake during timer (Wake Lock API)
  useEffect(() => {
    if (phase !== 'running') return
    let wakeLock: WakeLockSentinel | null = null
    async function acquire() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Wake Lock not supported or failed — no-op
      }
    }
    acquire()
    return () => { wakeLock?.release() }
  }, [phase])

  // Watch for timer completion
  useEffect(() => {
    if (timer.isComplete && phase === 'running') {
      handleTimerEnd()
    }
  }, [timer.isComplete, phase, handleTimerEnd])

  return (
    <div>
      {phase === 'idle' && (
        <>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <button
            className="btn-primary btn-block"
            onClick={startSession}
            disabled={activeHats.length === 0}
            style={{ flex: 1 }}
          >
            {miniMode ? 'Mini Session' : 'Focus Session'}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={toggleMini}
              title={miniMode ? 'Mini mode (1-5 min)' : 'Normal mode (1-25 min)'}
              style={{
                background: 'none',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1.2rem',
                opacity: miniMode ? 1 : 0.4,
              }}
            >
              {'\u{23F1}\u{FE0F}'}
            </button>
            <span style={{ fontSize: '0.65rem', color: '#999', marginTop: '2px' }}>Mini</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={chime.toggle}
              title={chime.enabled ? 'Chime on' : 'Chime off'}
              style={{
                background: 'none',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1.2rem',
                opacity: chime.enabled ? 1 : 0.4,
              }}
            >
              {chime.enabled ? '\u{1F514}' : '\u{1F515}'}
            </button>
            <span style={{ fontSize: '0.65rem', color: '#999', marginTop: '2px' }}>Sound</span>
          </div>
        </div>
        {activeHats.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
            Add a hat above to start a session.
          </p>
        )}
        </>
      )}

      {phase === 'reveal-hat' && currentHat && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Your next hat:</h3>
            <p><strong>{currentHat.name}</strong></p>
            {isPremium && currentHat.why && !editingWhy && (
              <div style={{ margin: '4px 0 12px' }}>
                <p style={{ color: '#666', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                  "{currentHat.why}"
                </p>
                <button className="link-button" style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }} onClick={() => { setWhyInput(currentHat.why || ''); setEditingWhy(true) }}>
                  edit
                </button>
              </div>
            )}
            {isPremium && editingWhy && (
              <div style={{ margin: '4px 0 12px' }}>
                <textarea
                  value={whyInput}
                  onChange={(e) => setWhyInput(e.target.value)}
                  placeholder="Write a note to your future self..."
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', fontFamily: 'inherit' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                  <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={() => {
                    if (onUpdateHatWhy) {
                      const val = whyInput.trim() || null
                      onUpdateHatWhy(currentHat.id, val)
                      currentHat.why = val
                    }
                    setWhyInput('')
                    setEditingWhy(false)
                  }}>
                    Save
                  </button>
                  <button className="link-button" style={{ fontSize: '0.8rem' }} onClick={() => { setWhyInput(''); setEditingWhy(false) }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => { setEditingWhy(false); rollTimer() }}>
                Roll the dice!
              </button>
            </div>
            <button className="link-button" onClick={() => { setEditingWhy(false); setPhase('idle'); setCurrentHat(null) }}>
              Never mind
            </button>
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
            <button className="link-button" onClick={() => { setPhase('idle'); setCurrentHat(null) }}>
              Never mind
            </button>
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

      {phase === 'prompt-why' && currentHat && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>+{timerMinutes} point{timerMinutes !== 1 ? 's' : ''}!</h3>
            <p style={{ color: '#666', fontSize: '0.85rem', margin: '8px 0 12px' }}>
              What would you tell yourself when you don't feel like <strong>{currentHat.name}</strong>?
            </p>
            <textarea
              value={whyInput}
              onChange={(e) => setWhyInput(e.target.value)}
              placeholder="Write a note to your future self..."
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', fontFamily: 'inherit' }}
            />
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveWhy} disabled={!whyInput.trim()}>
                Save
              </button>
            </div>
            <button className="link-button" onClick={() => { setWhyInput(''); setPhase('complete') }}>
              Skip
            </button>
          </div>
        </div>
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
              <button className="btn-danger" onClick={() => endSessions(true)}>
                No, I'm done
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'stopped-early' && currentHat && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Session ended</h3>
            <p>
              Want to try another session?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={anotherSession}>
                Yes
              </button>
              <button className="btn-danger" onClick={() => endSessions()}>
                No, I'm done
              </button>
            </div>
          </div>
        </div>
      )}

      <ScoreDisplay score={todayScore} streak={streak} />
    </div>
  )
}
