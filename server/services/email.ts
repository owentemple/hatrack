import { Resend } from 'resend'

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'HatRack <noreply@notify.hatrack.it>'
const APP_URL = process.env.APP_URL || 'https://www.hatrack.it'

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your HatRack password',
    html: `
      <p>You requested a password reset for your HatRack account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  })
}
