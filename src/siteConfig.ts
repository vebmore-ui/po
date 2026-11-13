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
}
