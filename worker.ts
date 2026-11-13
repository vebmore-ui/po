export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url)

    // Ensure robots.txt is directly served and never blocked
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /\n', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    try {
      let response = await env.ASSETS.fetch(request)

      if (response.status === 404) {
        const indexUrl = new URL('/index.html', request.url)
        response = await env.ASSETS.fetch(new Request(indexUrl.toString(), request))
      }

      return response
    } catch {
      try {
        const indexUrl = new URL('/index.html', request.url)
        return await env.ASSETS.fetch(new Request(indexUrl.toString(), request))
      } catch {
        return new Response('Not found', { status: 404 })
      }
    }
  },
}
