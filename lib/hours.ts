import { hours, formatTime, type DayName } from './site'

const DAYS: DayName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function dayHours(day: DayName) {
  const row = hours.find((h) => h.days.includes(day))
  return row ? { opens: row.opens, closes: row.closes } : null
}

export type OpenStatus = { open: boolean; text: string }

/** F1: open or closed right now, computed in Atlanta time whatever the visitor's time zone. */
export function statusAt(now: Date): OpenStatus {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const dayIdx = SHORT.indexOf(get('weekday'))
  const mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10)
  const today = dayHours(DAYS[dayIdx])

  if (today && mins >= toMin(today.opens) && mins < toMin(today.closes)) {
    return { open: true, text: `Open until ${formatTime(today.closes)}` }
  }
  if (today && mins < toMin(today.opens)) {
    return { open: false, text: `Closed, opens ${formatTime(today.opens)}` }
  }
  for (let k = 1; k <= 7; k++) {
    const day = DAYS[(dayIdx + k) % 7]
    const h = dayHours(day)
    if (h) return { open: false, text: `Closed, opens ${formatTime(h.opens)} ${k === 1 ? 'tomorrow' : day}` }
  }
  return { open: false, text: 'Closed' }
}

/** Shown before scripts run, and to crawlers. Always true whatever the time. */
export const staticStatus = (() => {
  const opens = new Set(hours.map((h) => h.opens))
  return opens.size === 1 ? `Open daily from ${formatTime(hours[0].opens)}` : 'See opening hours'
})()
