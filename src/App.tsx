import { useState, useEffect } from 'react'
import Compass from './components/hero/Compass'
import ScrollTextLines from './components/hero/ScrollTextLines'
import AboutSection from './components/AboutSection'
import './App.css'
import './components/motion-world/about.css'

function getScrollTop() {
  const root = document.getElementById('root')
  const rootTop = root ? root.scrollTop : 0
  return rootTop > 0 ? rootTop : document.documentElement.scrollTop || window.scrollY
}

// Timing for compass initial entrance & text animations
const QUESTION_REVEAL = 1200
const COMPASS_ANIM = 1200

// How many viewports of scroll travel for the compass exit
const HERO_SCROLL_VIEWPORTS = 1.6

function App() {
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

  // Compass section stages:
  // 1. Text lines exit sequentially (0.0 to 0.45)
  // 2. Compass fades out (0.35 to 0.70)
  const textProgress = Math.min(Math.max(heroProgress / 0.45, 0), 1)
  const compassProgress = heroProgress < 0.35 ? 0 : Math.min(Math.max((heroProgress - 0.35) / 0.35, 0), 1)

  // Once hero is fully scrolled past, hide the fixed container
  const heroDone = heroProgress >= 1

  // AboutSection activates as it arrives into view
  const aboutActive = heroProgress >= 0.85

  return (
    <>
      {/* Spacer providing scroll distance for the hero section exit */}
      <div className="scroll-spacer" style={{ height: Math.round(viewport.heroTrack) }} />

      {/* Compass hero: fixed pinned layer that reacts to scroll until scrolled past */}
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
        <ScrollTextLines textProgress={textProgress} animationComplete={animationComplete} />
      </div>

      {/* About section: flows naturally after the hero spacer */}
      <AboutSection active={aboutActive} />
    </>
  )
}

export default App
