import { useRef, useEffect } from 'react'

export default function CompassNeedle({ size = 400, visible = true }: { size: number; visible?: boolean }) {
  const needleRef = useRef<SVGGElement>(null)
  const targetAngle = useRef(0)
  const currentAngle = useRef(0)

  useEffect(() => {
    let raf: number
    const animate = () => {
      if (!needleRef.current) return
      let diff = targetAngle.current - currentAngle.current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      currentAngle.current += diff * 0.06
      const deg = currentAngle.current * (180 / Math.PI)
      needleRef.current.setAttribute('transform', `translate(${size / 2}, ${size / 2}) rotate(${deg})`)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [size])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight * 0.78
      const angle = Math.atan2(-(e.clientY - cy), e.clientX - cx)
      targetAngle.current = Math.PI / 2 - angle
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  const needleLen = size * 0.38
  const needleWidth = size * 0.055
  const pivotR = size * 0.045

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      <defs>
        <linearGradient id="northGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0000" />
          <stop offset="18%" stopColor="#3d0808" />
          <stop offset="45%" stopColor="#5c1010" />
          <stop offset="75%" stopColor="#6b1818" />
          <stop offset="100%" stopColor="#4a0f0f" />
        </linearGradient>
        <linearGradient id="northHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="southGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#050d1a" />
          <stop offset="22%" stopColor="#0a1525" />
          <stop offset="50%" stopColor="#101f35" />
          <stop offset="78%" stopColor="#142845" />
          <stop offset="100%" stopColor="#0c1a2d" />
        </linearGradient>
        <linearGradient id="southHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="pivotGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="30%" stopColor="#a0a0a0" />
          <stop offset="100%" stopColor="#606060" />
        </linearGradient>
        <filter id="needleShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.5)" />
        </filter>
        <filter id="pivotShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>

      <g ref={needleRef}>
        {/* soft contact shadow beneath needle */}
        <ellipse cx="0" cy="0" rx={needleWidth * 0.55} ry={needleLen * 0.15} fill="rgba(0,0,0,0.12)" />

        {/* south navy needle - thin body, subtle arrow tip near end */}
        <path
          d={`M 0 ${needleLen} L ${needleWidth * 0.5} ${needleLen * 0.9} L ${needleWidth * 0.5} ${needleLen * 0.75} L ${needleWidth * 0.12} 0 L ${-needleWidth * 0.12} 0 L ${-needleWidth * 0.5} ${needleLen * 0.75} L ${-needleWidth * 0.5} ${needleLen * 0.9} Z`}
          fill="url(#southGrad)"
          filter="url(#needleShadow)"
        />
        {/* south highlight ridge - thin center line */}
        <path
          d={`M 0 ${needleLen * 0.95} L ${needleWidth * 0.04} ${needleLen * 0.9} L ${needleWidth * 0.04} ${needleLen * 0.75} L ${needleWidth * 0.015} 0 L ${-needleWidth * 0.015} 0 L ${-needleWidth * 0.04} ${needleLen * 0.75} L ${-needleWidth * 0.04} ${needleLen * 0.9} Z`}
          fill="url(#southHighlight)"
        />

        {/* north red needle - simple tapered shape */}
        <path
          d={`M 0 ${-needleLen} L ${needleWidth * 0.55} ${needleWidth * 0.4} L ${needleWidth * 0.14} 0 L ${-needleWidth * 0.14} 0 L ${-needleWidth * 0.55} ${needleWidth * 0.4} Z`}
          fill="url(#northGrad)"
          filter="url(#needleShadow)"
        />
        {/* north highlight ridge */}
        <path
          d={`M 0 ${-needleLen * 0.85} L ${needleWidth * 0.5} ${needleWidth * 0.32} L ${needleWidth * 0.12} 0 L ${-needleWidth * 0.12} 0 L ${-needleWidth * 0.5} ${needleWidth * 0.32} Z`}
          fill="url(#northHighlight)"
        />

        {/* central pivot */}
        <circle r={pivotR} fill="url(#pivotGrad)" stroke="#505050" strokeWidth="2" filter="url(#pivotShadow)" />
        <circle r={pivotR * 0.45} fill="#fffdf5" opacity="0.7" />
        <circle r={pivotR * 0.2} fill="#fff" opacity="0.85" />
      </g>
    </svg>
  )
}
