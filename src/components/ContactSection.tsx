import { useEffect, useRef, useState } from 'react'
import ContactButton from './contact/ContactButton'
import {
  CONTACT_EMAIL,
  LINKEDIN_URL,
  INSTAGRAM_URL,
  PHONES,
  gmailComposeUrl,
  outlookComposeUrl,
  whatsappUrl,
  telUrl,
} from './contact/contactData'
import './contact.css'

/**
 * CONTACT — the black panel Works slides into.
 *
 * Two-column editorial layout: the statement on the left, three action groups
 * stacked on the right (SOCIAL / EMAIL / WHATSAPP), each opened by a hairline.
 * The surface is black with white text; the only colour is the green index
 * numerals and the green quotation marks.
 *
 * The entry sequence fires once when the stage reports the slide has passed
 * `q 0.45` (or, when used outside the stage, when an IntersectionObserver sees
 * the section). Everything is a mask reveal or a hairline draw.
 *
 * Beat order: label → BE MORE WITH → VEBMORE → lede → group 1 hairline →
 * group 2 hairline → group 3 hairline → buttons → copyright.
 */

const WORDS = ['BE', 'MORE', 'WITH']
const MARK = 'VEBMORE'

interface Props {
  /** Stage-controlled entry trigger. `undefined` → use the observer. */
  triggerEntry?: boolean
}

export default function ContactSection({ triggerEntry }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const timers = useRef<number[]>([])
  const [beat, setBeat] = useState(0)
  const entryFired = useRef(false)

  const fireEntry = () => {
    if (entryFired.current) return
    entryFired.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBeat(9)
      return
    }

    // 1 label, 2 words, 3 mark, 4 lede, 5/6/7 group hairlines, 8 buttons,
    // 9 copyright.
    const schedule: Array<[number, number]> = [
      [100, 1],
      [280, 2],
      [560, 3],
      [760, 4],
      [900, 5],
      [1050, 6],
      [1200, 7],
      [1350, 8],
      [1600, 9],
    ]
    schedule.forEach(([ms, n]) =>
      timers.current.push(
        window.setTimeout(() => setBeat((b) => Math.max(b, n)), ms),
      ),
    )
  }

  // ── Stage-driven trigger ──
  useEffect(() => {
    if (triggerEntry) fireEntry()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerEntry])

  // ── Fallback: IntersectionObserver when not inside the stage ──
  useEffect(() => {
    if (triggerEntry !== undefined) return
    const el = rootRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        fireEntry()
      },
      { threshold: 0.2 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerEntry])

  const shown = (n: number) => beat >= n

  return (
    <section ref={rootRef} className="ct-root" aria-labelledby="ct-heading">
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
            Tell us where you want to go. We will chart the bearing — the
            strategy, the system and the motion that gets you there.
          </p>

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

          {/* 02 EMAIL */}
          <div className={`ct-group${shown(6) ? ' is-in' : ''}`}>
            <p className="ct-group-label">
              <span className="ct-group-index">02</span>
              <span>EMAIL</span>
            </p>
            <p className="ct-email">
              <a href={`mailto:${CONTACT_EMAIL}`} className="ct-email-link">
                {CONTACT_EMAIL}
              </a>
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
