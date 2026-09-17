// Original VEBMORE graphics for the black motion canvas.
// Visual language: direction, movement, compass geometry, digital journey.
// Everything is vector, scalable and colour-driven by the active palette.

const INK = '#ffffff'
const MUTED = 'rgba(255,255,255,0.45)'
const FAINT = 'rgba(255,255,255,0.22)'
// The canvas has exactly two colours: white for type and structure, green for
// accents. No third hue is introduced anywhere in this file.
const ACCENT = '#35d07f'
const ACCENT_2 = '#0f8f4b'

/** Concentric compass rings with tick marks and cardinal nicks. */
export function CompassRings({ size = 560 }: { size?: number }) {
  const ticks = Array.from({ length: 72 }, (_, i) => (i * 360) / 72)
  return (
    <svg
      className="mw-svg"
      data-depth="deep"
      viewBox="-200 -200 400 400"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <circle cx="0" cy="0" r="188" fill="none" stroke={FAINT} strokeWidth="0.6" />
      <circle cx="0" cy="0" r="150" fill="none" stroke={FAINT} strokeWidth="0.6" strokeDasharray="2 6" />
      <circle className="mw-draw" data-draw="ring" cx="0" cy="0" r="118" fill="none" stroke={MUTED} strokeWidth="0.9" />
      <circle cx="0" cy="0" r="70" fill="none" stroke={FAINT} strokeWidth="0.6" />
      {ticks.map((deg, i) => (
        <line
          key={deg}
          x1="0"
          y1="-188"
          x2="0"
          y2={i % 6 === 0 ? -172 : -180}
          stroke={i % 6 === 0 ? MUTED : FAINT}
          strokeWidth={i % 6 === 0 ? 1.1 : 0.6}
          transform={`rotate(${deg})`}
        />
      ))}
      {[0, 90, 180, 270].map((deg) => (
        <line key={deg} x1="0" y1="-206" x2="0" y2="-188" stroke={INK} strokeWidth="1.4" transform={`rotate(${deg})`} />
      ))}
    </svg>
  )
}

/** Long meandering trajectory path, drawn by scroll. */
export function RoutePath({ hue = 'muted' }: { hue?: 'muted' | 'accent' }) {
  const stroke = hue === 'accent' ? ACCENT : MUTED
  return (
    <svg className="mw-svg" data-depth="mid" viewBox="0 0 1600 600" preserveAspectRatio="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        <path
          className="mw-draw"
          data-draw="dash"
          d="M -40 470 C 240 470 300 150 560 150 S 900 470 1160 300 S 1480 110 1660 170"
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Rides the route as it draws itself on. */}
        <circle className="mw-path-dot" cx="-40" cy="470" r="4" fill={ACCENT} />
      </svg>
  )
}

/** Solid arc that sweeps around a word. */
export function SweepArc({ size = 420 }: { size?: number }) {
  return (
    <svg className="mw-svg" viewBox="0 0 200 200" aria-hidden="true" style={{ width: size, height: size }}>
      <circle
        className="mw-draw"
        data-draw="arc"
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke={ACCENT_2}
        strokeWidth="1.4"
        strokeLinecap="round"
        transform="rotate(-120 100 100)"
      />
      <circle cx="100" cy="100" r="66" fill="none" stroke={FAINT} strokeWidth="0.7" />
    </svg>
  )
}

/** Directional arrow head on a shaft — the brand's movement mark. */
export function DirectionArrow({ width = 360, angle = 0 }: { width?: number; angle?: number }) {
  return (
    <svg
      className="mw-svg"
      viewBox="0 0 300 40"
      aria-hidden="true"
      style={{ width, height: (width / 300) * 40, transform: `rotate(${angle}deg)` }}
    >
      <line className="mw-draw" data-draw="line" x1="0" y1="20" x2="262" y2="20" stroke={INK} strokeWidth="1.2" />
      <path d="M262 8 L292 20 L262 32 Z" fill={ACCENT} />
    </svg>
  )
}

/** Coordinate cross-hair with a travelling dot. */
export function CoordinateMark({ size = 220 }: { size?: number }) {
  return (
    <svg className="mw-svg" viewBox="0 0 120 120" aria-hidden="true" style={{ width: size, height: size }}>
      <line x1="60" y1="0" x2="60" y2="120" stroke={FAINT} strokeWidth="0.7" />
      <line x1="0" y1="60" x2="120" y2="60" stroke={FAINT} strokeWidth="0.7" />
      <circle cx="60" cy="60" r="26" fill="none" stroke={MUTED} strokeWidth="0.9" strokeDasharray="3 5" />
      <circle className="mw-orbit-dot" cx="86" cy="60" r="3.4" fill={ACCENT} />
    </svg>
  )
}

/** Stacked vertical rule cluster — reads like a scale / elevation marker. */
export function ScaleMarks({ count = 9 }: { count?: number }) {
  return (
    <svg className="mw-svg" viewBox="0 0 40 400" aria-hidden="true" style={{ width: 40, height: 400 }}>
      {Array.from({ length: count }, (_, i) => (
        <line
          key={i}
          x1={i % 3 === 0 ? 0 : 14}
          y1={(i * 400) / (count - 1)}
          x2="40"
          y2={(i * 400) / (count - 1)}
          stroke={i % 3 === 0 ? MUTED : FAINT}
          strokeWidth={i % 3 === 0 ? 1 : 0.7}
        />
      ))}
    </svg>
  )
}

/** Orbiting satellites around a small core — layered depth marker. */
export function OrbitCluster({ size = 300 }: { size?: number }) {
  const dots = [0, 1, 2, 3, 4]
  return (
    <svg className="mw-svg" viewBox="0 0 200 200" aria-hidden="true" style={{ width: size, height: size }}>
      <circle cx="100" cy="100" r="4" fill={INK} />
      <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke={FAINT} strokeWidth="0.8" />
      <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke={FAINT} strokeWidth="0.8" transform="rotate(60 100 100)" />
      <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke={FAINT} strokeWidth="0.8" transform="rotate(120 100 100)" />
      {dots.map((i) => {
        const a = (i / dots.length) * Math.PI * 2
        return <circle key={i} cx={100 + Math.cos(a) * 78} cy={100 + Math.sin(a) * 26} r="2.6" fill={ACCENT_2} />
      })}
    </svg>
  )
}
