import { useEffect, useRef, useState } from 'react'
import vebReveal from '../../assets/veb-reveal.png'

const LETTERS = 'VEBMORE'.split('')

// Phase 0: VEBMORE letters flip in one at a time.
// Phase 1: after a pause the "VEB" slot flips (rotateY 180) and the image
// replaces VEB in the same spot. "MORE" never moves.
//
// `onComplete` is the only addition to the original reveal: it reports that the
// composition has fully settled, so whatever comes next can wait for it instead
// of guessing at a delay. Nothing about the reveal itself is changed.
export default function VebmoreReveal({ onComplete }: { onComplete?: () => void }) {
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState(0)
  const complete = useRef(false)
  const notify = useRef(onComplete)

  useEffect(() => {
    notify.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0)
    return () => clearTimeout(t)
  }, [])

  // 7 letters x 0.25s stagger + 0.3s hold, then flip VEB
  useEffect(() => {
    if (!ready) return
    const total = LETTERS.length * 0.25 + 0.3
    const t = setTimeout(() => setPhase(1), total * 1000)
    return () => clearTimeout(t)
  }, [ready])

  // The image flip is the last beat: 0.3s delay plus 0.3s animation. Reported on
  // a timer rather than an animation event, because the flip runs on an element
  // the parent re-renders on every scroll tick, which restarts it before it can
  // ever emit `animationend`.
  useEffect(() => {
    if (!ready) return
    const letters = LETTERS.length * 0.25 + 0.3
    const t = setTimeout(() => {
      if (complete.current) return
      complete.current = true
      notify.current?.()
    }, (letters + 0.3 + 0.3) * 1000)
    return () => clearTimeout(t)
  }, [ready])

  return (
    <>
      <style>{`
        @keyframes flipIn {
          from { opacity: 0; transform: rotateY(90deg); }
          to   { opacity: 1; transform: rotateY(0deg); }
        }
        @keyframes flipImageIn {
          from { opacity: 0; transform: rotateY(-90deg); }
          to   { opacity: 1; transform: rotateY(0deg); }
        }
        .reveal-letter {
          display: inline-block;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          animation: flipIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .reveal-row {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Image and MORE together: one flex container, the mark inline to the
           left of the letters. */
        .reveal-image-more {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .reveal-char {
          flex: 0 0 auto;
          margin-right: 0.45em;
        }
        .reveal-char:last-child {
          margin-right: 0;
        }
        /* The slot keeps its original fixed width so MORE never shifts; it is
           wide enough to hold the mark, which overflows it by design. */
        /* The VEB slot collapses once the mark takes its place, so MORE sits
           directly beside the image with no reserved gap. */
        .reveal-veb-slot {
          position: relative;
          display: flex;
          align-items: center;
          flex: 0 0 auto;
          width: 2.6em;
          margin-right: 0.25em;
        }
        .reveal-veb-slot:has(.reveal-image) {
          width: auto;
          margin-right: 0;
        }
        /* Once the mark has replaced VEB the slot is gone, so only the lockup
           remains and it centres as a whole. */
        .reveal-row:has(.reveal-image) .reveal-veb-slot {
          display: none;
        }
        .reveal-veb {
          display: flex;
          gap: 0;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
        }
        .reveal-veb.flip {
          transform: rotateY(180deg);
          opacity: 0;
        }
        .reveal-veb .reveal-letter {
          margin-right: 0.45em;
          flex-shrink: 0;
        }
        .reveal-veb .reveal-letter:last-child {
          margin-right: 0;
        }
        /* The mark is a normal flex item in the row, sitting immediately to the
           left of MORE, so the image and MORE are one container laid out by the
           flow. No absolute positioning: that was what put the mark in the wrong
           place on screen and detached it from the letters.

           The asset is a 1254x1254 canvas whose glyph occupies only its middle
           band (x 169-1112, y 341-995), so the element is sized larger than the
           letters and the empty canvas above and below the glyph is trimmed
           back with negative margins. */
        .reveal-image {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          animation: flipImageIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 0.3s;
          height: 2.2em;
          width: auto;
          margin: -0.85em 0 -0.85em 0.12em;
        }
        .reveal-image img {
          height: 100%;
          width: auto;
          display: block;
        }

        @media (max-width: 390px) {
          .reveal-veb-slot {
            width: 3.4em !important;
            margin-right: 0.35em !important;
          }
          .reveal-image {
            width: 3em !important;
            left: -2.8em !important;
            top: -0.4em !important;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(2rem, 8vw, 6rem)',
          color: '#ffffff',
          pointerEvents: 'none',
          zIndex: 200,
        }}
      >
        {/* The image and MORE are ONE container: the mark is a flex item sitting
            immediately left of the letters, so they share a baseline and a flow. */}
        <div className="reveal-row">
          <span className="reveal-veb-slot">
            <span
              className={`reveal-veb${phase === 1 ? ' flip' : ''}`}
              style={{ opacity: phase === 1 ? 0 : 1 }}
            >
              {['V', 'E', 'B'].map((ch, i) => (
                <span
                  key={i}
                  className="reveal-letter"
                  style={{ animationDelay: `${i * 0.25}s`, opacity: ready ? 1 : 0 }}
                >
                  {ch}
                </span>
              ))}
            </span>
          </span>
          <span className="reveal-image-more">
            {phase === 1 && (
              <span className="reveal-image">
                <img src={vebReveal} alt="" />
              </span>
            )}
            {['M', 'O', 'R', 'E'].map((ch, i) => (
              <span
                key={i}
                className="reveal-char reveal-letter"
                style={{ animationDelay: `${(3 + i) * 0.25}s`, opacity: ready ? 1 : 0 }}
              >
                {ch}
              </span>
            ))}
          </span>
        </div>
      </div>
    </>
  )
}
