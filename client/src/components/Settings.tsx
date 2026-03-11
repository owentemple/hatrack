import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../lib/api'

export default function Settings() {
  const [username, setUsername] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [goalSlug, setGoalSlug] = useState('')
  const [connected, setConnected] = useState(false)
  const [connectedUsername, setConnectedUsername] = useState('')
  const [connectedGoalSlug, setConnectedGoalSlug] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // SMS state
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [smsPhone, setSmsPhone] = useState<string | null>(null)
  const [smsTimezone, setSmsTimezone] = useState<string | null>(null)
  const [smsReminderHour, setSmsReminderHour] = useState<number | null>(null)
  const [smsOptedOut, setSmsOptedOut] = useState(false)
  const [smsFrequency, setSmsFrequency] = useState('daily')
  const [smsCustomMessage, setSmsCustomMessage] = useState<string | null>(null)
  const [smsPhoneInput, setSmsPhoneInput] = useState('')
  const [smsFrequencyInput, setSmsFrequencyInput] = useState('daily')
  const [smsMessageInput, setSmsMessageInput] = useState('')
  const [showSmsForm, setShowSmsForm] = useState(false)
  const [smsError, setSmsError] = useState('')
  const [smsSuccess, setSmsSuccess] = useState('')

  useEffect(() => {
    Promise.all([
      api.getBeeminderSettings().then((settings) => {
        setConnected(settings.connected)
        if (settings.connected) {
          setConnectedUsername(settings.username || '')
          setConnectedGoalSlug(settings.goalSlug || '')
        }
      }),
      api.getSmsSettings().then((sms) => {
        setSmsEnabled(sms.enabled)
        setSmsPhone(sms.phone)
        setSmsTimezone(sms.timezone)
        setSmsReminderHour(sms.reminderHour)
        setSmsFrequency(sms.frequency || 'daily')
        setSmsCustomMessage(sms.customMessage)
        setSmsOptedOut(sms.optedOut)
      }),
    ]).finally(() => setLoading(false))
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const result = await api.saveBeeminderSettings(username, authToken, goalSlug)
      setConnected(true)
      setConnectedUsername(username)
      setConnectedGoalSlug(goalSlug)
      setUsername('')
      setAuthToken('')
      setGoalSlug('')
      if (result.connected) setSuccess('Beeminder connected!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDisconnect() {
    setError('')
    setSuccess('')

    try {
      await api.disconnectBeeminder()
      setConnected(false)
      setConnectedUsername('')
      setConnectedGoalSlug('')
      setSuccess('Beeminder disconnected.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="settings-page">
      <Link to="/" className="back-link">&larr; Back to Hats</Link>
      <h2>Settings</h2>

      <InstallInstructions />

      <SmsSection
        enabled={smsEnabled}
        phone={smsPhone}
        timezone={smsTimezone}
        reminderHour={smsReminderHour}
        frequency={smsFrequency}
        customMessage={smsCustomMessage}
        optedOut={smsOptedOut}
        phoneInput={smsPhoneInput}
        frequencyInput={smsFrequencyInput}
        messageInput={smsMessageInput}
        showForm={showSmsForm}
        error={smsError}
        success={smsSuccess}
        onPhoneInputChange={setSmsPhoneInput}
        onFrequencyInputChange={setSmsFrequencyInput}
        onMessageInputChange={setSmsMessageInput}
        onShowForm={() => setShowSmsForm(true)}
        onSave={async (e: FormEvent) => {
          e.preventDefault()
          setSmsError('')
          setSmsSuccess('')
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
          try {
            const result = await api.saveSmsSettings(smsPhoneInput, tz, smsFrequencyInput, smsMessageInput)
            setSmsEnabled(result.enabled)
            setSmsPhone(result.phone)
            setSmsTimezone(result.timezone)
            setSmsReminderHour(result.reminderHour)
            setSmsFrequency(result.frequency || 'daily')
            setSmsCustomMessage(result.customMessage)
            setSmsOptedOut(result.optedOut)
            setSmsPhoneInput('')
            setSmsMessageInput('')
            setShowSmsForm(false)
            setSmsSuccess('SMS reminders enabled! Check your phone for a confirmation text.')
          } catch (err: unknown) {
            setSmsError(err instanceof Error ? err.message : 'Failed to save')
          }
        }}
        onDisable={async () => {
          setSmsError('')
          setSmsSuccess('')
          try {
            await api.disconnectSms()
            setSmsEnabled(false)
            setSmsPhone(null)
            setSmsTimezone(null)
            setSmsReminderHour(null)
            setSmsCustomMessage(null)
            setShowSmsForm(false)
            setSmsSuccess('SMS reminders disabled.')
          } catch (err: unknown) {
            setSmsError(err instanceof Error ? err.message : 'Failed to disable')
          }
        }}
        onCancel={() => { setShowSmsForm(false); setSmsPhoneInput(''); setSmsFrequencyInput('daily'); setSmsMessageInput('') }}
      />

      <div className="settings-section" style={{ marginTop: '2rem' }}>
        <h3>Beeminder</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 1rem' }}>
          <a href="https://www.beeminder.com/" target="_blank" rel="noopener noreferrer">Beeminder</a> is
          an optional commitment service that keeps you on track with real stakes.
          Connect it to automatically send your focus session points as data.
        </p>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {connected ? (
          <div className="beeminder-status">
            <p>
              Connected as <strong>{connectedUsername}</strong> &rarr; goal <strong>{connectedGoalSlug}</strong>
            </p>
            <p className="beeminder-hint">Focus session points are automatically sent to Beeminder.</p>
            <button className="btn-danger" onClick={handleDisconnect}>Disconnect</button>
          </div>
        ) : !showForm ? (
          <button className="btn-secondary" onClick={() => setShowForm(true)}>Connect Beeminder</button>
        ) : (
          <form className="auth-form" onSubmit={handleSave}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Beeminder username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Auth token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0' }}>
                Find this at{' '}
                <a href="https://www.beeminder.com/api/v1/auth_token.json" target="_blank" rel="noopener noreferrer">
                  beeminder.com/api/v1/auth_token.json
                </a>{' '}
                (log in first)
              </p>
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Goal slug"
                value={goalSlug}
                onChange={(e) => setGoalSlug(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0' }}>
                The URL name of your goal — e.g. for beeminder.com/you/<strong>focus</strong>, enter <strong>focus</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary">Connect</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
}

function SmsSection({ enabled, phone, timezone, reminderHour, frequency, customMessage, optedOut, phoneInput, frequencyInput, messageInput, showForm, error, success, onPhoneInputChange, onFrequencyInputChange, onMessageInputChange, onShowForm, onSave, onDisable, onCancel }: {
  enabled: boolean
  phone: string | null
  timezone: string | null
  reminderHour: number | null
  frequency: string
  customMessage: string | null
  optedOut: boolean
  phoneInput: string
  frequencyInput: string
  messageInput: string
  showForm: boolean
  error: string
  success: string
  onPhoneInputChange: (v: string) => void
  onFrequencyInputChange: (v: string) => void
  onMessageInputChange: (v: string) => void
  onShowForm: () => void
  onSave: (e: FormEvent) => void
  onDisable: () => void
  onCancel: () => void
}) {
  const freqLabel = frequency === 'weekly' ? 'Weekly' : frequency === 'monthly' ? 'Monthly' : 'Daily'

  return (
    <div className="settings-section" style={{ marginTop: '2rem' }}>
      <h3>SMS Reminders</h3>
      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 1rem' }}>
        Get a text message reminder to start a focus session, timed to when you usually use HatRack.
      </p>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {optedOut ? (
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          You opted out via STOP. Text START to the HatRack number to re-enable.
        </p>
      ) : enabled ? (
        <div className="beeminder-status">
          <p>Sending to <strong>{phone}</strong></p>
          {reminderHour !== null && (
            <p className="beeminder-hint">{freqLabel} reminder around {formatHour(reminderHour)} ({timezone})</p>
          )}
          {customMessage && (
            <p className="beeminder-hint" style={{ fontStyle: 'italic' }}>"{customMessage}"</p>
          )}
          <button className="btn-danger" onClick={onDisable}>Disable</button>
        </div>
      ) : !showForm ? (
        <button className="btn-secondary" onClick={onShowForm}>Enable SMS Reminders</button>
      ) : (
        <form className="auth-form" onSubmit={onSave}>
          <div className="form-group">
            <input
              type="tel"
              inputMode="tel"
              placeholder="Phone number"
              value={phoneInput}
              onChange={(e) => onPhoneInputChange(e.target.value)}
              required
            />
            <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0' }}>
              US numbers only. Standard message rates apply.
            </p>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>How often?</label>
            <div style={{ display: 'flex', gap: '0', border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden' }}>
              {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '0.35rem 0',
                    fontSize: '0.8rem',
                    border: 'none',
                    borderRight: f !== 'monthly' ? '1px solid #ccc' : 'none',
                    background: frequencyInput === f ? '#337ab7' : '#fff',
                    color: frequencyInput === f ? '#fff' : '#666',
                    cursor: 'pointer',
                    fontWeight: frequencyInput === f ? 600 : 400,
                  }}
                  onClick={() => onFrequencyInputChange(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Write a message to future you (optional)</label>
            <input
              type="text"
              placeholder="e.g. You always feel better after you start."
              value={messageInput}
              onChange={(e) => onMessageInputChange(e.target.value)}
              maxLength={120}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.75rem' }}>
            Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary">Enable</button>
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

function InstallInstructions() {
  const [browser, setBrowser] = useState<'safari' | 'chrome'>(() => {
    const ua = navigator.userAgent
    if (/CriOS|Chrome/.test(ua) && !/Safari/.test(ua) || /Android/.test(ua)) return 'chrome'
    return 'safari'
  })

  const steps = browser === 'safari'
    ? [
        <>Tap the <span className="apple-icon" aria-label="Share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom' }}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </span> <strong>Share</strong> button</>,
        <>Scroll down and tap <span className="apple-icon" aria-label="Add to Home Screen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </span> <strong>"Add to Home Screen"</strong></>,
        <>Tap <strong>"Add"</strong></>,
      ]
    : [
        <>Tap the <strong>menu</strong> (three dots)</>,
        <>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></>,
        <>Tap <strong>"Add"</strong></>,
      ]

  return (
    <div className="settings-section">
      <h3>Add to Home Screen on Mobile Device</h3>
      <div className="install-tabs">
        <button
          className={`install-tab${browser === 'safari' ? ' install-tab--active' : ''}`}
          onClick={() => setBrowser('safari')}
        >
          Safari
        </button>
        <button
          className={`install-tab${browser === 'chrome' ? ' install-tab--active' : ''}`}
          onClick={() => setBrowser('chrome')}
        >
          Chrome
        </button>
      </div>
      <ol className="install-steps">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  )
}
