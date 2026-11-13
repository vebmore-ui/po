import { useRef, useEffect, useState } from 'react'
import WorksSection from './WorksSection'
import PricingSection from './PricingSection'
import ContactSection from './ContactSection'
import {
  HOLD_WORKS,
  VERTICAL_WORKS_PRICING,
  HOLD_PRICING,
  SLIDE_PRICING_CONTACT,
  HOLD_CONTACT,
} from '../sectionMap'
import './worksContactStage.css'

/**
 * Pinned stage: WORKS (with PRICING underneath) → CONTACT (from the left).
 *
 * DOM structure:
 * - Left panel (wc-panel-contact): ContactSection
 * - Right panel (wc-panel-main):
 *     Vertical track (wc-vertical-track):
 *       - WorksSection (top subpanel)
 *       - PricingSection (bottom subpanel, underneath Works)
 *
 * Track starts at translateX(-100vw), so the right panel (Works) is on screen.
 * Timeline:
 *   1. HOLD_WORKS (70svh): Works holds, carousel active.
 *   2. VERTICAL_WORKS_PRICING (90svh): wc-vertical-track moves translateY(0 -> -50%)
 *      Works scrolls up, and Pricing rises from UNDER Works.
 *   3. HOLD_PRICING (80svh): Pricing holds, fully interactive.
 *   4. SLIDE_PRICING_CONTACT (100svh): Track moves translateX(-100vw -> 0vw).
 *      Pricing exits right, and Contact enters from the LEFT (as it was originally!).
 *   5. HOLD_CONTACT (50svh): Contact holds, clock ticks, page ends.
 */

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

interface Props {
  currentRoute?: string
}

export default function WorksContactStage({ currentRoute = '/' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const verticalTrackRef = useRef<HTMLDivElement>(null)
  const worksSubpanelRef = useRef<HTMLDivElement>(null)
  const separatorRef = useRef<HTMLDivElement>(null)
  const contactParallaxRef = useRef<HTMLDivElement>(null)

  const [worksTrigger, setWorksTrigger] = useState(false)
  const [pricingTrigger, setPricingTrigger] = useState(false)
  const [contactTrigger, setContactTrigger] = useState(false)

  const worksSlideRef = useRef(0)
  const rafRef = useRef(0)
  const worksFired = useRef(false)
  const pricingFired = useRef(false)
  const contactFired = useRef(false)

  // Total wrapper height: 490svh
  const wrapperSvh =
    100 +
    HOLD_WORKS +
    VERTICAL_WORKS_PRICING +
    HOLD_PRICING +
    SLIDE_PRICING_CONTACT +
    HOLD_CONTACT

  const isDisabled = useRef(false)
  useEffect(() => {
    const mq900 = window.matchMedia('(max-width: 900px)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const check = () => {
      isDisabled.current = mq900.matches || mqMotion.matches
      if (isDisabled.current) {
        setWorksTrigger(true)
        setPricingTrigger(true)
        setContactTrigger(true)
      }
    }
    check()
    mq900.addEventListener('change', check)
    mqMotion.addEventListener('change', check)
    return () => {
      mq900.removeEventListener('change', check)
      mqMotion.removeEventListener('change', check)
    }
  }, [])

  useEffect(() => {
    const tick = () => {
      if (isDisabled.current) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const wrap = wrapRef.current
      const track = trackRef.current
      const vertTrack = verticalTrackRef.current
      if (!wrap || !track || !vertTrack) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const svh = window.innerHeight / 100
      const wrapTop = wrap.getBoundingClientRect().top + window.scrollY
      const s = clamp((window.scrollY - wrapTop) / svh, 0, 1e6)

      // Works entry trigger: fires when wrapper is reached
      if (!worksFired.current && s >= 0) {
        worksFired.current = true
        setWorksTrigger(true)
      }

      // Step 1: Vertical scroll Works -> Pricing
      const sVertStart = HOLD_WORKS
      const qVert = clamp((s - sVertStart) / VERTICAL_WORKS_PRICING, 0, 1)
      worksSlideRef.current = qVert
      const easedVert = easeInOut(qVert)

      // Travel distance: full height of Works (window.innerHeight) + separator buffer
      const sepHeight =
        separatorRef.current?.offsetHeight ?? Math.round(window.innerHeight * 0.28)
      const travelY = window.innerHeight + sepHeight
      vertTrack.style.transform = `translateY(${-easedVert * travelY}px)`

      // Works gracefully fades out as it scrolls up into the buffer
      if (worksSubpanelRef.current) {
        const worksOpacity = clamp(1 - qVert * 2.2, 0, 1)
        worksSubpanelRef.current.style.opacity = worksOpacity.toString()
      }

      // Pricing entry trigger: fires at qVert >= 0.45, resets when scrolling back up (qVert < 0.20)
      if (qVert >= 0.45 && !pricingFired.current) {
        pricingFired.current = true
        setPricingTrigger(true)
      } else if (qVert < 0.20 && pricingFired.current) {
        pricingFired.current = false
        setPricingTrigger(false)
      }

      // Step 2: Horizontal slide from Pricing to Contact (Contact enters from LEFT)
      const sHorizStart = sVertStart + VERTICAL_WORKS_PRICING + HOLD_PRICING
      const qHoriz = clamp((s - sHorizStart) / SLIDE_PRICING_CONTACT, 0, 1)
      const easedHoriz = easeInOut(qHoriz)
      track.style.transform = `translateX(${-100 * (1 - easedHoriz)}vw)`

      // Contact parallax lag: -6vw -> 0 across the horizontal slide
      if (contactParallaxRef.current) {
        const lag = (1 - easedHoriz) * -6
        contactParallaxRef.current.style.transform = `translateX(${lag}vw)`
      }

      // Contact entry trigger: fires at qHoriz >= 0.45, resets when scrolling back right (qHoriz < 0.20)
      if (qHoriz >= 0.45 && !contactFired.current) {
        contactFired.current = true
        setContactTrigger(true)
      } else if (qHoriz < 0.20 && contactFired.current) {
        contactFired.current = false
        setContactTrigger(false)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="wc-wrap"
      style={{
        height: `${wrapperSvh}svh`,
        minHeight: `${wrapperSvh}vh`,
      }}
    >
      <div className="wc-pin">
        <div ref={trackRef} className="wc-track">
          {/* Contact panel: sits on the LEFT of the track, revealed as track moves right */}
          <div className="wc-panel wc-panel-contact">
            <div ref={contactParallaxRef} className="wc-parallax-layer">
              <ContactSection
                triggerEntry={contactTrigger}
                isStandalone={currentRoute === '/contact'}
              />
            </div>
          </div>

          {/* Right panel: holds Works and Pricing (underneath Works) */}
          <div className="wc-panel wc-panel-main">
            <div ref={verticalTrackRef} className="wc-vertical-track">
              <div ref={worksSubpanelRef} className="wc-subpanel wc-subpanel-works">
                <WorksSection
                  triggerEntry={worksTrigger}
                  slideProgressRef={worksSlideRef}
                />
              </div>

              {/* Dedicated breathing space & editorial separator between Works and Pricing */}
              <div
                ref={separatorRef}
                className="wc-vertical-separator"
                aria-hidden="true"
              >
                <div className="wc-separator-line" />
                <span className="wc-separator-tag">
                  // STUDIO PLANS & ARCHITECTURE
                </span>
              </div>

              <div className="wc-subpanel wc-subpanel-pricing">
                <PricingSection
                  triggerEntry={pricingTrigger}
                  isStandalone={currentRoute === '/pricing'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
