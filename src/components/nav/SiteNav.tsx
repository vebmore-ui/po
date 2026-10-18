import { useEffect, useMemo, useRef, useState } from 'react'
import './nav.css'

/**
 * SITE NAVIGATION
 *
 * A compact fixed pill at the top right. The active section's item is rendered
 * slightly larger, in full white, with a small lime triangle beneath the word,
 * and is always moved to the LEFTMOST position of the pill. The remaining items
 * keep their canonical relative order.
 *
 * DOM order never changes — only the CSS `order` of each flex item does — so the
 * tab order and the screen-reader order stay stable no matter which section is
 * active. Each item's scaled width is reserved in CSS, so the pill's total width
 * stays constant as the active item changes and nothing shifts.
 *
 * Section detection is a single rAF-throttled passive scroll listener; React
 * state is written only when the active section id actually changes. The
 * geometry itself lives in `sectionMap.ts`, next to the stage constants it is
 * derived from.
 */

export interface NavItem {
  id: string
  label: string
}

interface Props {
  /** Canonical order; the active item is moved to the front visually only. */
  items: NavItem[]
  activeId: string
  /** Called with the section id; the owner resolves the anchor and scrolls. */
  onSelect: (id: string) => void
}

export default function SiteNav({ items, activeId, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  /* ── Narrow-screen detection: the pill collapses to active word + MENU ── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const sync = () => setIsNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* ── Dropdown dismissal: selection, outside tap, Escape ── */
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Close the dropdown whenever the active section changes underneath it.
  useEffect(() => {
    setOpen(false)
  }, [activeId])

  /**
   * The visual order: the active item first, then the rest in canonical order.
   * `order` is assigned from this list; the DOM stays in `items` order.
   */
  const visualOrder = useMemo(() => {
    const active = items.find((i) => i.id === activeId)
    const rest = items.filter((i) => i.id !== activeId)
    return active ? [active, ...rest] : items
  }, [items, activeId])

  const orderIndex = (id: string) => {
    const i = visualOrder.findIndex((v) => v.id === id)
    return i < 0 ? items.length : i
  }

  const handleSelect = (id: string) => {
    setOpen(false)
    onSelect(id)
  }

  const activeItem = items.find((i) => i.id === activeId) ?? items[0]

  return (
    <header className="nav-root">
      {/* Empty slot reserved for the mark. Nothing is drawn here yet. */}
      <div className="nav-logo-slot" aria-hidden="true">
        {/* LOGO GOES HERE */}
      </div>

      <nav ref={rootRef} className="nav-pill" aria-label="Primary">
        <ul className="nav-list" role="list">
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <li
                key={item.id}
                className={`nav-item${active ? ' is-active' : ''}`}
                style={{ order: orderIndex(item.id) }}
              >
                <a
                  className="nav-link"
                  href={`#${item.id}`}
                  aria-current={active ? 'location' : undefined}
                  onClick={(e) => {
                    // Plain left-click only; modified clicks keep default behaviour.
                    if (e.defaultPrevented) return
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                    e.preventDefault()
                    handleSelect(item.id)
                  }}
                >
                  <span className="nav-link-label">{item.label}</span>
                  <span className="nav-triangle" aria-hidden="true" />
                </a>
              </li>
            )
          })}
        </ul>

        {/* ── Narrow-screen control ── */}
        <button
          type="button"
          className="nav-menu-btn"
          aria-expanded={open}
          aria-controls="nav-dropdown"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-menu-label">{isNarrow ? activeItem.label : 'MENU'}</span>
          <span className="nav-menu-triangle" aria-hidden="true" />
        </button>

        <div
          id="nav-dropdown"
          className={`nav-dropdown${open ? ' is-open' : ''}`}
          hidden={!open}
        >
          <ul className="nav-dropdown-list" role="list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav-dropdown-link${
                    item.id === activeId ? ' is-active' : ''
                  }`}
                  aria-current={item.id === activeId ? 'location' : undefined}
                  onClick={() => handleSelect(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
