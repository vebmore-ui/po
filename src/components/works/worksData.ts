/**
 * The Works archive.
 *
 * Adding a project is a single array entry: every field the roller, the preview
 * plate and the fallback list need is right here. The roller reads the array
 * order, so a new entry appears in the wheel without any other change.
 */
export interface Project {
  /** Stable slug — used as the anchor id and the React key. */
  id: string
  /** Display name, set in the roller and the preview plate. */
  name: string
  /** Short year string, shown in the mono meta column. */
  year: string
  /** Role / discipline string, shown in the mono meta column. */
  role: string
  /** Three tags, shown in the preview plate. */
  tags: [string, string, string]
  /** CSS background for the preview plate card. */
  gradient: string
  /** Optional plate image; falls back to the gradient when absent. */
  image?: string
  /** Included in the homepage carousel (the rest live on /works only). */
  featured: boolean
  /** One-sentence line shown on the project's detail view. */
  blurb: string
}

export const projects: Project[] = [
  {
    id: 'orbit',
    name: 'ORBIT',
    year: '2026',
    role: 'DESIGN & DEV',
    tags: ['THREE.JS', 'WEBGL', 'DESIGN SYSTEM'],
    gradient:
      'radial-gradient(ellipse at 70% 30%, #13ff00 0%, #064c24 35%, #000000 80%)',
    featured: true,
    blurb: 'A WebGL launchpad for a satellite-data product — design system, shaders and build in one continuous arc.',
  },
  {
    id: 'meridian',
    name: 'MERIDIAN',
    year: '2026',
    role: 'CREATIVE DEV',
    tags: ['GSAP MOTION', 'SHADERS', 'ARCHITECTURE'],
    gradient:
      'linear-gradient(135deg, #0f8f4b 0%, #064c24 45%, #111111 100%)',
    featured: true,
    blurb: 'Shader-driven storytelling for an architecture studio — the site moves the way their buildings do.',
  },
  {
    id: 'northline',
    name: 'NORTHLINE',
    year: '2025',
    role: 'BRAND & PLATFORM',
    tags: ['EDITORIAL', 'TYPOGRAPHY', 'ECOMMERCE'],
    gradient:
      'radial-gradient(circle at 30% 70%, #ffffff 0%, #333333 30%, #000000 75%)',
    featured: true,
    blurb: 'Editorial platform and identity for a northern logistics brand — typography doing the heavy lifting.',
  },
  {
    id: 'halcyon',
    name: 'HALCYON',
    year: '2025',
    role: 'INTERACTION LAB',
    tags: ['SPATIAL UI', 'CANVAS 2D', 'IDENTITY'],
    gradient:
      'linear-gradient(160deg, #13ff00 0%, #0f8f4b 25%, #050505 75%)',
    featured: true,
    blurb: 'An interaction lab for spatial interfaces — canvas experiments folded into one coherent product.',
  },
  // ── PLACEHOLDERS below: replace with real projects. They exist so the
  //    "more" button (INITIAL_VISIBLE 4, BATCH 4) has something to reveal.
  {
    id: 'solstice',
    name: 'SOLSTICE',
    year: '2024',
    role: 'CAMPAIGN SITE',
    tags: ['MOTION', 'WEBGL', 'ART DIRECTION'],
    gradient:
      'radial-gradient(circle at 70% 25%, #ffd36e 0%, #b35c00 35%, #000000 80%)',
    featured: false,
    blurb: 'A campaign site built around motion — art direction, WebGL and a single decisive scroll.',
  },
  {
    id: 'vantage',
    name: 'VANTAGE',
    year: '2024',
    role: 'PRODUCT UI',
    tags: ['DESIGN SYSTEM', 'REACT', 'CHARTS'],
    gradient:
      'linear-gradient(200deg, #4f7cff 0%, #14235c 45%, #050505 100%)',
    featured: false,
    blurb: 'Product interface work: a design system, a charting language and a React component library.',
  },
  {
    id: 'lattice',
    name: 'LATTICE',
    year: '2024',
    role: 'PLATFORM',
    tags: ['ARCHITECTURE', 'TYPESCRIPT', 'API'],
    gradient:
      'linear-gradient(120deg, #13ff00 0%, #0f8f4b 40%, #0a0a0a 100%)',
    featured: false,
    blurb: 'A platform rebuild with the API layer redesigned alongside the surface it serves.',
  },
  {
    id: 'obsidian',
    name: 'OBSIDIAN',
    year: '2023',
    role: 'BRAND & WEB',
    tags: ['IDENTITY', 'EDITORIAL', 'GSAP'],
    gradient:
      'radial-gradient(circle at 30% 80%, #6b6b6b 0%, #1c1c1c 40%, #000000 85%)',
    featured: false,
    blurb: 'Identity and editorial for a print-first brand, carried across to the web without losing its weight.',
  },
]

/** Projects shown before the "more" button is pressed. */
export const INITIAL_VISIBLE = 4

/** Projects revealed per "more" press. */
export const BATCH = 4


/** How many of the top projects appear in the homepage carousel. */
export const FEATURED_COUNT = 5

/** The slice of the archive the carousel shows, in array order. */
export const featuredProjects: Project[] = projects.slice(0, FEATURED_COUNT)
