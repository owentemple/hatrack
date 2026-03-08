import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (sent) {
    return (
      <div className="auth-form">
        <h2>Check Your Email</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '1rem 0' }}>
          If an account exists for {email}, we sent a password reset link. It expires in 1 hour.
        </p>
        <Link to="/login" className="switch-link">Back to log in</Link>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem' }}>
        Enter your email and we'll send you a reset link.
      </p>
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
      <button type="submit" className="btn-primary" style={{ width: '100%' }}>
        Send Reset Link
      </button>
      <p className="switch-link">
        <Link to="/login">Back to log in</Link>
      </p>
    </form>
  )
}
