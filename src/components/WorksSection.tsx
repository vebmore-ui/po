import { useState, useRef, useEffect, useCallback } from 'react'
import { projects, type Project } from './works/worksData'
import WorkPreview from './works/WorkPreview'
import './works.css'

const TITLE_LINE_1 = ['SELECTED']
const TITLE_LINE_2 = ['WORK']

export default function WorksSection() {
  const rootRef = useRef<HTMLElement>(null)
  const timers = useRef<number[]>([])
  const [beat, setBeat] = useState(0)

  // Desktop hover preview state
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  // Mobile tap accordion state (one open at a time)
  const [openMobileId, setOpenMobileId] = useState<string | null>(null)

  // ── Entry animation schedule ──
  const fireEntry = useCallback(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBeat(8)
      return
    }

    const schedule: Array<[number, number]> = [
      [100, 1],  // label rises
      [280, 2],  // title words mask-slide up
      [500, 3],  // lede fades up
      [650, 4],  // row 1 hairline & content
      [740, 5],  // row 2 hairline & content
      [830, 6],  // row 3 hairline & content
      [920, 7],  // row 4 hairline & content
      [1010, 8], // footer hairline & text
    ]

    schedule.forEach(([ms, n]) => {
      timers.current.push(
        window.setTimeout(() => setBeat((prev) => Math.max(prev, n)), ms),
      )
    })
  }, [])

  useEffect(() => {
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
  }, [fireEntry])

  const shown = (n: number) => beat >= n

  const handleRowMouseEnter = (project: Project) => {
    setHoveredProject(project)
    setPreviewVisible(true)
  }

  const handleListMouseLeave = () => {
    setPreviewVisible(false)
  }

  const handleRowClick = (e: React.MouseEvent, projectId: string) => {
    // Only toggle mobile accordion on coarse pointer or <= 900px
    const isMobile =
      window.matchMedia('(max-width: 900px)').matches ||
      window.matchMedia('(pointer: coarse)').matches

    if (isMobile) {
      e.preventDefault()
      setOpenMobileId((prev) => (prev === projectId ? null : projectId))
    }
  }

  return (
    <section ref={rootRef} className="wk-root" aria-labelledby="wk-heading">
      {/* ── Header ── */}
      <header className="wk-header">
        <div>
          <p className={`wk-label wk-rise${shown(1) ? ' is-in' : ''}`}>
            <span className="wk-label-num">03</span>
            <span>WORKS</span>
          </p>

          <h2 id="wk-heading" className="wk-title">
            <span className="wk-title-line">
              {TITLE_LINE_1.map((word, i) => (
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
              {TITLE_LINE_2.map((word, i) => (
                <span className="wk-word-mask" key={word}>
                  <span
                    className={`wk-word${shown(2) ? ' is-in' : ''}`}
                    style={{
                      transitionDelay: `${(TITLE_LINE_1.length + i) * 90}ms`,
                    }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </span>
          </h2>
        </div>

        <div className="wk-header-right">
          <span className={`wk-count-badge wk-rise${shown(3) ? ' is-in' : ''}`}>
            [04]
          </span>
          <p className={`wk-lede wk-rise${shown(3) ? ' is-in' : ''}`}>
            Artifacts of precision. Digital systems engineered for longevity,
            clarity of purpose, and expressive kinetic rhythm.
          </p>
        </div>
      </header>

      {/* ── Project List ── */}
      <ul
        className="wk-list"
        role="list"
        onMouseLeave={handleListMouseLeave}
      >
        {projects.map((project, idx) => {
          const rowBeat = 4 + idx
          const isOpen = openMobileId === project.id
          const indexNum = String(idx + 1).padStart(2, '0')

          return (
            <li
              key={project.id}
              className={`wk-row${shown(rowBeat) ? ' is-in' : ''}`}
              onMouseEnter={() => handleRowMouseEnter(project)}
            >
              <a
                href={`#${project.id}`}
                className="wk-row-link"
                onClick={(e) => handleRowClick(e, project.id)}
                aria-expanded={isOpen}
              >
                <div className="wk-row-content">
                  <span className="wk-row-item wk-index">{indexNum}</span>

                  <span className="wk-row-item wk-name-wrap">
                    <span className="wk-name">{project.name}</span>
                  </span>

                  <div className="wk-row-item wk-meta">
                    <span className="wk-meta-item">
                      <strong>YEAR:</strong> {project.year}
                    </span>
                    <span className="wk-meta-item">
                      <strong>ROLE:</strong> {project.role}
                    </span>
                  </div>

                  <span className="wk-row-item wk-arrow-wrap">
                    <span className="wk-arrow" aria-hidden="true">
                      &#x2197;
                    </span>
                  </span>
                </div>
              </a>

              {/* Mobile / touch inline preview accordion plate */}
              <div
                className={`wk-inline-plate-wrap${isOpen ? ' is-open' : ''}`}
                aria-hidden={!isOpen}
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

      {/* ── Footer Strip ── */}
      <footer className={`wk-footer${shown(8) ? ' is-in' : ''}`}>
        <p className="wk-footer-text">[04/04] ARCHIVE CONTINUES</p>
      </footer>

      {/* ── Desktop Cursor-following Preview Plate ── */}
      <WorkPreview project={hoveredProject} visible={previewVisible} />
    </section>
  )
}

