export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export const formatDateTimeLocal = (timestamp) => {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  const parts = formatter.formatToParts(date)
  const values = {}

  for (const part of parts) {
    values[part.type] = part.value
  }

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`
}

export function localDateTimeToISOString (value) {
  if (!value) {
    return null
  }

  return new Date(value).toISOString()
}