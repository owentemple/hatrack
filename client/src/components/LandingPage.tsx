import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <p className="landing-hook">
        Spend time on what matters — without overthinking where to start.
      </p>

      <Link
        to="/signup"
        className="btn-primary"
        style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px 20px', margin: '1.5rem 0' }}
      >
        Get Started
      </Link>

      <p className="switch-link">
        Already have an account? <Link to="/login">Log in</Link>
      </p>

      <div className="landing-how">
        <h3>How it works</h3>
        <p>Add your activities to the rack.</p>
        <p>Start a session — HatRack picks one at random with a short timer.</p>
        <p>Finish and earn points. Then go again.</p>
      </div>
    </div>
  )
}
