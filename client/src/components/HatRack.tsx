import { useState, useEffect, FormEvent } from 'react'
import * as api from '../lib/api'
import { Hat } from '../lib/api'
import HatItem from './HatItem'
import FocusSession from './FocusSession'

export default function HatRack() {
  const [hats, setHats] = useState<Hat[]>([])
  const [newHat, setNewHat] = useState('')
  const [showHelp, setShowHelp] = useState<boolean | null>(null)

  useEffect(() => {
    loadHats()
  }, [])

  async function loadHats() {
    try {
      const data = await api.getHats()
      setHats(data)
    } catch {
      // user might not be logged in yet
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newHat.trim()) return
    try {
      const hat = await api.createHat(newHat.trim())
      setHats((prev) => [...prev, hat])
      setNewHat('')
    } catch {
      // handle error
    }
  }

  async function handleToggle(id: number, done: boolean) {
    try {
      const updated = await api.updateHat(id, { done })
      setHats((prev) => prev.map((h) => (h.id === id ? updated : h)))
    } catch {
      // handle error
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteHat(id)
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
          placeholder="e.g. Reading, Drawing"
          value={newHat}
          onChange={(e) => setNewHat(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Add Hat to Rack
        </button>
      </form>

      {hats.length > 0 && hats.length <= 3 && (
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

      <FocusSession hats={hats} onSessionEnd={loadHats} />

      <button className="how-it-works-toggle" onClick={() => setShowHelp((prev) => !(prev ?? hats.length === 0))}>
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
    </div>
  )
}
