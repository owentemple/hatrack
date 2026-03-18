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
        the user's explicit consent. To enable reminders:
      </p>
      <ol style={{ fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.25rem' }}>
        <li>Log in to your HatRack account</li>
        <li>Go to <a href="/settings">Settings</a></li>
        <li>Enter your phone number</li>
        <li>Choose your preferred frequency (daily, weekly, or monthly)</li>
        <li>Review the consent disclosure: <em>"By enabling, you agree to receive text messages from HatRack at the frequency you selected. Msg &amp; data rates may apply. Reply STOP to unsubscribe."</em></li>
        <li>Tap "Enable" to consent and activate reminders</li>
      </ol>
      <p>
        After enabling, users receive a confirmation text:{' '}
        <em>"HatRack: [Frequency] reminders enabled! Reply STOP to opt out."</em>
      </p>
      <p>
        No messages are sent until the user completes all steps above and
        explicitly taps "Enable." Phone numbers are never pre-populated or
        imported — users must manually enter their own number.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Message Frequency</h3>
      <p>
        Users control how often they receive messages. Options are daily, weekly,
        or monthly. Message timing is based on the user's most common focus
        session hour. No more than one message per day is sent.
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
        <li>Disabling reminders in <a href="/settings">Settings</a></li>
      </ul>
      <p>
        Opting out takes effect immediately. No further messages are sent
        after opt-out.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Cost</h3>
      <p>
        HatRack does not charge for SMS reminders. Standard message and data
        rates from your carrier may apply.
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
