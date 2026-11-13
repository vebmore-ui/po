/**
 * Site URL constant — single point of configuration for the site domain.
 * Update this when pointing to a custom domain.
 */
const SITE_URL = 'https://your.vebmore-3f4.workers.dev'

/**
 * File extension regex: matches paths ending with an extension like .xml, .js, .css, .png, .html, etc.
 */
const FILE_EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/

interface Env {
  ASSETS?: {
    fetch: (request: Request | string) => Promise<Response>
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Guard against missing ASSETS binding so Worker never throws error 1101
    if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
      return new Response('Asset service unavailable', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const url = new URL(request.url)
    const pathname = url.pathname

    // 2. Dedicated /robots.txt route (guarantees crawler accessibility & sitemap declaration)
    if (pathname === '/robots.txt') {
      return new Response(
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        },
      )
    }

    // 3. Dedicated Google Search Console verification route (ensures direct 200 OK without 307 clean-URL redirect)
    if (pathname === '/googlecfb7fdca3c615ade.html' || pathname === '/googlecfb7fdca3c615ade') {
      return new Response('google-site-verification: googlecfb7fdca3c615ade.html', {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    // 4. Dedicated handling for /works and /work to guarantee prerendered HTML is served directly
    if (pathname === '/works' || pathname === '/works/' || pathname === '/work' || pathname === '/work/') {
      const worksUrl = new URL('/works/index.html', request.url)
      const worksRes = await env.ASSETS.fetch(new Request(worksUrl.toString(), request))
      if (worksRes.status === 200) {
        return worksRes
      }
    }

    try {
      // 5. Fetch the requested asset from the static assets directory
      const response = await env.ASSETS.fetch(request)

      // 6. Handle 404 from asset binding
      if (response.status === 404) {
        // Missing file-like path (has an extension) -> return a real 404
        if (FILE_EXTENSION_REGEX.test(pathname)) {
          return new Response('Not Found', {
            status: 404,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }

        // Check if a pre-rendered route file exists (e.g. /works/index.html or /works.html)
        const cleanPath = pathname.replace(/\/$/, '')
        if (cleanPath.length > 0) {
          const routeIndexUrl = new URL(`${cleanPath}/index.html`, request.url)
          const routeRes = await env.ASSETS.fetch(new Request(routeIndexUrl.toString(), request))
          if (routeRes.status === 200) {
            return routeRes
          }

          const routeHtmlUrl = new URL(`${cleanPath}.html`, request.url)
          const routeHtmlRes = await env.ASSETS.fetch(new Request(routeHtmlUrl.toString(), request))
          if (routeHtmlRes.status === 200) {
            return routeHtmlRes
          }
        }

        // Extension-less page route -> SPA fallback to /index.html
        const indexUrl = new URL('/index.html', request.url)
        return await env.ASSETS.fetch(new Request(indexUrl.toString(), request))
      }

      // 7. Guard against wrangler single-page-application rewriting missing files to index.html with 200 OK:
      // If a file-like path that is NOT .html was requested and returned HTML index, return a real 404.
      if (
        response.status === 200 &&
        FILE_EXTENSION_REGEX.test(pathname) &&
        !pathname.endsWith('.html') &&
        response.headers.get('content-type')?.includes('text/html')
      ) {
        return new Response('Not Found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      }

      return response
    } catch {
      // Fallback safeguard to prevent error 1101
      if (FILE_EXTENSION_REGEX.test(pathname)) {
        return new Response('Not Found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      }

      try {
        const indexUrl = new URL('/index.html', request.url)
        return await env.ASSETS.fetch(new Request(indexUrl.toString(), request))
      } catch {
        return new Response('Internal Server Error', {
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      }
    }
  },
}
