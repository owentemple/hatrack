import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <p>
        Most of us juggle multiple roles and projects — we "wear many hats."
        HatRack lets you put all your hats on the rack. Start a focus session,
        and HatRack draws a hat at random with a timer of varying length.
        Earn points for every focused minute.
      </p>

      <p>Randomness removes the burden of choosing. Gamification makes it fun. Nothing gets missed.</p>

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
    </div>
  )
}
