import { useEffect, useRef } from 'react'
import './cursor.css'

/**
 * CUSTOM CURSOR
 *
 * Editorial compass cursor enabled only for (hover: hover) and (pointer: fine).
 * - Dot: 6px solid white circle with 1px black outline, tracks pointer exactly.
 * - Ring: 30px with 1px black outline and four cardinal ticks (N/E/S/W), lerping 0.18/frame.
 * - Single rAF loop running only during motion; stops after ~1s stillness and restarts on move.
 * - State toggling via event delegation on document.
 */

export default function SiteCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only fine hover pointers; never under prefers-reduced-motion
    const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mqHover.matches || mqMotion.matches) return

    const root = rootRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    if (!root || !dot || !ring) return

    let targetX = 0
    let targetY = 0
    let ringX = 0
    let ringY = 0
    let isLive = false
    let isMoving = false
    let lastMoveTime = 0
    let rafId = 0
    let isPressed = false

    const updateTransforms = () => {
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)${
        isPressed ? ' scale(0.88)' : ''
      }`
    }

    const loop = (timestamp: number) => {
      // Lerp ring toward target
      ringX += (targetX - ringX) * 0.18
      ringY += (targetY - ringY) * 0.18

      updateTransforms()

      // Stop loop after 1s of stillness once the ring has converged
      const dist = Math.hypot(targetX - ringX, targetY - ringY)
      if (timestamp - lastMoveTime > 1000 && dist < 0.2) {
        ringX = targetX
        ringY = targetY
        updateTransforms()
        isMoving = false
        rafId = 0
        return
      }

      rafId = requestAnimationFrame(loop)
    }

    const startLoop = () => {
      lastMoveTime = performance.now()
      if (!isMoving) {
        isMoving = true
        rafId = requestAnimationFrame(loop)
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY

      if (!isLive) {
        isLive = true
        ringX = targetX
        ringY = targetY
        document.documentElement.classList.add('has-custom-cursor')
        root.classList.add('is-live')
        updateTransforms()
      }

      startLoop()
    }

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (!target) return

      const viewEl = target.closest('[data-cursor="view"]')
      if (viewEl) {
        root.classList.add('is-view')
        root.classList.remove('is-interactive')
        return
      }
      root.classList.remove('is-view')

      const interactive = target.closest('a, button, [role="button"]')
      if (interactive) {
        root.classList.add('is-interactive')
      } else {
        root.classList.remove('is-interactive')
      }
    }

    const onPointerDown = () => {
      isPressed = true
      root.classList.add('is-pressed')
      startLoop()
    }

    const onPointerUp = () => {
      isPressed = false
      root.classList.remove('is-pressed')
      startLoop()
    }

    const onPointerLeave = () => {
      root.classList.remove('is-live')
    }

    const onPointerEnter = () => {
      if (isLive) {
        root.classList.add('is-live')
        startLoop()
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    document.addEventListener('mouseleave', onPointerLeave)
    document.addEventListener('mouseenter', onPointerEnter)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('mouseleave', onPointerLeave)
      document.removeEventListener('mouseenter', onPointerEnter)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <div ref={rootRef} className="cur-root" aria-hidden="true">
      <div ref={ringRef} className="cur-ring">
        <div className="cur-ticks">
          <span className="cur-tick cur-tick-n" />
          <span className="cur-tick cur-tick-s" />
          <span className="cur-tick cur-tick-e" />
          <span className="cur-tick cur-tick-w" />
        </div>
        <span className="cur-view-label">VIEW</span>
      </div>
      <div ref={dotRef} className="cur-dot" />
    </div>
  )
}

