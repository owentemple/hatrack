export default function SmsTerms() {
  return (
    <div className="about-page">
      <h2>SMS Reminders</h2>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>How It Works</h3>
      <p>
        HatRack offers optional SMS reminders to help you stay on track with your
        focus sessions. When enabled, you'll receive a text message at a time
        based on when you typically use HatRack, nudging you to start a session.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Consent &amp; Opt-In Process</h3>
      <p>
        SMS reminders are entirely opt-in. No messages are ever sent without
        the user's explicit consent. The opt-in form is located within
        authenticated user account settings at hatrack.it/settings. To enable
        reminders, users must:
      </p>
      <ol style={{ fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.25rem' }}>
        <li>Log in to their HatRack account</li>
        <li>Navigate to Settings</li>
        <li>Enter their phone number</li>
        <li>Select message frequency (daily, weekly, or monthly)</li>
        <li>Check an explicit consent checkbox (not pre-selected)</li>
        <li>Tap the "Enable" button to activate reminders</li>
      </ol>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Opt-In Form</h3>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
        This is the consent form users see in their account settings:
      </p>
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        background: '#fafafa',
        maxWidth: '400px',
      }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0 0 4px' }}>SMS Reminders</p>
        <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 12px' }}>
          Get a text message reminder to start a focus session, timed to when you usually use HatRack.
        </p>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="tel"
            placeholder="Phone number"
            disabled
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem', background: '#fff', boxSizing: 'border-box' }}
          />
          <p style={{ fontSize: '0.7rem', color: '#999', margin: '4px 0 0' }}>US numbers only.</p>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 4px' }}>How often?</p>
          <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden' }}>
            <span style={{ flex: 1, textAlign: 'center', padding: '6px 0', fontSize: '0.75rem', background: '#337ab7', color: '#fff', fontWeight: 600 }}>Daily</span>
            <span style={{ flex: 1, textAlign: 'center', padding: '6px 0', fontSize: '0.75rem', borderLeft: '1px solid #ccc', color: '#666' }}>Weekly</span>
            <span style={{ flex: 1, textAlign: 'center', padding: '6px 0', fontSize: '0.75rem', borderLeft: '1px solid #ccc', color: '#666' }}>Monthly</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0' }}>
          <input type="checkbox" disabled style={{ marginTop: '2px', flexShrink: 0 }} />
          <span style={{ fontSize: '0.7rem', color: '#666', lineHeight: '1.4' }}>
            I agree to receive automated text messages from HatRack at the frequency selected above. Up to 1 msg/day. Msg &amp; data rates may apply. Reply HELP for help, STOP to cancel. <span style={{ color: '#337ab7' }}>SMS Terms</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', background: '#ccc', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}>Enable</span>
          <span style={{ display: 'inline-block', padding: '6px 16px', background: '#eee', color: '#666', borderRadius: '4px', fontSize: '0.85rem' }}>Cancel</span>
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
        The "Enable" button is disabled until the user checks the consent checkbox.
        The checkbox is never pre-selected. Phone numbers are never pre-populated
        or imported — users must manually enter their own number.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Confirmation Message</h3>
      <p>
        After opting in, users immediately receive a confirmation text:
      </p>
      <p style={{ padding: '12px 16px', background: '#f5f5f5', borderRadius: '6px', fontSize: '0.9rem' }}>
        "HatRack: Daily reminders enabled! Up to 1 msg/day. Reply HELP for help, STOP to cancel. Msg &amp; data rates may apply."
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Message Frequency</h3>
      <p>
        Users control how often they receive messages. Options are daily, weekly,
        or monthly. No more than 1 message per day is sent.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Sample Message</h3>
      <p style={{ padding: '12px 16px', background: '#f5f5f5', borderRadius: '6px', fontSize: '0.9rem' }}>
        "Your hats are waiting. Tap to start — hatrack.it"
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Opt-Out</h3>
      <p>
        Users can stop receiving messages at any time by:
      </p>
      <ul style={{ fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.25rem' }}>
        <li>Replying <strong>STOP</strong> to any HatRack text message</li>
        <li>Disabling reminders in their account settings</li>
      </ul>
      <p>
        Opting out takes effect immediately. No further messages are sent
        after opt-out.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Help</h3>
      <p>
        Users can reply <strong>HELP</strong> to any HatRack text message to receive:
      </p>
      <p style={{ padding: '12px 16px', background: '#f5f5f5', borderRadius: '6px', fontSize: '0.9rem' }}>
        "HatRack SMS Reminders from HatRack, LLC (hatrack.it). Up to 1 msg/day. Reply STOP to cancel, HELP for help. Msg &amp; data rates may apply. info@hatrack.it"
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Cost</h3>
      <p>
        HatRack does not charge for SMS reminders. Message and data rates from
        your carrier may apply.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Privacy</h3>
      <p>
        Phone numbers are stored securely and used only for sending HatRack
        reminders. We do not share, sell, or rent phone numbers to third
        parties. Messages are sent via Twilio. Phone numbers are deleted
        immediately when a user disables reminders.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Contact</h3>
      <p>
        Questions about SMS reminders? Email{' '}
        <a href="mailto:info@hatrack.it">info@hatrack.it</a>.
      </p>

      <p className="about-footer" style={{ marginTop: '32px' }}>
        © 2015–2026 HatRack, LLC. Austin, Texas.
      </p>
    </div>
  )
}
