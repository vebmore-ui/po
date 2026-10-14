import { useRef, useEffect, useState, useCallback } from 'react'
import AboutSection from './AboutSection'
import CapabilitiesSection from './CapabilitiesSection'
import './stage.css'

/**
 * Pinned horizontal stage that slides About → Capabilities.
 *
 * Scroll progress `p` (0–1) is derived from how far the wrapper has scrolled
 * past the top of the viewport. Transforms are written directly to DOM refs
 * via rAF — no React state per frame.
 *
 * Timeline:
 *   p 0.00–0.12  Hold. About visible, birds live.
 *   p 0.12–0.28  Birds plate fades out (opacity + scale).
 *   p 0.28–0.78  Track slides from 0 to -100vw.
 *   p 0.52       Capabilities entry beats fire (once).
 *   p 0.78–1.00  Hold. Capabilities interactive. Pin releases.
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
  const birdsPlateRef = useRef<HTMLDivElement>(null)
  const capParallaxRef = useRef<HTMLDivElement>(null)

  // Reactive state (low-frequency, not per-frame)
  const [birdsActive, setBirdsActive] = useState(true)
  const [capTrigger, setCapTrigger] = useState(false)

  // Refs for rAF loop
  const pRef = useRef(0)
  const rafRef = useRef(0)
  const capFired = useRef(false)

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

    // ── Birds fade: p 0.12–0.28 ──
    const birdsT = clamp((rawP - 0.12) / 0.16, 0, 1)
    if (birdsPlateRef.current) {
      const opacity = 1 - birdsT
      const scale = 1 - birdsT * 0.04
      birdsPlateRef.current.style.opacity = String(opacity)
      birdsPlateRef.current.style.transform = `scale(${scale})`
    }

    // Birds WebGL lifecycle (hysteresis: destroy at 0.28, re-create at 0.24)
    if (rawP > 0.28 && birdsActive) {
      setBirdsActive(false)
    } else if (rawP < 0.24 && !birdsActive) {
      setBirdsActive(true)
    }

    // ── Track slide: p 0.28–0.78 ──
    const slideT = clamp((rawP - 0.28) / 0.5, 0, 1)
    const eased = easeInOut(slideT)
    const trackX = -eased * 100
    track.style.transform = `translateX(${trackX}vw)`

    // Capabilities parallax lag: 6vw extra offset that resolves to 0
    if (capParallaxRef.current) {
      const parallax = (1 - eased) * 6
      capParallaxRef.current.style.transform = `translateX(${parallax}vw)`
    }

    // ── Capabilities entry at p ≥ 0.52 (once) ──
    if (rawP >= 0.52 && !capFired.current) {
      capFired.current = true
      setCapTrigger(true)
    }

    rafRef.current = requestAnimationFrame(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birdsActive])

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
            <div ref={birdsPlateRef} style={{ display: 'contents' }}>
              <AboutSection active={aboutActive} birdsActive={birdsActive} />
            </div>
          </div>

          {/* ── Panel 2: Capabilities ── */}
          <div className="stg-panel">
            <div ref={capParallaxRef} style={{ width: '100%', height: '100%' }}>
              <CapabilitiesSection triggerEntry={capTrigger} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
