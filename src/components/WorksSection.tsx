import { useState, useRef, useEffect, useCallback } from 'react'
import { featuredProjects, type Project } from './works/worksData'
import WorkPreview from './works/WorkPreview'
import './works.css'

/**
 * WORKS — the pinned project carousel.
 *
 * The homepage carousel shows the first FEATURED_COUNT projects in a fixed
 * 5-item roller. The full archive lives on /works, where this same component
 * renders in `page` variant: the full list is visible at once (no roller
 * transform math), with a link back to the homepage.
 *
 * The homepage roller itself owns no scroll math: `WorksContactStage` measures
 * scroll in absolute distance and pushes the dwell-eased float index `f` in
 * through a ref (never state, so the roller never re-renders per frame).
 *
 * Everything the roller needs — the per-item transform/opacity, the counter —
 * is written to DOM refs inside the rAF loop. React state is reserved for
 * things that change at human speed: the entry beats, the hovered project and
 * the open mobile row.
 */

const TITLE_WORDS = ['GROW', 'MORE', 'WITH']
const MARK = 'VEBMORE'

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

interface Props {
  /** The dwell-eased active index, written by the stage's rAF loop. */
  rollRef?: React.RefObject<number>
  /** Stage-controlled entry trigger. `undefined` → use the observer. */
  triggerEntry?: boolean
  /** Reports the visible project count up so the stage can size its wrapper. */
  onVisibleCountChange?: (count: number) => void
  /** Lets the stage scroll the page to a project (click / keyboard on a row). */
  onRequestScrollToProject?: (index: number) => void
  /**
   * `panel` (default): homepage roller inside the pinned stage.
   * `page`: standalone /works page — full list in normal flow, no roller math.
   */
  variant?: 'panel' | 'page'
}

export default function WorksSection({
  rollRef,
  triggerEntry,
  onVisibleCountChange,
  onRequestScrollToProject,
  variant = 'panel',
}: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const timers = useRef<number[]>([])
  const [beat, setBeat] = useState(0)

  // Desktop hover preview state
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  // Mobile tap accordion state (one open at a time)
  const [openMobileId, setOpenMobileId] = useState<string | null>(null)

  const list = featuredProjects

  // ── Entry animation schedule ──
  const entryFired = useRef(false)
  const fireEntry = useCallback(() => {
    if (entryFired.current) return
    entryFired.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBeat(6)
      return
    }

    const schedule: Array<[number, number]> = [
      [100, 1], // label rises
      [280, 2], // heading words mask-slide up
      [560, 3], // VEBMORE mark
      [500, 4], // lede fades up
      [650, 5], // roller hairlines draw
      [820, 6], // roller rows & counter
    ]

    schedule.forEach(([ms, n]) => {
      timers.current.push(
        window.setTimeout(() => setBeat((prev) => Math.max(prev, n)), ms),
      )
    })
  }, [])

  // ── Stage-driven entry ──
  useEffect(() => {
    if (triggerEntry) fireEntry()
  }, [triggerEntry, fireEntry])

  // ── Fallback: IntersectionObserver when not inside the stage ──
  useEffect(() => {
    if (triggerEntry !== undefined) return
    const el = rootRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        fireEntry()
      },
      { threshold: 0.15 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [triggerEntry, fireEntry])

  // ── Report the visible count up to the stage (wrapper height) ──
  useEffect(() => {
    onVisibleCountChange?.(list.length)
  }, [list.length, onVisibleCountChange])

  const shown = (n: number) => beat >= n

  // ── Measure the row height once, and again only on resize ──
  // The stacking maths needs the active row's natural height; measuring it per
  // frame would force a layout on every tick, so it is cached here instead.
  useEffect(() => {
    if (variant !== 'panel') return
    const listEl = rootRef.current?.querySelector('.wk-roll-list') as HTMLElement | null
    const roller = rootRef.current?.querySelector('.wk-roller') as HTMLElement | null
    if (!listEl) return

    const measure = () => {
      const first = listEl.querySelector('.wk-roll-item') as HTMLElement | null
      if (first) {
        const h = first.offsetHeight
        listEl.style.setProperty('--wk-row-h', `${h}px`)
        if (roller) roller.style.setProperty('--wk-row-h', `${h}px`)
      }
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(listEl)
    if (roller) ro.observe(roller)
    return () => ro.disconnect()
  }, [variant])

  // ── Roller driver: one rAF loop, refs only ──
  // The stage writes `rollRef.current`; this loop turns it into the per-item
  // transform/opacity, the counter text and the "more" button's state.
  //
  // Overlap is impossible BY CONSTRUCTION: each item's height is its own scale
  // applied to the measured row height, and the items are stacked with a fixed
  // gap between their edges. Only the LEFT block is scaled, so the meta/arrow
  // column never shrinks into the middle of the row.
  useEffect(() => {
    if (variant !== 'panel' || !rollRef) return
    let raf = 0
    let lastRounded = -1

    const GAP = () => clamp(window.innerHeight * 0.014, 8, 18)
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

    /** Scale for an item `d` steps from the active one: 1 at 0, ~0.55 at |1|. */
    const scaleFor = (d: number) => {
      const ad = Math.min(Math.abs(d), 1)
      return 1 - ad * 0.45
    }

    const opacityFor = (d: number) => {
      const ad = Math.min(Math.abs(d), 1)
      return 1 - ad * 0.72
    }

    const loop = () => {
      const f = rollRef.current ?? 0
      const listEl = rootRef.current?.querySelector('.wk-roll-list') as HTMLElement | null
      const roller = rootRef.current?.querySelector('.wk-roller') as HTMLElement | null
      const H =
        parseFloat(
          (roller ?? listEl)?.style.getPropertyValue('--wk-row-h') || '',
        ) || 0
      const rollerH = roller?.clientHeight ?? 0

      if (listEl && H > 0 && rollerH > 0) {
        const items = listEl.children
        const n = items.length
        const gap = GAP()

        // ── 1. Visible height of each item, from its own scale ──
        // The item's LAYOUT box stays `H` tall (only its inner left block is
        // scaled), so the box must be placed by `H` while the stacking is
        // computed from these visible heights. That is what keeps the visible
        // text centred on the same point the box is centred on.
        const heights: number[] = []
        for (let i = 0; i < n; i++) {
          heights.push(H * scaleFor(i - f))
        }

        // ── 2. Stack the visible content top to bottom (edges + gap) ──
        const centres: number[] = []
        let cursor = 0
        for (let i = 0; i < n; i++) {
          const c = cursor + heights[i] / 2
          centres.push(c)
          cursor = c + heights[i] / 2 + gap
        }

        // ── 3. The interpolated centre that must sit at the roller's middle ──
        const lo = clamp(Math.floor(f), 0, n - 1)
        const hi = clamp(Math.ceil(f), 0, n - 1)
        const t = easeOutCubic(clamp(f - Math.floor(f), 0, 1))
        const focusCentre = centres[lo] + (centres[hi] - centres[lo]) * t
        const offset = rollerH / 2 - focusCentre

        // ── 4. Write transform + opacity only ──
        for (let i = 0; i < n; i++) {
          const el = items[i] as HTMLElement
          const d = i - f
          const ad = Math.abs(d)
          const scale = scaleFor(d)
          const opacity = opacityFor(d)
          const active = ad < 0.5

          el.classList.toggle('is-active', active)
          el.classList.toggle('is-neighbour', !active && ad < 1.25)

          const link = el.querySelector('a')
          if (link) {
            if (active) link.setAttribute('aria-current', 'true')
            else link.removeAttribute('aria-current')
          }

          if (ad > 1.25) {
            el.style.opacity = '0'
            el.style.visibility = 'hidden'
            el.style.pointerEvents = 'none'
            continue
          }

          // Place the BOX by its true layout height (H), so the box and its
          // centred visible content share one centre. The box is H tall, so its
          // top is the centre minus H/2.
          const y = centres[i] + offset - H / 2
          el.style.visibility = 'visible'
          el.style.pointerEvents = active ? 'auto' : 'none'
          el.style.opacity = `${opacity}`
          el.style.transform = `translate3d(0, ${y}px, 0)`
          // The left block carries the scale (origin left-centre); the right
          // block is never scaled, so it stays pinned at the far right.
          const left = el.querySelector('.wk-roll-left') as HTMLElement | null
          if (left) left.style.transform = `scale(${scale})`
        }
      }

      // Counter — only touch the DOM when the rounded index changes.
      const rounded = Math.round(f)
      const counter = rootRef.current?.querySelector('.wk-counter-text')
      if (rounded !== lastRounded && counter) {
        lastRounded = rounded
        const total = String(list.length).padStart(2, '0')
        const now = String(Math.min(rounded + 1, list.length)).padStart(2, '0')
        counter.textContent = `[${now}/${total}]`
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [variant, rollRef, list.length])

  const handleRowMouseEnter = (project: Project) => {
    setHoveredProject(project)
    setPreviewVisible(true)
  }

  const handleListMouseLeave = () => {
    setPreviewVisible(false)
  }

  const handleRowClick = (
    e: React.MouseEvent,
    project: Project,
    index: number,
  ) => {
    // Only toggle mobile accordion on coarse pointer or <= 900px
    const isMobile =
      window.matchMedia('(max-width: 900px)').matches ||
      window.matchMedia('(pointer: coarse)').matches

    if (isMobile) {
      e.preventDefault()
      setOpenMobileId((prev) => (prev === project.id ? null : project.id))
      return
    }
    // Desktop: a non-active row scrolls the page to that project's position.
    if (
      variant === 'panel' &&
      onRequestScrollToProject &&
      index !== Math.round(rollRef?.current ?? 0)
    ) {
      e.preventDefault()
      onRequestScrollToProject(index)
    }
  }

  return (
    <section
      ref={rootRef}
      className={`wk-root wk-variant-${variant}`}
      aria-labelledby="wk-heading"
    >
      {/* Static green glow — a flat plate with no canvas, WebGL or animation. */}
      <span className="wk-glow" aria-hidden="true" />

      <div className="wk-inner">
        {/* ── Header ── */}
        <header className="wk-header">
          <div className="wk-header-left">
            <p className={`wk-label wk-rise${shown(1) ? ' is-in' : ''}`}>
              <span>WORKS</span>
              <span className="wk-quotes" aria-hidden="true">
                &ldquo;&rdquo;
              </span>
            </p>

            <h2 id="wk-heading" className="wk-title">
              <span className="wk-title-line">
                {TITLE_WORDS.map((word, i) => (
                  <span className="wk-word-mask" key={word}>
                    <span
                      className={`wk-word${shown(2) ? ' is-in' : ''}`}
                      style={{ transitionDelay: `${i * 90}ms` }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </span>
              <span className="wk-title-line">
                <span className="wk-word-mask">
                  <span
                    className={`wk-word wk-word-mark${shown(3) ? ' is-in' : ''}`}
                    style={{ transitionDelay: '120ms' }}
                  >
                    {MARK}
                  </span>
                </span>
              </span>
            </h2>
          </div>

          <div className="wk-header-right">
            <span className={`wk-count-badge wk-rise${shown(4) ? ' is-in' : ''}`}>
              [{String(projects.length).padStart(2, '0')}]
            </span>
            <p className={`wk-lede wk-rise${shown(4) ? ' is-in' : ''}`}>
              Artifacts of precision. Digital systems engineered for longevity,
              clarity of purpose, and expressive kinetic rhythm.
            </p>
          </div>
        </header>

        {/* ── Roller ── */}
        <div className={`wk-roller${shown(5) ? ' is-in' : ''}`}>
          <div className="wk-roll-viewport">
            <span className="wk-hairline wk-hairline-top" aria-hidden="true" />
            <span className="wk-hairline wk-hairline-bottom" aria-hidden="true" />

            <ul
              ref={rollerRef}
              className={`wk-roll-list${shown(6) ? ' is-in' : ''}`}
              role="list"
              onMouseLeave={handleListMouseLeave}
            >
              {list.map((project, idx) => {
              const indexNum = String(idx + 1).padStart(2, '0')
              return (
                <li key={project.id} className="wk-roll-item">
                  <a
                      href={`/works#${project.id}`}
                      className="wk-roll-link"
                    onClick={(e) => handleRowClick(e, project, idx)}
                    onMouseEnter={() => handleRowMouseEnter(project)}
                    onFocus={() => handleRowMouseEnter(project)}
                  >
                    {/* LEFT block: the only part that scales. transform-origin
                        is left-centre, so every name shares one left edge. */}
                    <span className="wk-roll-left">
                      <span className="wk-index">{indexNum}</span>
                      <span className="wk-name-wrap">
                        <span className="wk-name">{project.name}</span>
                      </span>
                    </span>

                    {/* RIGHT block: never scales, stays pinned at the far right
                        and simply fades with the row. */}
                    <span className="wk-roll-right">
                      <span className="wk-meta">
                        <span className="wk-meta-item">
                          <strong>YEAR:</strong> {project.year}
                        </span>
                        <span className="wk-meta-item">
                          <strong>ROLE:</strong> {project.role}
                        </span>
                      </span>
                      <span className="wk-arrow-wrap">
                        <span className="wk-arrow" aria-hidden="true">
                          &#x2197;
                        </span>
                      </span>
                    </span>
                  </a>

                  {/* Mobile / touch inline preview accordion plate */}
                  <div
                    className={`wk-inline-plate-wrap${
                      openMobileId === project.id ? ' is-open' : ''
                    }`}
                    aria-hidden={openMobileId !== project.id}
                  >
                    <div className="wk-inline-plate-inner">
                      <div
                        className="wk-preview-card wk-inline-card is-visible"
                        style={{ background: project.gradient }}
                      >
                        <div className="wk-preview-overlay">
                          <div className="wk-preview-top">
                            <span className="wk-preview-mono-badge">
                              {project.year}
                            </span>
                            <span className="wk-preview-mono-badge">
                              {project.role}
                            </span>
                          </div>
                          <div className="wk-preview-bottom">
                            <h4 className="wk-preview-name">{project.name}</h4>
                            <div className="wk-preview-tags">
                              {project.tags.map((tag) => (
                                <span key={tag} className="wk-preview-tag">
                                  [{tag}]
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          </div>

          {/* ── All-work link: the full archive lives on /works ── */}
          <a
            href="/works"
            className={`wk-all-link wk-rise${shown(6) ? ' is-in' : ''}`}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
              e.preventDefault()
              window.location.assign('/works')
            }}
          >
            <span className="wk-all-circle" aria-hidden="true">
              &#x2192;
            </span>
            <span className="wk-all-label">ALL WORK</span>
          </a>
        </div>

        {/* ── Counter strip ── */}
        <footer className={`wk-counter-strip${shown(6) ? ' is-in' : ''}`}>
          <span className="wk-counter-text">
            [01/{String(list.length).padStart(2, '0')}]
          </span>
        </footer>
      </div>

      {/* ── Desktop Cursor-following Preview Plate ── */}
      <WorkPreview
        project={hoveredProject}
        visible={previewVisible}
        containerRef={rootRef}
      />
    </section>
  )
}
