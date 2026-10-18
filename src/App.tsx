import { useState, useEffect, useRef, useCallback } from 'react'
import SiteNav, { type NavItem } from './components/nav/SiteNav'
import SiteCursor from './components/cursor/SiteCursor'
import HomePage from './pages/HomePage'
import WorksPage from './pages/WorksPage'
import { usePath, navigate } from './router'
import {
  SECTION_IDS,
  SECTION_LABELS,
  type SectionId,
  getActiveSection,
  getAnchors,
  sectionIdFromHash,
  type AnchorContext,
} from './sectionMap'
import './App.css'

const NAV_ITEMS: NavItem[] = SECTION_IDS.map((id) => ({
  id,
  label: SECTION_LABELS[id],
}))

function getAnchorContext(): AnchorContext {
  return {
    aboutStage: document.querySelector('.stg-track-wrap'),
    worksStage: document.querySelector('.wc-wrap'),
    aboutPanel: document.querySelector('.ab-root'),
    capabilitiesPanel: document.querySelector('.cap-root'),
    techPanel: document.querySelector('.ts-root'),
    worksPanel: document.querySelector('.wk-root'),
    contactPanel: document.querySelector('.ct-root'),
  }
}

export default function App() {
  const path = usePath()
  const isWorksPage = path === '/works'
  const [activeSection, setActiveSection] = useState<SectionId>('home')
  const rafScrollRef = useRef(0)

  // ── Scroll to a specific section anchor ──
  const scrollToSection = useCallback((id: SectionId) => {
    const ctx = getAnchorContext()
    const anchors = getAnchors(ctx)
    const targetY = anchors[id] ?? 0
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: targetY,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [])

  // ── Nav selection handler ──
  const handleNavSelect = useCallback(
    (id: string) => {
      const sectionId = id as SectionId
      if (isWorksPage) {
        if (sectionId === 'home') {
          navigate('/')
        } else {
          navigate(`/#${sectionId}`)
        }
      } else {
        scrollToSection(sectionId)
      }
    },
    [isWorksPage, scrollToSection],
  )

  // ── Active section detection for homepage ──
  useEffect(() => {
    if (isWorksPage) return

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        rafScrollRef.current = requestAnimationFrame(() => {
          ticking = false
          const ctx = getAnchorContext()
          const currentId = getActiveSection(ctx)
          setActiveSection((prev) => (prev !== currentId ? currentId : prev))
        })
      }
    }

    // Run once on mount
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [isWorksPage])

  // ── Handle incoming hash when mounting on homepage ──
  useEffect(() => {
    if (isWorksPage) return

    const hash = window.location.hash
    if (!hash) return

    const targetSection = sectionIdFromHash(hash)
    if (!targetSection) return

    // Allow layout and DOM to settle before calculating anchors
    const id = requestAnimationFrame(() => {
      scrollToSection(targetSection)
    })
    return () => cancelAnimationFrame(id)
  }, [isWorksPage, scrollToSection])

  return (
    <>
      {/* Editorial Custom Cursor (persists across pages) */}
      <SiteCursor />

      {/* Primary Site Navigation (persists across pages) */}
      <SiteNav
        items={NAV_ITEMS}
        activeId={isWorksPage ? 'work' : activeSection}
        onSelect={handleNavSelect}
      />

      {/* Pages: unmounts / mounts per path */}
      {isWorksPage ? <WorksPage /> : <HomePage />}
    </>
  )
}
