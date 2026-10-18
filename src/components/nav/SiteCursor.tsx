import { useEffect, useRef } from 'react'
import './cursor.css'

/**
 * CUSTOM CURSOR
 *
 * A lime dot glued to the pointer and a larger ring lerping behind it. The ring
 * swells over interactive elements and tightens on press. Everything is written
 * straight to DOM refs from one rAF loop — no React state per frame.
 *
 * Mount once, at the app shell level. The class `has-custom-cursor` on <html>
 * hides the native cursor; it is only added after the first fine-pointer move,
 * so there is never a frame without a cursor on screen.
 */
export default function SiteCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mqFine = window.matchMedia('(pointer: fine)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mqFine.matches || mqMotion.matches) return

    const root = rootRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    if (!root || !dot || !ring) return

    // Native cursor is hidden only once the custom one is really live.
    document.documentElement.classList.add('has-custom-cursor')

    const targetX = { current: 0 }
    const targetY = { current: 0 }
    const ringX = { current: 0 }
    const ringY = { current: 0 }
    let live = false
    let raf = 0

    const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label'

    const onMove = (e: PointerEvent) => {
      targetX.current = e.clientX
      targetY.current = e.clientY
      if (!live) {
        live = true
        // Snap both layers to the pointer on first sight — no fly-in from (0,0).
        ringX.current = e.clientX
        ringY.current = e.clientY
        root.classList.add('is-live')
        dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
        ring.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
    }

    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null
      ring.classList.toggle('is-hover', !!el?.closest?.(INTERACTIVE))
    }

    const onDown = () => root.classList.add('is-pressed')
    const onUp = () => root.classList.remove('is-pressed')
    const onLeave = () => root.classList.remove('is-live')
    const onEnter = () => {
      if (live) root.classList.add('is-live')
    }

    const loop = () => {
      // Ring lags the dot with a light lerp; the dot is exact.
      ringX.current += (targetX.current - ringX.current) * 0.18
      ringY.current += (targetY.current - ringY.current) * 0.18
      dot.style.transform = `translate3d(${targetX.current}px, ${targetY.current}px, 0)`
      ring.style.transform = `translate3d(${Math.round(ringX.current)}px, ${Math.round(ringY.current)}px, 0)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <div ref={rootRef} className="cur-root" aria-hidden="true">
      <div ref={ringRef} className="cur-ring" />
      <div ref={dotRef} className="cur-dot" />
    </div>
  )
}
