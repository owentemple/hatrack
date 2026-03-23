import { useState, useEffect } from 'react'
import { Hat } from '../lib/api'
import type { SessionRecord } from '../lib/api'
import * as ds from '../lib/dataService'

interface Props {
  hat: Hat
  isPremium: boolean
  onClose: () => void
  onUpdateWhy: (id: number, why: string | null) => void
}

export default function HatDetail({ hat, isPremium, onClose, onUpdateWhy }: Props) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingWhy, setEditingWhy] = useState(false)
  const [whyInput, setWhyInput] = useState(hat.why || '')

  useEffect(() => {
    ds.getSessions().then(all => {
      const hatSessions = all
        .filter(s => s.hatId === hat.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setSessions(hatSessions)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [hat.id])

  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60)
  const totalPoints = sessions.reduce((sum, s) => sum + s.score, 0)

  function saveWhy() {
    const val = whyInput.trim() || null
    onUpdateWhy(hat.id, val)
    hat.why = val
    setEditingWhy(false)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal hat-detail" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '12px' }}>{hat.name}</h3>

        {isPremium && (
          <div style={{ marginBottom: '16px' }}>
            {!editingWhy ? (
              <>
                {hat.why && (
                  <p style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem', margin: '0 0 4px', textAlign: 'center' }}>
                    &ldquo;{hat.why}&rdquo;
                  </p>
                )}
                <div style={{ textAlign: 'center' }}>
                  <button className="link-button" style={{ fontSize: '0.75rem', marginTop: '4px' }} onClick={() => { setWhyInput(hat.why || ''); setEditingWhy(true) }}>
                    {hat.why ? 'edit why' : 'add why'}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <textarea
                  value={whyInput}
                  onChange={e => setWhyInput(e.target.value)}
                  placeholder="What would you tell yourself when you don't feel like it?"
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                  <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '4px 12px' }} onClick={saveWhy}>Save</button>
                  <button className="link-button" style={{ fontSize: '0.85rem' }} onClick={() => setEditingWhy(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sessions.length}</div>
              <div style={{ color: '#999', fontSize: '0.75rem' }}>sessions</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{totalMinutes}</div>
              <div style={{ color: '#999', fontSize: '0.75rem' }}>minutes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{totalPoints}</div>
              <div style={{ color: '#999', fontSize: '0.75rem' }}>points</div>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>Loading...</p>
        ) : sessions.length === 0 ? (
          <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', margin: '16px 0' }}>No sessions yet</p>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none' }}>
              {sessions.slice(0, 20).map(s => (
                <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5', fontSize: '0.85rem' }}>
                  <span style={{ color: '#999' }}>{formatDate(s.createdAt)}</span>
                  <span style={{ color: '#999' }}>{formatTime(s.createdAt)}</span>
                  <span style={{ color: '#666' }}>{Math.round(s.durationSeconds / 60)} min</span>
                  <span style={{ color: '#333', fontWeight: 600 }}>+{s.score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button className="link-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
