import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../lib/api'

export default function Settings() {
  const [username, setUsername] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [goalSlug, setGoalSlug] = useState('')
  const [connected, setConnected] = useState(false)
  const [connectedUsername, setConnectedUsername] = useState('')
  const [connectedGoalSlug, setConnectedGoalSlug] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    api.getBeeminderSettings().then((settings) => {
      setConnected(settings.connected)
      if (settings.connected) {
        setConnectedUsername(settings.username || '')
        setConnectedGoalSlug(settings.goalSlug || '')
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const result = await api.saveBeeminderSettings(username, authToken, goalSlug)
      setConnected(true)
      setConnectedUsername(username)
      setConnectedGoalSlug(goalSlug)
      setUsername('')
      setAuthToken('')
      setGoalSlug('')
      if (result.connected) setSuccess('Beeminder connected!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDisconnect() {
    setError('')
    setSuccess('')

    try {
      await api.disconnectBeeminder()
      setConnected(false)
      setConnectedUsername('')
      setConnectedGoalSlug('')
      setSuccess('Beeminder disconnected.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="settings-page">
      <Link to="/" className="back-link">&larr; Back to Hats</Link>
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Beeminder</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 1rem' }}>
          <a href="https://www.beeminder.com/" target="_blank" rel="noopener noreferrer">Beeminder</a> is
          an optional commitment service that keeps you on track with real stakes.
          Connect it to automatically send your focus session points as data.
        </p>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {connected ? (
          <div className="beeminder-status">
            <p>
              Connected as <strong>{connectedUsername}</strong> &rarr; goal <strong>{connectedGoalSlug}</strong>
            </p>
            <p className="beeminder-hint">Focus session points are automatically sent to Beeminder.</p>
            <button className="btn-danger" onClick={handleDisconnect}>Disconnect</button>
          </div>
        ) : !showForm ? (
          <button className="btn-secondary" onClick={() => setShowForm(true)}>Connect Beeminder</button>
        ) : (
          <form className="auth-form" onSubmit={handleSave}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Beeminder username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Auth token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0' }}>
                Find this at{' '}
                <a href="https://www.beeminder.com/api/v1/auth_token.json" target="_blank" rel="noopener noreferrer">
                  beeminder.com/api/v1/auth_token.json
                </a>{' '}
                (log in first)
              </p>
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Goal slug"
                value={goalSlug}
                onChange={(e) => setGoalSlug(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0' }}>
                The URL name of your goal — e.g. for beeminder.com/you/<strong>focus</strong>, enter <strong>focus</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary">Connect</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <InstallInstructions />
    </div>
  )
}

function InstallInstructions() {
  const [browser, setBrowser] = useState<'safari' | 'chrome'>(() => {
    const ua = navigator.userAgent
    if (/CriOS|Chrome/.test(ua) && !/Safari/.test(ua) || /Android/.test(ua)) return 'chrome'
    return 'safari'
  })

  const steps = browser === 'safari'
    ? [
        <>Tap the <span className="apple-icon" aria-label="Share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom' }}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </span> <strong>Share</strong> button</>,
        <>Scroll down and tap <span className="apple-icon" aria-label="Add to Home Screen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </span> <strong>"Add to Home Screen"</strong></>,
        <>Tap <strong>"Add"</strong></>,
      ]
    : [
        <>Tap the <strong>menu</strong> (three dots)</>,
        <>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></>,
        <>Tap <strong>"Add"</strong></>,
      ]

  return (
    <div className="settings-section" style={{ marginTop: '2rem' }}>
      <h3>Add to Home Screen on Mobile Device</h3>
      <div className="install-tabs">
        <button
          className={`install-tab${browser === 'safari' ? ' install-tab--active' : ''}`}
          onClick={() => setBrowser('safari')}
        >
          Safari
        </button>
        <button
          className={`install-tab${browser === 'chrome' ? ' install-tab--active' : ''}`}
          onClick={() => setBrowser('chrome')}
        >
          Chrome
        </button>
      </div>
      <ol className="install-steps">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  )
}
