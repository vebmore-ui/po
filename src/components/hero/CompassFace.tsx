import { useRef, useEffect } from 'react'

export default function CompassFace({ size = 400, animationStage = 6, cursorPos = { x: 0.5, y: 0.5 } }: { size: number; animationStage?: number; cursorPos?: { x: number; y: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const s = size * 2
    c.width = s
    c.height = s
    ctx.scale(2, 2)

    const cx = size / 2
    const cy = size / 2
    const outerR = size / 2 - 3
    const innerR = size / 2 - 14
    const dialR = innerR - 5

    ctx.clearRect(0, 0, size, size)

    if (animationStage < 1) return

    // soft outer shadow - warm, not black
    ctx.beginPath()
    ctx.arc(cx + 2, cy + 3, outerR, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(60,40,10,0.25)'
    ctx.fill()

    // outer gold rim - brighter, more golden
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    const rimGrad = ctx.createRadialGradient(
      cx - outerR * 0.3,
      cy - outerR * 0.35,
      outerR * 0.05,
      cx,
      cy,
      outerR
    )
    rimGrad.addColorStop(0, '#f0f0f0')
    rimGrad.addColorStop(0.12, '#e0e0e0')
    rimGrad.addColorStop(0.25, '#c0c0c0')
    rimGrad.addColorStop(0.45, '#a0a0a0')
    rimGrad.addColorStop(0.7, '#808080')
    rimGrad.addColorStop(0.9, '#606060')
    rimGrad.addColorStop(1, '#404040')
    ctx.fillStyle = rimGrad
    ctx.fill()

    // outer rim bright edge
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.lineWidth = 1.8
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.stroke()

    // outer rim highlight - left/top side
    ctx.beginPath()
    ctx.arc(cx - outerR * 0.28, cy - outerR * 0.3, outerR * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fill()

    // cursor-reactive golden glow line on outer border
    const glowAngle = ((Math.atan2(cursorPos.y - 0.5, cursorPos.x - 0.5) * 180) / Math.PI) + 90
    const glowGrad = ctx.createLinearGradient(
      cx + Math.cos(((glowAngle - 90) * Math.PI) / 180) * outerR,
      cy + Math.sin(((glowAngle - 90) * Math.PI) / 180) * outerR,
      cx + Math.cos(((glowAngle + 90) * Math.PI) / 180) * outerR,
      cy + Math.sin(((glowAngle + 90) * Math.PI) / 180) * outerR
    )
    glowGrad.addColorStop(0, 'rgba(192,192,192,0)')
    glowGrad.addColorStop(0.35, 'rgba(192,192,192,0.55)')
    glowGrad.addColorStop(0.5, 'rgba(220,220,220,0.9)')
    glowGrad.addColorStop(0.65, 'rgba(192,192,192,0.55)')
    glowGrad.addColorStop(1, 'rgba(192,192,192,0)')
    ctx.beginPath()
    ctx.arc(cx, cy, outerR + 1, 0, Math.PI * 2)
    ctx.lineWidth = 2.5
    ctx.strokeStyle = glowGrad
    ctx.stroke()

    if (animationStage < 2) return

    // subtle shadow ring inside rim
    ctx.beginPath()
    ctx.arc(cx, cy, innerR + 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(60,40,10,0.35)'
    ctx.fill()

    // inner brass bevel - slightly darker for depth
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    const bevelGrad = ctx.createRadialGradient(
      cx - innerR * 0.2,
      cy - innerR * 0.2,
      0,
      cx,
      cy,
      innerR
    )
    bevelGrad.addColorStop(0, '#f0f0f0')
    bevelGrad.addColorStop(0.25, '#c8c8c8')
    bevelGrad.addColorStop(0.55, '#a0a0a0')
    bevelGrad.addColorStop(0.8, '#707070')
    bevelGrad.addColorStop(1, '#505050')
    ctx.fillStyle = bevelGrad
    ctx.fill()

    // inner bevel edge
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.lineWidth = 1.2
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.stroke()

    // inner bevel highlight
    ctx.beginPath()
    ctx.arc(cx - innerR * 0.18, cy - innerR * 0.18, innerR * 0.55, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fill()

    // crisp white dial
    ctx.beginPath()
    ctx.arc(cx, cy, dialR, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()

    if (animationStage < 3) return

    // subtle dial texture
    for (let i = 0; i < 180; i++) {
      const nx = cx + (Math.random() - 0.5) * dialR * 1.8
      const ny = cy + (Math.random() - 0.5) * dialR * 1.8
      const dist = Math.hypot(nx - cx, ny - cy)
      if (dist < dialR) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.01})`
        ctx.fillRect(nx, ny, 1, 1)
      }
    }

    // tick marks - refined hierarchy, very subtle
    for (let i = 0; i < 360; i++) {
      const angle = ((i - 90) * Math.PI) / 180
      const isMajor = i % 30 === 0
      const isMedium = i % 10 === 0
      const isStrong = i % 5 === 0

      const outerTick = dialR - 8
      const innerTick = isMajor ? outerTick - 14 : isMedium ? outerTick - 8 : isStrong ? outerTick - 3 : outerTick - 1.5

      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * outerTick, cy + Math.sin(angle) * outerTick)
      ctx.lineTo(cx + Math.cos(angle) * innerTick, cy + Math.sin(angle) * innerTick)
      ctx.strokeStyle = isMajor ? '#000000' : isMedium ? '#4a3d2a' : isStrong ? '#6b5d4d' : '#a09484'
      ctx.lineWidth = isMajor ? 2 : isMedium ? 1 : isStrong ? 0.5 : 0.25
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    if (animationStage < 4) return

    // cardinal direction lines
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.lineWidth = 1.8
    ctx.beginPath()
    for (let deg = 0; deg < 360; deg += 90) {
      const angle = ((deg - 90) * Math.PI) / 180
      ctx.moveTo(cx + Math.cos(angle) * (dialR - 20), cy + Math.sin(angle) * (dialR - 20))
      ctx.lineTo(cx + Math.cos(angle) * (dialR + 6), cy + Math.sin(angle) * (dialR + 6))
    }
    ctx.stroke()

    // degree numbers - OUTER BAND, all 12 bearings with degree symbol
    if (animationStage < 5) return

    // cardinal letters - INNER BAND, Times New Roman, smaller, elegant
    ctx.font = `${Math.round(size * 0.06)}px Times New Roman, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000000'
    const letterR = dialR - 50
    const dirs = [
      { label: 'N', deg: 0 },
      { label: 'E', deg: 90 },
      { label: 'S', deg: 180 },
      { label: 'W', deg: 270 },
    ]
    dirs.forEach(({ label, deg }) => {
      const angle = ((deg - 90) * Math.PI) / 180
      ctx.fillText(label, cx + Math.cos(angle) * letterR, cy + Math.sin(angle) * letterR)
    })

    if (animationStage < 6) return

    // inner dial shadow
    const shadowGrad = ctx.createRadialGradient(cx, cy, dialR * 0.55, cx, cy, dialR)
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0)')
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0.08)')
    ctx.beginPath()
    ctx.arc(cx, cy, dialR, 0, Math.PI * 2)
    ctx.fillStyle = shadowGrad
    ctx.fill()

    // specular highlight on rim - static
    ctx.beginPath()
    ctx.arc(cx - outerR * 0.28, cy - outerR * 0.3, outerR * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.fill()

    // glass refraction highlight
    ctx.beginPath()
    ctx.arc(cx - outerR * 0.26, cy - outerR * 0.28, outerR * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fill()
  }, [size, animationStage, cursorPos])

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: '50%',
        opacity: animationStage === 0 ? 0 : 1,
        transition: 'opacity 0.35s ease-out',
      }}
    />
  )
}