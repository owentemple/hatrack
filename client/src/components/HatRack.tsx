import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as ds from '../lib/dataService'
import { Hat } from '../lib/dataService'
import { getSessionCount } from '../lib/localStore'
import HatItem from './HatItem'
import FocusSession from './FocusSession'

export default function HatRack() {
  const [hats, setHats] = useState<Hat[]>([])
  const [newHat, setNewHat] = useState('')
  const [showHelp, setShowHelp] = useState<boolean | null>(() => {
    try {
      return localStorage.getItem('hatrack-help-dismissed') ? null : true
    } catch { return null }
  })
  const [showInstallNudge, setShowInstallNudge] = useState(false)
  const [showSignupNudge, setShowSignupNudge] = useState(false)
  const isLoggedIn = !!localStorage.getItem('token')

  // Show install nudge after first session if not already in standalone mode
  useEffect(() => {
    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const dismissed = localStorage.getItem('hatrack-install-dismissed')
      const hasSession = localStorage.getItem('hatrack-has-session')
      if (isMobile && !isStandalone && !dismissed && hasSession) {
        setShowInstallNudge(true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    loadHats()
  }, [])

  async function loadHats() {
    try {
      const result = await ds.getHats()
      setHats(result)
    } catch {
      // user might not be logged in yet
    }
  }

  function checkSignupNudge() {
    if (isLoggedIn) return
    try {
      const dismissed = localStorage.getItem('hatrack-signup-nudge-dismissed')
      if (!dismissed && getSessionCount() >= 3) {
        setShowSignupNudge(true)
      }
    } catch {}
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newHat.trim()) return
    try {
      const hat = await ds.createHat(newHat.trim())
      setHats((prev) => [...prev, hat])
      setNewHat('')
    } catch {
      // handle error
    }
  }

  async function handleToggle(id: number, done: boolean) {
    try {
      const updated = await ds.updateHat(id, { done })
      setHats((prev) => prev.map((h) => (h.id === id ? updated : h)))
    } catch {
      // handle error
    }
  }

  async function handleDelete(id: number) {
    try {
      await ds.deleteHat(id)
      setHats((prev) => prev.filter((h) => h.id !== id))
    } catch {
      // handle error
    }
  }

  return (
    <div>
      <form className="hat-input-row" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="e.g. Drawing, Stretching"
          value={newHat}
          onChange={(e) => setNewHat(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Add Hat to Rack
        </button>
      </form>

      {hats.length > 0 && hats.length <= 3 && !isLoggedIn && !localStorage.getItem('hatrack-starter-dismissed') && (
        <p style={{ color: '#999', fontSize: '0.8rem', margin: '0 0 4px' }}>
          These are just starters — add your own, rename, or remove any hat.{' '}
          <button className="link-button" style={{ fontSize: '0.8rem' }} onClick={() => {
            localStorage.setItem('hatrack-starter-dismissed', 'true')
            setHats([...hats]) // force re-render
          }}>Got it</button>
        </p>
      )}
      {hats.length > 0 && hats.length <= 3 && (isLoggedIn || localStorage.getItem('hatrack-starter-dismissed')) && (
        <p style={{ color: '#999', fontSize: '0.8rem', margin: '0 0 4px' }}>Done for the day? Check it off. Resets tomorrow. Tap x to remove.</p>
      )}
      <ul className="hat-list">
        {hats.length === 0 && (
          <li className="empty-state">
            Add your activities above — things like "Writing," "Meditating," or "Exercising." These are your hats.
          </li>
        )}
        {hats.map((hat) => (
          <HatItem
            key={hat.id}
            hat={hat}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      <FocusSession hats={hats} onSessionEnd={() => {
        loadHats()
        checkSignupNudge()
        // Check if we should show install nudge after session
        try {
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
          const dismissed = localStorage.getItem('hatrack-install-dismissed')
          if (isMobile && !isStandalone && !dismissed && localStorage.getItem('hatrack-has-session')) {
            setShowInstallNudge(true)
          }
        } catch {}
      }} onHatDone={(id) => {
        // Optimistically update local state so checkbox appears immediately
        setHats((prev) => prev.map((h) => (h.id === id ? { ...h, done: true } : h)))
        // Fire API call in background
        ds.updateHat(id, { done: true }).catch(() => loadHats())
      }} />

      <button className="how-it-works-toggle" onClick={() => setShowHelp((prev) => {
        const next = !(prev ?? hats.length === 0)
        if (!next) { try { localStorage.setItem('hatrack-help-dismissed', 'true') } catch {} }
        return next
      })}>
        {(showHelp ?? hats.length === 0) ? 'Hide' : 'How it works'}
      </button>
      {(showHelp ?? hats.length === 0) && (
        <ul className="how-it-works">
          <li>Add your activities ("hats") to the rack</li>
          <li>Start a session — a random hat and timer (1–25 min) are chosen for you</li>
          <li>Complete the timer to earn points (1 point per minute)</li>
          <li>Check off a hat when you're done with it for the day</li>
        </ul>
      )}

      {showSignupNudge && (
        <div className="install-nudge">
          <p>Your hats and history are saved on this device. <Link to="/signup">Create an account</Link> to keep them safe and sync across devices.</p>
          <button className="link-button" onClick={() => {
            setShowSignupNudge(false)
            try { localStorage.setItem('hatrack-signup-nudge-dismissed', 'true') } catch {}
          }}>
            Dismiss
          </button>
        </div>
      )}

      {showInstallNudge && (
        <div className="install-nudge">
          <p>HatRack works best from your home screen — opens full-screen like an app.</p>
          <p style={{ fontSize: '0.8rem', color: '#999', margin: '4px 0 0' }}>
            Tap your browser's Share or Menu button, then "Add to Home Screen."
          </p>
          <button className="link-button" onClick={() => {
            setShowInstallNudge(false)
            try { localStorage.setItem('hatrack-install-dismissed', 'true') } catch {}
          }}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
