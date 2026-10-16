/* ------------------------------------------------------------------
   VEBMORE — Tech stack data
   The list order IS the pop sequence: row-major, left to right.
   Icons are inline SVG paths from `simple-icons` (CC0), imported by name
   so the bundle only carries the fifteen that are actually rendered.
   ------------------------------------------------------------------ */

import {
  siReact,
  siNextdotjs,
  siVite,
  siReactrouter,
  siRemix,
  siTailwindcss,
  siJavascript,
  siTypescript,
  siPython,
  siNodedotjs,
  siGreensock,
  siThreedotjs,
  siFigma,
  siGit,
} from 'simple-icons'

export interface TechIcon {
  /** SVG path data drawn inside a 24×24 viewBox. */
  path: string
}

export interface TechItem {
  id: string
  name: string
  /** Present when a simple-icons glyph exists; absent → monogram fallback. */
  icon?: TechIcon
  /** Two-letter fallback shown when no glyph exists (e.g. Canva). */
  monogram?: string
}

/**
 * Row-major, five per row — this exact order drives the pop sequence.
 *
 * Canva is deliberately glyph-less: `simple-icons` does not ship a Canva
 * mark in the installed version (only unrelated `siCanvas` / `siPlaycanvas`),
 * so the tile renders a Bebas Neue monogram instead of an approximated logo.
 */
export const techStack: TechItem[] = [
  // ── Row 1 ──
  { id: 'react', name: 'React', icon: { path: siReact.path } },
  { id: 'nextjs', name: 'Next.js', icon: { path: siNextdotjs.path } },
  { id: 'vite', name: 'Vite', icon: { path: siVite.path } },
  { id: 'react-router', name: 'React Router', icon: { path: siReactrouter.path } },
  { id: 'remix', name: 'Remix', icon: { path: siRemix.path } },

  // ── Row 2 ──
  { id: 'tailwind', name: 'Tailwind CSS', icon: { path: siTailwindcss.path } },
  { id: 'javascript', name: 'JavaScript', icon: { path: siJavascript.path } },
  { id: 'typescript', name: 'TypeScript', icon: { path: siTypescript.path } },
  { id: 'python', name: 'Python', icon: { path: siPython.path } },
  { id: 'nodejs', name: 'Node.js', icon: { path: siNodedotjs.path } },

  // ── Row 3 ──
  { id: 'gsap', name: 'GSAP', icon: { path: siGreensock.path } },
  { id: 'threejs', name: 'Three.js', icon: { path: siThreedotjs.path } },
  { id: 'figma', name: 'Figma', icon: { path: siFigma.path } },
  { id: 'canva', name: 'Canva', monogram: 'CA' },
  { id: 'git', name: 'Git', icon: { path: siGit.path } },
]

/** Column count on desktop; used for the pop stagger's row/column maths. */
export const TECH_COLUMNS = 5

/** Delay between consecutive tiles in the pop sequence. */
export const TECH_POP_STAGGER_MS = 70

/** Duration of one tile's pop, matched to `--ts-pop-ms` in techstack.css. */
export const TECH_POP_DURATION_MS = 520
