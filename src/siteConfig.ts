/**
 * Global site configuration and canonical domain.
 * Update SITE_URL here whenever migrating to a custom domain.
 */
export const SITE_URL = 'https://your.vebmore-3f4.workers.dev'

export interface PageMetadata {
  title: string
  description: string
  canonical: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogImageAlt: string
}

export const PAGES_METADATA: Record<string, PageMetadata> = {
  '/': {
    title: 'Vebmore | Website Design & Development in Ahmedabad, India',
    description:
      'Vebmore provides modern website design, web development, and affordable digital solutions for brands across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    canonical: `${SITE_URL}/`,
    ogTitle: 'Vebmore | Website Design & Development in Ahmedabad, India',
    ogDescription:
      'Vebmore provides modern website design, web development, and affordable digital solutions for brands across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    ogImage: `${SITE_URL}/og-image.png`,
    ogImageAlt: 'Vebmore — Website Design & Development Agency',
  },
  '/about': {
    title: 'About Vebmore | Web Design Studio in Ahmedabad, India',
    description:
      'Learn about Vebmore, a digital design and web development agency creating affordable, high-performance websites across Ahmedabad, Surendranagar, and Bhubaneswar.',
    canonical: `${SITE_URL}/about`,
    ogTitle: 'About Vebmore | Web Design Studio in Ahmedabad, India',
    ogDescription:
      'Learn about Vebmore, a digital design and web development agency creating affordable, high-performance websites across Ahmedabad, Surendranagar, and Bhubaneswar.',
    ogImage: `${SITE_URL}/og-image.png`,
    ogImageAlt: 'About Vebmore — Creative Web Design Studio',
  },
  '/services': {
    title: 'Web Design & Development Services | Vebmore Solutions',
    description:
      'Discover Vebmore\'s website design, web development, and affordable digital solutions tailored for growing brands in Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    canonical: `${SITE_URL}/services`,
    ogTitle: 'Web Design & Development Services | Vebmore Solutions',
    ogDescription:
      'Discover Vebmore\'s website design, web development, and affordable digital solutions tailored for growing brands in Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    ogImage: `${SITE_URL}/og-image.png`,
    ogImageAlt: 'Vebmore Services — Website Design & Development',
  },
  '/works': {
    title: 'Web Design & Development Archive | Vebmore Projects',
    description:
      'Explore selected website design, web development, and digital solution projects by Vebmore for clients across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    canonical: `${SITE_URL}/works`,
    ogTitle: 'Web Design & Development Archive | Vebmore Projects',
    ogDescription:
      'Explore selected website design, web development, and digital solution projects by Vebmore for clients across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    ogImage: `${SITE_URL}/og-image.png`,
    ogImageAlt: 'Vebmore Projects Archive — Web Design & Development',
  },
  '/pricing': {
    title: 'Affordable Web Design & Development Pricing | Vebmore',
    description:
      'Transparent, affordable website design and development pricing starting at ₹5,999. Tailored packages for businesses in Ahmedabad, Surendranagar, and Bhubaneswar.',
    canonical: `${SITE_URL}/pricing`,
    ogTitle: 'Affordable Web Design & Development Pricing | Vebmore',
    ogDescription:
      'Transparent, affordable website design and development pricing starting at ₹5,999. Tailored packages for businesses in Ahmedabad, Surendranagar, and Bhubaneswar.',
    ogImage: `${SITE_URL}/og-image.png`,
    ogImageAlt: 'Vebmore Pricing & Packages — Transparent Web Architecture',
  },
  '/contact': {
    title: 'Contact Vebmore | Web Design Agency in India & Remote',
    description:
      'Get in touch with Vebmore for your website design and web development needs. Serving clients across Ahmedabad, Surendranagar, and Bhubaneswar, Gujarat, India.',
    canonical: `${SITE_URL}/contact`,
    ogTitle: 'Contact Vebmore | Web Design Agency in India & Remote',
    ogDescription:
      'Get in touch with Vebmore for your website design and web development needs. Serving clients across Ahmedabad, Surendranagar, and Bhubaneswar, Gujarat, India.',
    ogImage: `${SITE_URL}/og-image.png`,
    ogImageAlt: 'Contact Vebmore — Web Design & Development Inquiries',
  },
  '/directory': {
    title: 'Studio Directory & Capabilities | Vebmore India',
    description:
      'Explore Vebmore\'s studio capabilities, web architecture stack, and digital solutions serving brands across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    canonical: `${SITE_URL}/directory`,
    ogTitle: 'Studio Directory & Capabilities | Vebmore India',
    ogDescription:
      'Explore Vebmore\'s studio capabilities, web architecture stack, and digital solutions serving brands across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    ogImage: `${SITE_URL}/og-image.png`,
    ogImageAlt: 'Vebmore Studio Directory — Capabilities & Architecture',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Vebmore Web Design Studio',
    description:
      'Get clear answers about Vebmore\'s website design pricing (₹5,999–₹24,499), delivery turnaround, tech stack, and service coverage across Ahmedabad and India.',
    canonical: `${SITE_URL}/faq`,
    ogTitle: 'Frequently Asked Questions | Vebmore Web Design Studio',
    ogDescription:
      'Get clear answers about Vebmore\'s website design pricing (₹5,999–₹24,499), delivery turnaround, tech stack, and service coverage across Ahmedabad and India.',
    ogImage: `${SITE_URL}/og-image.png`,
    ogImageAlt: 'Vebmore FAQ — Web Design Pricing & Process',
  },
}
