/**
 * Preserved SEO & editorial copy moved from the homepage layout into dedicated pages.
 * Used by /directory and /faq to retain rich content and keyword discoverability without
 * altering the homepage scroll track, section heights, or visual rhythm.
 */

export interface ServiceDetail {
  id: string
  name: string
  category: string
  description: string
  highlights: string[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
}

export const SEO_STUDIO_COPY = {
  about: {
    tagline: 'Website design, web development & digital solutions.',
    paragraphs: [
      'Vebmore is an independent digital agency providing modern website design, web development, and affordable digital solutions for brands across Ahmedabad, Surendranagar, and Bhubaneswar, India. We combine aesthetic discipline with clean engineering to create digital storefronts and web architectures that feel considered, intentional, and enduring.',
      'Our studio approaches every project as a balance of form and utility. From initial interface concepts and responsive layout design to frontend engineering with React, TypeScript, and Vite, we eliminate unnecessary complexity while optimizing load speeds, search engine discoverability, and Core Web Vitals.',
      'Whether partnering with emerging founders in Gujarat or growing enterprises across India, our objective remains consistent: crafting accessible, high-performance web presences that elevate brand credibility and drive meaningful digital engagement.',
    ],
  },
  contact: {
    lede: 'HAVE AN IDEA, A BRIEF OR JUST A ROUGH SKETCH? TELL US WHAT YOU WANT TO BUILD. WE DESIGN AND DEVELOP WEBSITES AND DIGITAL PRODUCTS THAT LOOK SHARP AND PERFORM.',
    editorialNotice:
      'Whether launching a new brand identity, engineering an interactive showcase, or building a high-speed corporate storefront, Vebmore collaborates closely with businesses across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    turnaroundNotice:
      'All client inquiries receive a direct review and response within 24 hours. Contact our team below via Gmail, Outlook, phone, or WhatsApp to schedule a discussion.',
  },
  locations: {
    primary: 'Ahmedabad, Gujarat, India',
    secondary: 'Surendranagar, Gujarat, India',
    eastHub: 'Bhubaneswar, Odisha, India',
    coverage: 'Local on-site availability across Gujarat and Odisha, with full remote collaboration nationwide and globally.',
  },
}

export const SEO_SERVICES: ServiceDetail[] = [
  {
    id: 'bespoke-web-design',
    name: 'Bespoke Website Design',
    category: 'Design & Creative Direction',
    description:
      'Interface architecture, editorial typography curation, and responsive grid layouts designed to establish brand authority and engage discerning audiences.',
    highlights: [
      'Custom typography and responsive grid layout systems',
      'Art-directed visual hierarchies tailored to brand positioning',
      'Design tokens and comprehensive UI style guides',
      'Figma to clean semantic code translation',
    ],
  },
  {
    id: 'frontend-engineering',
    name: 'High-Performance Web Development',
    category: 'Engineering & Architecture',
    description:
      'Modern frontend development with React, TypeScript, Vite, and Cloudflare Workers delivering instant page hydration, Core Web Vitals excellence, and semantic markup.',
    highlights: [
      'Component-driven architecture with React and TypeScript',
      'Sub-second first contentful paint and optimized LCP/INP',
      'Edge deployment with Cloudflare Workers ASSETS binding',
      'Zero unnecessary bundle overhead and clean tree-shaking',
    ],
  },
  {
    id: 'affordable-solutions',
    name: 'Affordable Digital Solutions',
    category: 'Transparent Packages',
    description:
      'Clear, predictable tiered pricing engineered for businesses, founders, and growing companies seeking premium digital execution without inflated agency retainers.',
    highlights: [
      '₹5,999 — Foundational single-page presence for launches and campaigns',
      '₹11,999 — Multi-page studio website with custom interactive motion',
      '₹24,499 — Scalable CMS-ready architecture for growing brands',
      'Transparent milestone invoicing with zero hidden maintenance fees',
    ],
  },
  {
    id: 'interactive-motion',
    name: 'Interactive Motion & 3D Experiences',
    category: 'Creative Tech',
    description:
      'Controlled GSAP timelines, Three.js WebGL canvas animations, and reactive cursor choreography crafted with restraint and strict accessibility fallbacks.',
    highlights: [
      'Smooth scroll-driven storytelling and pinned stage transitions',
      'Lightweight WebGL interactive canvas backgrounds',
      'Fluid custom cursor gestures and tactile micro-interactions',
      'prefers-reduced-motion media query conformance',
    ],
  },
]

export const SEO_TECH_STACK = [
  { name: 'React 19', role: 'Component UI Framework', benefit: 'Reactive, modular view layer' },
  { name: 'TypeScript', role: 'Type Safety & Stability', benefit: 'Deterministic, bug-free codebase' },
  { name: 'Vite', role: 'Build Tool & Bundler', benefit: 'Lightning-fast HMR and optimized tree-shaken builds' },
  { name: 'Cloudflare Workers', role: 'Edge Runtime & Hosting', benefit: 'Sub-50ms global latency and edge asset delivery' },
  { name: 'GSAP & Motion', role: 'Kinetic Choreography', benefit: 'Silky 60fps animations with hardware acceleration' },
  { name: 'Tailwind & Modern CSS', role: 'Utility & Styling', benefit: 'Responsive fluid clamps and accessible CSS variables' },
]

export const SEO_FAQS: FaqItem[] = [
  {
    id: 'cities-served',
    category: 'Locations & Coverage',
    question: 'Which cities and regions does Vebmore serve?',
    answer:
      'Our primary hubs are located in Ahmedabad (Gujarat), Surendranagar (Gujarat), and Bhubaneswar (Odisha), India. We collaborate with clients on-site in these metro hubs and provide end-to-end remote collaboration for founders and companies across India and worldwide.',
  },
  {
    id: 'pricing-tiers',
    category: 'Pricing & Investment',
    question: 'What are Vebmore’s website design and development prices?',
    answer:
      'Our transparent packages start at ₹5,999 for foundational single-page landing sites, ₹11,999 for multi-page studio showcase websites with custom motion, and ₹24,499 for scalable comprehensive web architectures. All pricing is upfront with defined milestones and no recurring lock-in fees.',
  },
  {
    id: 'delivery-timeline',
    category: 'Timelines & Process',
    question: 'How long does a website project take from brief to launch?',
    answer:
      'Single-page landing experiences are typically delivered within 7 to 10 business days. Multi-page studio platforms and custom-engineered web builds typically range between 2 to 4 weeks depending on scope, copy readiness, and custom interactive requirements.',
  },
  {
    id: 'client-portfolio',
    category: 'Work & Experience',
    question: 'Can I view previous client projects and case studies?',
    answer:
      'Yes, explore our portfolio archive at /works to inspect live client builds, interactive storefronts, and architectural case studies including Shree Architects (real-estatesamp.vercel.app), restaurant storefronts, and modern brand platforms.',
  },
  {
    id: 'seo-performance',
    category: 'Search & Performance',
    question: 'Are Vebmore websites optimized for Google search and fast loading?',
    answer:
      'Yes. Every website we build includes semantic HTML5 structure, per-page meta titles and descriptions, Open Graph social tags, canonical tags, automated XML sitemaps, robots.txt configuration, Google Search Console verification readiness, and build-time prerendering for lightning-fast Core Web Vitals.',
  },
  {
    id: 'initiate-project',
    category: 'Consultation & Contact',
    question: 'How do I start a project or schedule a consultation?',
    answer:
      'You can reach our studio directly via Gmail, Outlook, phone call (+91 9427550414), or direct WhatsApp messaging. We review every brief and reply within 24 hours with project scope recommendations and milestone schedules.',
  },
]
