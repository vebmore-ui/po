import { useEffect, useRef } from 'react'

type Props = {
  /** 0..1 progress of the pixelize stage, driven by the master scroll. */
  progress: number
}

/**
 * The black-to-white seam between the GSAP motion world and the About section.
 *
 * This is the point where the page changes world — black canvas to white paper —
 * so the change has to be carried by something with a shape. A fade or a
 * background-color tween would read as a slide projector changing slides; the
 * brief asks for the black world to break into pixels and resolve into white.
 *
 * HOW IT WORKS
 * The transition is a canvas-rendered grid of square cells. Every cell runs its
 * OWN black -> white ramp, but each one starts at a different moment, so the
 * field resolves as a diagonal wave rather than a single cross-fade. Because the
 * cells are squares on a fixed grid, the intermediate states are genuine
 * pixelation: the frame is legible as a mosaic of blocks at every point in
 * between, which is what makes it read as "breaking into pixels".
 *
 * The progress is a pure function of scroll, so the whole effect is reversible:
 * scrolling back up runs the wave in reverse and the world re-forms, with no
 * state to reset and nothing to latch.
 */

// Cell size in CSS pixels at the grid's coarsest. Larger cells read as a chunkier,
// more deliberate pixelation; smaller ones look like noise or a blur.
const CELL = 64

// How much of the timeline one cell's own ramp occupies. A low number means cells
// snap over quickly and the wave front stays thin and crisp; a high number makes
// everything mush together into a fade. This is the single most important value
// for whether the effect looks intentional.
const CELL_RAMP = 0.34

// The wave travels down and across, so the shatter starts at the TOP of the
// frame and resolves downward.
//
// `row` 0 is the top of the canvas, so a low offset (early in the wave) belongs
// to the topmost cells and the mosaic clears from the top down. Weighting the
// row more heavily than the column keeps the motion a clean vertical front with
// only a slight diagonal lean, rather than a corner-to-corner diagonal.
function wavePosition(col: number, row: number, cols: number, rows: number) {
  const cx = cols > 1 ? col / (cols - 1) : 0
  const cy = rows > 1 ? row / (rows - 1) : 0
  // ROW DOMINANT: the front is horizontal first, with a gentle left-to-right
  // lean so it reads as a sweep rather than a hard wipe.
  return cy * 0.72 + cx * 0.28
}

export default function PixelizeTransition({ progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // The grid is kept in a ref so a resize can rebuild it without re-rendering.
  const gridRef = useRef({ cols: 0, rows: 0, w: 0, h: 0, dpr: 1 })
  // rAF handle: the draw is scheduled, never synchronous with the scroll event.
  const rafRef = useRef(0)

  // ---- Grid sizing: rebuild only when the viewport actually changes ----------
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      gridRef.current = {
        w,
        h,
        dpr,
        cols: Math.ceil(w / CELL),
        rows: Math.ceil(h / CELL),
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ---- Draw: one frame per progress change ----------------------------------
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const { cols, rows, w, h, dpr } = gridRef.current
      if (!cols || !rows) return

      // The last stretch of the stage is held fully white, so the About section
      // is already in place before its own content begins to arrive. Without this
      // the paper and the copy would animate in on top of each other.
      const p = Math.min(Math.max(progress, 0), 1)
      const shatter = Math.min(p / 0.82, 1)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Cell size in CSS px, derived from the integer grid so the blocks tile the
      // frame exactly and no hairline gaps show between them.
      const cw = w / cols
      const ch = h / rows

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const offset = wavePosition(col, row, cols, rows)
          // Each cell's own 0..1 ramp, staggered by its position in the wave.
          const span = 1 - CELL_RAMP
          const local = (shatter - offset * span) / CELL_RAMP
          const t = Math.min(Math.max(local, 0), 1)

          // Black -> white. Goods are drawn as opaque fills so the mosaic is
          // genuinely solid in every intermediate frame -- a translucent overlay
          // would let the black canvas show through and read as a fade.
          const v = Math.round(t * 255)
          ctx.fillStyle = `rgb(${v},${v},${v})`
          // Overdraw by a hair to close seams caused by fractional cell sizes.
          ctx.fillRect(col * cw, row * ch, cw + 0.5, ch + 0.5)
        }
      }
    }

    // The scroll handler fires far faster than the display refreshes, so frames
    // are coalesced into one draw per animation frame.
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(rafRef.current)
  }, [progress])

  return (
    <div className="px-root" aria-hidden="true">
      <canvas ref={canvasRef} className="px-canvas" />
    </div>
  )
}
