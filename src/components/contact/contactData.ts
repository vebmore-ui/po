/**
 * CONTACT data.
 *
 * EVERY value below is a placeholder marked `// REPLACE`. They are collected
 * here so that replacing the studio's real details is a single-file edit: the
 * section and every button URL are built from these values, nothing is
 * hard-coded in a component.
 */

/** The address shown in the UI and used to build the compose URLs. */
export const CONTACT_EMAIL = 'hello@vebmore.com' // REPLACE

/** LinkedIn profile URL. */
export const LINKEDIN_URL = 'https://www.linkedin.com/company/vebmore' // REPLACE

/** Instagram profile URL. */
export const INSTAGRAM_URL = 'https://www.instagram.com/vebmore' // REPLACE

/** Subject prefilled into the Gmail / Outlook compose windows. */
export const EMAIL_SUBJECT = 'Hello VEBMORE'

/** Greeting prefilled into the WhatsApp chat. */
export const WHATSAPP_GREETING = 'Hello VEBMORE, I would like to talk about a project.'

export interface PhoneContact {
  /** Small mono label shown beside the number, e.g. `CONTACT 01`. */
  label: string
  /** Human-readable number, e.g. `+91 98765 43210`. // REPLACE */
  display: string
  /** Digits only, for the tel: and wa.me links, e.g. `919876543210`. // REPLACE */
  digits: string
}

export const PHONES: PhoneContact[] = [
  { label: 'CONTACT 01', display: '+91 98765 43210', digits: '919876543210' }, // REPLACE
  { label: 'CONTACT 02', display: '+91 91234 56780', digits: '919123456780' }, // REPLACE
]

/** `mailto:`-style Gmail compose, opened in a new tab. */
export function gmailComposeUrl(): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: CONTACT_EMAIL,
    su: EMAIL_SUBJECT,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

/** Outlook web compose, opened in a new tab. */
export function outlookComposeUrl(): string {
  const params = new URLSearchParams({
    to: CONTACT_EMAIL,
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
