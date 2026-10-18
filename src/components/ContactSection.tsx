import { useEffect, useRef, useState } from 'react'
import ContactButton from './contact/ContactButton'
import {
  LINKEDIN_URL,
  INSTAGRAM_URL,
  PHONES,
  STUDIO_TIMEZONE,
  STUDIO_TIMEZONE_LABEL,
  gmailComposeUrl,
  outlookComposeUrl,
  whatsappUrl,
  telUrl,
} from './contact/contactData'
import './contact.css'

/**
 * CONTACT — the black panel Works slides into.
 *
 * Two-column editorial layout: the statement and live studio clock on the left,
 * three action groups stacked on the right (SOCIAL / EMAIL / WHATSAPP).
 * Background features a faint dot grid, SVG compass ring, and green corner glow.
 */

const WORDS = ['BE', 'MORE', 'WITH']
const MARK = 'VEBMORE'

interface Props {
  triggerEntry?: boolean
}

export default function ContactSection({ triggerEntry }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const timers = useRef<number[]>([])
  const [beat, setBeat] = useState(0)
  const entryFired = useRef(false)
  const [isVisible, setIsVisible] = useState(false)
  const [timeStr, setTimeStr] = useState('')

  const fireEntry = () => {
    if (entryFired.current) return
    entryFired.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timers.current.push(
        window.setTimeout(() => setBeat(9), 0),
      )
      return
    }

    const schedule: Array<[number, number]> = [
      [100, 1], // label
      [280, 2], // words
      [560, 3], // mark
      [760, 4], // lede & clock
      [900, 5], // group 1 hairline
      [1050, 6], // group 2 hairline
      [1200, 7], // group 3 hairline
      [1350, 8], // buttons
      [1600, 9], // copyright
    ]
    schedule.forEach(([ms, n]) =>
      timers.current.push(
        window.setTimeout(() => setBeat((b) => Math.max(b, n)), ms),
      ),
    )
  }

  // Stage-driven trigger
  useEffect(() => {
    if (triggerEntry) fireEntry()
  }, [triggerEntry])

  // Fallback observer & visibility tracker for clock and compass rotation
  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting && triggerEntry === undefined) {
          fireEntry()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [triggerEntry])

  // ── Live studio clock (ticks every 1s only while on screen) ──
  useEffect(() => {
    if (!isVisible) return

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: STUDIO_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    const updateClock = () => {
      setTimeStr(formatter.format(new Date()))
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [isVisible])

  const shown = (n: number) => beat >= n

  return (
    <section
      ref={rootRef}
      className={`ct-root${isVisible ? ' is-visible' : ''}`}
      aria-labelledby="ct-heading"
    >
      {/* ── Background embellishments ── */}
      <div className="ct-dot-grid" aria-hidden="true" />
      <div className="ct-glow-corner" aria-hidden="true" />

      {/* Faint SVG compass ring behind left column */}
      <div className="ct-compass-bg" aria-hidden="true">
        <svg
          viewBox="0 0 400 400"
          className="ct-compass-svg"
          fill="none"
          stroke="currentColor"
        >
          {/* Concentric rings */}
          <circle cx="200" cy="200" r="190" strokeWidth="1" />
          <circle cx="200" cy="200" r="160" strokeWidth="1" strokeDasharray="2 4" />
          <circle cx="200" cy="200" r="130" strokeWidth="1" />
          <circle cx="200" cy="200" r="70" strokeWidth="1" strokeDasharray="3 6" />

          {/* Rotating outer tick ring */}
          <g className="ct-tick-group">
            {/* Cardinal ticks */}
            <line x1="200" y1="5" x2="200" y2="25" strokeWidth="1.5" />
            <line x1="200" y1="375" x2="200" y2="395" strokeWidth="1.5" />
            <line x1="5" y1="200" x2="25" y2="200" strokeWidth="1.5" />
            <line x1="375" y1="200" x2="395" y2="200" strokeWidth="1.5" />

            {/* 30 deg ticks */}
            <line x1="295" y1="35" x2="285" y2="52" strokeWidth="1" />
            <line x1="365" y1="105" x2="348" y2="115" strokeWidth="1" />
            <line x1="365" y1="295" x2="348" y2="285" strokeWidth="1" />
            <line x1="295" y1="365" x2="285" y2="348" strokeWidth="1" />
            <line x1="105" y1="365" x2="115" y2="348" strokeWidth="1" />
            <line x1="35" y1="295" x2="52" y2="285" strokeWidth="1" />
            <line x1="35" y1="105" x2="52" y2="115" strokeWidth="1" />
            <line x1="105" y1="35" x2="115" y2="52" strokeWidth="1" />

            {/* Cardinal letters */}
            <text x="200" y="42" textAnchor="middle" className="ct-cardinal-text">N</text>
            <text x="360" y="204" textAnchor="middle" className="ct-cardinal-text">E</text>
            <text x="200" y="368" textAnchor="middle" className="ct-cardinal-text">S</text>
            <text x="40" y="204" textAnchor="middle" className="ct-cardinal-text">W</text>
          </g>
        </svg>
      </div>

      <div className="ct-grid">
        {/* ── LEFT: editorial column ── */}
        <div className="ct-left">
          <div className="ct-left-top">
            <p className={`ct-label ct-rise${shown(1) ? ' is-in' : ''}`}>
              <span>CONTACT</span>
              <span className="ct-quotes" aria-hidden="true">
                &ldquo;&rdquo;
              </span>
            </p>

            <h2 id="ct-heading" className="ct-title">
              <span className="ct-title-line">
                {WORDS.map((word, i) => (
                  <span className="ct-word-mask" key={word}>
                    <span
                      className={`ct-word${shown(2) ? ' is-in' : ''}`}
                      style={{ transitionDelay: `${i * 90}ms` }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </span>
              <span className="ct-title-line">
                <span className="ct-word-mask">
                  <span
                    className={`ct-word ct-word-mark${shown(3) ? ' is-in' : ''}`}
                    style={{ transitionDelay: '120ms' }}
                  >
                    {MARK}
                  </span>
                </span>
              </span>
            </h2>
          </div>

          <p className={`ct-lede ct-rise${shown(4) ? ' is-in' : ''}`}>
            HAVE AN IDEA, A BRIEF OR JUST A ROUGH SKETCH? TELL US WHAT YOU WANT
            TO BUILD. WE DESIGN AND DEVELOP WEBSITES AND DIGITAL PRODUCTS THAT
            LOOK SHARP AND PERFORM.
          </p>

          {/* ── Live studio clock ── */}
          <div className={`ct-clock ct-rise${shown(4) ? ' is-in' : ''}`}>
            <span className="ct-clock-label">LOCAL TIME</span>
            <span className="ct-clock-time">{timeStr || '00:00:00'}</span>
            <span className="ct-clock-zone">{STUDIO_TIMEZONE_LABEL}</span>
          </div>

          <p className={`ct-copyright ct-rise${shown(9) ? ' is-in' : ''}`}>
            © 2026 VEBMORE — A CREATIVE DIGITAL STUDIO FOR THE MODERN WEB.
          </p>
        </div>

        {/* ── RIGHT: three action groups ── */}
        <div className="ct-right">
          {/* 01 SOCIAL */}
          <div className={`ct-group${shown(5) ? ' is-in' : ''}`}>
            <p className="ct-group-label">
              <span className="ct-group-index">01</span>
              <span>SOCIAL</span>
            </p>
            <div className={`ct-btn-row${shown(8) ? ' is-in' : ''}`}>
              <ContactButton href={LINKEDIN_URL} label="LinkedIn" icon="linkedin" />
              <ContactButton href={INSTAGRAM_URL} label="Instagram" icon="instagram" />
            </div>
          </div>

          {/* 02 EMAIL (email address line removed as requested) */}
          <div className={`ct-group${shown(6) ? ' is-in' : ''}`}>
            <p className="ct-group-label">
              <span className="ct-group-index">02</span>
              <span>EMAIL</span>
            </p>
            <div className={`ct-btn-row${shown(8) ? ' is-in' : ''}`}>
              <ContactButton href={gmailComposeUrl()} label="Gmail" icon="gmail" />
              <ContactButton
                href={outlookComposeUrl()}
                label="Outlook"
                icon="outlook"
              />
            </div>
          </div>

          {/* 03 WHATSAPP */}
          <div className={`ct-group${shown(7) ? ' is-in' : ''}`}>
            <p className="ct-group-label">
              <span className="ct-group-index">03</span>
              <span>WHATSAPP</span>
            </p>
            <ul className="ct-phone-list" role="list">
              {PHONES.map((phone) => (
                <li key={phone.label} className="ct-phone-row">
                  <span className="ct-phone-label">{phone.label}</span>
                  <a href={telUrl(phone.digits)} className="ct-phone-number">
                    {phone.display}
                  </a>
                  <ContactButton
                    href={whatsappUrl(phone.digits)}
                    label="WhatsApp"
                    icon="whatsapp"
                    ariaLabel={`WhatsApp ${phone.label}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
