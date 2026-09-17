import { useState, useEffect, useCallback } from 'react'
import Compass from './components/hero/Compass'
import ScrollTextLines from './components/hero/ScrollTextLines'
import vebReveal from './assets/veb-reveal.png'
import VebmoreReveal from './components/hero/VebmoreReveal'
import CurtainsTransition from './components/CurtainsTransition'
import MotionWorld from './components/MotionWorld'
import PixelizeTransition from './components/PixelizeTransition'
import AboutSection from './components/AboutSection'
import './App.css'
import './components/motion-world/motionWorld.css'
import './components/motion-world/about.css'


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
// Stage C's scroll budget, in viewports. The motion world is a FIXED layer with
// no height of its own, so this is the scroll attached to the end of Act I's
// spacer that drives its timeline. It is deliberately a separate number: Act I's
// own timing (and therefore the curtain's) stays exactly as it was, and the world
// simply gets a journey of its own after it.
const ACT3_VIEWPORTS = 3.6
// Act IV's scroll budget: the pixelize seam and the arrival of the About
// section. The About section is a REAL section in the flow (it is paper, not a
// fixed overlay like the world), so it supplies its own viewport of height; this
// adds the transition stretch on top of it. Kept separate for the same reason as
// ACT3: the earlier acts' timing must not move.
const ACT4_VIEWPORTS = 1.6
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
      // Act I's track PLUS Stage C's own journey: the fixed world layer
      // contributes no height, so the whole scroll the page has must be declared
      // here or the world's timeline would have nothing to scrub through.
      track: Math.max(h * (ACT1_VIEWPORTS + ACT3_VIEWPORTS), 200),
      worldSpan: Math.max(h * ACT3_VIEWPORTS, 1),
      pixelSpan: Math.max(h * ACT4_VIEWPORTS, 1),
      tail: 0,
    }
  })
  // The VEBMORE mark is a timed entrance: it must play on arrival and must not
  // be held hostage by how fast the page is scrolled.
  const [revealed, setRevealed] = useState(false)
  // The mark's own entrance reports completion by setting this to the zone it
  // completed in. Storing the zone rather than a plain boolean means leaving and
  // re-entering the reveal automatically re-arms it — no effect and no latching,
  // which keeps this consistent with the rest of the act's scroll-derived state.
  const [revealDoneInZone, setRevealDoneInZone] = useState(false)
  // Act I's progress span is exactly the scroll its own spacer provides, so its
  // end is precisely reachable: scrolling to the bottom of the track completes
  // the act. Deriving this from the live page height instead would feed back on
  // itself (the page grows when the world mounts, which changes the span, which
  // changes when the world mounts).
  useEffect(() => {
    const measure = () => {
      const h = window.innerHeight || 800
      // Act I's scroll budget, in pixels of travel. This is unchanged: the
      // compass, the reveal and the curtain keep their exact original timing.
      const span = Math.max(h * ACT1_VIEWPORTS, 200)
      // Stage C's budget, appended AFTER Act I's. A fixed world layer contributes
      // no height, so this scroll exists only because the spacer declares it.
      const worldSpan = Math.max(h * ACT3_VIEWPORTS, 1)
      // Act IV's transition stretch. The About section below supplies its own
      // viewport of real height, so only the seam is declared here.
      const pixelSpan = Math.max(h * ACT4_VIEWPORTS, 1)
      // The spacer provides its own height MINUS the viewport already on screen,
      // so it is sized to `span` plus that viewport — the act's last pixel is then
      // exactly reachable. The later acts' budgets are added on top, so the page's
      // scroll runs to the end of all of them.
      const track = span + worldSpan + pixelSpan + h
      setViewport({ h, span, track, worldSpan, pixelSpan, tail: 0 })
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
  // The reveal reports when its last beat (the mark's flip into place) has
  // settled. Only then does the page become scrollable again.
  const handleRevealComplete = useCallback(() => setRevealDoneInZone(true), [])
  // Fired when a fresh reveal mounts. The reveal is only mounted inside its own
  // zone, so a mount means the viewer has just arrived — the flag is cleared to
  // arm the lock. This is the reset that makes a second pass replay the mark
  // rather than silently skipping it, and it keeps the reset on the same event
  // that starts the animation instead of on a separate scroll threshold.
  const handleRevealStart = useCallback(() => setRevealDoneInZone(false), [])

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
  // Act I ends at the end of its OWN span, not at the end of the page: the page
  // now also carries Stage C's scroll, so gating on the full track would leave
  // the hero and curtain mounted for the whole of the world's journey and hide it
  // completely. This is the boundary the curtain is aiming for.
  const actOneEnd = viewport.span + 2
  const pastActOne = scrollTop >= actOneEnd
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
  // The composition stays up while the curtain comes DOWN over it, and only
  // leaves once the frame is genuinely fully covered.
  //
  // The columns are STAGGERED, so "the curtain is falling" and "the frame is
  // covered" are not the same moment. Inside the curtain component each column
  // finishes at coverIn >= 1, which is curtainProgress 0.55; the lift only begins
  // at 0.78. Gating the retirement on anything before 0.55 removes the mark while
  // the later columns are still a third of the way down the frame, which is
  // exactly what was happening — the mark vanished with three of the seven
  // columns still in flight, so the curtain appeared to fall onto nothing.
  //
  // Retiring at 0.55 (the last column landing) is still one frame early by the
  // time the browser paints, so the mark is held a little past it — comfortably
  // inside the covered stretch, and well before the lift at 0.78 begins to reveal
  // anything. Past Act I retires it too, which keeps the boundary reachable at
  // the very end of the act.
  const columnsDown = curtainProgress >= 0.62
  const compositionRetired = (columnsDown && inCurtainZone) || pastActOne
  // The world is behind the curtain from the moment the curtain starts, so the
  // iris/column lift reveals it. It is scroll-derived, so scrolling back puts the
  // curtain over it again.
  //
  // The world is a FIXED LAYER that mounts here and stays mounted: it sits behind
  // the curtain and is revealed by it, rather than living further down the page.
  // Mounting it a touch BEFORE the curtain zone means it is already rendered
  // when the first column lands, so the lift uncovers a live canvas rather than
  // a black gap that fills in a frame later.
  const worldReady = heroProgress > ZONE_CURTAIN - 0.12
  // Stage C's own journey. The world is a fixed layer with no height of its own,
  // so its scroll budget is provided by Act I's spacer (see `ACT3_VIEWPORTS`)
  // rather than by a section further down the page. Progress is therefore read
  // from raw scroll PAST the act's own track: heroProgress saturates at 1 once
  // Act I is behind us, so it cannot express "how far into the world we are".
  const worldScroll = Math.max(scrollTop - viewport.span, 0)
  const worldProgress = Math.min(worldScroll / Math.max(viewport.worldSpan, 1), 1)

  // ---- Act IV: the pixelize seam, then the About section -------------------
  // The seam begins exactly where the world's own journey ends, so it cannot
  // start while the world is still travelling. It is read from the same raw
  // scroll as everything else, which is what makes it reversible: there is no
  // separate trigger to fire twice and no state to get out of step.
  const pixelScroll = Math.max(scrollTop - viewport.span - viewport.worldSpan, 0)
  // The seam's own budget. It runs over the whole stretch rather than a slice of
  // it, so the mosaic resolves at the same rate the About section rises behind
  // it: the two finish together instead of the pixels snapping over early and
  // leaving the paper to arrive on its own.
  const pixelProgress = Math.min(pixelScroll / Math.max(viewport.pixelSpan, 1), 1)
  // The About section's content begins as the mosaic is nearly resolved, so the
  // first beat of copy lands while the last pixels are still settling rather than
  // after a dead beat of plain white.
  const aboutActive = pixelProgress >= 0.72
  // THE WORLD IS OVER ONCE THE PIXELIZE HAS COVERED IT.
  // The mosaic is opaque and resolves to white, so the moment it has done its
  // work the black canvas behind it is dead weight — and worse, it is a FIXED
  // layer, so leaving it mounted let the restored black show through again the
  // further the page was scrolled. The pixelize is what makes the screen white;
  // after it, nothing black may remain in the stack.
  //
  // The seam is live once the world's journey is over, and it stays up until the
  // About section has taken the frame. It is deliberately NOT gated on the world
  // being mounted: the world is retired at the very moment the seam resolves, so
  // tying the two together would unmount both in the same frame and leave a hole.
  // They are separate lifetimes with one frame of overlap.
  //
  // The end condition is the ABOUT SECTION'S ACTUAL POSITION, not the seam's
  // scroll budget. This is the bug that made black come back: the About section
  // is real flow content sitting AFTER the spacer, so it only reaches the top of
  // the viewport once the spacer's whole height has scrolled past. The seam's own
  // budget ends well before that, so gating on it unmounted the seam while a tall
  // band of black below was still the thing on screen — the mosaic finished, the
  // paper had not arrived, and the only thing left to see was the black tail.
  //
  // The section is the LAST element in the flow, directly after the spacer, so its
  // top edge in document coordinates is simply the spacer's height. It has reached
  // the top of the viewport once the scroll has covered all but one screen of that
  // — which is the same "document offset minus scrollTop" arithmetic every other
  // boundary here uses, and needs no measurement at all.
  const aboutDocTop = viewport.track
  const aboutTopOnScreen = aboutDocTop - scrollTop - viewport.h
  // The paper has taken the frame once its top edge has reached the viewport top.
  const aboutCovering = aboutTopOnScreen <= 1
  const pixelVisible = worldProgress > 0.96 && !aboutCovering
  // `pixelSettled` is the boundary at which black leaves the page for good: the
  // mosaic has resolved to white AND the paper has actually arrived to replace it.
  // Retiring the world here is what stops a later scroll from walking back onto
  // the fixed black canvas — the world adds no height, so without this it stays
  // pinned behind the About section forever and reappears the moment the paper
  // scrolls past it.
  //
  // The seam and the world therefore overlap for exactly the window between the
  // mosaic finishing and the paper arriving, which is the window that was showing
  // black. They are unmounted together, never in separate frames.
  const pixelSettled = aboutCovering
  const worldAlive = worldReady && !pixelSettled

  // ---- Scroll lock while the VEBMORE reveal plays -------------------------
  // The reveal is a timed entrance with no scroll of its own, so the page must
  // not be scrollable until it has finished: otherwise a fast wheel scroll walks
  // straight past it and the mark is never seen. The lock is released the moment
  // the reveal reports completion, so the journey continues with no extra click.
  // The lock engages as soon as the viewer ENTERS the reveal's zone, not when the
  // reveal merely becomes eligible to mount. `revealed && plateUp` is already
  // true long before the viewer arrives, and the reveal runs on its own timer —
  // so gating on that let the mark finish (and the lock clear) before it was ever
  // seen. Keying off the zone means the mark starts when it is actually reached.
  //
  // Once the mark reports it has settled the lock lifts, so the viewer scrolls on
  // with no extra action. Scrolling back out of the zone resets the flag, so the
  // mark replays — and locks again — on the next pass.
  const scrollLocked = inRevealZone && !inCurtainZone && !revealDoneInZone
  // Hold the page still while the mark plays. `overflow: hidden` on the root is
  // what actually stops the scroll; nothing about the scroll position changes, so
  // there is no jump when the lock lifts. The reveal's own completion releases
  // it, so this can never trap the viewer on a frozen page.
  useEffect(() => {
    if (!scrollLocked) return
    const body = document.body
    const html = document.documentElement
    const prevBody = body.style.overflow
    const prevHtml = html.style.overflow
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    return () => {
      body.style.overflow = prevBody
      html.style.overflow = prevHtml
    }
  }, [scrollLocked])

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
      {/* Mounted ONLY once the reveal's zone is reached, and re-mounted on every
          re-entry so the mark replays rather than sitting as a still. Before
          this it is unmounted, which is what lets the reveal own its moment: it
          appears when it is reached, plays once, and locks the page meanwhile. */}
      {revealed && plateUp && inRevealZone && (
        <div
          className="vebmore-reveal-layer"
          style={{ visibility: compositionRetired ? 'hidden' : 'visible' }}
        >
          {/* Keyed to the zone so re-entering the mark remounts it: a fresh mount
              replays the entrance and re-arms the lock, so the reveal is never
              treated as already watched on a second pass. */}
          <VebmoreReveal
            key={`reveal-${inRevealZone}`}
            onStart={handleRevealStart}
            onComplete={handleRevealComplete}
          />
        </div>
      )}
      {/* The motion world sits BEHIND the curtain: it mounts as soon as the
          curtain's zone begins, so lifting the curtain uncovers it and the story
          continues without any further scrolling. */}
      {worldAlive && <MotionWorld progress={worldProgress} />}
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

      {/* ---- ACT IV: the black-to-white seam ---- */}
      {/* A fixed mosaic layer above everything black, driven by the same master
          scroll as the rest of the page. It mounts as the world's journey ends
          and resolves the black canvas into white paper, which is the section
          below unfurling behind it. Unmounted once it has fully resolved so a
          fixed opaque layer never sits over the About section. */}
      {pixelVisible && <PixelizeTransition progress={pixelProgress} />}

      {/* ---- ACT V: the About section (white) ---- */}
      {/* A REAL section in the flow, unlike the world: it is the page's final
          resting surface, so it supplies its own height and is simply scrolled
          onto once the seam has resolved. */}
      <AboutSection active={aboutActive} />
    </>
  )
}

export default App
