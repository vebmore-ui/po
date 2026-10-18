/**
 * /works — THE FULL ARCHIVE
 *
 * A normal document-flow page (nothing here is pinned). Same black canvas, same
 * card language as the homepage carousel, but laid out as a filterable grid.
 * Entry animations fire once via one IntersectionObserver and are skipped
 * entirely under reduced motion.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '../router'
import { projects } from '../components/works/worksData'
import { PROJECT_COUNT } from '../sectionMap'
import './worksPage.css'

const ALL = 'ALL'

/** Display label for a tag: `DESIGN SYSTEM` reads better than the raw string. */
function chipLabel(tag: string): string {
  return tag.toUpperCase()
}

export default function WorksPage() {
  const [filter, setFilter] = useState<string>(ALL)
  const rootRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'VEBMORE — The Full Archive'
    window.scrollTo(0, 0)
    return () => {
      document.title = 'VEBMORE — A Creative Digital Studio'
    }
  }, [])

  /* The filter chips are derived from the data, never hand-listed. */
  const filters = useMemo(() => {
    const seen: string[] = []
    for (const p of projects) {
      for (const t of p.tags) {
        if (!seen.includes(t)) seen.push(t)
      }
    }
    return [ALL, ...seen]
  }, [])

  const visible = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => p.tags.includes(filter))),
    [filter],
  )

  /* Entry animation: fires once, then disconnects. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      root.classList.add('is-entered')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            root.classList.add('is-entered')
            io.disconnect()
          }
        }
      },
      { threshold: 0.12 },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])

  return (
    <main className="wp-root" ref={rootRef}>
      <div className="wp-grid-bg" aria-hidden="true" />

      <div className="wp-inner">
        <header className="wp-head">
          <p className="wp-label">
            ALL WORK <span className="wp-quote">“”</span>
          </p>

          <div className="wp-title-row">
            <h1 className="wp-title">
              <span className="wp-mask">
                <span className="wp-word">THE FULL</span>
              </span>
              <span className="wp-mask">
                <span className="wp-word">ARCHIVE</span>
              </span>
            </h1>
            <p className="wp-count" aria-label={`${PROJECT_COUNT} projects`}>
              [{String(PROJECT_COUNT).padStart(2, '0')}]
            </p>
          </div>

          <div className="wp-head-foot">
            <p className="wp-lede">
              EVERY PROJECT WE HAVE SHIPPED, IN ONE PLACE. WEB DESIGN AND
              DEVELOPMENT, DESIGN SYSTEMS AND MOTION — FILTER BY DISCIPLINE TO
              NARROW THE LIST.
            </p>
            <Link to="/" className="wp-back">
              ← BACK TO HOME
            </Link>
          </div>
        </header>

        <div className="wp-filters" role="group" aria-label="Filter projects">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`wp-chip${f === filter ? ' is-active' : ''}`}
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
            >
              {chipLabel(f)}
            </button>
          ))}
        </div>

        <div className="wp-cards" ref={gridRef} key={filter}>
          {visible.map((p, i) => (
            <a
              key={p.id}
              className="wp-card"
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="wp-card-plate" style={{ background: p.gradient }}>
                <span className="wp-card-index">
                  {String(projects.indexOf(p) + 1).padStart(2, '0')}
                </span>
                <span className="wp-card-name">{p.name}</span>
              </div>
              <div className="wp-card-foot">
                <span className="wp-card-meta">
                  {p.year} · {p.role}
                </span>
                <span className="wp-card-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="wp-card-tag">
                      {t}
                    </span>
                  ))}
                </span>
                <span className="wp-card-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </a>
          ))}
        </div>

        <footer className="wp-footer">
          <span className="wp-footer-text">HAVE A PROJECT IN MIND?</span>
          <Link to="/#contact" className="wp-footer-btn">
            GET IN TOUCH ↗
          </Link>
        </footer>
      </div>
    </main>
  )
}
