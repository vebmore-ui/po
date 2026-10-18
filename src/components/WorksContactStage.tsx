import { useRef, useEffect, useState, useCallback } from 'react'
import WorksSection from './WorksSection'
import ContactSection from './ContactSection'
import { FEATURED_COUNT } from './works/worksData'
import './worksContactStage.css'

/**
 * Pinned horizontal stage: WORKS → CONTACT.
 *
 * DOM order is Contact first, then Works, and the track starts at -100vw so
 * Works is the panel on screen. As the user scrolls the track animates to 0, so
 * Works exits to the RIGHT and Contact enters from the LEFT.
 *
 * Scroll is measured in ABSOLUTE DISTANCE from the wrapper top (`s`, in svh
 * units) rather than as a fraction of the total height, so adding projects later
 * never shifts the position at which an earlier project rolls in.
 *
 * Timeline constants (units: svh):
 *   HOLD_START   10   first project holds
 *   STEP         60   scroll distance per project-to-project roll
 *   HOLD_END     50   last project holds (user can press "all work")
 *   SLIDE       100   Works → Contact horizontal slide
 *   HOLD_CONTACT 40   Contact holds, then the page ends
 *
 * Wrapper height = 100 + HOLD_START + (FEATURED_COUNT − 1) × STEP + HOLD_END
 *                + SLIDE + HOLD_CONTACT
 *
 * The count is FIXED: the homepage carousel always shows the same
 * FEATURED_COUNT projects, so the wrapper height never changes and the timeline
 * stays predictable. The full archive lives on /works.
 */

const HOLD_START = 10
const STEP = 60
const HOLD_END = 50
const SLIDE = 100
const HOLD_CONTACT = 40

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** Dwell ease: holds for the first ~20% and last ~20% of each step. */
function dwellEase(frac: number): number {
  return easeInOut(clamp((frac - 0.2) / 0.6, 0, 1))
}

export default function WorksContactStage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const contactParallaxRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  const [worksTrigger, setWorksTrigger] = useState(false)
  const [contactTrigger, setContactTrigger] = useState(false)

  // Refs for the rAF loop.
  const pRef = useRef(0) // raw distance `s`, in svh units
  const rollRef = useRef(0) // dwell-eased active index `f`
  const slideRef = useRef(0) // slide progress `q`
  const rafRef = useRef(0)
  const worksFired = useRef(false)
  const contactFired = useRef(false)

  // ── Sizing: wrapper height from the timeline (the count is fixed) ──
  const wrapperSvh =
    100 +
    HOLD_START +
    Math.max(FEATURED_COUNT - 1, 0) * STEP +
    HOLD_END +
    SLIDE +
    HOLD_CONTACT

  // ── Mobile / reduced-motion detection (disables the pin entirely) ──
  const isDisabled = useRef(false)
  useEffect(() => {
    const mq900 = window.matchMedia('(max-width: 900px)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    isDisabled.current = mq900.matches || mqMotion.matches

    const check = () => {
      isDisabled.current = mq900.matches || mqMotion.matches
    }
    mq900.addEventListener('change', check)
    mqMotion.addEventListener('change', check)
    return () => {
      mq900.removeEventListener('change', check)
      mqMotion.removeEventListener('change', check)
    }
  }, [])

  // ── Scroll-to-project (click / keyboard on a row) ──
  const handleRequestScrollToProject = useCallback((index: number) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const svh = window.innerHeight / 100
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY
    // Position at which project `index` becomes the active one.
    const target = wrapTop + (HOLD_START + index * STEP) * svh
    window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  const handleVisibleCountChange = useCallback((_count: number) => {
    // The carousel count is fixed (FEATURED_COUNT); the prop is kept so the
    // section/stage contract is unchanged, but the wrapper no longer resizes.
  }, [])

  // ── The rAF loop ──
  const tick = useCallback(() => {
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
    // `s` is the scroll distance past the wrapper top, in svh units.
    const s = clamp((window.scrollY - wrapTop) / svh, 0, 1e6)
    pRef.current = s

    // ── Roll phase ──
    const maxIndex = Math.max(visibleCount - 1, 0)
    const x = clamp((s - HOLD_START) / STEP, 0, maxIndex)
    const f = Math.floor(x) + dwellEase(x - Math.floor(x))
    rollRef.current = f

    // ── Slide phase ──
    const slideStart = HOLD_START + maxIndex * STEP + HOLD_END
    const q = clamp((s - slideStart) / SLIDE, 0, 1)
    slideRef.current = q
    const eased = easeInOut(q)
    track.style.transform = `translateX(${-100 * (1 - eased)}vw)`

    // Contact parallax lag: -6vw → 0 across the slide.
    if (contactParallaxRef.current) {
      const lag = (1 - eased) * -6
      contactParallaxRef.current.style.transform = `translateX(${lag}vw)`
    }

    // ── Entry triggers ──
    if (!worksFired.current) {
      worksFired.current = true
      setWorksTrigger(true)
    }
    if (q >= 0.45 && !contactFired.current) {
      contactFired.current = true
      setContactTrigger(true)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  // ── Works entry: fire as the stage wrapper's top enters the viewport ──
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setWorksTrigger(true)
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      className="wc-wrap"
      style={{ height: `${wrapperSvh}svh` }}
    >
      <div ref={pinRef} className="wc-pin">
        <div ref={trackRef} className="wc-track">
          {/* ── Panel 1 (LEFT): Contact ── */}
          <div className="wc-panel">
            <div
              ref={contactParallaxRef}
              className="wc-parallax"
              style={{ width: '100%', height: '100%' }}
            >
              <ContactSection triggerEntry={contactTrigger} />
            </div>
          </div>

          {/* ── Panel 2 (RIGHT): Works ── */}
          <div className="wc-panel">
            <WorksSection
              rollRef={rollRef}
              triggerEntry={worksTrigger}
              onVisibleCountChange={handleVisibleCountChange}
              onRequestScrollToProject={handleRequestScrollToProject}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
