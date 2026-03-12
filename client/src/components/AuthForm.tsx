import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as api from '../lib/api'
import * as localStore from '../lib/localStore'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [showMergePrompt, setShowMergePrompt] = useState(false)
  const [pendingAuth, setPendingAuth] = useState<{ token: string; user: { id: number; email: string; name: string } } | null>(null)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const hasLocal = localStore.hasLocalData()

  async function migrateAndFinish(res: { token: string; user: { id: number; email: string; name: string } }) {
    // Set auth first so API calls work
    setAuth(res.token, res.user)

    const hats = localStore.getAllHatsForMigration()
    const sessions = localStore.getAllSessionsForMigration()

    if (hats.length > 0 || sessions.length > 0) {
      try {
        await api.migrateLocalData(hats, sessions)
      } catch {
        // Migration failed — data stays local, user can still use the app
        console.error('Migration failed')
      }
    }
    localStore.clear()
    navigate('/')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      if (mode === 'signup') {
        const res = await api.signup(email, password, name)
        if (hasLocal) {
          await migrateAndFinish(res)
        } else {
          setAuth(res.token, res.user)
          navigate('/')
        }
      } else {
        const res = await api.login(email, password)
        if (hasLocal && !localStore.isOnlyStarterData()) {
          setPendingAuth(res)
          setShowMergePrompt(true)
        } else {
          localStore.clear()
          setAuth(res.token, res.user)
          navigate('/')
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function handleMerge(merge: boolean) {
    if (!pendingAuth) return
    if (merge) {
      await migrateAndFinish(pendingAuth)
    } else {
      setAuth(pendingAuth.token, pendingAuth.user)
      localStore.clear()
      navigate('/')
    }
  }

  if (showMergePrompt && pendingAuth) {
    const hatCount = localStore.getAllHatsForMigration().filter(h => !h.deletedAt).length
    const sessionCount = localStore.getSessionCount()
    return (
      <div className="auth-form">
        <h2>Welcome back</h2>
        <p style={{ color: '#666', lineHeight: 1.7 }}>
          You have {hatCount} hat{hatCount !== 1 ? 's' : ''} and {sessionCount} session{sessionCount !== 1 ? 's' : ''} saved on this device.
          Add them to your account?
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn-primary" onClick={() => handleMerge(true)}>Yes, add them</button>
          <button className="btn-secondary" onClick={() => handleMerge(false)}>No, start fresh</button>
        </div>
      </div>
    )
  }

  const valuePitch = (
    <div style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1.25rem', lineHeight: 1.7 }}>
      <p>Add your activities. Roll a random timer. Focus. Earn points.</p>
      <p style={{ marginTop: '0.5rem' }}>Randomness removes decision fatigue so you just start.</p>
    </div>
  )

  if (mode === 'login') {
    return (
      <div className="auth-form">
        <h2>Log In</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Log In
          </button>
          <p className="switch-link">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p className="switch-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {valuePitch}
      {hasLocal && (
        <p style={{ color: '#4a9', fontSize: '0.85rem', margin: '0 0 1rem' }}>
          Your hats and sessions from this device will be saved to your account.
        </p>
      )}
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn-primary">
        Sign Up
      </button>
      <p className="switch-link">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  )
}
