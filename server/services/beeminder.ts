interface BeeminderConfig {
  username: string
  authToken: string
  goalSlug: string
}

interface DatapointPayload {
  value: number
  comment: string
  requestid: string
}

export function isBeeminderConfigured(user: {
  beeminderUsername: string | null
  beeminderAuthToken: string | null
  beeminderGoalSlug: string | null
}): user is { beeminderUsername: string; beeminderAuthToken: string; beeminderGoalSlug: string } {
  return !!(user.beeminderUsername && user.beeminderAuthToken && user.beeminderGoalSlug)
}

export async function sendDatapoint(config: BeeminderConfig, payload: DatapointPayload) {
  const url = `https://www.beeminder.com/api/v1/users/${config.username}/goals/${config.goalSlug}/datapoints.json`

  const body = new URLSearchParams({
    auth_token: config.authToken,
    value: String(payload.value),
    comment: payload.comment,
    requestid: payload.requestid,
  })

  const res = await fetch(url, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Beeminder API error ${res.status}: ${text}`)
  }

  return res.json()
}
