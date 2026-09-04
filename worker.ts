export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url)

    let response = await env.ASSETS.fetch(request)

    if (response.status === 404) {
      response = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`))
    }

    return response
  },
}
