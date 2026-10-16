import { useEffect, useRef, useState } from 'react'
import {
  techStack,
  TECH_POP_STAGGER_MS,
  TECH_POP_DURATION_MS,
  type TechItem,
} from './techstack/techData'
import './techstack.css'

/**
 * Panel 3 of the pinned stage — the solid green "TOOLS WE FLY WITH" screen.
 *
 * The panel arrives completely blank while the track slides it in; only once
 * it has settled do the tiles pop, row by row. Nothing here reads scroll
 * position itself — the stage's rAF loop owns progress and pushes two flags
 * in through props:
 *
 *   triggerPop     false → true  when p crosses the pop threshold.
 *   triggerPop     true  → false when p falls back past the reset point.
 *
 * The down-then-up pair is what gives the sequence hysteresis: a tile that has
 * popped stays popped while the user sits near the boundary, but resets the
 * moment the panel really leaves, so it pops again on re-entry.
 *
 * Reduced motion and narrow screens bypass all of that — the panel is then a
 * normal-flow section and the IntersectionObserver path below reveals it.
 */

interface Props {
  /** Drives the pop sequence. `undefined` = no stage parent → use the observer. */
  triggerPop?: boolean
}

/** ms each tile waits before its own pop begins. */
const staggerFor = (index: number) => index * TECH_POP_STAGGER_MS

export default function TechStackPanel({ triggerPop }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const timers = useRef<number[]>([])
  const [popped, setPopped] = useState(false)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  // ── Stage-driven sequence ──
  useEffect(() => {
    if (triggerPop === undefined) return // observer path owns this case
    clearTimers()

    if (!triggerPop) {
      // Panel has left the viewport: reset so the tiles pop again on re-entry.
      // Deferred a tick — same pattern as the tiles' own reset — so the state
      // change doesn't cascade synchronously out of the effect.
      const r = window.setTimeout(() => setPopped(false), 0)
      return () => clearTimeout(r)
    }

    // Fire the sequence: every tile pops, each delayed by its position in the
    // row-major order. Timers are real time rather than scroll distance because
    // the panel is stationary by the time this fires.
    techStack.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setPopped(true), staggerFor(i)),
      )
    })
    return clearTimers
  }, [triggerPop])

  // ── Fallback: IntersectionObserver (mobile / reduced motion) ──
  useEffect(() => {
    if (triggerPop !== undefined) return // stage controls the sequence
    const el = rootRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setPopped(true)
      },
      { threshold: 0.2 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      clearTimers()
    }
  }, [triggerPop])

  return (
    <section ref={rootRef} className="ts-root" aria-label="Tech stack">
      <div className="ts-inner">
        {/* Labels stay invisible until the sequence has run — while the green
            screen is sliding in, it must read as a completely blank plate. */}
        <p className={`ts-label ts-fade${popped ? ' is-in' : ''}`}>Tools we fly with</p>

        <ul className="ts-grid" role="list">
          {techStack.map((item, i) => (
            <TechTile key={item.id} item={item} index={i} popped={popped} />
          ))}
        </ul>

        <p className={`ts-caption ts-fade${popped ? ' is-in' : ''}`}>
          [{techStack.length}] Technologies
        </p>
      </div>
    </section>
  )
}

/**
 * One technology tile. Its pop is a pure CSS transition keyed off the parent's
 * `popped` flag, delayed by its position in the sequence; the hover effect is
 * disabled until the tile's own delay has elapsed, so nothing lifts before it
 * has finished arriving.
 */
function TechTile({
  item,
  index,
  popped,
}: {
  item: TechItem
  index: number
  popped: boolean
}) {
  const delay = staggerFor(index)

  // The tile is only interactive once its own pop has finished. Until then it
  // carries `ts-tile-idle`, whose CSS suppresses hover and pointer events; the
  // timer below clears the flag exactly when this tile's transition ends.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    // Deferred by a tick rather than set synchronously: the reset must not
    // cascade a render out of the effect (oxlint set-state-in-effect).
    if (!popped) {
      const r = window.setTimeout(() => setSettled(false), 0)
      return () => clearTimeout(r)
    }
    const t = window.setTimeout(
      () => setSettled(true),
      delay + TECH_POP_DURATION_MS,
    )
    return () => clearTimeout(t)
  }, [popped, delay])

  const style = {
    transitionDelay: `${delay}ms`,
    '--ts-tile-delay': `${delay}ms`,
  } as React.CSSProperties

  return (
    <li
      className={`ts-tile${popped ? ' is-in' : ''}${settled ? '' : ' ts-tile-idle'}`}
      style={style}
    >
      <span className="ts-logo" aria-hidden="true">
        {item.icon ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={item.icon.path} />
          </svg>
        ) : (
          <span className="ts-monogram">{item.monogram}</span>
        )}
      </span>
      <span className="ts-name">{item.name}</span>
    </li>
  )
}
