import http from 'http'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')

const SITE_URL = 'https://your.vebmore-3f4.workers.dev'

const ROUTES = [
  {
    path: '/',
    outputPath: path.join(distDir, 'index.html'),
    title: 'Vebmore | Website Design & Development in Ahmedabad, India',
    description:
      'Vebmore provides modern website design, web development, and affordable digital solutions for brands across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    canonical: `${SITE_URL}/`,
  },
  {
    path: '/about',
    outputPath: path.join(distDir, 'about', 'index.html'),
    aliasPath: path.join(distDir, 'about.html'),
    title: 'About Vebmore | Web Design Studio in Ahmedabad, India',
    description:
      'Learn about Vebmore, a digital design and web development agency creating affordable, high-performance websites across Ahmedabad, Surendranagar, and Bhubaneswar.',
    canonical: `${SITE_URL}/about`,
  },
  {
    path: '/services',
    outputPath: path.join(distDir, 'services', 'index.html'),
    aliasPath: path.join(distDir, 'services.html'),
    title: 'Web Design & Development Services | Vebmore Solutions',
    description:
      "Discover Vebmore's website design, web development, and affordable digital solutions tailored for growing brands in Ahmedabad, Surendranagar, and Bhubaneswar, India.",
    canonical: `${SITE_URL}/services`,
  },
  {
    path: '/works',
    outputPath: path.join(distDir, 'works', 'index.html'),
    aliasPath: path.join(distDir, 'works.html'),
    title: 'Web Design & Development Archive | Vebmore Projects',
    description:
      'Explore selected website design, web development, and digital solution projects by Vebmore for clients across Ahmedabad, Surendranagar, and Bhubaneswar, India.',
    canonical: `${SITE_URL}/works`,
  },
  {
    path: '/pricing',
    outputPath: path.join(distDir, 'pricing', 'index.html'),
    aliasPath: path.join(distDir, 'pricing.html'),
    title: 'Affordable Web Design & Development Pricing | Vebmore',
    description:
      'Transparent, affordable website design and development pricing starting at ₹5,999. Tailored packages for businesses in Ahmedabad, Surendranagar, and Bhubaneswar.',
    canonical: `${SITE_URL}/pricing`,
  },
  {
    path: '/contact',
    outputPath: path.join(distDir, 'contact', 'index.html'),
    aliasPath: path.join(distDir, 'contact.html'),
    title: 'Contact Vebmore | Web Design Agency in India & Remote',
    description:
      'Get in touch with Vebmore for your website design and web development needs. Serving clients across Ahmedabad, Surendranagar, and Bhubaneswar, Gujarat, India.',
    canonical: `${SITE_URL}/contact`,
  },
  {
    path: '/directory',
    outputPath: path.join(distDir, 'directory', 'index.html'),
    aliasPath: path.join(distDir, 'directory.html'),
    title: 'Studio Directory & Capabilities | Vebmore India',
    description:
      "Explore Vebmore's studio capabilities, web architecture stack, and digital solutions serving brands across Ahmedabad, Surendranagar, and Bhubaneswar, India.",
    canonical: `${SITE_URL}/directory`,
  },
  {
    path: '/faq',
    outputPath: path.join(distDir, 'faq', 'index.html'),
    aliasPath: path.join(distDir, 'faq.html'),
    title: 'Frequently Asked Questions | Vebmore Web Design Studio',
    description:
      "Get clear answers about Vebmore's website design pricing (₹5,999–₹24,499), delivery turnaround, tech stack, and service coverage across Ahmedabad and India.",
    canonical: `${SITE_URL}/faq`,
  },
]

function findChromePath() {
  const envBin = process.env.CHROME_BIN || process.env.PUPPETEER_EXECUTABLE_PATH
  if (envBin && fs.existsSync(envBin)) return envBin

  const candidates = [
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]

  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      return c
    }
  }
  return null
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.xml': 'application/xml',
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0]
      const ext = path.extname(reqPath)
      if (!ext) {
        reqPath = '/index.html'
      }
      const filePath = path.join(distDir, reqPath)
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const fileExt = path.extname(filePath).toLowerCase()
        res.writeHead(200, { 'Content-Type': mimeTypes[fileExt] || 'application/octet-stream' })
        fs.createReadStream(filePath).pipe(res)
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        fs.createReadStream(path.join(distDir, 'index.html')).pipe(res)
      }
    })

    server.listen(port, () => resolve(server))
    server.on('error', reject)
  })
}

function dumpDomWithChrome(chromePath, url) {
  return new Promise((resolve, reject) => {
    execFile(
      chromePath,
      [
        '--headless=new',
        '--dump-dom',
        '--virtual-time-budget=3000',
        '--disable-gpu',
        '--no-sandbox',
        url,
      ],
      { maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) return reject(err)
        resolve(stdout)
      },
    )
  })
}

function injectHeadMeta(html, route) {
  let modified = html

  // Replace or inject title
  if (modified.includes('<title>')) {
    modified = modified.replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`)
  } else {
    modified = modified.replace('</head>', `<title>${route.title}</title></head>`)
  }

  // Replace or inject meta description
  if (modified.includes('name="description"')) {
    modified = modified.replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="description" content="${route.description}" />`,
    )
  }

  // Replace or inject canonical link
  if (modified.includes('rel="canonical"')) {
    modified = modified.replace(
      /<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i,
      `<link rel="canonical" href="${route.canonical}" />`,
    )
  }

  // Replace or inject og:title
  if (modified.includes('property="og:title"')) {
    modified = modified.replace(
      /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta property="og:title" content="${route.title}" />`,
    )
  }

  // Replace or inject og:description
  if (modified.includes('property="og:description"')) {
    modified = modified.replace(
      /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta property="og:description" content="${route.description}" />`,
    )
  }

  // Replace or inject og:url
  if (modified.includes('property="og:url"')) {
    modified = modified.replace(
      /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta property="og:url" content="${route.canonical}" />`,
    )
  }

  // Replace or inject twitter:title
  if (modified.includes('name="twitter:title"')) {
    modified = modified.replace(
      /<meta\s+name="twitter:title"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="twitter:title" content="${route.title}" />`,
    )
  }

  // Replace or inject twitter:description
  if (modified.includes('name="twitter:description"')) {
    modified = modified.replace(
      /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="twitter:description" content="${route.description}" />`,
    )
  }

  return modified
}

async function run() {
  console.log('[prerender] Starting build-time prerendering...')
  const chromePath = findChromePath()

  if (!chromePath) {
    console.warn(
      '[prerender] Chrome executable not found on system. Generating static metadata fallbacks...',
    )
    const baseHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
    for (const route of ROUTES) {
      const pageHtml = injectHeadMeta(baseHtml, route)
      fs.mkdirSync(path.dirname(route.outputPath), { recursive: true })
      fs.writeFileSync(route.outputPath, pageHtml, 'utf8')
      if (route.aliasPath) {
        fs.writeFileSync(route.aliasPath, pageHtml, 'utf8')
      }
      console.log(`[prerender] Generated static route (fallback): ${route.path}`)
    }
    return
  }

  console.log(`[prerender] Using Chrome at: ${chromePath}`)
  const port = 4188
  const server = await startServer(port)

  try {
    for (const route of ROUTES) {
      console.log(`[prerender] Rendering route: ${route.path}`)
      const targetUrl = `http://127.0.0.1:${port}${route.path}`
      let renderedHtml = await dumpDomWithChrome(chromePath, targetUrl)

      // Ensure DOCTYPE is present
      if (!renderedHtml.startsWith('<!doctype html>') && !renderedHtml.startsWith('<!DOCTYPE html>')) {
        renderedHtml = `<!doctype html>\n${renderedHtml}`
      }

      // Synchronize head metadata tags
      renderedHtml = injectHeadMeta(renderedHtml, route)

      fs.mkdirSync(path.dirname(route.outputPath), { recursive: true })
      fs.writeFileSync(route.outputPath, renderedHtml, 'utf8')
      if (route.aliasPath) {
        fs.writeFileSync(route.aliasPath, renderedHtml, 'utf8')
      }
      console.log(
        `[prerender] Successfully wrote: ${path.relative(distDir, route.outputPath)} (${renderedHtml.length} bytes)`,
      )
    }
  } finally {
    server.close()
  }

  console.log('[prerender] Prerendering complete!')
}

run().catch((err) => {
  console.error('[prerender] Error during prerendering:', err)
  process.exit(1)
})
