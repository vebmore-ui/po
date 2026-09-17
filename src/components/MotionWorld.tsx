import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
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
type Props = {
  /**
   * 0..1 progress of Stage C's own journey. Supplied by App from the page's
   * scroll *past the end of Act I*, so the world scrubs while it is already the
   * thing on screen — it never needs scroll length of its own.
   */
  progress: number
}

export default function MotionWorld({ progress }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  // The journey's timeline, kept across renders so the progress effect can seek
  // it. GSAP owns the tween; this is only a handle to it.
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)

  // The world is a FIXED layer, not a section in the flow. It sits behind the
  // curtain from the moment the curtain's zone begins, so the curtain simply
  // uncovers it — there is nothing below to scroll down into. Its scroll budget
  // is Act I's own spacer, which is why this component contributes no height to
  // the page at all.
  //
  // The journey is therefore driven by the `progress` prop rather than a
  // ScrollTrigger: App already owns the one place that converts scroll into
  // progress, and reusing that keeps the two acts on a single clock.

  // A short fade so the canvas is not revealed mid-frame, independent of scroll.
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

      if (reduced) {
        // Reduced motion: no travel through the line and no canvas choreography.
        // Every statement is shown at rest and legible, so the world is still
        // readable — it simply does not move.
        gsap.set(words, { opacity: 1, yPercent: 0 })
        gsap.set(metaEls, { opacity: 1, y: 0 })
        stageEls.forEach((s) => s.setAttribute('data-ready', 'true'))
        const track = el.querySelector<HTMLElement>('.mw-line-track')
        if (track) gsap.set(track, { x: window.innerWidth / 2 - (words[0]?.offsetWidth ?? 0) / 2 })
        return
      }

      // A paused timeline, not a ScrollTrigger: App supplies `progress` and the
      // effect below seeks this timeline to it. The timeline is the single
      // source of the journey's shape; scroll only says where in it we are.
      const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true })
      tlRef.current = tl

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
      // EVERY word gets the SAME beat: a plain rise-and-settle as it crosses the
      // centre. No rotation, no scale, no entry from the side — the only motion
      // is the shared leftward travel of the track plus this one settle, so the
      // four statements read as one consistent line rather than four separate
      // directional effects. The per-word tweens are therefore derived from one
      // shape, applied to each word at the moment it actually reaches centre.
      words.forEach((word, i) => {
        tl.fromTo(word,
          { yPercent: 18, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: beat * 1.4, ease: 'power2.out' },
          centreBeat(i))
      })

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

      // The line must be measured with the real fonts, so the first seek happens
      // after they land; until then the track sits at its resting offset.
      tl.invalidate()
    }, el)

    // Fonts arrive after first paint and change the line's width, so the
    // timeline's measured positions are re-derived once they are ready. Without
    // this the words would animate at the moments the fallback font implied.
    const invalidate = () => {
      const tl = tlRef.current
      if (tl) tl.invalidate()
    }
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    fonts?.ready.then(invalidate).catch(() => {})
    const t = window.setTimeout(invalidate, 400)

    return () => {
      window.clearTimeout(t)
      tlRef.current = null
      ctx.revert()
    }
  }, [reduced])

  // Scroll only drives the timeline: the world is a fixed layer, so its progress
  // is handed in rather than measured here. A scrub-smoothed follow keeps the
  // motion fluid without adding a second source of truth for the position.
  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    if (reduced) return
    gsap.to(tl, { time: tl.duration() * Math.min(Math.max(progress, 0), 1), duration: 0.35, ease: 'power1.out', overwrite: true })
  }, [progress, reduced])

  // A FIXED full-viewport layer sitting behind the curtain. It adds no height to
  // the page, so nothing has to be scrolled past to reach it: the world is
  // already there, and the curtain lifting is the only thing that reveals it.
  return (
    <div
      ref={root}
      id="motion-world"
      className="mw-root"
      aria-label="You Dream, We Design, We Develop, We Deliver."
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
    </div>
  )
}
