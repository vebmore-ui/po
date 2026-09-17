import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionConfig, motion, useReducedMotion } from 'motion/react'
import {
  CompassRings,
  CoordinateMark,
  DirectionArrow,
  OrbitCluster,
  RoutePath,
  ScaleMarks,
  SweepArc,
} from './motion-world/motionObjects'

gsap.registerPlugin(ScrollTrigger)

const LINES = [
  { lead: 'You', word: 'Dream,' },
  { lead: 'We', word: 'Design,' },
  { lead: 'We', word: 'Develop,' },
  { lead: 'We', word: 'Deliver.' },
]


/**
 * Stage C — the black motion-design world.
 *
 * One giant black canvas: the section is a scroll-length track, the inner
 * viewport frame is pinned, and a single scrubbed GSAP timeline moves every word
 * and graphic through it. Scroll up reverses the same timeline, so the journey
 * is finite and fully reversible. Supporting SVG objects are driven by Motion
 * springs, which own only their own transforms — GSAP never touches them.
 */
export default function MotionWorld() {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)

  // The section's height is a viewport expression, not a measurement: resizing
  // the section from inside it moves the ground under the scroller and freezes
  // the page. `--mw-scroll` is how many screens of scroll the journey takes, and
  // covers the line's travel with a screen at each end.
  // The section's height sets how much scroll the journey has, so it is derived
  // from the travel the line actually needs: one viewport of horizontal travel
  // per viewport of scroll, plus a viewport to open and close on. A fixed
  // viewport count either starved the later words of scroll or left a long
  // stretch of dead scroll after the last one had settled.
  // Screens of scroll for the journey: the line's travel plus a screen at each
  // end to open and close on. Kept as a viewport expression rather than a
  // measurement — deriving it from the layout inside the section moves the
  // ground under the scroller and freezes the page.
  const worldHeight = '520vh'

  // Stage C must not become visible until the curtains are fully finished: the
  // world mounts behind them and only reveals itself once the iris has opened.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 40)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const el = root.current
    const stage = frame.current
    if (!el || !stage) return

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('.mw-line')
      const stageEls = gsap.utils.toArray<HTMLElement>('[data-stage]')
      const metaEls = gsap.utils.toArray<HTMLElement>('.mw-meta')

      // The section mounts BEHIND the curtain, so its own top has already
      // scrolled past by the time the curtain lifts. Anchoring the range to the
      // top of the document would strand the timeline at progress 0 and the line
      // would never move; anchoring it to where the section actually starts
      // makes the first frame the moment it is uncovered.
      // The scrub range is deliberately SHORTER than the section: the section is
      // sized generously so there is always enough scroll, and the timeline uses
      // as much of it as the line actually needs to cross. Scrubbing across the
      // whole section instead stretched four words over several thousand pixels
      // and the page ran out of scroll before the last one reached the centre.
      const range = () => {
        const vh = window.innerHeight
        // The journey starts when the canvas is actually on screen, not when the
        // section mounts: the section's sticky frame holds the canvas behind the
        // curtain while the hero's own track finishes scrolling past. Starting
        // the range at the section's top left that whole stretch scrolling with
        // the line frozen.
        const start = Math.max(el.offsetTop, 0)
        // One viewport of scroll for every viewport of horizontal travel, plus a
        // screen at each end to hold the opening and closing frames. Scaled by
        // the same ratio the line itself travels, so the timeline ends exactly
        // when the last word has crossed the centre.
        const travelPx = travel()
        // One viewport of scroll per viewport of travel, plus a screen to hold
        // the opening frame. Deliberately not more: the section is sized
        // generously so there is always scroll available, and stretching the
        // timeline across all of it left a long stretch of dead scroll after the
        // last word had already reached the centre.
        const end = Math.min(
          start + travelPx * (vh / window.innerWidth) + vh,
          Math.max(document.documentElement.scrollHeight - vh, start + 1),
        )
        return { start, end }
      }

      if (reduced) {
        // Reduced motion: no travel through the line, just the words legible and
        // a gentle hand-off between them as the section is scrolled.
        gsap.set(words, { opacity: 0.14, yPercent: 0 })
        gsap.set(words[0], { opacity: 1 })
        ScrollTrigger.create({
          trigger: el,
          start: () => range().start,
          end: () => range().end,
          onUpdate: (self) => {
            const active = Math.min(Math.round(self.progress * (words.length - 1)), words.length - 1)
            words.forEach((w, i) => gsap.set(w, { opacity: i === active ? 1 : 0.14 }))
          },
        })
        return
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          // Absolute scroll positions, not `top+=N` offsets. Those are measured
          // from the trigger element's own top, so adding the element's document
          // offset to them counted that offset twice and pushed the whole range
          // far past the end of the page — leaving the scrub stuck at its start.
          trigger: el,
          start: () => range().start,
          end: () => range().end,
          scrub: 0.9,
          // Re-derives every function-based value above (travel, centres) each
          // time the trigger refreshes, so the font loading in after first paint
          // does not leave the line animating to stale positions.
          invalidateOnRefresh: true,
          onRefresh: (self) => self.animation?.invalidate(),
        },
      })

      // ONE LINE, MOVING LEFT. The four statements are laid out side by side as
      // a single horizontal track; scroll translates that track leftwards so each
      // word passes through the centre of the viewport in turn. Nothing enters
      // from a side of its own accord — the line moves, and each word happens to
      // animate as it reaches the middle.
      //
      // `line` is the track; its own travel is what the viewer reads as progress.
      const line = el.querySelector<HTMLElement>('.mw-line-track')
      if (!line) return
      // How far the line must move for its LAST word to reach the centre of the
      // viewport. The line starts with its first word already at the centre (the
      // track is offset by half a viewport at rest), so the distance is simply
      // the gap between the first and last word centres.
      const travel = () => {
        const first = words[0] as HTMLElement | undefined
        const last = words[words.length - 1] as HTMLElement | undefined
        if (!first || !last) return Math.max(line.scrollWidth - window.innerWidth, 1)
        const firstCentre = first.offsetLeft + first.offsetWidth / 2
        const lastCentre = last.offsetLeft + last.offsetWidth / 2
        return Math.max(lastCentre - firstCentre, 1)
      }

      // The track rests so that its FIRST word is centred, which is the frame the
      // journey opens on.
      const restX = () => {
        const first = words[0] as HTMLElement | undefined
        if (!first) return window.innerWidth * 0.5
        return window.innerWidth / 2 - (first.offsetLeft + first.offsetWidth / 2)
      }
      gsap.set(words, { xPercent: 0, yPercent: 0, rotate: 0, scale: 1, opacity: 1 })
      gsap.set(line, { x: restX() })

      // The track moves left across the whole timeline: this single tween is the
      // spine every per-word animation hangs off. Its duration is derived from
      // how much travel there actually is, so a wider line takes proportionally
      // more scroll rather than crawling.
      const SPAN = 8
      tl.to(line, { x: () => restX() - travel(), duration: SPAN, ease: 'none' }, 0)

      // Each word animates over the stretch of the timeline where it is ACTUALLY
      // crossing the centre of the screen. The position is derived from the
      // word's real offset inside the track, so a longer or shorter word still
      // gets its animation at the right moment instead of at an even split.
      // These are measured lazily, on every refresh, rather than captured once:
      // the line's width depends on the web fonts, which arrive after first
      // paint. Measuring up front baked in the fallback font's layout, so the
      // later statements animated at the wrong moments.
      // A word animates as it crosses the centre. The last word reaches centre
      // exactly at the end of the line's travel, so its beat is clamped strictly
      // inside the timeline — landing it ON the final position meant the tween
      // only began once the timeline was already over, and the closing statement
      // never animated at all.
      const centreBeat = (i: number) => {
        const word = words[i]
        const first = words[0] as HTMLElement | undefined
        if (!word || !first) return 0
        const total = travel()
        const firstCentre = first.offsetLeft + first.offsetWidth / 2
        const wordCentre = word.offsetLeft + word.offsetWidth / 2
        // How far into the line's travel this word reaches the centre.
        const fraction = Math.min(Math.max((wordCentre - firstCentre) / total, 0), 1)
        // Kept strictly inside the timeline, with room for the tween to play.
        return fraction * (SPAN - beat * 1.6)
      }
      const beat = SPAN / LINES.length
      // Word 0 — "You Dream," settles down from a slight rise and swells.
      tl.fromTo(words[0],
        { yPercent: 14, scale: 1.1, opacity: 0.2 },
        { yPercent: 0, scale: 1, opacity: 1, duration: beat * 1.4, ease: 'power2.out' }, centreBeat(0))
      // Word 1 — "We Design," tips in from a rotation and lifts through.
      tl.fromTo(words[1],
        { rotate: 12, yPercent: 22, scale: 0.86, opacity: 0.15 },
        { rotate: 0, yPercent: 0, scale: 1, opacity: 1, duration: beat * 1.4, ease: 'power3.out' }, centreBeat(1))
      // Word 2 — "We Develop," rises to full scale from small.
      tl.fromTo(words[2],
        { scale: 0.72, yPercent: 30, opacity: 0.15 },
        { scale: 1, yPercent: 0, opacity: 1, duration: beat * 1.4, ease: 'power3.out' }, centreBeat(2))
      // Word 3 — "We Deliver." arrives with a slight counter-rotation and a
      // letter-spacing settle, then holds as the closing statement.
      tl.fromTo(words[3],
        { rotate: -8, yPercent: 26, scale: 1.18, opacity: 0.15, letterSpacing: '0.06em' },
        { rotate: 0, yPercent: 0, scale: 1, opacity: 1, letterSpacing: '0em', duration: beat * 1.5, ease: 'power3.out' }, centreBeat(3))

      // ---------------------------------------------------------------------
      // OBJECTS. The brief asks for motion that is physical and spatial: things
      // crossing in front of and behind the type, drawn paths, parallax, and
      // depth. Each object therefore travels on its OWN timeline that overlaps
      // the others, rather than every object drifting in lockstep.
      // ---------------------------------------------------------------------

      // Behind the type: the compass rings turn slowly while scaling, so they
      // read as a distant layer rather than a graphic on the same plane.
      tl.to('[data-stage="0"]', { rotate: 300, scale: 1.15, duration: SPAN, ease: 'none' }, 0)

      // In front of the type: the orbit cluster crosses the whole viewport from
      // right to left, passing OVER the words as they animate underneath it.
      tl.fromTo('[data-stage="1"]',
        { x: () => window.innerWidth * 0.55, yPercent: 10 },
        { x: () => -window.innerWidth * 0.85, yPercent: -14, duration: SPAN, ease: 'none' }, 0)

      // Behind: the coordinate mark rotates a half turn and drifts opposite to
      // the line, giving the canvas a counter-motion against the typography.
      tl.to('[data-stage="2"]', { rotate: 200, xPercent: 18, duration: SPAN, ease: 'none' }, 0)

      // In front: the arrow sweeps across the words early in the journey and
      // leaves the frame, so it is seen crossing and then gone.
      tl.fromTo('[data-stage="3"]',
        { x: () => window.innerWidth * 0.35 },
        { x: () => -window.innerWidth * 1.2, duration: SPAN * 0.45, ease: 'power1.inOut' }, 0)

      // Behinc, slowest layer: the route path drifts a short distance so it
      // reads as the furthest plane.
      tl.to('[data-stage="4"]', { x: () => -window.innerWidth * 0.28, duration: SPAN, ease: 'none' }, 0)

      // In front, mid-journey: the scale marks descend past the type.
      tl.fromTo('[data-stage="5"]',
        { y: () => -window.innerHeight * 0.5 },
        { y: () => window.innerHeight * 0.5, rotate: 90, duration: SPAN * 0.75, ease: 'power1.inOut' }, SPAN * 0.2)

      // Behind, closing: the sweep arc turns through the final statement.
      tl.to('[data-stage="6"]', { rotate: -140, scale: 0.8, duration: SPAN, ease: 'none' }, 0)

      // ---------------------------------------------------------------------
      // SVG PATH DRAWING. The route and both accent rings draw themselves on as
      // the line travels, rather than being present from the first frame.
      // ---------------------------------------------------------------------
      const draws = gsap.utils.toArray<SVGGeometryElement>('[data-draw]')
      draws.forEach((path) => {
        const len = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 0
        if (!len) return
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        tl.to(path, { strokeDashoffset: 0, duration: SPAN * 0.7, ease: 'power1.inOut' }, SPAN * 0.15)
      })

      // The small dot follows the route as it is drawn: the brief's
      // "objects following a path", tied to the same stretch of scroll.
      const dot = el.querySelector<SVGElement>('.mw-path-dot')
      const route = el.querySelector<SVGGeometryElement>('[data-draw="dash"]')
      if (dot && route && typeof route.getTotalLength === 'function') {
        const total = route.getTotalLength()
        tl.to({ t: 0 }, {
          t: 1,
          duration: SPAN * 0.7,
          ease: 'power1.inOut',
          onUpdate() {
            const pt = route.getPointAtLength(this.targets()[0].t * total)
            dot.setAttribute('cx', String(pt.x))
            dot.setAttribute('cy', String(pt.y))
          },
        }, SPAN * 0.15)
      }

      gsap.set(metaEls, { opacity: 0, y: 16 })
      // stage elements fade from their authored CSS opacity; nothing else to do.
      stageEls.forEach((s) => s.setAttribute('data-ready', 'true'))
    }, el)

    // The section's own height is added to the page when it mounts, so every
    // range measured before that is stale: the trigger would be built against a
    // page that did not yet contain this section, pinning the scrub to the wrong
    // stretch of scroll and leaving the line frozen for thousands of pixels.
    // Two refreshes — one on the next frame, one after fonts/layout settle —
    // give the ranges their real values.
    const id1 = requestAnimationFrame(() => ScrollTrigger.refresh())
    const id2 = window.setTimeout(() => ScrollTrigger.refresh(), 400)

    return () => {
      cancelAnimationFrame(id1)
      window.clearTimeout(id2)
      ctx.revert()
    }
  }, [reduced])

  // The line must cross the whole viewport, so the section is sized for that
  // travel rather than for a count of screens: this height IS the scroll range
  // the timeline scrubs through, and the sticky frame holds the canvas while it
  // passes. Too little and the later words never reach the centre.
  return (
    <section
      ref={root}
      id="motion-world"
      className="mw-root"
      aria-label="You Dream, We Design, We Develop, We Deliver."
      style={{ height: worldHeight, background: '#000' }}
    >
      <div ref={frame} className={`mw-frame${ready ? ' is-ready' : ''}`}>
        <MotionConfig reducedMotion="user">
          {/* Canvas graphics — Motion owns these transforms exclusively. */}
          <div className="mw-obj" data-stage="0" style={{ top: '6%', left: '-12%', opacity: 0.55 }}>
            <CompassRings size={760} />
          </div>
          <motion.div
            className="mw-obj"
            data-stage="1"
            style={{ bottom: '14%', right: '-6%' }}
            initial={{ opacity: 0, scale: 0.82 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ root: frame, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          >
            <OrbitCluster size={340} />
          </motion.div>
          <div className="mw-obj mw-route" data-stage="4">
            <RoutePath hue="muted" />
          </div>
          <motion.div
            className="mw-obj"
            data-stage="5"
            style={{ top: '18%', right: '8%', opacity: 0 }}
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ScaleMarks count={9} />
          </motion.div>
          <div className="mw-obj" data-stage="2" style={{ bottom: '10%', left: '12%', opacity: 0.5 }}>
            <CoordinateMark size={228} />
          </div>
          <div className="mw-obj" data-stage="3" style={{ top: '12%', left: '16%', opacity: 0.7 }}>
            <DirectionArrow width={320} angle={-18} />
          </div>
          <div className="mw-obj" data-stage="6" style={{ top: '8%', right: '14%', opacity: 0.35 }}>
            <SweepArc size={440} />
          </div>

          {/* ONE horizontal line of statements. Scroll translates this track
              leftwards; each statement animates as it passes through centre. */}
          <div className="mw-words">
            <div className="mw-line-track">
              {LINES.map((line, i) => (
                <h2 className="mw-line" data-index={i} key={line.word}>
                  <span className="mw-lead">{line.lead}</span>{' '}
                  <em className="mw-word">{line.word}</em>
                </h2>
              ))}
            </div>
          </div>

        </MotionConfig>
      </div>
    </section>
  )
}
