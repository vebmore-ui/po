import { useState, useEffect } from 'react'
import Compass from '../components/hero/Compass'
import ScrollTextLines from '../components/hero/ScrollTextLines'
import AboutCapabilitiesStage from '../components/AboutCapabilitiesStage'
import WorksContactStage from '../components/WorksContactStage'
import SEO from '../components/SEO'
import '../components/motion-world/about.css'

function getScrollTop(): number {
  const root = document.getElementById('root')
  const rootTop = root ? root.scrollTop : 0
  return rootTop > 0 ? rootTop : document.documentElement.scrollTop || window.scrollY
}

const QUESTION_REVEAL = 1200
const COMPASS_ANIM = 1200
const HERO_SCROLL_VIEWPORTS = 1.6

export default function HomePage({ currentRoute = '/' }: { currentRoute?: string }) {
  const [showCompass, setShowCompass] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [, setScrollTick] = useState(0)

  const [viewport, setViewport] = useState(() => {
    const h = window.innerHeight || 800
    return {
      h,
      heroTrack: Math.max(h * HERO_SCROLL_VIEWPORTS, 200),
    }
  })

  useEffect(() => {
    const measure = () => {
      const h = window.innerHeight || 800
      const heroTrack = Math.max(h * HERO_SCROLL_VIEWPORTS, 200)
      setViewport({ h, heroTrack })
    }
    const id = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollTick((t) => t + 1)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    const root = document.getElementById('root')
    root?.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      root?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCompass(true)
    }, QUESTION_REVEAL)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showCompass) return
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, COMPASS_ANIM)
    return () => clearTimeout(timer)
  }, [showCompass])

  const scrollTop = getScrollTop()
  const heroProgress = Math.min(Math.max(scrollTop / viewport.heroTrack, 0), 1)

  const textProgress = Math.min(Math.max(heroProgress / 0.45, 0), 1)
  const compassProgress =
    heroProgress < 0.35 ? 0 : Math.min(Math.max((heroProgress - 0.35) / 0.35, 0), 1)

  const heroDone = heroProgress >= 1
  const aboutActive = heroProgress >= 0.85
  const isHomeRoute = currentRoute === '/' || currentRoute === ''

  return (
    <>
      {/* Route-level dynamic SEO metadata */}
      <SEO path={currentRoute} />

      {/* Spacer providing scroll distance for hero exit */}
      <div className="scroll-spacer" style={{ height: Math.round(viewport.heroTrack) }} />

      {/* Compass hero */}
      <div
        className="hero-container"
        style={{
          position: 'fixed',
          inset: 0,
          visibility: heroDone ? 'hidden' : 'visible',
          zIndex: 1,
        }}
      >
        {showCompass && <Compass compassProgress={compassProgress} />}
        <ScrollTextLines
          textProgress={textProgress}
          animationComplete={animationComplete}
          isHeroH1={isHomeRoute}
        />
      </div>

      {/* About + Capabilities + Tech Stack pinned stage */}
      <AboutCapabilitiesStage aboutActive={aboutActive} currentRoute={currentRoute} />

      {/* Works → Contact pinned stage */}
      <WorksContactStage currentRoute={currentRoute} />
    </>
  )
}

