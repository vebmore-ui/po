import { useState, useEffect } from 'react'
import Compass from './components/hero/Compass'
import ScrollTextLines from './components/hero/ScrollTextLines'
import './App.css'

const TOTAL_SCROLL_HEIGHT = 300

function getScrollProgress() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  if (docHeight <= 0) return 0
  return Math.min(Math.max(scrollTop / docHeight, 0), 1)
}

const QUESTION_REVEAL = 1200
const COMPASS_ANIM = 1200

function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showCompass, setShowCompass] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollProgress(getScrollProgress())
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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

  const textProgress = Math.min(Math.max(scrollProgress / 0.35, 0), 1)
  const compassProgress = scrollProgress < 0.35 ? 0 : Math.min(Math.max((scrollProgress - 0.35) / 0.25, 0), 1)
  const whiteProgress = scrollProgress < 0.6 ? 0 : Math.min(Math.max((scrollProgress - 0.6) / 0.4, 0), 1)

  return (
    <>
      <div className="scroll-spacer" style={{ height: `${TOTAL_SCROLL_HEIGHT}vh` }} />
      <div className="hero-container" style={{ position: 'fixed', inset: 0 }}>
        {showCompass && <Compass compassProgress={compassProgress} />}
        <ScrollTextLines textProgress={textProgress} animationComplete={animationComplete} />
        <div
          className="white-bg"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '100%',
            background: '#ffffff',
            transform: `translateY(${(1 - whiteProgress) * 100}%)`,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  )
}

export default App