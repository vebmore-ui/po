/**
 * CONTACT data.
 *
 * Studio details are collected here so the contact section and its links stay
 * consistent without hard-coding contact data in components.
 */

/** Studio local timezone for the live clock. */
export const STUDIO_TIMEZONE = 'Asia/Kolkata'

/** Studio timezone abbreviation display label. */
export const STUDIO_TIMEZONE_LABEL = 'IST'

/** Addresses used to build the email compose URLs. */
export const GMAIL_ADDRESS = 'vebmore@gmail.com'
export const OUTLOOK_ADDRESS = 'vebmore@outlook.com'

/** LinkedIn profile URL. */
export const LINKEDIN_URL = 'https://www.linkedin.com/company/vebmore/'

/** Instagram profile URL. */
export const INSTAGRAM_URL = 'https://www.instagram.com/vebmore'

/** Subject prefilled into the Gmail / Outlook compose windows. */
export const EMAIL_SUBJECT = 'Hello VEBMORE'

/** Greeting prefilled into the WhatsApp chat. */
export const WHATSAPP_GREETING = 'Hello VEBMORE, I would like to talk about a project.'

export interface PhoneContact {
  /** Small mono label shown beside the number, e.g. `CONTACT 01`. */
  label: string
  /** Human-readable phone number shown in the contact section. */
  display: string
  /** Digits including the country code, for tel: and wa.me links. */
  digits: string
}

export const PHONES: PhoneContact[] = [
  { label: 'CONTACT 01', display: '+91 9427550414', digits: '919427550414' },
]

/** `mailto:`-style Gmail compose, opened in a new tab. */
export function gmailComposeUrl(): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: GMAIL_ADDRESS,
    su: EMAIL_SUBJECT,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

/** Outlook web compose, opened in a new tab. */
export function outlookComposeUrl(): string {
  const params = new URLSearchParams({
    to: OUTLOOK_ADDRESS,
    subject: EMAIL_SUBJECT,
  })
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`
}

/** WhatsApp chat deep link for a given digits-only number. */
export function whatsappUrl(digits: string): string {
  const params = new URLSearchParams({ text: WHATSAPP_GREETING })
  return `https://wa.me/${digits}?${params.toString()}`
}

/** `tel:` link for a given digits-only number. */
export function telUrl(digits: string): string {
  return `tel:+${digits}`
}
