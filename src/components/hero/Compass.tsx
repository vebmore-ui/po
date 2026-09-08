import { useState, useEffect } from 'react'
import CompassFace from './CompassFace'
import CompassNeedle from './CompassNeedle'
import CompassGlass from './CompassGlass'

export default function Compass({ compassProgress = 0 }: { compassProgress?: number }) {
  const [size, setSize] = useState(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const minSize = vw < 480 ? 140 : 280
    return Math.round(Math.min(Math.max(minSize, Math.min(vw * 0.28, vh * 0.40)), 420))
  })
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 })
  const [animationStage, setAnimationStage] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const minSize = vw < 480 ? 140 : 280
      setSize(Math.round(Math.min(Math.max(minSize, Math.min(vw * 0.28, vh * 0.40)), 420)))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      setCursorPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  useEffect(() => {
    const timers = [
      { delay: 100, stage: 1 },
      { delay: 250, stage: 2 },
      { delay: 400, stage: 3 },
      { delay: 550, stage: 4 },
      { delay: 700, stage: 5 },
      { delay: 850, stage: 6 },
      { delay: 1200, stage: 7 },
    ]

    const timeouts = timers.map(({ delay, stage }) =>
      setTimeout(() => {
        setAnimationStage(stage)
      }, delay)
    )

    return () => timeouts.forEach(clearTimeout)
  }, [])

  const opacity = 1 - compassProgress

  return (
    <div
      className="compass-wrapper"
      style={{
        position: 'absolute',
        left: '50%',
        top: '78%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        zIndex: 10,
        pointerEvents: 'none',
        opacity,
      }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none' }}>
        <CompassFace size={size} animationStage={animationStage} cursorPos={cursorPos} />
        <CompassNeedle size={size} visible={animationStage >= 6} />
        <CompassGlass />
      </div>
    </div>
  )
}