import { useEffect, useRef, useState } from 'react'

const LETTERS = 'VEBMORE'.split('')

export default function AboutSection({ whiteProgress = 0 }: { whiteProgress?: number }) {
  const [visible, setVisible] = useState<boolean[]>(Array(LETTERS.length).fill(false))
  const [fontSize, setFontSize] = useState(() => Math.round(Math.min(window.innerWidth * 0.15, window.innerHeight * 0.15, 180)))
  const triggeredRef = useRef(false)

  useEffect(() => {
    const handleResize = () => {
      setFontSize(Math.round(Math.min(window.innerWidth * 0.15, window.innerHeight * 0.15, 180)))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (triggeredRef.current) return
    if (whiteProgress < 0.95) return
    triggeredRef.current = true
    const timers = LETTERS.map((_, i) =>
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, i * 100)
    )
    return () => timers.forEach(clearTimeout)
  }, [whiteProgress])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: "'Anton', sans-serif",
          fontSize,
          color: '#000000',
          whiteSpace: 'nowrap',
          letterSpacing: '0.15em',
          display: 'inline-flex',
        }}
      >
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: visible[i] ? 1 : 0,
              transform: visible[i] ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'opacity 0.4s ease-out, transform 0.25s ease-out',
            }}
          >
            {letter}
          </span>
        ))}
      </span>
    </div>
  )
}