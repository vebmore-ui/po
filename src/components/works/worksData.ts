import haulwiseImage from '../../assets/haulwise-cover.png'
import femiknitImage from '../../assets/femiknit-cover.png'
import shreeArchitectsImage from '../../assets/shree-architects-cover.jpg'

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
  /** Optional secondary destination, such as a separate design preview. */
  secondaryUrl?: string
  /** Included in the homepage carousel (first 5). */
  featured: boolean
  /** 1-2 short sentences in brand voice about web design and development. */
  description: string
  /** Alias for description. */
  blurb?: string
}

export const projects: Project[] = [
  {
    id: 'haulwise',
    slug: 'haulwise',
    name: 'HAULWISE',
    year: '2026',
    role: 'PRODUCT DESIGN & DEVELOPMENT',
    tags: ['LOGISTICS', 'TRUCK BOOKING', 'LIVE TRACKING'],
    gradient:
      'linear-gradient(135deg, #f3f6f7 0%, #17445a 55%, #f47a1f 100%)',
    image: haulwiseImage,
    url: 'https://transportsample.vercel.app/',
    featured: true,
    description:
      'A B2B truck-booking platform connecting shippers with verified carriers across India. Fixed upfront fares, part-load and full-truck bookings, OTP-sealed doors, and WhatsApp GPS tracking bring clarity to every dispatch.',
    blurb:
      'A B2B truck-booking platform connecting shippers with verified carriers across India. Fixed upfront fares, part-load and full-truck bookings, OTP-sealed doors, and WhatsApp GPS tracking bring clarity to every dispatch.',
  },
  {
    id: 'femiknit',
    slug: 'femiknit',
    name: 'Femiknit',
    year: '2026',
    role: 'ECOMMERCE DESIGN & DEVELOPMENT',
    tags: ['ETHNIC WEAR', 'FASHION', 'ECOMMERCE'],
    gradient:
      'linear-gradient(135deg, #8b0a3b 0%, #ef174b 55%, #ff9a00 100%)',
    image: femiknitImage,
    url: 'https://femiknit.vebmore.workers.dev/',
    secondaryUrl: 'https://femiknit-storefront.vercel.app/',
    featured: true,
    description:
      'A family-focused ethnic-wear storefront for sarees, kurtas, and kidswear. Festive collections, easy product discovery, and a confident shopping flow bring traditional styles to a modern online store.',
    blurb:
      'A family-focused ethnic-wear storefront for sarees, kurtas, and kidswear. Festive collections, easy product discovery, and a confident shopping flow bring traditional styles to a modern online store.',
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
    id: 'shree-architects',
    slug: 'shree-architects',
    name: 'SHREE ARCHITECTS',
    year: '2026',
    role: 'ARCHITECTURE & SPATIAL DESIGN',
    tags: ['ARCHITECTURE', 'RESIDENTIAL', 'SPATIAL DESIGN'],
    gradient:
      'linear-gradient(135deg, #fbfaf7 0%, #d8cfc4 40%, #2b2825 100%)',
    image: shreeArchitectsImage,
    url: 'https://real-estatesamp.vercel.app',
    featured: true,
    description:
      'An architectural studio crafting enduring residential spaces to live, gather, and belong. Considered spatial design, natural materiality, and calm editorial presence.',
    blurb:
      'An architectural studio crafting enduring residential spaces to live, gather, and belong. Considered spatial design, natural materiality, and calm editorial presence.',
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
