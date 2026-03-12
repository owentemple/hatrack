import { Link, useNavigate } from 'react-router-dom'
import { seedStarterHats } from '../lib/localStore'

export default function LandingPage() {
  const navigate = useNavigate()

  function handleGetStarted() {
    seedStarterHats()
    navigate('/', { replace: true })
    // Force re-render by reloading — HomePage will now see local data
    window.location.reload()
  }

  return (
    <div className="landing-page">
      <p className="landing-hook">
        Spend time on what matters — without overthinking where to start.
      </p>

      <button
        className="btn-primary"
        onClick={handleGetStarted}
        style={{ display: 'block', width: '100%', textAlign: 'center', padding: '10px 20px', margin: '1.5rem 0' }}
      >
        Get Started
      </button>

      <p className="switch-link" style={{ marginBottom: '0.75rem' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
      <p className="switch-link">
        <Link to="/signup">Create an account</Link> to save across devices
      </p>

      <div className="landing-how">
        <h3>How it works</h3>
        <p>Add your activities to the rack.</p>
        <p>Start a session — HatRack picks one at random with a short timer.</p>
        <p>Finish and earn points. Then go again.</p>
        <p style={{ marginTop: '1rem', opacity: 0.7 }}>Works on any device. Best in your pocket.</p>
      </div>
    </div>
  )
}
