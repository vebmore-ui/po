/**
 * PRICING & PLANS DATA
 *
 * Tier definitions and deliverables matching VEBMORE's studio standards.
 */

import { PHONES } from '../contact/contactData'

export interface PlanFeature {
  text: string
  highlight?: boolean
}

export interface PricingPlan {
  id: string
  index: string
  name: string
  tagline: string
  category: string
  price: string
  priceNumeric: number
  priceSuffix?: string
  popular?: boolean
  maintenance: string
  pages: string
  hosting: string
  features: PlanFeature[]
  ctaText: string
  whatsappGreeting: string
}

export interface SpecializedTier {
  id: string
  index: string
  name: string
  badge: string
  tagline: string
  price: string
  priceNote: string
  maintenance: string
  deliverables: string[]
  ctaText: string
  whatsappGreeting: string
}

const PRIMARY_PHONE_DIGITS = PHONES[0]?.digits ?? '919427550414'

export function buildPricingWhatsappUrl(greeting: string): string {
  const params = new URLSearchParams({ text: greeting })
  return `https://wa.me/${PRIMARY_PHONE_DIGITS}?${params.toString()}`
}

export const CORE_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    index: '01',
    name: 'STARTER',
    category: 'SPRINT PRESENCE',
    tagline: 'HIGH-IMPACT LANDING PAGE & CONCISE STUDIO PRESENCE',
    price: '₹5,999',
    priceNumeric: 5999,
    priceSuffix: 'ONE-TIME',
    maintenance: '6 MONTHS FREE MAINTENANCE',
    pages: 'UP TO 2 WEB PAGES (1 LONG SCROLLABLE + 1 SHORT SUB-PAGE)',
    hosting: 'FREE HOSTING INCLUDED · DOMAIN CHARGES DIFFER (AT ACTUALS)',
    features: [
      { text: 'UP TO 2 WEB PAGES (1 LONG SCROLLABLE + 1 SHORT PAGE)' },
      { text: '6 MONTHS FREE STUDIO MAINTENANCE', highlight: true },
      { text: 'FREE HIGH-SPEED CLOUD HOSTING (DOMAIN CHARGES DIFFER)' },
      { text: 'MOBILE, TABLET & DESKTOP RESPONSIVE ARCHITECTURE' },
      { text: 'SUB-SECOND CORE WEB VITALS PERFORMANCE' },
      { text: 'DIRECT WHATSAPP INSTANT CONTACT INTEGRATION', highlight: true },
    ],
    ctaText: 'START WITH STARTER ↗',
    whatsappGreeting:
      'HELLO VEBMORE, I WOULD LIKE TO GET STARTED WITH THE STARTER PLAN (₹5,999).',
  },
  {
    id: 'pro',
    index: '02',
    name: 'PRO',
    category: 'STUDIO STANDARD',
    tagline: 'COMPLETE DIGITAL NARRATIVE WITH BESPOKE MOTION CHOREOGRAPHY',
    price: '₹11,999',
    priceNumeric: 11999,
    priceSuffix: 'ONE-TIME',
    popular: true,
    maintenance: '1 YEAR FREE MAINTENANCE',
    pages: '5–7 WEB PAGES (UP TO 3 EXTENDABLE LONG-SCROLL PAGES)',
    hosting: 'FREE HOSTING INCLUDED · DOMAIN CHARGES DIFFER (AT ACTUALS)',
    features: [
      { text: 'AT MAX 5–7 WEB PAGES (UP TO 3 LONG-SCROLL PAGES)' },
      { text: '1 YEAR FREE STUDIO MAINTENANCE', highlight: true },
      { text: 'EVERYTHING IN STARTER WITH UPGRADED ARCHITECTURE' },
      { text: 'HIGH-CLASS ANIMATION & CHOREOGRAPHED SCROLL EFFECTS', highlight: true },
      { text: 'CONTACT BUTTONS WITH PRE-FILLED MESSAGING' },
      { text: 'INTERACTIVE CONTACT FORM WITH AUTOMATED VALIDATION', highlight: true },
      { text: 'FREE HIGH-SPEED HOSTING (DOMAIN CHARGES DIFFER)' },
    ],
    ctaText: 'CHOOSE PRO PLAN ↗',
    whatsappGreeting:
      'HELLO VEBMORE, I AM INTERESTED IN THE PRO PLAN (₹11,999). LET US DISCUSS MY PROJECT.',
  },
  {
    id: 'plus',
    index: '03',
    name: 'PLUS',
    category: 'FLAGSHIP SYSTEM',
    tagline: 'FLAGSHIP WEB PLATFORM WITH CUSTOM CMS & MEDIA SERVER',
    price: '₹24,499',
    priceNumeric: 24499,
    priceSuffix: 'ONE-TIME',
    maintenance: '2 YEARS FREE MAINTENANCE',
    pages: 'UP TO 20 EXTENSIVE WEB PAGES',
    hosting: 'FREE HOSTING + FREE DATABASE SERVER FOR IMAGE STORAGE',
    features: [
      { text: 'UP TO 20 EXTENSIVE WEB PAGES' },
      { text: '2 YEARS FREE STUDIO MAINTENANCE', highlight: true },
      { text: 'HIGH-QUALITY FLUID SCROLLABLE STORYTELLING & ANIMATIONS' },
      { text: 'FREE DATABASE SERVER FOR IMAGE STORAGE', highlight: true },
      { text: 'ADMIN DASHBOARD TO UPDATE DETAILS & ADD/DELETE IMAGES', highlight: true },
      { text: 'FREE HOSTING INCLUDED (DOMAIN CHARGES DIFFER)' },
      { text: 'EDGE CDN ASSET OPTIMIZATION & PRIORITY TECHNICAL SUPPORT' },
    ],
    ctaText: 'BUILD WITH PLUS ↗',
    whatsappGreeting:
      'HELLO VEBMORE, I WANT TO BUILD OUR DIGITAL PRESENCE WITH THE PLUS PLAN (₹24,499).',
  },
]

export const SPECIALIZED_TIER: SpecializedTier = {
  id: 'ecommerce-booking',
  index: '04',
  name: 'E-BOOKING / E-COMMERCE',
  badge: 'SPECIALIZED ARCHITECTURE',
  tagline:
    'CUSTOM TRANSACTIONAL ENGINES, REAL-TIME BOOKING SYSTEMS, OR END-TO-END DIGITAL STOREFRONTS BUILT FOR SCALE.',
  price: 'STARTING FROM ₹31,999',
  priceNote: 'FINAL PRICE DECIDED UPON ARCHITECTURAL DISCUSSION',
  maintenance: '18 MONTHS FREE MAINTENANCE',
  deliverables: [
    'FULL E-COMMERCE STOREFRONT OR REAL-TIME BOOKING / RESERVATION ENGINE',
    '18 MONTHS FREE DEDICATED MAINTENANCE & MONITORING',
    'SECURE MULTI-GATEWAY PAYMENT PROCESSING (UPI, CARDS, NETBANKING)',
    'DYNAMIC INVENTORY MANAGEMENT OR APPOINTMENTS & CALENDAR SCHEDULING',
    'ADMIN DASHBOARD WITH ORDER/BOOKING MANAGEMENT & ANALYTICS',
    'AUTOMATED CUSTOMER TRANSACTION ALERTS (EMAIL / WHATSAPP)',
    'DEDICATED DATABASE SERVER & CLOUD INFRASTRUCTURE DEPLOYMENT',
  ],
  ctaText: 'DISCUSS ARCHITECTURE ↗',
  whatsappGreeting:
    'HELLO VEBMORE, I WOULD LIKE TO DISCUSS AN E-BOOKING / E-COMMERCE CUSTOM PROJECT (STARTING FROM ₹31,999).',
}
