import { useEffect, useState } from 'react'

const LETTERS = 'VEBMORE'.split('')

export default function VebmoreWordmark({ size, animate }: { size: number; animate: boolean }) {
  const fontSize = Math.round(size * 0.38)
  const [visible, setVisible] = useState<boolean[]>(Array(LETTERS.length).fill(false))
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!animate) return
    const timers = LETTERS.map((_, i) =>
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, i * 150)
    )
    return () => timers.forEach(clearTimeout)
  }, [animate])

  const getLetterStyle = (index: number) => {
    const isHovered = hoveredIndex === index
    const isLeftNeighbor = hoveredIndex === index + 1
    const isRightNeighbor = hoveredIndex === index - 1

    let scaleX = 1
    if (isHovered) scaleX = 1.6
    else if (isLeftNeighbor || isRightNeighbor) scaleX = 0.7

    return {
      display: 'inline-block',
      opacity: visible[index] ? 1 : 0,
      transform: visible[index] ? `scaleX(${scaleX})` : 'scaleX(0)',
      transition: 'opacity 0.4s ease-out, transform 0.25s ease-out',
      cursor: 'pointer',
      transformOrigin: 'center center',
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '2px',
        transform: 'translate(-50%, -100%)',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <span
        style={{
          fontFamily: "'Anton', sans-serif",
          fontSize,
          color: '#ffffff',
          whiteSpace: 'nowrap',
          letterSpacing: '0.15em',
          display: 'inline-flex',
          perspective: '600px',
        }}
      >
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            style={getLetterStyle(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {letter}
          </span>
        ))}
      </span>
    </div>
  )
}
