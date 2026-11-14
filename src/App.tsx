import { useState, useEffect, useRef, useCallback } from 'react'
import SiteNav, { type NavItem } from './components/nav/SiteNav'
import SiteCursor from './components/cursor/SiteCursor'
import HomePage from './pages/HomePage'
import WorksPage from './pages/WorksPage'
import DirectoryPage from './pages/DirectoryPage'
import FaqPage from './pages/FaqPage'
import { usePath, navigate } from './router'
import {
  SECTION_IDS,
  SECTION_LABELS,
  SECTION_ROUTES,
  sectionIdFromPath,
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

type HeaderTheme = {
  tone: 'dark' | 'light'
  surface: 'ink' | 'paper' | 'green'
}

function getHeaderTheme(): HeaderTheme {
  const sections: Array<[string, HeaderTheme]> = [
    ['.ab-root', { tone: 'dark', surface: 'paper' }],
    ['.cap-root', { tone: 'dark', surface: 'paper' }],
    ['.ts-root', { tone: 'light', surface: 'green' }],
    ['.wk-root', { tone: 'light', surface: 'ink' }],
    ['.pr-root', { tone: 'light', surface: 'ink' }],
    ['.ct-root', { tone: 'light', surface: 'ink' }],
  ]
  const probeX = window.innerWidth / 2
  const probeY = Math.min(80, window.innerHeight * 0.12)

  for (const [selector, tone] of sections) {
    const section = document.querySelector<HTMLElement>(selector)
    if (!section) continue
    const rect = section.getBoundingClientRect()
    if (
      rect.top <= probeY &&
      rect.bottom > probeY &&
      rect.left <= probeX &&
      rect.right > probeX
    ) {
      return tone
    }
  }

  return { tone: 'light', surface: 'ink' }
}

function getAnchorContext(): AnchorContext {
  return {
    aboutStage: document.querySelector('.stg-track-wrap'),
    worksStage: document.querySelector('.wc-wrap'),
    aboutPanel: document.querySelector('.ab-root'),
    capabilitiesPanel: document.querySelector('.cap-root'),
    techPanel: document.querySelector('.ts-root'),
    worksPanel: document.querySelector('.wk-root'),
    pricingPanel: document.querySelector('.pr-root'),
    contactPanel: document.querySelector('.ct-root'),
  }
}

export default function App() {
  const path = usePath()
  const isWorksPage = path === '/works' || path === '/work'
  const isDirectoryPage = path === '/directory'
  const isFaqPage = path === '/faq'
  const isStandaloneDoc = isWorksPage || isDirectoryPage || isFaqPage

  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    return sectionIdFromPath(path) ?? 'home'
  })
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>({
    tone: 'light',
    surface: 'ink',
  })
  const rafScrollRef = useRef(0)
  const isInitialMountRef = useRef(true)

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
      const targetRoute = SECTION_ROUTES[sectionId] ?? '/'
      if (isStandaloneDoc) {
        navigate(targetRoute)
      } else {
        if (sectionId === 'work') {
          navigate('/works')
        } else {
          setActiveSection(sectionId)
          window.history.replaceState(null, '', targetRoute)
          scrollToSection(sectionId)
        }
      }
    },
    [isStandaloneDoc, scrollToSection],
  )

  // ── Active section detection for homepage ──
  useEffect(() => {
    if (isStandaloneDoc) return

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        rafScrollRef.current = requestAnimationFrame(() => {
          ticking = false
          const ctx = getAnchorContext()
          const currentId = getActiveSection(ctx)
          const nextTheme = getHeaderTheme()
          setActiveSection((prev) => (prev !== currentId ? currentId : prev))
          setHeaderTheme((prev) =>
            prev.tone === nextTheme.tone && prev.surface === nextTheme.surface
              ? prev
              : nextTheme,
          )
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
  }, [isStandaloneDoc])

  // ── Handle incoming path or hash when mounting on homepage ──
  useEffect(() => {
    if (isStandaloneDoc) return

    const initialSection = sectionIdFromPath(path)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      if (initialSection && initialSection !== 'home') {
        const id = requestAnimationFrame(() => {
          scrollToSection(initialSection)
        })
        return () => cancelAnimationFrame(id)
      }
    } else if (initialSection) {
      setActiveSection(initialSection)
      const id = requestAnimationFrame(() => {
        scrollToSection(initialSection)
      })
      return () => cancelAnimationFrame(id)
    }

    const hash = window.location.hash
    if (!hash) return

    const targetSection = sectionIdFromHash(hash)
    if (!targetSection) return

    // Allow layout and DOM to settle before calculating anchors
    const id = requestAnimationFrame(() => {
      scrollToSection(targetSection)
    })
    return () => cancelAnimationFrame(id)
  }, [isStandaloneDoc, path, scrollToSection])

  const activeNavId = isWorksPage
    ? 'work'
    : isDirectoryPage || isFaqPage
      ? ''
      : activeSection

  return (
    <>
      {/* Editorial Custom Cursor (persists across pages) */}
      <SiteCursor />

      {/* Primary Site Navigation (persists across pages) */}
      <SiteNav
        items={NAV_ITEMS}
        activeId={activeNavId}
        onSelect={handleNavSelect}
        tone={isWorksPage ? 'dark' : isDirectoryPage || isFaqPage ? 'light' : headerTheme.tone}
        surface={isWorksPage ? 'paper' : isDirectoryPage || isFaqPage ? 'ink' : headerTheme.surface}
        archive={isWorksPage}
      />

      {/* Pages: unmounts / mounts per path */}
      {isWorksPage ? (
        <WorksPage />
      ) : isDirectoryPage ? (
        <DirectoryPage />
      ) : isFaqPage ? (
        <FaqPage />
      ) : (
        <HomePage currentRoute={path} />
      )}
    </>
  )
}
