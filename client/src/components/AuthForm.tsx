import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as api from '../lib/api'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('')
  const [error, setError] = useState('')
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const res =
        mode === 'signup'
          ? await api.signup(email, password, name, template || undefined)
          : await api.login(email, password)
      setAuth(res.token, res.user)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
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
      <div className="form-group">
        <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>
          Start with a template (you can always add or remove hats later)
        </label>
        <div className="template-picker">
          <button
            type="button"
            className={`template-option${template === '' ? ' template-option--selected' : ''}`}
            onClick={() => setTemplate('')}
          >
            <strong>Start empty</strong>
            <span>Add your own activities after signup</span>
          </button>
          <button
            type="button"
            className={`template-option${template === 'starter' ? ' template-option--selected' : ''}`}
            onClick={() => setTemplate(template === 'starter' ? '' : 'starter')}
          >
            <strong>Starter</strong>
            <span>Exercise, Reading, Creative Work</span>
          </button>
          <button
            type="button"
            className={`template-option${template === 'songwriter' ? ' template-option--selected' : ''}`}
            onClick={() => setTemplate(template === 'songwriter' ? '' : 'songwriter')}
          >
            <strong>Songwriter</strong>
            <span>Writing, Reading, Listening, Performing</span>
          </button>
        </div>
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
