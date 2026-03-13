import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="about-page">
      <h2>About HatRack</h2>

      <p>
        Most of us juggle multiple roles and projects — we "wear many hats."
        HatRack™ lets you put all your hats on the rack. Writing, Meditating,
        Reading, Drawing, Coding — whatever you want to make progress on. Start a
        focus session, and HatRack draws a hat at random with a timer of varying
        length. Wear one hat, then move on to the next. Earn points for every
        focused minute.
      </p>

      <p>
        Randomness removes the burden of choosing. Gamification makes it fun.
        Nothing gets missed.
      </p>

      <p>
        HatRack was created by Owen Temple and originally launched at
        hatrackapp.com in July 2015. The app has been rebuilt and expanded over
        the years, but the core concept hasn't changed: pick a hat, start a
        timer, do the work.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Subscriptions</h3>
      <p style={{ fontSize: '0.85rem' }}>
        HatRack is free to use. HatRack Premium unlocks stats, streak calendar, and insights
        for $5/month. Cancel anytime from Settings — your premium features remain active through
        the end of your billing period. No refunds for partial billing periods.
        Questions? Contact <a href="mailto:info@hatrackapp.com">info@hatrackapp.com</a>.
      </p>

      <p className="about-footer">
        <Link to="/blog">Read the blog</Link>
      </p>

      <p className="about-footer">
        Made in Austin, Texas.
      </p>

      <p className="about-copyright">
        © 2015–2026 HatRack, LLC
      </p>

      <p className="about-source">
        <a
          href="https://github.com/owentemple/hatrack"
          target="_blank"
          rel="noopener noreferrer"
        >
          View the source on GitHub
        </a>
      </p>
    </div>
  )
}
