import { useState, FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as api from '../lib/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="auth-form">
        <h2>Invalid Link</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '1rem 0' }}>
          This reset link is invalid. Please request a new one.
        </p>
        <Link to="/forgot-password">Request new link</Link>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await api.resetPassword(token!, password)
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (done) {
    return (
      <div className="auth-form">
        <h2>Password Reset</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '1rem 0' }}>
          Your password has been updated. You can now log in.
        </p>
        <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px 20px' }}>
          Log In
        </Link>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Set New Password</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%' }}>
        Reset Password
      </button>
    </form>
  )
}
