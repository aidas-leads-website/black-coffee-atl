export const EVENT_TYPES = ['Pop-up', 'Listening party', 'Brand activation', 'Community gathering', 'Private party', 'Something else'] as const

export type InquiryValues = {
  name: string
  email: string
  phone: string
  date: string
  guests: string
  type: string
  details: string
}

export type InquiryState = {
  status: 'idle' | 'ok' | 'error'
  message?: string
  errors?: Partial<Record<keyof InquiryValues, string>>
  values?: InquiryValues
}

export const initialInquiryState: InquiryState = { status: 'idle' }

export function prettyDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
