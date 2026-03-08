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
      <div className="form-group">
        <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>
          Start with a template (you can always add or remove hats later)
        </label>
        <div className="template-picker">
          <button
            type="button"
            className={`template-option${template === 'songwriter' ? ' template-option--selected' : ''}`}
            onClick={() => setTemplate(template === 'songwriter' ? '' : 'songwriter')}
          >
            <strong>Songwriter</strong>
            <span>Writing, Reading, Listening, Performing</span>
          </button>
          <button
            type="button"
            className={`template-option${template === '' ? ' template-option--selected' : ''}`}
            onClick={() => setTemplate('')}
          >
            <strong>General</strong>
            <span>Writing, Meditating</span>
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
