import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createCheckoutSession } from '../lib/api'

interface Props {
  isLoggedIn: boolean
}

export default function PremiumTeaser({ isLoggedIn }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const { url } = await createCheckoutSession()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="premium-teaser">
      <h3 className="premium-teaser-title">Unlock Stats & Insights</h3>
      <p className="premium-teaser-text">
        See your focus trends by day, week, month, and year. Track your streak on a calendar. Discover your peak hours and most active days.
      </p>
      {isLoggedIn ? (
        <button className="btn-primary" onClick={handleUpgrade} disabled={loading}>
          {loading ? 'Loading...' : 'Upgrade to Premium'}
        </button>
      ) : (
        <Link to="/signup" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Sign up to unlock
        </Link>
      )}
    </div>
  )
}
