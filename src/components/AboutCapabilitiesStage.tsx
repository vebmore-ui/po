import { useRef, useEffect, useState, useCallback } from 'react'
import AboutSection from './AboutSection'
import CapabilitiesSection from './CapabilitiesSection'
import TechStackPanel from './TechStackPanel'
import './stage.css'

/**
 * Pinned horizontal stage that slides About → Capabilities.
 *
 * Scroll progress `p` (0–1) is derived from how far the wrapper has scrolled
 * past the top of the viewport. Transforms are written directly to DOM refs
 * via rAF — no React state per frame.
 *
 * Timeline:
 *   p 0.00–0.16  Hold. About visible, birds live.
 *   p 0.16–0.42  Track slides from 0 to -100vw (ease-in-out).
 *   p 0.42       Capabilities entry beats fire (once).
 *   p 0.42–0.62  Capabilities dwell — rows stay interactive.
 *   p 0.62–0.82  Track slides from -100vw to -200vw (same ease-in-out).
 *   p 0.74       Tiles start popping once the green plate covers ~70% of the
 *                screen (~70ms apart).
 *   p 0.82–1.00  Final hold, all tiles hoverable. Pin releases.
 *
 * The birds deliberately stay live for the whole stage: they no longer fade as
 * the track departs, so the flock keeps animating into the Capabilities slide.
 */

/* Ease-in-out curve: maps a linear 0–1 to a smoothed 0–1 */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

interface Props {
  aboutActive: boolean
}

export default function AboutCapabilitiesStage({ aboutActive }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const capParallaxRef = useRef<HTMLDivElement>(null)

  // Reactive state (low-frequency, not per-frame)
  const [capTrigger, setCapTrigger] = useState(false)
  const [techTrigger, setTechTrigger] = useState(false)

  // Refs for rAF loop
  const pRef = useRef(0)
  const rafRef = useRef(0)
  const capFired = useRef(false)
  const techFired = useRef(false)

  // Detect mobile / reduced-motion to skip the rAF loop entirely
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

    const rect = wrap.getBoundingClientRect()
    const vh = window.innerHeight
    const scrollRange = wrap.offsetHeight - vh
    const rawP = scrollRange > 0 ? clamp(-rect.top / scrollRange, 0, 1) : 0
    pRef.current = rawP

    // ── Birds stay live for the whole stage (no fade, no teardown) ──

    // ── Track slide 1: p 0.16–0.42, 0vw → -100vw ──
    const slide1T = clamp((rawP - 0.16) / 0.26, 0, 1)
    const eased1 = easeInOut(slide1T)

    // ── Track slide 2: p 0.62–0.82, -100vw → -200vw ──
    const slide2T = clamp((rawP - 0.62) / 0.2, 0, 1)
    const eased2 = easeInOut(slide2T)

    const trackX = -eased1 * 100 - eased2 * 100
    track.style.transform = `translateX(${trackX}vw)`

    // Capabilities parallax lag: 6vw extra offset that resolves to 0 by the
    // end of slide 1 (the tech panel gets no parallax — it must read as a
    // flat plate sliding in).
    if (capParallaxRef.current) {
      const parallax = (1 - eased1) * 6
      capParallaxRef.current.style.transform = `translateX(${parallax}vw)`
    }

    // ── Capabilities entry at p ≥ 0.42 (once) ──
    if (rawP >= 0.42 && !capFired.current) {
      capFired.current = true
      setCapTrigger(true)
    }

    // ── Tech tile sequence, with hysteresis ──
    // Fire once the green plate has covered ~70% of the screen during slide 2
    // (eased2 ≈ 0.7 lands near p 0.74); reset only when p falls back below 0.68,
    // so sitting near the boundary neither re-fires nor rewinds. The reset lets
    // tiles pop again on re-entry.
    if (rawP >= 0.74 && !techFired.current) {
      techFired.current = true
      setTechTrigger(true)
    } else if (rawP < 0.68 && techFired.current) {
      techFired.current = false
      setTechTrigger(false)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  return (
    <div ref={wrapRef} className="stg-track-wrap">
      <div className="stg-pin">
        <div ref={trackRef} className="stg-track">
          {/* ── Panel 1: About ── */}
          <div className="stg-panel">
            <AboutSection active={aboutActive} />
          </div>

          {/* ── Panel 2: Capabilities ── */}
          <div className="stg-panel">
            <div ref={capParallaxRef} style={{ width: '100%', height: '100%' }}>
              <CapabilitiesSection triggerEntry={capTrigger} />
            </div>
          </div>

          {/* ── Panel 3: Tech stack ── */}
          <div className="stg-panel">
            <TechStackPanel triggerPop={techTrigger} />
          </div>
        </div>
      </div>
    </div>
  )
}
