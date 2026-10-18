/**
 * SHARED SECTION MAP
 *
 * The page is a scroll of pinned stages. The nav needs to know:
 *   1. Which section the viewport is currently inside (`getActiveSection`).
 *   2. Where each section's anchor sits, so a nav click can smooth-scroll to it (`getAnchors`).
 *   3. When the layout is stacked (<= 900px or reduced motion), using element offsets.
 */

import { projects } from './components/works/worksData'

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

/** Hero scroll budget, in viewports. Mirrors HERO_SCROLL_VIEWPORTS in App.tsx. */
export const HERO_SCROLL_VIEWPORTS = 1.6

/** Hero fraction at which the About reveal begins. */
export const HERO_ABOUT_FRACTION = 0.85

/** About → Capabilities stage wrapper height, in viewports. */
export const ABOUT_STAGE_VIEWPORTS = 4

/**
 * Fraction of the about-stage wrapper at which its FIRST slide reaches its midpoint.
 * Slide runs p 0.16 → 0.42, midpoint is p 0.29.
 */
export const ABOUT_STAGE_SLIDE1_MID = 0.29

/**
 * Works → Contact stage timeline, in svh units:
 * HOLD_WORKS = 80, SLIDE = 100, HOLD_CONTACT = 40 (total 320svh).
 */
export const HOLD_WORKS = 80
export const SLIDE = 100
export const HOLD_CONTACT = 40

export const FEATURED_COUNT = 5

function vh(): number {
  return typeof window === 'undefined' ? 800 : window.innerHeight || 800
}

/** True when the layout is stacked: narrow screen or reduced motion. */
export function isStacked(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  return window.matchMedia('(max-width: 900px)').matches
}

export interface AnchorContext {
  aboutStage: HTMLElement | null
  worksStage: HTMLElement | null
  aboutPanel: HTMLElement | null
  capabilitiesPanel: HTMLElement | null
  techPanel: HTMLElement | null
  worksPanel: HTMLElement | null
  contactPanel: HTMLElement | null
}

function docTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY
}

/**
 * The document offset each section should scroll to:
 * - home: 0
 * - about: heroTrack (just after About panel is fully revealed)
 * - capabilities: where slide 1 completes (p 0.42 of about stage)
 * - work: where Works is fully entered (worksStageTop)
 * - contact: where Works → Contact slide completes (worksStageTop + (HOLD_WORKS + SLIDE) * h / 100)
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

  // Where slide 1 completes and Capabilities entry sequence has fired (p 0.42)
  const capabilities = aboutStageTop + 0.42 * aboutStageRange

  const worksStageTop = ctx.worksStage
    ? docTop(ctx.worksStage)
    : aboutStageTop + aboutStageRange

  // Works is fully entered at the start of stage 2
  const work = worksStageTop

  // Contact is fully entered where the Works → Contact slide completes
  const contact = worksStageTop + ((HOLD_WORKS + SLIDE) * h) / 100

  return { home: 0, about: aboutStart, capabilities, work, contact }
}

/**
 * Active-section detection:
 * - home: hero until About reveal begins (heroProgress >= 0.85)
 * - about: About panel until first stage slide reaches midpoint (slide1Mid)
 * - capabilities: from midpoint through Capabilities and Tech Stack to end of stage 1
 * - work: Works panel until second stage slide reaches midpoint
 * - contact: after that
 */
export function getActiveSection(ctx: AnchorContext): SectionId {
  const h = vh()
  const stacked = isStacked()

  if (stacked) {
    const middle = window.scrollY + h * 0.5
    if (ctx.contactPanel && middle >= docTop(ctx.contactPanel)) return 'contact'
    if (ctx.worksPanel && middle >= docTop(ctx.worksPanel)) return 'work'
    if (ctx.techPanel && middle >= docTop(ctx.techPanel)) return 'capabilities'
    if (ctx.capabilitiesPanel && middle >= docTop(ctx.capabilitiesPanel)) return 'capabilities'
    if (ctx.aboutPanel && middle >= docTop(ctx.aboutPanel)) return 'about'
    return 'home'
  }

  const heroTrack = Math.max(h * HERO_SCROLL_VIEWPORTS, 200)
  const y = window.scrollY

  // home: hero until About reveal begins (heroProgress >= 0.85)
  if (y < heroTrack * HERO_ABOUT_FRACTION) return 'home'

  const aboutStageTop = ctx.aboutStage ? docTop(ctx.aboutStage) : heroTrack
  const aboutStageRange = ctx.aboutStage
    ? Math.max(ctx.aboutStage.offsetHeight - h, 0)
    : ABOUT_STAGE_VIEWPORTS * h

  const slide1Mid = aboutStageTop + ABOUT_STAGE_SLIDE1_MID * aboutStageRange
  if (y < slide1Mid) return 'about'

  const worksStageTop = ctx.worksStage
    ? docTop(ctx.worksStage)
    : aboutStageTop + aboutStageRange

  // capabilities: through to end of stage 1
  if (y < worksStageTop) return 'capabilities'

  // work: Works panel until second stage slide reaches midpoint
  const slide2Mid = worksStageTop + ((HOLD_WORKS + SLIDE / 2) * h) / 100
  if (y < slide2Mid) return 'work'

  // contact: after that
  return 'contact'
}

export function sectionIdFromHash(hash: string): SectionId | null {
  const raw = hash.replace(/^#/, '').trim().toLowerCase()
  if (!raw) return null
  if (raw === 'top') return 'home'
  return (SECTION_IDS as readonly string[]).includes(raw)
    ? (raw as SectionId)
    : null
}

export const PROJECT_COUNT = projects.length
export const featuredProjects = projects.filter((p) => p.featured).slice(0, FEATURED_COUNT)
