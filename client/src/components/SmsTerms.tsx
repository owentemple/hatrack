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

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Opt-In</h3>
      <p>
        SMS reminders are entirely opt-in. To enable them, log in to your
        HatRack account, go to{' '}
        <a href="/settings">Settings</a>, enter your phone number, and choose
        your preferred frequency (daily, weekly, or monthly). You may also add
        an optional custom message to personalize your reminders. No messages
        are sent until you explicitly enable reminders and save your preferences.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Message Frequency</h3>
      <p>
        You control how often you receive messages. Options are daily, weekly,
        or monthly. Message timing is based on your most common focus session
        hour. You will receive no more than one message per day.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Opt-Out</h3>
      <p>
        You can stop receiving messages at any time by replying <strong>STOP</strong> to
        any HatRack text message, or by disabling reminders in your{' '}
        <a href="/settings">Settings</a> page. Opting out takes effect
        immediately.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Cost</h3>
      <p>
        HatRack does not charge for SMS reminders. Standard message and data
        rates from your carrier may apply.
      </p>

      <h3 style={{ marginTop: '24px', fontSize: '0.95rem' }}>Privacy</h3>
      <p>
        Your phone number is stored securely and used only for sending HatRack
        reminders. We do not share your phone number with third parties for
        marketing purposes. Messages are sent via Twilio.
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
