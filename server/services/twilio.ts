import twilio from 'twilio'

let client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
  }
  return client
}

export async function sendSms(to: string, body: string) {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  return getClient().messages.create({
    to,
    body,
    ...(messagingServiceSid
      ? { messagingServiceSid }
      : { from: process.env.TWILIO_PHONE_NUMBER! }),
  })
}

export function validateE164(phone: string): boolean {
  return /^\+1\d{10}$/.test(phone)
}

export function formatPhoneInput(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (input.startsWith('+1') && digits.length === 11) return `+${digits}`
  return null
}
