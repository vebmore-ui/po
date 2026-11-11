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
export const EMAIL_SUBJECT =
  'Project Inquiry // Digital Experience & Web Architecture — VEBMORE'

/** Comprehensive inquiry template prefilled into email body. */
export const EMAIL_BODY = `Hello VEBMORE Studio Team,

I am reaching out regarding a new project for our brand / business.

1. Project Overview:
   [Briefly describe your company, brand, and what you want to build]

2. Desired Scope / Architecture:
   [ ] Starter Plan (₹5,999) — Landing Page / Studio Presence
   [ ] Pro Plan (₹11,999) — 5–7 Pages with Bespoke Animations
   [ ] Plus Plan (₹24,499) — Up to 20 Pages with Custom CMS & Image Server
   [ ] E-Booking / E-Commerce (Starting ₹31,999) — Transactional Engine
   [ ] Other / Bespoke Architecture

3. Estimated Timeline:
   [e.g., Next 2–4 weeks / Flexible]

4. Reference Websites / Inspiration:
   [Links to websites or aesthetics you admire]

Looking forward to hearing your perspective and discussing next steps.

Best regards,
[Your Name]
[Your Company / Brand]
[Your Phone Number]`

/** Greeting prefilled into the WhatsApp chat. */
export const WHATSAPP_GREETING = `Hello VEBMORE,

I am reaching out from your website to discuss a new digital project.

• Scope: Web Design & Architecture
• Goal: Build a high-performance, bespoke digital experience

Please let me know your availability for a quick discussion.`

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

/** `mailto:`-style Gmail compose for web browsers, opened in a new tab. */
export function gmailComposeUrl(): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: GMAIL_ADDRESS,
    su: EMAIL_SUBJECT,
    body: EMAIL_BODY,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

/** Standard `mailto:` URL for mobile devices and native email apps with prefilled Subject and Body. */
export function mailtoUrl(to: string = GMAIL_ADDRESS): string {
  const params = new URLSearchParams({
    subject: EMAIL_SUBJECT,
    body: EMAIL_BODY,
  })
  // Format spaces as %20 for strict mailto client compatibility
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`
}

/** Outlook web compose, opened in a new tab. */
export function outlookComposeUrl(): string {
  const params = new URLSearchParams({
    to: OUTLOOK_ADDRESS,
    subject: EMAIL_SUBJECT,
    body: EMAIL_BODY,
  })
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`
}

/** WhatsApp chat deep link for a given digits-only number with clean line-break encoding. */
export function whatsappUrl(
  digits: string,
  greeting: string = WHATSAPP_GREETING,
): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`
}

/** `tel:` link for a given digits-only number. */
export function telUrl(digits: string): string {
  return `tel:+${digits}`
}
