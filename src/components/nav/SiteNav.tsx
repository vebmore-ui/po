import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import './nav.css'

export interface NavItem {
  id: string
  label: string
}

interface Props {
  items: NavItem[]
  activeId: string
  onSelect: (id: string) => void
}

export default function SiteNav({ items, activeId, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Derived state pattern: close dropdown when activeId changes without triggering an extra render loop
  const [prevActiveId, setPrevActiveId] = useState(activeId)
  if (activeId !== prevActiveId) {
    setPrevActiveId(activeId)
    setOpen(false)
  }

  useEffect(() => {
    const mqNarrow = window.matchMedia('(max-width: 900px)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncNarrow = () => setIsNarrow(mqNarrow.matches)
    const syncMotion = () => setReducedMotion(mqMotion.matches)

    syncNarrow()
    syncMotion()

    mqNarrow.addEventListener('change', syncNarrow)
    mqMotion.addEventListener('change', syncMotion)
    return () => {
      mqNarrow.removeEventListener('change', syncNarrow)
      mqMotion.removeEventListener('change', syncMotion)
    }
  }, [])

  /* Close dropdown on outside click or Escape */
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  /**
   * Visual order: active item leftmost (index 0), then the rest in canonical order.
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
    <header className="nav-header">
      {/* LEFT slot reserved for the wordmark / logo */}
      <div className="nav-logo-slot" aria-hidden="true">
        {/* LOGO GOES HERE */}
      </div>

      {/* TOP RIGHT nav pill */}
      <nav ref={rootRef} className="nav-pill" aria-label="Primary">
        {/* Wide screens: full pill with reordering */}
        <ul className="nav-list" role="list">
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <motion.li
                key={item.id}
                layout
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 350, damping: 28 }
                }
                className={`nav-item${active ? ' is-active' : ''}`}
                style={{ order: orderIndex(item.id) }}
              >
                <a
                  className="nav-link"
                  href={`#${item.id}`}
                  aria-current={active ? 'location' : undefined}
                  onClick={(e) => {
                    if (e.defaultPrevented) return
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                    e.preventDefault()
                    handleSelect(item.id)
                  }}
                >
                  <span className="nav-link-sizer" aria-hidden="true">
                    {item.label}
                  </span>
                  <span className="nav-link-text">{item.label}</span>
                  {active && <span className="nav-triangle" aria-hidden="true" />}
                </a>
              </motion.li>
            )
          })}
        </ul>

        {/* <= 900px screens: active word + MENU toggle */}
        {isNarrow && (
          <div className="nav-mobile-bar">
            <div className="nav-mobile-active">
              <span className="nav-mobile-active-label">{activeItem.label}</span>
              <span className="nav-triangle" aria-hidden="true" />
            </div>
            <button
              type="button"
              className="nav-menu-btn"
              aria-expanded={open}
              aria-controls="nav-dropdown"
              onClick={() => setOpen((prev) => !prev)}
            >
              MENU
            </button>
          </div>
        )}

        {/* Mobile dropdown */}
        {open && (
          <div id="nav-dropdown" className="nav-dropdown">
            <ul className="nav-dropdown-list" role="list">
              {items.map((item) => {
                const active = item.id === activeId
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`nav-dropdown-link${active ? ' is-active' : ''}`}
                      aria-current={active ? 'location' : undefined}
                      onClick={() => handleSelect(item.id)}
                    >
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
