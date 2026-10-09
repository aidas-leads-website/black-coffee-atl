'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitInquiry } from './actions'
import { EVENT_TYPES, initialInquiryState, prettyDate, type InquiryValues } from './inquiry'
import { track } from '@/components/SiteEffects'

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: keyof InquiryValues
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="field">
      <label htmlFor={`f-${id}`}>{label}</label>
      {hint ? (
        <span className="hint" id={`f-${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {children}
      {error ? (
        <span className="err" id={`f-${id}-err`}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

export function InquiryForm() {
  const [state, action, pending] = useActionState(submitInquiry, initialInquiryState)
  const [started, setStarted] = useState('')
  const status = useRef<HTMLDivElement>(null)
  const v = state.values
  const e = state.errors || {}

  useEffect(() => {
    setStarted(String(Date.now()))
  }, [])

  useEffect(() => {
    if (state.status === 'ok') track('inquiry_submit', { type: state.values?.type || '' })
    if (state.status !== 'idle') status.current?.focus()
  }, [state])

  if (state.status === 'ok' && v) {
    return (
      <div className="notice ok" role="status" tabIndex={-1} ref={status}>
        <h3>Inquiry sent</h3>
        <p>
          Thank you, {v.name.split(' ')[0]}. The Black Coffee ATL team has your request for {prettyDate(v.date)}, for {v.guests} guests,
          and will reply to {v.email}.
        </p>
      </div>
    )
  }

  const describedBy = (k: keyof InquiryValues, hint = false) =>
    [hint ? `f-${k}-hint` : '', e[k] ? `f-${k}-err` : ''].filter(Boolean).join(' ') || undefined

  return (
    // Keyed on the returned values so a failed submission remounts with every answer kept, selects included.
    <form className="form" action={action} noValidate key={v ? JSON.stringify(v) : 'blank'}>
      <div ref={status} tabIndex={-1} aria-live="assertive">
        {state.status === 'error' && state.message ? (
          <p className="notice bad" role="alert">
            {state.message}
          </p>
        ) : null}
      </div>

      <div className="row">
        <Field id="date" label="Date of the event" error={e.date}>
          <input
            id="f-date"
            name="date"
            type="date"
            required
            defaultValue={v?.date}
            aria-invalid={!!e.date}
            aria-describedby={describedBy('date')}
          />
        </Field>
        <Field id="guests" label="Number of guests" error={e.guests}>
          <input
            id="f-guests"
            name="guests"
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            required
            defaultValue={v?.guests}
            aria-invalid={!!e.guests}
            aria-describedby={describedBy('guests')}
          />
        </Field>
      </div>

      <Field id="type" label="Type of event" error={e.type}>
        <select id="f-type" name="type" required defaultValue={v?.type || ''} aria-invalid={!!e.type} aria-describedby={describedBy('type')}>
          <option value="" disabled>
            Choose one
          </option>
          {EVENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>

      <div className="row">
        <Field id="name" label="Your name" error={e.name}>
          <input
            id="f-name"
            name="name"
            autoComplete="name"
            required
            defaultValue={v?.name}
            aria-invalid={!!e.name}
            aria-describedby={describedBy('name')}
          />
        </Field>
        <Field id="email" label="Email" error={e.email}>
          <input
            id="f-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={v?.email}
            aria-invalid={!!e.email}
            aria-describedby={describedBy('email')}
          />
        </Field>
      </div>

      <Field id="phone" label="Phone (optional)">
        <input id="f-phone" name="phone" type="tel" autoComplete="tel" defaultValue={v?.phone} />
      </Field>

      <Field id="details" label="Tell us about it (optional)" hint="Times, layout, food and drink, sound, anything else.">
        <textarea id="f-details" name="details" rows={5} defaultValue={v?.details} aria-describedby={describedBy('details', true)} />
      </Field>

      {/* Spam protection: people never see or fill this field. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Leave this empty</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="t" value={started} />

      <div>
        <button className="btn primary" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send inquiry'}
        </button>
      </div>
    </form>
  )
}
