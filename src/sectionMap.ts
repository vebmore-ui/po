/**
 * SHARED SECTION MAP
 *
 * The page is one long scroll of pinned stages. The nav needs to know three
 * things and it must not duplicate any of the stages' magic numbers:
 *
 *   1. which section the viewport is currently inside (`getActiveSection`),
 *   2. where each section's anchor sits, so a nav click can scroll to it,
 *   3. when the layout is stacked (<= 900px or reduced motion), in which case
 *      the anchors are just the elements' own offsets.
 *
 * Scroll is measured in ABSOLUTE DISTANCE units. The stages express their
 * timelines in viewport units, so those unit counts live here once and are
 * converted to pixels against the live viewport. Everything below is read-only
 * measurement: the module never writes to the DOM and owns no rAF loop of its
 * own — the nav runs the single listener and asks this module to resolve.
 */

import { projects } from './components/works/worksData'

/* ------------------------------------------------------------------
   The canonical section order. This is the order the nav renders in and
   the order the document is read in; only the VISUAL order changes when a
   different section becomes active.
   ------------------------------------------------------------------ */

export const SECTION_IDS = [
  'home',
  'about',
  'capabilities',
  'work',
  'contact',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export const SECTION_LABELS: Record<SectionId, string> = {
  home: 'HOME',
  about: 'ABOUT',
  capabilities: 'CAPABILITIES',
  work: 'WORK',
  contact: 'CONTACT',
}

/* ------------------------------------------------------------------
   Stage constants.
   Kept in sync with AboutCapabilitiesStage.tsx and WorksContactStage.tsx by
   importing the real numbers where they are exported. The about-stage
   thresholds are fractions of its own wrapper, so they cannot be imported as
   raw numbers; they are mirrored here with a comment pointing at the source.
   ------------------------------------------------------------------ */

/** Hero scroll budget, in viewports. Mirrors `HERO_SCROLL_VIEWPORTS` in App.tsx. */
export const HERO_SCROLL_VIEWPORTS = 1.6

/** Hero fraction at which the About reveal begins. Mirrors App.tsx. */
export const HERO_ABOUT_FRACTION = 0.85

/** About → Capabilities stage wrapper height, in viewports. Mirrors stage.css. */
export const ABOUT_STAGE_VIEWPORTS = 4

/**
 * Fraction of the about-stage wrapper at which its FIRST slide reaches its
 * midpoint. The slide itself runs p 0.16 → 0.42, so its midpoint is p 0.29.
 * Mirrors the curve in AboutCapabilitiesStage.tsx.
 */
export const ABOUT_STAGE_SLIDE1_MID = 0.29

/**
 * Works → Contact stage timeline, in viewport units. Imported from the stage so
 * the two can never drift apart.
 */
export const HOLD_WORKS = 80
export const SLIDE = 100
export const HOLD_CONTACT = 40

/** Featured projects sit in the carousel; the count is fixed by the design. */
export const FEATURED_COUNT = 5

/** Viewport height in pixels, with a sane fallback for zero-height iframes. */
function vh(): number {
  return window.innerHeight || 800
}

/** True when the layout is stacked: narrow screen or reduced motion. */
export function isStacked(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  return window.matchMedia('(max-width: 900px)').matches
}

/* ------------------------------------------------------------------
   Anchors
   Each anchor is computed from the stage constants above, never from a
   hard-coded pixel value. In stacked mode the panels are in normal flow, so
   the elements' own offsets are the anchors instead.
   ------------------------------------------------------------------ */

export interface AnchorContext {
  /** `.stg-track-wrap` — the About → Capabilities wrapper. */
  aboutStage: HTMLElement | null
  /** `.wc-wrap` — the Works → Contact wrapper. */
  worksStage: HTMLElement | null
  /** The About panel element, used in stacked mode. */
  aboutPanel: HTMLElement | null
  /** The Capabilities panel element, used in stacked mode. */
  capabilitiesPanel: HTMLElement | null
  /** The Tech Stack panel element, used in stacked mode. */
  techPanel: HTMLElement | null
  /** The Works panel element, used in stacked mode. */
  worksPanel: HTMLElement | null
  /** The Contact panel element, used in stacked mode. */
  contactPanel: HTMLElement | null
}

function docTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY
}

/**
 * The document offset each section should scroll to.
 *
 * Desktop (pinned):
 *   home         0
 *   about        the hero's full scroll budget — the point at which the hero is
 *                scrolled past and the About panel is fully revealed.
 *   capabilities the point in the about-stage at which the first slide has
 *                completed (p 0.42 of the wrapper).
 *   work         the point in the works-stage at which Works has fully entered —
 *                the end of the slide hold, just before the slide begins.
 *   contact      the point at which the Works → Contact slide has completed.
 */
export function getAnchors(ctx: AnchorContext): Record<SectionId, number> {
  const h = vh()
  const stacked = isStacked()

  if (stacked) {
    const base = {
      home: 0,
      about: ctx.aboutPanel ? docTop(ctx.aboutPanel) : 0,
      capabilities: ctx.capabilitiesPanel ? docTop(ctx.capabilitiesPanel) : 0,
      work: ctx.worksPanel ? docTop(ctx.worksPanel) : 0,
      contact: ctx.contactPanel ? docTop(ctx.contactPanel) : 0,
    }
    // The Tech Stack panel sits between Capabilities and Works; keep the anchors
    // monotonic so a click never scrolls backwards unexpectedly.
    return {
      home: 0,
      about: base.about,
      capabilities: Math.max(base.capabilities, base.about),
      work: Math.max(base.work, base.capabilities),
      contact: Math.max(base.contact, base.work),
    }
  }

  const heroTrack = Math.max(h * HERO_SCROLL_VIEWPORTS, 200)
  const aboutStart = heroTrack

  const aboutStageTop = ctx.aboutStage ? docTop(ctx.aboutStage) : aboutStart
  const aboutStageRange = ctx.aboutStage
    ? Math.max(ctx.aboutStage.offsetHeight - h, 0)
    : ABOUT_STAGE_VIEWPORTS * h

  const capabilities = aboutStageTop + ABOUT_STAGE_SLIDE1_MID * aboutStageRange

  const worksStageTop = ctx.worksStage
    ? docTop(ctx.worksStage)
    : aboutStageTop + aboutStageRange

  // Works holds for HOLD_WORKS, then slides. Works is fully entered for the
  // whole hold, so the anchor is the hold's midpoint.
  const work = worksStageTop + (HOLD_WORKS * h) / 100

  const slideStart = HOLD_WORKS
  const contact = worksStageTop + ((slideStart + SLIDE) * h) / 100

  return { home: 0, about: aboutStart, capabilities, work, contact }
}

/* ------------------------------------------------------------------
   Active-section detection
   The ranges are derived from the same constants as the anchors, so the
   triangle sits under the right word for the whole scroll.
   ------------------------------------------------------------------ */

/**
 * Which section the viewport is currently inside.
 *
 * Desktop boundaries, all in document pixels:
 *   home         < aboutStart                     (hero, until About begins)
 *   about        < slide1Mid                      (About panel, until slide 1's
 *                                                 midpoint)
 *   capabilities < slide2Start                    (Capabilities + Tech Stack,
 *                                                 through to the end of the
 *                                                 works-stage slide hold)
 *   work         < slide2Mid                      (Works, until slide 2's
 *                                                 midpoint)
 *   contact      otherwise
 *
 * Stacked mode: the boundaries are the panels' own offsets, measured against
 * the middle of the viewport so the triangle flips when a panel really takes
 * the screen.
 */
export function getActiveSection(ctx: AnchorContext): SectionId {
  const h = vh()
  const stacked = isStacked()

  if (stacked) {
    const middle = window.scrollY + h * 0.5
    const aboutPanel = ctx.aboutPanel
    const capPanel = ctx.capabilitiesPanel
    const techPanel = ctx.techPanel
    const worksPanel = ctx.worksPanel
    const contactPanel = ctx.contactPanel

    if (contactPanel && middle >= docTop(contactPanel)) return 'contact'
    if (worksPanel && middle >= docTop(worksPanel)) return 'work'
    if (techPanel && middle >= docTop(techPanel)) return 'capabilities'
    if (capPanel && middle >= docTop(capPanel)) return 'capabilities'
    if (aboutPanel && middle >= docTop(aboutPanel)) return 'about'
    return 'home'
  }

  const heroTrack = Math.max(h * HERO_SCROLL_VIEWPORTS, 200)
  const y = window.scrollY

  if (y < heroTrack) return 'home'

  const aboutStageTop = ctx.aboutStage ? docTop(ctx.aboutStage) : heroTrack
  const aboutStageRange = ctx.aboutStage
    ? Math.max(ctx.aboutStage.offsetHeight - h, 0)
    : ABOUT_STAGE_VIEWPORTS * h

  const slide1Mid = aboutStageTop + ABOUT_STAGE_SLIDE1_MID * aboutStageRange
  if (y < slide1Mid) return 'about'

  const worksStageTop = ctx.worksStage
    ? docTop(ctx.worksStage)
    : aboutStageTop + aboutStageRange

  const slideHoldEnd = worksStageTop + (HOLD_WORKS * h) / 100
  const slideMid = worksStageTop + ((HOLD_WORKS + SLIDE / 2) * h) / 100

  if (y < slideHoldEnd) return 'capabilities'
  if (y < slideMid) return 'work'
  return 'contact'
}

/* ------------------------------------------------------------------
   Hash anchors for the /works page
   `/works` links back into the homepage sections with a hash, so the hash has
   to resolve to the same anchor the nav would scroll to. The names map onto
   the section ids one to one.
   ------------------------------------------------------------------ */

export function sectionIdFromHash(hash: string): SectionId | null {
  const raw = hash.replace(/^#/, '').trim().toLowerCase()
  if (!raw) return null
  if (raw === 'top') return 'home'
  return (SECTION_IDS as readonly string[]).includes(raw)
    ? (raw as SectionId)
    : null
}

/* ------------------------------------------------------------------
   Convenience helpers used by the app shell
   ------------------------------------------------------------------ */

/** Total number of projects in the archive (for the /works header count). */
export const PROJECT_COUNT = projects.length

/** The projects that appear in the Works carousel. */
export const featuredProjects = projects.filter((p) => p.featured).slice(0, FEATURED_COUNT)
