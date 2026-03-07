import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as api from '../lib/api'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const res =
        mode === 'signup'
          ? await api.signup(email, password, name)
          : await api.login(email, password)
      setAuth(res.token, res.user)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const valuePitch = (
    <div style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1.25rem' }}>
      <p style={{ marginBottom: '0.75rem' }}>Build habits with random focus sessions.</p>
      <ul style={{ textAlign: 'left', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
        <li>Add your activities — writing, meditating, exercising</li>
        <li>Roll a random timer and focus</li>
        <li>Earn points and track your daily score</li>
      </ul>
      <p style={{ marginTop: '0.75rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
        Randomness removes decision fatigue so you just start.
      </p>
    </div>
  )

  if (mode === 'login') {
    return (
      <div className="auth-form">
        {valuePitch}
        <Link to="/signup" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px 20px' }}>
          Get Started
        </Link>
        <div style={{ margin: '2rem 0 1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <h2>Log In</h2>
        </div>
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
        </form>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {valuePitch}
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
