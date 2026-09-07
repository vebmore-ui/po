import { useState, useEffect } from 'react'

const REPEAT_COUNT = 8

// Line 0 is the question strip. It sits above line 1 (LET), has a white
// background with black-outlined (empty-inside) text, repeats the sentence
// like the other lines, scrolls opposite to line 1 (right), and reveals with
// a typewriter clip that writes in from the left before the slide starts.
// Lines 1-4 keep their original disappearance order (COMPASS first, LET last).
const LINES = [
  { text: 'SEEKING DIGITAL DIRECTION?', direction: 'right', isQuestion: true },
  { text: 'LET', direction: 'left' },
  { text: 'VEBMORE', direction: 'right' },
  { text: 'BE YOUR', direction: 'left' },
  { text: 'COMPASS', direction: 'right' },
]

// Disappearance schedule, in original order: COMPASS first, LET last.
// Line 0 (question) never disappears.
const DISAPPEAR_ORDER = [4, 3, 2, 1]

export default function ScrollTextLines({ textProgress = 0, animationComplete = false }: { textProgress?: number; animationComplete?: boolean }) {
  const [visibleLines, setVisibleLines] = useState<boolean[]>(Array(LINES.length).fill(false))
  const [questionRevealed, setQuestionRevealed] = useState(false)

  // Line 0 reveals with a typewriter on mount — before the compass appears.
  useEffect(() => {
    const t = setTimeout(() => setQuestionRevealed(true), 0)
    return () => clearTimeout(t)
  }, [])

  // Lines 1-4 stagger in after the compass animation completes.
  useEffect(() => {
    if (!animationComplete) return

    const timers = LINES.map((_, index) =>
      setTimeout(() => {
        setVisibleLines((prev) => {
          const next = [...prev]
          next[index] = true
          return next
        })
      }, index * 200)
    )

    return () => timers.forEach(clearTimeout)
  }, [animationComplete])

  return (
    <>
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes slideRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeWord {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes slideAfterTypewriter {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .text-line {
          transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
        }
        .word {
          animation: fadeWord 0.5s ease-out both;
        }
        .question-clip {
          overflow: hidden;
          white-space: nowrap;
          width: 0;
          animation: typewriter 2.4s steps(60, end) forwards;
          height: 100%;
          display: flex;
          align-items: center;
        }
        .question-track {
          display: flex;
          white-space: nowrap;
          font-size: clamp(0.7rem, 1.9vw, 1.4rem);
          font-family: 'Anton', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #000000;
          animation: slideAfterTypewriter 25s linear infinite;
          animation-delay: 2.4s;
          will-change: transform;
        }
      `}</style>
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          background: '#000000',
          overflow: 'hidden',
          padding: '20vh 0',
          transform: 'translateY(-8vh)',
        }}
      >
        {LINES.map((line, index) => {
          const items = []
          for (let set = 0; set < 2; set++) {
            for (let i = 0; i < REPEAT_COUNT; i++) {
              const isOutline = i % 2 === 1
              items.push(
                <span
                  key={`${set}-${i}`}
                  style={{
                    paddingRight: '2rem',
                    color: isOutline ? '#000000' : '#ffffff',
                    WebkitTextStroke: isOutline ? '2px #666666' : '0px',
                    paintOrder: 'stroke fill',
                    opacity: 0.9,
                  }}
                >
                  {line.text}
                </span>
              )
            }
          }

          const isQuestion = line.isQuestion

          // Line 0 stays visible the whole time; lines 1-4 disappear in the
          // original order (COMPASS first, LET last).
          const disappearRank = isQuestion ? -1 : DISAPPEAR_ORDER.indexOf(index)
          const lineStart = disappearRank * 0.25
          const lineProgress = Math.min(Math.max((textProgress - lineStart) / 0.25, 0), 1)

          const hasEntered = isQuestion ? questionRevealed : visibleLines[index]
          const opacity = hasEntered ? (isQuestion ? 1 : 1 - lineProgress) : 0
          const translateY = hasEntered ? (isQuestion ? 0 : lineProgress * 30) : 30

          return (
            <div
              className="text-line"
              key={index}
              style={{
                position: 'relative',
                width: '100%',
                height: isQuestion ? '7vh' : '20vh',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                background: isQuestion ? '#ffffff' : 'transparent',
                borderTop: isQuestion ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                borderBottom: isQuestion ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            >
              {isQuestion ? (
                <div className="question-clip">
                  <div className="question-track">
                    {items.map((item, i) => (
                      <span
                        key={i}
                        style={{ paddingRight: '2rem', whiteSpace: 'nowrap' }}
                      >
                        {item.props.children}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    whiteSpace: 'nowrap',
                    fontSize: 'clamp(3rem, 10vw, 12rem)',
                    fontFamily: "'Anton', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    animation: `${line.direction === 'left' ? 'slideLeft' : 'slideRight'} ${20 + index * 5}s linear infinite`,
                    willChange: 'transform',
                  }}
                >
                  {items}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}