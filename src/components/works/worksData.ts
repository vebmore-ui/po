/**
 * The Works archive.
 *
 * Adding a project is a single array entry: every field the carousel,
 * the detail stage, and the /works archive grid need is right here.
 */

export interface Project {
  /** Stable id / key. */
  id: string
  /** URL-friendly slug. */
  slug: string
  /** Display name. */
  name: string
  /** Short year string. */
  year: string
  /** Role / discipline string. */
  role: string
  /** Three discipline tags. */
  tags: [string, string, string]
  /** CSS background gradient. */
  gradient: string
  /** Optional plate image; falls back to gradient when absent. */
  image?: string
  /** External project URL. */
  url: string
  /** Included in the homepage carousel (first 5). */
  featured: boolean
  /** 1-2 short sentences in brand voice about web design and development. */
  description: string
  /** Alias for description. */
  blurb?: string
}

export const projects: Project[] = [
  {
    id: 'orbit',
    slug: 'orbit',
    name: 'ORBIT',
    year: '2026',
    role: 'DESIGN & DEV',
    tags: ['THREE.JS', 'WEBGL', 'DESIGN SYSTEM'],
    gradient:
      'radial-gradient(ellipse at 70% 30%, #13ff00 0%, #064c24 35%, #000000 80%)',
    url: '#', // REPLACE
    featured: true,
    description:
      'A WebGL launchpad for a satellite-data platform. Real-time telemetry, procedural globe shaders, and a design system engineered to scale.',
    blurb:
      'A WebGL launchpad for a satellite-data platform. Real-time telemetry, procedural globe shaders, and a design system engineered to scale.',
  },
  {
    id: 'meridian',
    slug: 'meridian',
    name: 'MERIDIAN',
    year: '2026',
    role: 'CREATIVE DEV',
    tags: ['GSAP MOTION', 'SHADERS', 'ARCHITECTURE'],
    gradient:
      'linear-gradient(135deg, #0f8f4b 0%, #064c24 45%, #111111 100%)',
    url: '#', // REPLACE
    featured: true,
    description:
      'Interactive portfolio and spatial storytelling for an architectural practice. Choreographed transitions where structure mirrors physical form.',
    blurb:
      'Interactive portfolio and spatial storytelling for an architectural practice. Choreographed transitions where structure mirrors physical form.',
  },
  {
    id: 'northline',
    slug: 'northline',
    name: 'NORTHLINE',
    year: '2025',
    role: 'BRAND & PLATFORM',
    tags: ['EDITORIAL', 'TYPOGRAPHY', 'ECOMMERCE'],
    gradient:
      'radial-gradient(circle at 30% 70%, #ffffff 0%, #333333 30%, #000000 75%)',
    url: '#', // REPLACE
    featured: true,
    description:
      'Editorial commerce experience built for high-latitude apparel. Precision typography, instant filtering, and sub-second page transitions.',
    blurb:
      'Editorial commerce experience built for high-latitude apparel. Precision typography, instant filtering, and sub-second page transitions.',
  },
  {
    id: 'halcyon',
    slug: 'halcyon',
    name: 'HALCYON',
    year: '2025',
    role: 'INTERACTION LAB',
    tags: ['SPATIAL UI', 'CANVAS 2D', 'IDENTITY'],
    gradient:
      'linear-gradient(160deg, #13ff00 0%, #0f8f4b 25%, #050505 75%)',
    url: '#', // REPLACE
    featured: true,
    description:
      'Experimental interaction lab exploring generative typography and spatial canvas interfaces across touch and pointer environments.',
    blurb:
      'Experimental interaction lab exploring generative typography and spatial canvas interfaces across touch and pointer environments.',
  },
  {
    id: 'solstice',
    slug: 'solstice',
    name: 'SOLSTICE',
    year: '2024',
    role: 'CAMPAIGN SITE',
    tags: ['MOTION', 'WEBGL', 'ART DIRECTION'],
    gradient:
      'radial-gradient(circle at 70% 25%, #ffd36e 0%, #b35c00 35%, #000000 80%)',
    url: '#', // REPLACE
    featured: true,
    description:
      'Immersive brand launch campaign featuring reactive lighting models, spatial sound design, and fluid scroll orchestration.',
    blurb:
      'Immersive brand launch campaign featuring reactive lighting models, spatial sound design, and fluid scroll orchestration.',
  },
  {
    id: 'vantage',
    slug: 'vantage',
    name: 'VANTAGE',
    year: '2024',
    role: 'PRODUCT UI',
    tags: ['DESIGN SYSTEM', 'REACT', 'CHARTS'],
    gradient:
      'linear-gradient(200deg, #4f7cff 0%, #14235c 45%, #050505 100%)',
    url: '#', // REPLACE
    featured: false,
    description:
      'Comprehensive design system and analytical dashboard suite built for enterprise data intelligence, deployed with React and SVG charts.',
    blurb:
      'Comprehensive design system and analytical dashboard suite built for enterprise data intelligence, deployed with React and SVG charts.',
  },
  {
    id: 'lattice',
    slug: 'lattice',
    name: 'LATTICE',
    year: '2024',
    role: 'PLATFORM',
    tags: ['ARCHITECTURE', 'TYPESCRIPT', 'API'],
    gradient:
      'linear-gradient(120deg, #13ff00 0%, #0f8f4b 40%, #0a0a0a 100%)',
    url: '#', // REPLACE
    featured: false,
    description:
      'Full-stack platform modernisation. Redesigned developer API docs, interactive code playgrounds, and strict TypeScript component primitives.',
    blurb:
      'Full-stack platform modernisation. Redesigned developer API docs, interactive code playgrounds, and strict TypeScript component primitives.',
  },
  {
    id: 'obsidian',
    slug: 'obsidian',
    name: 'OBSIDIAN',
    year: '2023',
    role: 'BRAND & WEB',
    tags: ['IDENTITY', 'EDITORIAL', 'GSAP'],
    gradient:
      'radial-gradient(circle at 30% 80%, #6b6b6b 0%, #1c1c1c 40%, #000000 85%)',
    url: '#', // REPLACE
    featured: false,
    description:
      'Monolithic editorial web publication with custom typesetting, dark-mode ink physics, and frictionless layout morphs.',
    blurb:
      'Monolithic editorial web publication with custom typesetting, dark-mode ink physics, and frictionless layout morphs.',
  },
]

/** Exactly 5 featured projects shown on the homepage carousel. */
export const FEATURED_COUNT = 5

/** The 5 featured projects in array order. */
export const featuredProjects: Project[] = projects.filter((p) => p.featured).slice(0, FEATURED_COUNT)
