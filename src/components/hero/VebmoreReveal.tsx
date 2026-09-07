import { useEffect, useState } from 'react'

const LETTERS = 'VEBMORE'.split('')

// Each letter flips in (rotateY) one at a time. No image swap, no second flip.
export default function VebmoreReveal() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @keyframes flipIn {
          from { opacity: 0; transform: rotateY(90deg); }
          to   { opacity: 1; transform: rotateY(0deg); }
        }
        .reveal-letter {
          display: inline-block;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          animation: flipIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
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
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(3.5rem, 9vw, 6rem)',
          color: '#000000',
          pointerEvents: 'none',
          zIndex: 200,
        }}
      >
        <div className="reveal-row">
          {LETTERS.map((ch, i) => (
            <span
              key={i}
              className="reveal-char reveal-letter"
              style={{ animationDelay: `${i * 0.45}s`, opacity: ready ? 1 : 0 }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}