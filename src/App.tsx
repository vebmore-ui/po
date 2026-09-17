import { useState, useEffect, useCallback } from 'react'
import Compass from './components/hero/Compass'
import ScrollTextLines from './components/hero/ScrollTextLines'
import vebReveal from './assets/veb-reveal.png'
import VebmoreReveal from './components/hero/VebmoreReveal'
import CurtainsTransition from './components/CurtainsTransition'
import MotionWorld from './components/MotionWorld'
import './App.css'
import './components/motion-world/motionWorld.css'


function getScrollTop() {
  // The scrolling element here is the document itself; #root is only consulted
  // as a fallback in case a future layout makes the app its own scroll box.
  const root = document.getElementById('root')
  const rootTop = root ? root.scrollTop : 0
  return rootTop > 0 ? rootTop : document.documentElement.scrollTop || window.scrollY
}

// Page scroll is one act: the hero lifecycle, then the curtains, then the motion
// world, then the coda. Each phase ends where the next begins, so the sequence
// is continuous and self-correcting on any viewport.
// The compass section keeps its original timing untouched.
const QUESTION_REVEAL = 1200
const COMPASS_ANIM = 1200
// How much scroll the whole first act (compass section + reveal + curtain) runs
// for. Kept tight on purpose: the GSAP world is the destination, so the act must
// not spend more scroll than it needs getting there.
const ACT1_VIEWPORTS = 4.4
// Act I is split into three sequential stretches: the compass section's own
// journey, the mark on the plate it leaves behind, then the curtain. Nothing
// overlaps, so the curtain never sweeps over a live compass.
//
// The curtain gets the last 40% of the act to itself: it has three beats to
// play (columns down, the covered hold, then the lift), and a narrow share made
// those pass in a couple of wheel clicks — the iris jumped from barely open to
// gone, which read as a cut rather than a transition.
const COMPASS_END = 0.3
const ZONE_CURTAIN = 0.6

function App() {
  const [showCompass, setShowCompass] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [, setScrollTick] = useState(0)
  // VEBMORE_REVEAL -> VEBMORE_COMPLETE -> CURTAINS_ACTIVE ->
  // CURTAINS_COMPLETE -> MOTION_WORLD_ACTIVE
  const [curtainsDone, setCurtainsDone] = useState(false)
  // The spacer is the whole of Act I's scroll length: the hero and the curtain
  // are fixed layers and contribute no height of their own, so this element is
  // the only thing that actually gives the act a scroll range. It is kept in
  // step with the viewport, so a resize (or a rotation) never leaves the act
  // with a scroll range that no longer matches its progress maths.
  const [viewport, setViewport] = useState(() => {
    const h = window.innerHeight || 800
    return {
      h,
      span: Math.max(h * ACT1_VIEWPORTS, 1),
      track: Math.max(h * ACT1_VIEWPORTS, 200),
      tail: Math.max(h * 0.2, 80),
    }
  })
  // The VEBMORE mark is a timed entrance: it must play on arrival and must not
  // be held hostage by how fast the page is scrolled.
  const [revealed, setRevealed] = useState(false)

  // Act I's progress span is exactly the scroll its own spacer provides, so its
  // end is precisely reachable: scrolling to the bottom of the track completes
  // the act. Deriving this from the live page height instead would feed back on
  // itself (the page grows when the world mounts, which changes the span, which
  // changes when the world mounts).
  useEffect(() => {
    const measure = () => {
      const h = window.innerHeight || 800
      // Act I's scroll budget, in pixels of travel.
      const span = Math.max(h * ACT1_VIEWPORTS, 200)
      // The spacer provides its own height MINUS the viewport already on screen,
      // so it is sized to `span` plus that viewport — the act's last pixel is then
      // exactly reachable. Note the tail below must not also add scroll: any
      // extra height past this makes the act's own end unreachable, and the
      // curtain's later beats (the covered hold, then the lift) never play.
      const track = span + h
      setViewport({ h, span, track, tail: 0 })
    }
    const id = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', measure)
    }
  }, [curtainsDone, revealed])
  // its own clock and the transition scrubs on scroll, so the two cannot block
  // each other. It stays exposed so the reveal's own timing is observable.
  const handleCurtainsComplete = useCallback(() => setCurtainsDone(true), [])

  useEffect(() => {
    // Scroll progress is derived during render from the real scroll offset; this
    // listener exists only to schedule the re-render that reads it.
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

  // Heaviest element on the page (a ~400 kB mark). It mounts the moment the
  // image to decode is available, independent of scroll.
  useEffect(() => {
    const img = new Image()
    img.src = vebReveal
    const preload = img.decode?.() ?? Promise.resolve()
    let t = 0
    preload.then(
      () => { t = setTimeout(() => setRevealed(true), 0) },
      () => { t = setTimeout(() => setRevealed(true), 0) },
    )
    return () => clearTimeout(t)
  }, [])

  // Act I occupies the first slice of the total scroll; its length in px is the
  // one place that converts page scroll into the hero's progress.
  const heroTrack = viewport.span
  // Raw scroll offset, read during render: the same value the progress maths
  // uses, kept separately because transitions out of Act I need to know where
  // they are in absolute terms (progress saturates, offset does not).
  const scrollTop = getScrollTop()
  const heroProgress = Math.min(Math.max(scrollTop / heroTrack, 0), 1)

  // Everything below is derived from the scroll position, with no latched flags
  // and no timers. Latching was what made the reverse pass glitch: a flag stayed
  // set for a moment after the scroll had already moved back, so the curtain
  // remounted on top of the world and the compass snapped rather than eased.

  // Act I is divided into three zones, in the order the story is told:
  //   compass  the section's own journey: lines, compass, then its plate rising
  //   reveal   the mark plays on the black the plate leaves behind
  //   curtain  the transition crosses into the motion world
  // Each zone is a slice of heroProgress, and every value below is interpolated
  // within its own slice. They do not overlap, so nothing can arrive early.
  const compass = Math.min(heroProgress / COMPASS_END, 1)
  const textProgress = Math.min(Math.max(compass / 0.35, 0), 1)
  const compassProgress = compass < 0.35 ? 0 : Math.min(Math.max((compass - 0.35) / 0.25, 0), 1)
  const whiteProgress = compass < 0.6 ? 0 : Math.min(Math.max((compass - 0.6) / 0.4, 0), 1)
  // The plate has fully risen: the compass section is finished and the black it
  // leaves behind is where the VEBMORE reveal plays. This is the same condition
  // the original used to mount the reveal.
  const plateUp = whiteProgress >= 1
  // How far through the reveal's own zone we are. The mark plays there, on the
  // plate the compass section left, and the curtain does not begin until it is
  // over: starting the curtain inside this window swept it straight over the
  // mark while the mark was still appearing.

  // The curtain is a passage between the two worlds, driven entirely by scroll
  // position so it plays identically on every pass: forward out of the hero,
  // backward into it. It is live from the moment the hero starts leaving until
  // it has finished playing, and the world takes over only at its very end.
  // Ordering is strict: the mark settles first (never cut short), then the hero
  // exits, and only then does the curtain take the scene — never over a live
  // hero. Past the curtain the theme is the motion world.
  // The hero's track saturates at 1 once Act I is behind us, so progress alone
  // cannot tell "mid-transition" from "in the motion world". The boundary is the
  // end of the spacer: before it we are in the transition, after it we are in
  // the world. Both sides are derived from raw scroll, so every pass through
  // behaves the same going down and coming back up.
  // Three zones of Act I, each a pure function of scroll position:
  //   compass   the section plays its own original journey
  //   reveal    the mark plays on the plate the compass section leaves behind
  //   curtain   the curtain crosses between the two worlds
  // Nothing is remembered between renders, so scrolling back walks each zone
  // backwards in the same order, with no pop and no double-mount.
  const inCurtainZone = heroProgress > ZONE_CURTAIN
  const inRevealZone = heroProgress > COMPASS_END
  // The curtain's own progress. It covers the composition, then lifts away to
  // uncover the motion world: the world is already mounted behind it, so the
  // story continues the moment the curtain rises rather than waiting for more
  // scroll. There is no separate scroll needed to reach Stage C.
  const curtainProgress = Math.min(
    Math.max((heroProgress - ZONE_CURTAIN) / (1 - ZONE_CURTAIN), 0),
    1,
  )

  // The composition the curtain falls on: the compass section's own journey,
  // then the mark. Neither is removed while the curtain is up — it covers them
  // and lifts to reveal what is behind, so VEB + MORE stays on screen underneath
  // exactly as it was.
  //
  // The curtain is on screen only while it has something to do. Once it has
  // fully lifted it is unmounted: a fixed, full-screen layer left in the tree
  // sits above the motion world (z-index 900) and hides it completely. Past the
  // end of Act I the hero's progress saturates at 1, so this cannot rely on
  // progress alone — it asks the scroller where it actually is.
  const pastActOne = scrollTop >= viewport.track
  const showCurtains = !pastActOne && heroProgress > ZONE_CURTAIN - 0.06 && curtainProgress < 1
  // The transition ends in three steps, and each one hands the scene to the next:
  //   1. the mark is fully settled (its own animation, on its own clock)
  //   2. the curtain crosses — this only starts once (1) is true
  //   3. the curtain lifts, and the moment it does the composition behind it is
  //      retired so that what the lift uncovers is the motion world, not VEB + MORE
  //
  // Step 3 is why this is not simply "past Act I": the lift happens *inside* the
  // act, so waiting for the act to end left the mark sitting under the world for
  // the whole of the opening stretch of the journey.
  // The mark retires only once the curtain has actually covered it. Gating on
  // the start of the curtain's zone retired it while the columns were still
  // parked above the frame, so img + MORE vanished into plain black and the
  // curtain then fell on nothing.
  //
  // The covered beat begins at `coverIn >= 1` inside the curtain component,
  // which is 55% of its progress — so this waits for that, then retires.
  const columnsLanded = curtainProgress >= 0.55
  const compositionRetired = (columnsLanded && inCurtainZone) || pastActOne
  // The world is behind the curtain from the moment the curtain starts, so the
  // iris/column lift reveals it. It is scroll-derived, so scrolling back puts the
  // curtain over it again.
  const worldReady = inCurtainZone

  return (
    <>
      {/* The first act owns this much scroll: the compass section's own progress,
          the reveal, and the curtain that follows it. */}
      <div className="scroll-spacer" style={{ height: Math.round(viewport.track) }} />
      {/* The compass section: the curtain falls over it and lifts to uncover what
          is behind. It stays mounted while the curtain is up, and is taken out of
          the stack once the curtain has gone — a fixed, full-screen section left
          in place would sit over the motion world and hide it completely. */}
      <div
        className="hero-container"
        style={{
          position: 'fixed',
          inset: 0,
          visibility: compositionRetired ? 'hidden' : 'visible',
        }}
      >
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
            background: '#000000',
            transform: `translateY(${(1 - whiteProgress) * 100}%)`,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* SECTION 2 — the VEBMORE reveal, its own section below the compass one.
          It appears only once that section has finished: the plate has risen
          over the compass and settled, and then the mark plays on the black it
          leaves behind. */}
      {revealed && plateUp && (
        <div
          className="vebmore-reveal-layer"
          style={{ visibility: compositionRetired ? 'hidden' : 'visible' }}
        >
          {/* Re-mounting on re-entry replays the mark's entrance, so scrolling
              back into this section shows the reveal again rather than a still. */}
          {/* Keyed to the zone so re-entering the section replays the mark
              rather than leaving a still frame. */}
          <VebmoreReveal key={inRevealZone ? 'replaying' : 'idle'} />
        </div>
      )}
      {/* The motion world sits BEHIND the curtain: it mounts as soon as the
          curtain's zone begins, so lifting the curtain uncovers it and the story
          continues without any further scrolling. */}
      {worldReady && <MotionWorld />}
      {/* Stage B stays black and layered above the world. The curtain is
          scroll-scrubbed: it falls over the VEB + MORE composition, then lifts
          away to uncover the motion canvas beneath it. */}
      {showCurtains && (
        <CurtainsTransition
          progress={curtainProgress}
          scrollSpan={heroTrack}
          onComplete={handleCurtainsComplete}
        />
      )}
      {/* The tail completes Act I's scroll budget. It is always present: letting
          it collapse when the world mounted changed the page's total height
          mid-journey, which moved every scroll boundary below it and left the
          later statements unreachable. */}
      <div className="mw-tail" aria-hidden="true" style={{ height: Math.round(viewport.tail) }} />
    </>
  )
}

export default App
