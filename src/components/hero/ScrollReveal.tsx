import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollReveal.css'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollReveal() {
  const whiteRevealRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const whiteReveal = whiteRevealRef.current
    const heroContainer = document.querySelector('.hero-container')
    if (!whiteReveal || !heroContainer) return

    const lines = heroContainer.querySelectorAll('.text-line')
    const compass = heroContainer.querySelector('.compass-wrapper')

    const ctx = gsap.context(() => {
      // Master scroll trigger tied to hero container scroll
      const master = ScrollTrigger.create({
        trigger: heroContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress

          // Phase 1: Lines disappear sequentially (0.0 - 0.35)
          lines.forEach((line, index) => {
            const lineStart = index * 0.07
            const lineEnd = lineStart + 0.1
            let progress = 0
            if (p >= lineEnd) {
              progress = 1
            } else if (p > lineStart) {
              progress = (p - lineStart) / (lineEnd - lineStart)
            }
            gsap.set(line, {
              opacity: 1 - progress,
              y: -30 * progress
            })
          })

          // Phase 2: Compass disappears (0.4 - 0.55)
          let compassProgress = 0
          if (p >= 0.55) {
            compassProgress = 1
          } else if (p > 0.4) {
            compassProgress = (p - 0.4) / 0.15
          }
          if (compass) {
            gsap.set(compass, {
              opacity: 1 - compassProgress,
              y: -30 * compassProgress
            })
          }

          // Phase 3: White background pulls up (0.65 - 0.85)
          let whiteProgress = 0
          if (p >= 0.85) {
            whiteProgress = 1
          } else if (p > 0.65) {
            whiteProgress = (p - 0.65) / 0.2
          }
          gsap.set(whiteReveal, {
            y: `${100 - whiteProgress * 100}%`
          })
        }
      })

      return () => master.kill()
    }, heroContainer)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <div ref={whiteRevealRef} className="white-reveal" />
      <div className="scroll-spacer" />
    </>
  )
}
