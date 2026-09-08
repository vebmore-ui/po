import { useEffect, useState } from 'react'
import vebReveal from '../../assets/veb-reveal.png'

const LETTERS = 'VEBMORE'.split('')

// Phase 0: VEBMORE letters flip in one at a time.
// Phase 1: after a pause the "VEB" slot flips (rotateY 180) and the image
// replaces VEB in the same spot. "MORE" never moves.
export default function VebmoreReveal() {
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState(0)

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
        .reveal-char {
          flex: 0 0 auto;
          margin-right: 0.45em;
        }
        .reveal-char:last-child {
          margin-right: 0;
        }
        .reveal-veb-slot {
          position: relative;
          display: flex;
          align-items: center;
          flex: 0 0 auto;
          width: 2.6em;
          margin-right: 0.25em;
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
        .reveal-image {
          position: fixed;
          top: 38%;
          left: 34%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          animation: flipImageIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 0.3s;
          width: 2.4em;
          height: auto;
          z-index: 201;
        }
        .reveal-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        @media (max-width: 390px) {
          .reveal-veb-slot {
            width: 3.4em !important;
            margin-right: 0.35em !important;
          }
          .reveal-image {
            left: 50% !important;
            top: 50% !important;
            width: 3em !important;
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
          color: '#000000',
          pointerEvents: 'none',
          zIndex: 200,
        }}
      >
        <div className="reveal-row">
          {/* VEB slot — fixed width so MORE never shifts */}
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
            {phase === 1 && (
              <span className="reveal-image">
                <img src={vebReveal} alt="" />
              </span>
            )}
          </span>
          {/* MORE — stays put */}
          {['M', 'O', 'R', 'E'].map((ch, i) => (
            <span
              key={i}
              className="reveal-char reveal-letter"
              style={{ animationDelay: `${(3 + i) * 0.25}s`, opacity: ready ? 1 : 0 }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}