import { useState, useEffect } from 'react'

const LINES = [
  { text: 'LET', direction: 'left' },
  { text: 'VEBMORE', direction: 'right' },
  { text: 'BE YOUR', direction: 'left' },
  { text: 'COMPASS', direction: 'right' },
]

const REPEAT_COUNT = 8
const QUESTION_WORDS = ['NEED', 'DIRECTION', 'TO', 'GROW', 'YOUR', 'BUSINESS', 'ONLINE?']

export default function ScrollTextLines({ textProgress = 0, animationComplete = false }: { textProgress?: number; animationComplete?: boolean }) {
  const [visibleLines, setVisibleLines] = useState<boolean[]>(Array(LINES.length).fill(false))

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

  const questionOpacity = Math.max(0, 1 - textProgress / 0.15)

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
        .text-line {
          transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
        }
        .word {
          animation: fadeWord 0.5s ease-out both;
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
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '6vh',
            left: '0.5rem',
            color: '#ffffff',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(1.2rem, 4vw, 3rem)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            opacity: questionOpacity,
            display: 'flex',
            gap: '0.5rem',
            pointerEvents: 'none',
          }}
        >
          {QUESTION_WORDS.map((word, i) => (
            <span
              key={i}
              className="word"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {word}
            </span>
          ))}
        </div>
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

          const lineStart = (LINES.length - 1 - index) * 0.25
          const lineProgress = Math.min(Math.max((textProgress - lineStart) / 0.25, 0), 1)

          const hasEntered = visibleLines[index]
          const opacity = hasEntered ? 1 - lineProgress : 0
          const translateY = hasEntered ? lineProgress * 30 : 30

          return (
            <div
              className="text-line"
              key={index}
              style={{
                position: 'relative',
                width: '100%',
                height: '20vh',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            >
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
            </div>
          )
        })}
      </div>
    </>
  )
}
