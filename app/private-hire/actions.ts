'use server'

import { headers } from 'next/headers'
import { business } from '@/lib/site'
import { EVENT_TYPES, prettyDate, type InquiryState, type InquiryValues } from './inquiry'

// Simple per-instance rate limit: 5 inquiries per address per hour.
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3_600_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > 5
}

function todayInAtlanta() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

async function send(values: InquiryValues) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.INQUIRY_TO || business.email
  const from = process.env.INQUIRY_FROM || 'Black Coffee ATL website <onboarding@resend.dev>'
  const text = [
    `New private-hire inquiry from blackcoffeeatl.com`,
    ``,
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Phone: ${values.phone || 'not given'}`,
    `Date: ${prettyDate(values.date)}`,
    `Guests: ${values.guests}`,
    `Event type: ${values.type}`,
    ``,
    values.details || '(no further details)',
  ].join('\n')

  if (!key) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[inquiry] RESEND_API_KEY not set; inquiry logged instead of emailed:\n' + text)
      return true
    }
    return false
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: values.email,
      subject: `Private hire: ${values.type}, ${prettyDate(values.date)}, ${values.guests} guests`,
      text,
    }),
  })
  return res.ok
}

/** F5: private-hire inquiry. Works with or without JavaScript. */
export async function submitInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const str = (k: string) => String(form.get(k) ?? '').trim()
  const values: InquiryValues = {
    name: str('name').slice(0, 120),
    email: str('email').slice(0, 200),
    phone: str('phone').slice(0, 40),
    date: str('date'),
    guests: str('guests'),
    type: str('type'),
    details: str('details').slice(0, 3000),
  }

  const errors: InquiryState['errors'] = {}
  if (!values.name) errors.name = 'Enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) errors.email = 'Enter an email address like name@example.com.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) errors.date = 'Choose the date of your event.'
  else if (values.date < todayInAtlanta()) errors.date = 'Choose a date that has not passed.'
  const guests = Number(values.guests)
  if (!Number.isInteger(guests) || guests < 1 || guests > 1000) errors.guests = 'Enter the number of guests, as a whole number.'
  if (!(EVENT_TYPES as readonly string[]).includes(values.type)) errors.type = 'Choose the type of event.'
  if (Object.keys(errors).length) {
    return { status: 'error', message: 'Please check the highlighted fields.', errors, values }
  }

  // Spam protection: a honeypot field people never see, and a minimum fill time when scripts ran.
  // Bots get a quiet success so they learn nothing; nothing is sent.
  const started = Number(str('t'))
  if (str('website') || (started && Date.now() - started < 2500)) {
    return { status: 'ok', values }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
  if (limited(ip)) {
    return { status: 'error', message: `Too many inquiries from this connection. Please email ${business.email} instead.`, values }
  }

  try {
    if (await send(values)) return { status: 'ok', values }
  } catch {
    /* fall through */
  }
  return {
    status: 'error',
    message: `Your inquiry could not be sent just now. Please email ${business.email} or call ${business.phone.display}.`,
    values,
  }
}
