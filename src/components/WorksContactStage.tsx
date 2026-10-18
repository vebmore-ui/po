import { useRef, useEffect, useState } from 'react'
import WorksSection from './WorksSection'
import ContactSection from './ContactSection'
import { HOLD_WORKS, SLIDE, HOLD_CONTACT } from '../sectionMap'
import './worksContactStage.css'

/**
 * Pinned horizontal stage: WORKS → CONTACT.
 *
 * DOM order: Contact first, then Works. The track starts at -100vw so
 * Works is initially the panel on screen. As user scrolls, track moves to 0,
 * so Works exits to the RIGHT and Contact enters from the LEFT.
 *
 * Timeline constants (in svh units):
 *   HOLD_WORKS   80   Works holds at the start
 *   SLIDE       100   Works → Contact horizontal slide
 *   HOLD_CONTACT 40   Contact holds, then the page ends
 *
 * Total wrapper height = 100 + 80 + 100 + 40 = 320svh
 */

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export default function WorksContactStage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const contactParallaxRef = useRef<HTMLDivElement>(null)

  const [worksTrigger, setWorksTrigger] = useState(false)
  const [contactTrigger, setContactTrigger] = useState(false)

  const slideRef = useRef(0)
  const rafRef = useRef(0)
  const worksFired = useRef(false)
  const contactFired = useRef(false)

  // Total wrapper height: 320svh
  const wrapperSvh = 100 + HOLD_WORKS + SLIDE + HOLD_CONTACT

  const isDisabled = useRef(false)
  useEffect(() => {
    const mq900 = window.matchMedia('(max-width: 900px)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const check = () => {
      isDisabled.current = mq900.matches || mqMotion.matches
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
      if (!wrap || !track) {
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

      // Slide phase
      const q = clamp((s - HOLD_WORKS) / SLIDE, 0, 1)
      slideRef.current = q
      const eased = easeInOut(q)
      track.style.transform = `translateX(${-100 * (1 - eased)}vw)`

      // Contact parallax lag: -6vw → 0 across the slide
      if (contactParallaxRef.current) {
        const lag = (1 - eased) * -6
        contactParallaxRef.current.style.transform = `translateX(${lag}vw)`
      }

      // Contact entry trigger: fires at q >= 0.45
      if (!contactFired.current && q >= 0.45) {
        contactFired.current = true
        setContactTrigger(true)
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
          {/* Contact panel: sits at left of track, revealed as track moves right */}
          <div className="wc-panel wc-panel-contact">
            <div ref={contactParallaxRef} className="wc-parallax-layer">
              <ContactSection triggerEntry={contactTrigger} />
            </div>
          </div>

          {/* Works panel: sits at right of track, visible initially */}
          <div className="wc-panel wc-panel-works">
            <WorksSection
              triggerEntry={worksTrigger}
              slideProgressRef={slideRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
