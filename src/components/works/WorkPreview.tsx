import { useEffect, useRef } from 'react'
import type { Project } from './worksData'

interface WorkPreviewProps {
  project: Project | null
  visible: boolean
  /**
   * The element the plate is positioned INSIDE. The stage track is transformed,
   * so `position: fixed` inside it resolves against the track rather than the
   * viewport — the plate must therefore be placed in the panel's own coordinate
   * space instead.
   */
  containerRef: React.RefObject<HTMLElement | null>
}

/**
 * Cursor-following floating preview plate for desktop (`pointer: fine`).
 *
 * Position & tilt are driven in a single rAF loop through DOM refs, and the
 * coordinates are kept relative to the Works panel so the plate stays glued to
 * the cursor even while the stage track is mid-slide.
 * The outer container tracks cursor position (lerp ~0.15) and tilts ±6° based on
 * horizontal velocity. The inner card handles the scale/opacity enter & leave.
 */
export default function WorkPreview({
  project,
  visible,
  containerRef,
}: WorkPreviewProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number>(0)

  // Target and current coordinates, in panel-local space.
  const targetX = useRef<number>(0)
  const targetY = useRef<number>(0)
  const currentX = useRef<number>(0)
  const currentY = useRef<number>(0)
  const prevTargetX = useRef<number>(0)
  const currentTilt = useRef<number>(0)
  const hasEntered = useRef(false)

  useEffect(() => {
    // Check for fine pointer and motion preference
    const mqFine = window.matchMedia('(pointer: fine)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mqFine.matches || mqMotion.matches) return

    const handlePointerMove = (e: PointerEvent) => {
      const host = containerRef.current
      if (!host) return
      // Convert the viewport-space pointer into panel-local space.
      const rect = host.getBoundingClientRect()
      targetX.current = e.clientX - rect.left
      targetY.current = e.clientY - rect.top
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [containerRef])

  useEffect(() => {
    const mqFine = window.matchMedia('(pointer: fine)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mqFine.matches || mqMotion.matches) return

    if (!visible) {
      hasEntered.current = false
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
        rafId.current = 0
      }
      return
    }

    // Initialize position directly on first enter to prevent jumping in from (0,0)
    if (!hasEntered.current) {
      hasEntered.current = true
      currentX.current = targetX.current
      currentY.current = targetY.current
      prevTargetX.current = targetX.current
    }

    const loop = () => {
      // Lerp smoothing (0.15)
      currentX.current += (targetX.current - currentX.current) * 0.15
      currentY.current += (targetY.current - currentY.current) * 0.15

      // Velocity-based tilt (max ±6 deg)
      const vx = targetX.current - prevTargetX.current
      prevTargetX.current = targetX.current
      const targetTilt = Math.max(-6, Math.min(6, vx * 0.35))
      currentTilt.current += (targetTilt - currentTilt.current) * 0.12

      if (outerRef.current) {
        // Offset so cursor is centered above the plate (width: 320, height: 220)
        const x = Math.round(currentX.current - 160)
        const y = Math.round(currentY.current - 110)
        const tilt = Math.round(currentTilt.current * 100) / 100
        outerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`
      }

      rafId.current = requestAnimationFrame(loop)
    }

    rafId.current = requestAnimationFrame(loop)

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
        rafId.current = 0
      }
    }
  }, [visible])

  return (
    <aside ref={outerRef} className="wk-preview-wrap" aria-hidden="true">
      <div
        className={`wk-preview-card${visible && project ? ' is-visible' : ''}`}
        style={project ? { background: project.gradient } : undefined}
      >
        <div className="wk-preview-overlay">
          <div className="wk-preview-top">
            <span className="wk-preview-mono-badge">{project?.year}</span>
            <span className="wk-preview-mono-badge">{project?.role}</span>
          </div>
          <div className="wk-preview-bottom">
            <h4 className="wk-preview-name">{project?.name}</h4>
            <div className="wk-preview-tags">
              {project?.tags.map((tag) => (
                <span key={tag} className="wk-preview-tag">
                  [{tag}]
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

