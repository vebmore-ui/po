import { useEffect, useRef, useState } from 'react'

const COLUMNS = 7

type Props = {
  /** Raw scroll progress of Act I (0..1+); negative-safe. */
  progress: number
  /** Scroll length of that act, in px — used only to hand scrolling back. */
  scrollSpan: number
  /** Fires once the curtain has fully covered and opened onto the world. */
  onComplete: () => void
}

/**
 * Stage B — Motion.dev "Curtains Mixed", driven by scroll.
 *
 * Mixed means the cover and the reveal use two different curtain effects: the
 * cover is a staggered wipe (green columns sweep down in sequence) and the
 * reveal is an iris (readable black opens from the centre onto the motion
 * world). The layering is always green cover → black iris, so the seam between
 * the two worlds is carried by the curtain itself and never by a colour change.
 *
 * Scroll down scrubs the timeline forward; scroll up scrubs it back, so the
 * transition is reversible like the rest of the experience. No autoplay.
 */
export default function CurtainsTransition({ progress, scrollSpan, onComplete }: Props) {
  const done = useRef(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const p = Math.min(Math.max(progress, 0), 1)

  // Three beats, in order:
  //   0.00 - 0.55  the green columns sweep down (cover in)
  //   0.55 - 0.78  the covered frame holds; the seam details cross it
  //   0.78 - 1.00  the iris opens and the cover lifts, carrying the green
  //                away to uncover the motion world underneath
  // The cover and the iris move together at the end, so the green is what
  // travels out of frame rather than being cut to black.
  const coverIn = reduced ? Math.min(p * 6, 1) : Math.min(p / 0.55, 1)
  const exit = reduced ? 0 : Math.min(Math.max((p - 0.78) / 0.22, 0), 1)
  const iris = reduced ? coverIn : exit

  // Completion fires once the reveal has actually played, not merely once the
  // scroll is near its end: the iris occupies the last stretch of the timeline,
  // and handing over before it opens skipped the second half of the effect.
  // Reduced motion collapses the beats, so it hands over on the cover instead.
  // Completion fires on the reveal being effectively played through. The last
  // increment of the scrub is not guaranteed: the world's own height supplies
  // the tail of the page's scroll, so until the world mounts the scroll can stop
  // just short of the very end. Treating the iris as open once it is nearly
  // there lets the handover happen instead of stalling on a full-open curtain.
  useEffect(() => {
    if (done.current) return
    const finished = reduced ? coverIn >= 1 : iris >= 0.995
    if (!finished) return
    done.current = true
    onComplete()
  }, [iris, coverIn, reduced, onComplete])

  useEffect(() => {
    if (done.current || p < 0.8) return
    // Trail completion backup: if the scrub is left mid-iris, the world still
    // takes over rather than leaving the pages cushioned on a curtain.
    const t = setTimeout(() => {
      if (done.current) return
      window.scrollTo({ top: Math.round(scrollSpan * 0.99), behavior: 'smooth' })
    }, 2500)
    return () => clearTimeout(t)
  }, [p, coverIn, scrollSpan])

  return (
    <div className="curtain-root" aria-hidden="true">
      {/* REVEAL — stays underneath: as the iris opens, it uncovers the motion
          world while the green cover above it is carried away. */}
      {/* The aperture is drawn in a square viewBox with a uniform aspect ratio:
          in a stretched coordinate space a circle renders as an ellipse, which
          made the iris open as a flattened off-centre sweep instead of a true
          centred aperture. The mask is sized past the viewport so the circle
          still covers the full frame once it is fully open. */}
      {/* maskUnits defaults to userSpaceOnUse for <mask> content, but the mask's
          own rect defaults to objectBoundingBox — mixing the two silently shifts
          the aperture. Both units are declared so the circle and the field it
          masks share one origin. */}
      <svg className="curtain-iris" viewBox="0 0 100 100">
        <defs>
          <mask id="curtainIrisMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
            {/* Field and aperture share the centre point. The aperture radius is
                scaled so the frame is fully clear only as the reveal completes:
                a larger multiplier reached the edges early and the iris read as
                a black corner sweeping in rather than an opening from centre. */}
            <rect x="-100" y="-100" width="300" height="300" fill="#fff" />
            <circle cx="50" cy="50" r={0.5 + iris * 70} fill="#000" />
          </mask>
        </defs>
        <rect x="-100" y="-100" width="300" height="300" fill="#000" mask="url(#curtainIrisMask)" />
      </svg>

      {/* COVER — staggered green columns sweep down over the VEBMORE mark, then
          lift away in the opposite sequence as the iris opens. The layer itself
          never moves: letting it translate as well compounded with each column's
          own travel and flattened the stagger into uniform slabs. */}
      <div className="curtain-cover-layer">
        {Array.from({ length: COLUMNS }, (_, i) => {
          const down = Math.min(Math.max((coverIn - i * 0.11) / 0.62, 0), 1)
          const up = Math.min(Math.max((exit - (COLUMNS - 1 - i) * 0.06) / 0.68, 0), 1)
          return (
            <span
              key={i}
              className="curtain-col"
              style={{
                left: `${(i * 100) / COLUMNS}%`,
                width: `${100 / COLUMNS + 0.7}%`,
                transform: `translateY(${-100 + down * 100 - up * 100}%)`,
              }}
            />
          )
        })}
      </div>

      {/* SEAM — a scanned band plus a compass arc crosses the two worlds. */}
      <span
        className="curtain-band"
        style={{ transform: `scaleY(${coverIn}) translateY(${-exit * 100}%)`, opacity: coverIn >= 1 ? 0.9 * (1 - exit) : 0 }}
      />
      {/* Rotation is applied about the element's own centre and the drift is
          written as a translation of the wrapper, never mixed into the centring
          transform — appending it there pushed the arc off the aperture it is
          meant to share a centre with. */}
      <div
        className="curtain-arc-wrap"
        style={{ transform: `translateY(${-exit * 40}%)`, opacity: coverIn >= 1 ? 0.5 * (1 - exit) : 0 }}
      >
        <svg className="curtain-arc" viewBox="-100 -100 200 200" style={{ transform: `rotate(${p * 120}deg)` }}>
        <circle cx="0" cy="0" r="72" fill="none" stroke="rgba(8,20,12,0.45)" strokeWidth="0.8" />
        <circle
          cx="0"
          cy="0"
          r="54"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="140 340"
          />
        </svg>
      </div>
    </div>
  )
}
