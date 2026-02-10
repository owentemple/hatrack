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

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Log In' : 'Sign Up'}</h2>
      {error && <p className="error-message">{error}</p>}
      {mode === 'signup' && (
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      )}
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
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </button>
      <p className="switch-link">
        {mode === 'login' ? (
          <>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </>
        ) : (
          <>
            Already have an account? <Link to="/login">Log in</Link>
          </>
        )}
      </p>
    </form>
  )
}
