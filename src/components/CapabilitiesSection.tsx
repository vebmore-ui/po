import { useEffect, useRef, useState, useCallback } from 'react'
import './capabilities.css'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Capability {
  bearing: string
  degrees: number
  name: string
  tags: string
  description: string
}

const items: Capability[] = [
  {
    bearing: '000° N',
    degrees: 0,
    name: 'Brand Strategy & Identity',
    tags: 'POSITIONING · NAMING · VISUAL SYSTEMS',
    description:
      'We build brands that hold their shape under pressure. Clear positioning, considered naming, and visual systems engineered to scale without losing discipline.',
  },
  {
    bearing: '090° E',
    degrees: 90,
    name: 'Creative Web Development',
    tags: 'REACT · WEBGL · THREE.JS · GSAP',
    description:
      'Performance-driven websites where motion serves intent. Every interaction is authored, every transition is earned, and the engineering is invisible.',
  },
  {
    bearing: '180° S',
    degrees: 180,
    name: 'Digital Systems & UI/UX',
    tags: 'DESIGN SYSTEMS · PRODUCT UI · PROTOTYPING',
    description:
      'Interface architecture that stays coherent at scale. Token-driven design systems, component libraries, and prototyping workflows built for the long term.',
  },
  {
    bearing: '270° W',
    degrees: 270,
    name: 'Motion & 3D',
    tags: 'MOTION DESIGN · INTERACTION · REAL-TIME 3D',
    description:
      'Choreographed motion and real-time 3D that reward attention. We animate with restraint — every frame has a reason, every axis has a destination.',
  },
]

const TITLE_LINE_1 = ['WHAT', 'WE']
const TITLE_LINE_2 = ['NAVIGATE']

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CapabilitiesSection({ triggerEntry }: { triggerEntry?: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const [beat, setBeat] = useState(0)
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const timers = useRef<number[]>([])
  const entryFired = useRef(false)

  // ── Beat schedule (shared by both trigger paths) ──
  const fireEntry = useCallback(() => {
    if (entryFired.current) return
    entryFired.current = true
    const schedule: Array<[number, number]> = [
      [100, 1],   // label rise
      [280, 2],   // title words
      [500, 3],   // lede
      [650, 4],   // row 1
      [740, 5],   // row 2
      [830, 6],   // row 3
      [920, 7],   // row 4
    ]
    schedule.forEach(([ms, n]) =>
      timers.current.push(
        window.setTimeout(() => setBeat((b) => Math.max(b, n)), ms),
      ),
    )
  }, [])

  // ── Stage-driven trigger ──
  useEffect(() => {
    if (triggerEntry) fireEntry()
  }, [triggerEntry, fireEntry])

  // ── Fallback: IntersectionObserver (used when not inside stage) ──
  useEffect(() => {
    if (triggerEntry !== undefined) return // stage controls entry
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
  }, [triggerEntry, fireEntry])

  const shown = (n: number) => beat >= n

  const toggle = useCallback((idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx))
  }, [])

  return (
    <section
      ref={rootRef}
      className="cap-root"
      aria-labelledby="cap-heading"
    >
      {/* ── Header ── */}
      <div className="cap-header">
        <div>
          <p className={`cap-label cap-rise${shown(1) ? ' is-in' : ''}`}>
            <span>CAPABILITIES</span>
            <span className="cap-quotes" aria-hidden="true">
              &ldquo;&rdquo;
            </span>
          </p>

          <h2 id="cap-heading" className="cap-title">
            <span className="cap-title-line">
              {TITLE_LINE_1.map((word, i) => (
                <span className="cap-word-mask" key={word}>
                  <span
                    className={`cap-word${shown(2) ? ' is-in' : ''}`}
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </span>
            <span className="cap-title-line">
              {TITLE_LINE_2.map((word, i) => (
                <span className="cap-word-mask" key={word}>
                  <span
                    className={`cap-word${shown(2) ? ' is-in' : ''}`}
                    style={{ transitionDelay: `${(TITLE_LINE_1.length + i) * 90}ms` }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </span>
          </h2>
        </div>

        <p className={`cap-lede cap-rise${shown(3) ? ' is-in' : ''}`}>
          Four cardinal directions. Each one a discipline we practise with care.
          We do not list services — we chart bearings.
        </p>
      </div>

      {/* ── Capability rows ── */}
      <ul className="cap-list" role="list">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx
          const rowBeat = 4 + idx // rows enter at beats 4, 5, 6, 7
          const panelId = `cap-panel-${idx}`
          const btnId = `cap-btn-${idx}`

          return (
            <li
              key={item.bearing}
              className={`cap-row${shown(rowBeat) ? ' is-in' : ''}${isOpen ? ' is-open' : ''}`}
            >
              {/* Black wipe panel */}
              <div className="cap-wipe" aria-hidden="true" />

              <button
                id={btnId}
                className="cap-btn"
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(idx)}
              >
                <span className="cap-btn-inner">
                  <span className="cap-bearing">{item.bearing}</span>
                  <span className="cap-name-wrap">
                    <span className="cap-name">{item.name}</span>
                  </span>
                  <span className="cap-tags">{item.tags}</span>
                  <span className="cap-toggle-cell">
                    <span
                      className={`cap-toggle${isOpen ? ' is-on' : ''}`}
                      role="presentation"
                    >
                      <span className="cap-toggle-knob" />
                    </span>
                  </span>
                </span>
              </button>

              <div
                id={panelId}
                className="cap-desc-wrap"
                role="region"
                aria-labelledby={btnId}
              >
                <div className="cap-desc-inner">
                  <p className="cap-desc">{item.description}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
