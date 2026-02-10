import { useState, useEffect, FormEvent } from 'react'
import * as api from '../lib/api'
import { Hat } from '../lib/api'
import HatItem from './HatItem'
import FocusSession from './FocusSession'

export default function HatRack() {
  const [hats, setHats] = useState<Hat[]>([])
  const [newHat, setNewHat] = useState('')
  const [showHelp, setShowHelp] = useState(false)

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
          placeholder="Enter a hat..."
          value={newHat}
          onChange={(e) => setNewHat(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Add Hat to Rack
        </button>
      </form>

      <hr />

      <ul className="hat-list">
        {hats.map((hat) => (
          <HatItem
            key={hat.id}
            hat={hat}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      <hr />

      <FocusSession hats={hats} onSessionEnd={loadHats} />

      <button className="how-it-works-toggle" onClick={() => setShowHelp(!showHelp)}>
        {showHelp ? 'Hide' : 'How it works'}
      </button>
      {showHelp && (
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
