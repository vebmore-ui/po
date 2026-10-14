/**
 * RowNeedle — simplified compass needle marker for capability rows.
 * Styled after CompassNeedle.tsx: crimson north, navy south, metallic pivot.
 * Accepts a `rotation` in degrees and animates to it.
 */

import { useRef, useEffect } from 'react'

interface RowNeedleProps {
  /** Target bearing in degrees (0 = N, 90 = E, 180 = S, 270 = W) */
  rotation: number
  /** Pixel size (width & height of the SVG square) */
  size?: number
  className?: string
}

export default function RowNeedle({ rotation, size = 32, className }: RowNeedleProps) {
  const gRef = useRef<SVGGElement>(null)
  const current = useRef(0)
  const target = useRef(rotation)

  useEffect(() => {
    target.current = rotation
  }, [rotation])

  useEffect(() => {
    let raf: number
    const tick = () => {
      if (!gRef.current) return
      let diff = target.current - current.current
      // Shortest-arc wraparound
      while (diff > 180) diff -= 360
      while (diff < -180) diff += 360
      current.current += diff * 0.08
      gRef.current.setAttribute(
        'transform',
        `translate(${size / 2},${size / 2}) rotate(${current.current})`,
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [size])

  const len = size * 0.36
  const w = size * 0.09

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <g ref={gRef}>
        {/* North (crimson) */}
        <polygon
          points={`0,${-len} ${w},0 ${-w},0`}
          fill="#6b1818"
        />
        {/* South (navy) */}
        <polygon
          points={`0,${len} ${w},0 ${-w},0`}
          fill="#101f35"
        />
        {/* Pivot dot */}
        <circle r={size * 0.06} fill="#a0a0a0" stroke="#606060" strokeWidth="1" />
      </g>
    </svg>
  )
}
