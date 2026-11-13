import { useEffect } from 'react'
import { PAGES_METADATA, SITE_URL } from '../siteConfig'

interface Props {
  path: string
}

function updateMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attrName, attrValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function updateCanonical(url: string) {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', url)
}

export default function SEO({ path }: Props) {
  useEffect(() => {
    const meta = PAGES_METADATA[path] || PAGES_METADATA['/']
    if (!meta) return

    // Document Title
    document.title = meta.title

    // Meta Description & Canonical
    updateMetaTag('name', 'description', meta.description)
    updateCanonical(meta.canonical)

    // Open Graph
    updateMetaTag('property', 'og:title', meta.ogTitle)
    updateMetaTag('property', 'og:description', meta.ogDescription)
    updateMetaTag('property', 'og:url', meta.canonical)
    updateMetaTag('property', 'og:image', meta.ogImage)
    updateMetaTag('property', 'og:image:alt', meta.ogImageAlt)

    // Twitter Card
    updateMetaTag('name', 'twitter:title', meta.ogTitle)
    updateMetaTag('name', 'twitter:description', meta.ogDescription)
    updateMetaTag('name', 'twitter:image', meta.ogImage)
  }, [path])

  return null
}
