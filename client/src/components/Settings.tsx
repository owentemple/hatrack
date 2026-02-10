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
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Goal slug"
                value={goalSlug}
                onChange={(e) => setGoalSlug(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Connect</button>
          </form>
        )}
      </div>
    </div>
  )
}
