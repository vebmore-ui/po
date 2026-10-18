import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type TouchEvent } from 'react'
import { featuredProjects, type Project } from './works/worksData'
import { navigate } from '../router'
import './works.css'

const TITLE_WORDS = ['GROW', 'MORE', 'WITH']
const MARK = 'VEBMORE'
const AXIS_TILT_DEG = -30
const AXIS_TILT_RAD = (AXIS_TILT_DEG * Math.PI) / 180
const COS_TILT = Math.cos(AXIS_TILT_RAD)
const SIN_TILT = Math.sin(AXIS_TILT_RAD)
const DEG_PER_SLOT = 360 / 5 // 72 deg
const BASE_VELOCITY = 360 / 28 // ~12.857 deg per second

interface Props {
  triggerEntry?: boolean
  slideProgressRef?: React.RefObject<number>
}

export default function WorksSection({ triggerEntry, slideProgressRef }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const carouselRegionRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const [beat, setBeat] = useState(0)
  const entryFired = useRef(false)
  const timers = useRef<number[]>([])

  // Hovered / active project for detail panel
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const hoverLeaveTimer = useRef<number | null>(null)
  const touchDeselectTimer = useRef<number | null>(null)

  // Carousel physics & animation refs
  const thetaRef = useRef(0)
  const targetThetaRef = useRef(0)
  const isTweeningRef = useRef(false)
  const tweenStartTimeRef = useRef(0)
  const tweenStartThetaRef = useRef(0)
  const tweenEndThetaRef = useRef(0)

  const isHoveredRef = useRef(false)
  const isDetailHoveredRef = useRef(false)
  const pauseUntilRef = useRef(0)
  const currentVelocityRef = useRef(BASE_VELOCITY)

  const isVisibleRef = useRef(false)
  const isReducedMotionRef = useRef(false)
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)

  // Cached dimensions
  const dimsRef = useRef({ w: 400, h: 400, rx: 140, ry: 90 })

  // ── Entry animation schedule ──
  const fireEntry = useCallback(() => {
    if (entryFired.current) return
    entryFired.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timers.current.push(window.setTimeout(() => setBeat(4), 0))
      return
    }

    const schedule: Array<[number, number]> = [
      [100, 1], // label rises
      [280, 2], // heading words mask-slide up
      [560, 3], // VEBMORE mark
      [700, 4], // content fade in
    ]

    schedule.forEach(([ms, n]) => {
      timers.current.push(
        window.setTimeout(() => setBeat((prev) => Math.max(prev, n)), ms),
      )
    })
  }, [])

  useEffect(() => {
    if (triggerEntry) fireEntry()
  }, [triggerEntry, fireEntry])

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

  // ── Reduced motion check ──
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    isReducedMotionRef.current = mq.matches
    const update = (e: MediaQueryListEvent) => {
      isReducedMotionRef.current = e.matches
    }
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // ── Measure carousel region ──
  useEffect(() => {
    const region = carouselRegionRef.current
    if (!region) return

    const measure = () => {
      const w = region.clientWidth || 400
      const h = region.clientHeight || 400
      // Cards are approx 140px wide x 186px high
      const cardW = Math.min(Math.max(w * 0.28, 112), 168)
      const cardH = cardW * (4 / 3)
      const rx = Math.max((w - cardW) * 0.44, 40)
      const ry = Math.max((h - cardH) * 0.42, 30)
      dimsRef.current = { w, h, rx, ry }
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(region)
    return () => ro.disconnect()
  }, [])

  // ── Render transforms for cards ──
  const applyCardTransforms = useCallback((thetaDeg: number) => {
    const { rx, ry } = dimsRef.current
    const count = featuredProjects.length

    for (let i = 0; i < count; i++) {
      const el = cardRefs.current[i]
      if (!el) continue

      const phiDeg = thetaDeg + i * (360 / count)
      const phiRad = (phiDeg * Math.PI) / 180

      // Before tilt: x = Rx * sin φ, y = -Ry * cos φ
      const x0 = rx * Math.sin(phiRad)
      const y0 = -ry * Math.cos(phiRad)
      const w = Math.cos(phiRad) // depth: +1 front, -1 back

      // Tilt around Z axis by AXIS_TILT_DEG
      const x = x0 * COS_TILT - y0 * SIN_TILT
      const y = x0 * SIN_TILT + y0 * COS_TILT

      const normDepth = (w + 1) / 2 // 0 (back) to 1 (front)
      const scale = 0.58 + 0.42 * normDepth
      const opacity = 0.28 + 0.72 * normDepth
      const zIndex = Math.round(normDepth * 30) + 1
      const rotY = Math.sin(phiRad) * 12

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)}) rotateY(${rotY.toFixed(1)}deg)`
      el.style.opacity = opacity.toFixed(3)
      el.style.zIndex = String(zIndex)
    }
  }, [])

  // ── Orbit rAF Loop ──
  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
      },
      { threshold: 0.05 },
    )
    observer.observe(el)

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = timestamp

      const slideQ = slideProgressRef?.current ?? 0
      const isPanelActive = isVisibleRef.current && slideQ < 0.98

      if (isPanelActive && !isReducedMotionRef.current) {
        // Tweening from arrow click
        if (isTweeningRef.current) {
          const elapsed = timestamp - tweenStartTimeRef.current
          const progress = Math.min(elapsed / 700, 1)
          // cubic ease-in-out
          const eased =
            progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2

          thetaRef.current =
            tweenStartThetaRef.current +
            (tweenEndThetaRef.current - tweenStartThetaRef.current) * eased

          if (progress >= 1) {
            isTweeningRef.current = false
            thetaRef.current = tweenEndThetaRef.current % 360
            targetThetaRef.current = thetaRef.current
          }
        } else {
          // Normal auto-rotation with hover damping
          const isPaused =
            isHoveredRef.current ||
            isDetailHoveredRef.current ||
            timestamp < pauseUntilRef.current

          const targetVelocity = isPaused ? 0 : BASE_VELOCITY
          const rate = isPaused ? 0.35 : 0.6
          currentVelocityRef.current +=
            (targetVelocity - currentVelocityRef.current) * Math.min(dt / rate, 1)

          thetaRef.current = (thetaRef.current + currentVelocityRef.current * dt) % 360
          targetThetaRef.current = thetaRef.current
        }

        applyCardTransforms(thetaRef.current)
      } else if (isReducedMotionRef.current) {
        // Static staggered arrangement
        applyCardTransforms(0)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [applyCardTransforms, slideProgressRef])

  // ── Step Carousel (Arrows / Keys / Swipe) ──
  const stepSlot = useCallback(
    (direction: 1 | -1) => {
      const now = performance.now()
      pauseUntilRef.current = now + 3000 // pause 3s after arrow

      if (isReducedMotionRef.current) {
        thetaRef.current = (thetaRef.current + direction * DEG_PER_SLOT) % 360
        targetThetaRef.current = thetaRef.current
        applyCardTransforms(thetaRef.current)
        return
      }

      tweenStartTimeRef.current = now
      tweenStartThetaRef.current = thetaRef.current
      tweenEndThetaRef.current = thetaRef.current + direction * DEG_PER_SLOT
      isTweeningRef.current = true
    },
    [applyCardTransforms],
  )

  // ── Hover Intent Handlers ──
  const handleCardMouseEnter = (project: Project) => {
    if (hoverLeaveTimer.current) {
      window.clearTimeout(hoverLeaveTimer.current)
      hoverLeaveTimer.current = null
    }
    isHoveredRef.current = true
    setActiveProject(project)
  }

  const handleCardMouseLeave = () => {
    isHoveredRef.current = false
    hoverLeaveTimer.current = window.setTimeout(() => {
      if (!isDetailHoveredRef.current) {
        setActiveProject(null)
      }
    }, 300)
  }

  const handleDetailMouseEnter = () => {
    if (hoverLeaveTimer.current) {
      window.clearTimeout(hoverLeaveTimer.current)
      hoverLeaveTimer.current = null
    }
    isDetailHoveredRef.current = true
  }

  const handleDetailMouseLeave = () => {
    isDetailHoveredRef.current = false
    hoverLeaveTimer.current = window.setTimeout(() => {
      if (!isHoveredRef.current) {
        setActiveProject(null)
      }
    }, 300)
  }

  // ── Touch Tap Handler ──
  const handleCardTouch = (project: Project) => {
    setActiveProject(project)
    isHoveredRef.current = true
    if (touchDeselectTimer.current) window.clearTimeout(touchDeselectTimer.current)
    touchDeselectTimer.current = window.setTimeout(() => {
      setActiveProject(null)
      isHoveredRef.current = false
    }, 8000)
  }

  // Touch Swipe
  const touchStartXRef = useRef<number | null>(null)
  const onTouchStart = (e: TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartXRef.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current
    if (Math.abs(deltaX) > 40) {
      stepSlot(deltaX < 0 ? 1 : -1)
    }
    touchStartXRef.current = null
  }

  // Keyboard navigation
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      stepSlot(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      stepSlot(1)
    }
  }

  return (
    <section ref={rootRef} className="wk-root" aria-labelledby="wk-heading">
      <div className="wk-grid-bg" aria-hidden="true" />

      <div className="wk-layout">
        {/* ── LEFT COLUMN: Header & Carousel ── */}
        <div className="wk-left-col">
          <div className="wk-head">
            <p className={`wk-label wk-rise${shown(1) ? ' is-in' : ''}`}>
              <span>WORKS</span>
              <span className="wk-quotes" aria-hidden="true">
                &ldquo;&rdquo;
              </span>
            </p>

            <h2 id="wk-heading" className="wk-title">
              <span className="wk-title-line">
                {TITLE_WORDS.map((w, i) => (
                  <span className="wk-word-mask" key={w}>
                    <span
                      className={`wk-word${shown(2) ? ' is-in' : ''}`}
                      style={{ transitionDelay: `${i * 90}ms` }}
                    >
                      {w}
                    </span>
                  </span>
                ))}
              </span>
              <span className="wk-title-line">
                <span className="wk-word-mask">
                  <span
                    className={`wk-word wk-word-mark${shown(3) ? ' is-in' : ''}`}
                    style={{ transitionDelay: '120ms' }}
                  >
                    {MARK}
                  </span>
                </span>
              </span>
            </h2>
          </div>

          {/* Diagonal Orbit Carousel Region */}
          <div
            ref={carouselRegionRef}
            className={`wk-carousel-wrap wk-fade${shown(4) ? ' is-in' : ''}`}
            tabIndex={0}
            role="region"
            aria-label="Featured projects carousel"
            onKeyDown={onKeyDown}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Tilted orbit track ring */}
            <div className="wk-orbit-track" aria-hidden="true" />

            {/* Orbiting Cards */}
            <div className="wk-cards-orbit">
              {featuredProjects.map((p, idx) => (
                <a
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el
                  }}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`wk-card${activeProject?.id === p.id ? ' is-active' : ''}`}
                  data-cursor="view"
                  style={{ background: p.gradient }}
                  onMouseEnter={() => handleCardMouseEnter(p)}
                  onMouseLeave={handleCardMouseLeave}
                  onFocus={() => handleCardMouseEnter(p)}
                  onBlur={handleCardMouseLeave}
                  onTouchStart={() => handleCardTouch(p)}
                  aria-label={`${p.name} — ${p.role}`}
                >
                  <span className="wk-card-index">0{idx + 1}</span>
                  <span className="wk-card-name">{p.name}</span>
                </a>
              ))}
            </div>

            {/* Carousel Arrow Controls */}
            <button
              type="button"
              className="wk-arrow-btn wk-arrow-prev"
              onClick={() => stepSlot(-1)}
              aria-label="Previous project"
            >
              ‹
            </button>
            <button
              type="button"
              className="wk-arrow-btn wk-arrow-next"
              onClick={() => stepSlot(1)}
              aria-label="Next project"
            >
              ›
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Detail Stage & More Works Button ── */}
        <div
          className={`wk-right-col wk-fade${shown(4) ? ' is-in' : ''}`}
          onMouseEnter={handleDetailMouseEnter}
          onMouseLeave={handleDetailMouseLeave}
        >
          <div className="wk-detail-container">
            {activeProject ? (
              /* Active State: Large View Reveal */
              <div className="wk-detail-active" key={activeProject.id}>
                <div
                  className="wk-plate"
                  style={{ background: activeProject.gradient }}
                >
                  <span className="wk-plate-index">
                    0{featuredProjects.indexOf(activeProject) + 1} / 05
                  </span>
                </div>

                <div className="wk-detail-meta-block">
                  <div className="wk-detail-head">
                    <span className="wk-detail-index">
                      0{featuredProjects.indexOf(activeProject) + 1} / 05
                    </span>
                    <h3 className="wk-detail-name">{activeProject.name}</h3>
                    <p className="wk-detail-meta">
                      YEAR: {activeProject.year} · ROLE: {activeProject.role}
                    </p>
                  </div>

                  <p className="wk-detail-desc">{activeProject.description}</p>

                  <div className="wk-detail-tags">
                    {activeProject.tags.map((t) => (
                      <span key={t} className="wk-tag-chip">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="wk-detail-actions">
                    <p className="wk-detail-hint">
                      CLICK THE ROTATING PROJECT TO VISIT IT ↗
                    </p>
                    <a
                      href={activeProject.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wk-visit-btn"
                    >
                      VISIT PROJECT ↗
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Idle State */
              <div className="wk-detail-idle">
                <div className="wk-idle-plate-placeholder" aria-hidden="true" />
                <div className="wk-idle-content">
                  <span className="wk-idle-count">[05]</span>
                  <p className="wk-idle-lede">
                    SELECTED WORKS FROM OUR INTERACTION AND WEB ARCHIVE.
                  </p>
                  <div className="wk-idle-prompt">
                    <span className="wk-prompt-pulse" aria-hidden="true" />
                    <span className="wk-prompt-text">
                      HOVER OVER OR CLICK A PROJECT TO SEE ITS DETAILS
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MORE DESIGNS & WORK ↗ Pill Button */}
          <div className="wk-more-wrap">
            <button
              type="button"
              className="wk-more-btn"
              onClick={() => navigate('/works')}
            >
              MORE DESIGNS & WORK ↗
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
