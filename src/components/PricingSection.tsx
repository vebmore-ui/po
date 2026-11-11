import { useEffect, useRef, useState, useCallback } from 'react'
import {
  CORE_PLANS,
  SPECIALIZED_TIER,
  buildPricingWhatsappUrl,
} from './pricing/pricingData'
import './pricing.css'

const TITLE_WORDS = ['BUILD', 'MORE', 'WITH']
const TITLE_MARK = 'VEBMORE'

interface Props {
  triggerEntry?: boolean
}

export default function PricingSection({ triggerEntry }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const [beat, setBeat] = useState(0)
  const entryFired = useRef(false)
  const timers = useRef<number[]>([])

  const fireEntry = useCallback(() => {
    if (entryFired.current) return
    entryFired.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timers.current.push(window.setTimeout(() => setBeat(6), 0))
      return
    }

    const schedule: Array<[number, number]> = [
      [100, 1], // label rise
      [240, 2], // heading words
      [480, 3], // mark
      [640, 4], // lede
      [820, 5], // core cards stagger
      [1040, 6], // special tier card
    ]

    schedule.forEach(([ms, n]) => {
      timers.current.push(
        window.setTimeout(() => setBeat((b) => Math.max(b, n)), ms),
      )
    })
  }, [])

  // Pinned stage-driven trigger (bi-directional with hysteresis)
  useEffect(() => {
    if (triggerEntry) {
      fireEntry()
    } else if (triggerEntry === false) {
      timers.current.forEach(clearTimeout)
      timers.current = []
      entryFired.current = false
      const id = window.setTimeout(() => setBeat(0), 0)
      timers.current.push(id)
    }
  }, [triggerEntry, fireEntry])

  // Fallback: IntersectionObserver when stacked or triggerEntry not supplied
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
      { threshold: 0.15 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [triggerEntry, fireEntry])

  const shown = (n: number) => beat >= n

  return (
    <section
      ref={rootRef}
      className="pr-root"
      aria-labelledby="pr-heading"
      data-reveal-armed=""
    >
      <div className="pr-dot-grid" aria-hidden="true" />
      <div className="pr-glow-corner" aria-hidden="true" />

      <div className="pr-container">
        {/* ── Section Header ── */}
        <header className="pr-header">
          <div className="pr-header-left">
            <p className={`pr-label pr-rise${shown(1) ? ' is-in' : ''}`}>
              <span>PRICING</span>
              <span className="pr-quotes" aria-hidden="true">
                &ldquo;&rdquo;
              </span>
            </p>

            <h2 id="pr-heading" className="pr-title">
              <span className="pr-title-line">
                {TITLE_WORDS.map((word, i) => (
                  <span className="pr-word-mask" key={word}>
                    <span
                      className={`pr-word${shown(2) ? ' is-in' : ''}`}
                      style={{ transitionDelay: `${i * 90}ms` }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </span>
              <span className="pr-title-line">
                <span className="pr-word-mask">
                  <span
                    className={`pr-word pr-word-mark${shown(3) ? ' is-in' : ''}`}
                    style={{ transitionDelay: '280ms' }}
                  >
                    {TITLE_MARK}
                  </span>
                </span>
              </span>
            </h2>
          </div>

          <p className={`pr-lede pr-rise${shown(4) ? ' is-in' : ''}`}>
            TRANSPARENT VALUE. FROM FOCUSED SPRINT LANDING PAGES TO BESPOKE CMS
            PLATFORMS AND COMMERCE ENGINES — SELECT THE SCOPE THAT MATCHES YOUR
            MOMENTUM.
          </p>
        </header>

        {/* ── 3 Core Pricing Plans ── */}
        <div className="pr-grid">
          {CORE_PLANS.map((plan, idx) => {
            const isPopular = Boolean(plan.popular)
            return (
              <article
                key={plan.id}
                className={`pr-card${isPopular ? ' is-popular' : ''}${shown(5) ? ' is-in' : ''}`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                {isPopular && (
                  <span className="pr-card-badge" aria-label="Popular Tier">
                    POPULAR // RECOMMENDED
                  </span>
                )}

                <div className="pr-card-header">
                  <div className="pr-card-meta">
                    <span className="pr-card-index">{plan.index}</span>
                    <span className="pr-card-category">{plan.category}</span>
                  </div>

                  <h3 className="pr-card-name">{plan.name}</h3>

                  <div className="pr-card-price-row">
                    <span className="pr-card-price">{plan.price}</span>
                    {plan.priceSuffix && (
                      <span className="pr-card-period">{plan.priceSuffix}</span>
                    )}
                  </div>

                  <div className="pr-maintenance-pill">
                    <span className="pr-maintenance-dot" aria-hidden="true" />
                    <span>{plan.maintenance}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="pr-features-list" role="list">
                  {plan.features.map((feat, fIdx) => (
                    <li
                      key={fIdx}
                      className={`pr-feature-item${feat.highlight ? ' is-highlight' : ''}`}
                    >
                      <svg
                        className="pr-feature-icon"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
                      </svg>
                      <span>{feat.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Action */}
                <a
                  href={buildPricingWhatsappUrl(plan.whatsappGreeting)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pr-cta-btn"
                  aria-label={`${plan.ctaText} via WhatsApp for ${plan.name} plan (${plan.price})`}
                >
                  <span>{plan.ctaText}</span>
                </a>
              </article>
            )
          })}
        </div>

        {/* ── 4th Specialized Plan: E-Booking / E-Commerce ── */}
        <article className={`pr-special-card${shown(6) ? ' is-in' : ''}`}>
          <div className="pr-special-left">
            <div className="pr-special-header-row">
              <span className="pr-card-index">{SPECIALIZED_TIER.index}</span>
              <span className="pr-special-badge">{SPECIALIZED_TIER.badge}</span>
              <div className="pr-maintenance-pill">
                <span className="pr-maintenance-dot" aria-hidden="true" />
                <span>{SPECIALIZED_TIER.maintenance}</span>
              </div>
            </div>

            <h3 className="pr-special-title">{SPECIALIZED_TIER.name}</h3>
            <p className="pr-special-desc">{SPECIALIZED_TIER.tagline}</p>

            <div className="pr-special-tags">
              <span className="pr-tag-chip">E-COMMERCE STOREFRONT</span>
              <span className="pr-tag-chip">BOOKING ENGINE</span>
              <span className="pr-tag-chip">PAYMENT GATEWAY</span>
              <span className="pr-tag-chip">CUSTOM DATABASE</span>
              <span className="pr-tag-chip">ADMIN ANALYTICS</span>
            </div>
          </div>

          <div className="pr-special-right">
            <div className="pr-special-price-wrap">
              <span className="pr-special-price">{SPECIALIZED_TIER.price}</span>
              <span className="pr-special-note">{SPECIALIZED_TIER.priceNote}</span>
            </div>

            <a
              href={buildPricingWhatsappUrl(SPECIALIZED_TIER.whatsappGreeting)}
              target="_blank"
              rel="noopener noreferrer"
              className="pr-cta-btn pr-special-cta"
              aria-label={`${SPECIALIZED_TIER.ctaText} via WhatsApp for ${SPECIALIZED_TIER.name}`}
            >
              <span>{SPECIALIZED_TIER.ctaText}</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}
