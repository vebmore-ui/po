// What element is actually painting the black after the pixelize resolves?
export default async function run(page) {
  const out = {}
  const vh = await page.evaluate(() => window.innerHeight)
  const base = 4.4 + 3.6

  // Park in the window between "pixelize done" and "about section on screen".
  await page.evaluate((y) => window.scrollTo(0, y), (base + 1.0) * vh)
  await page.waitForTimeout(1200)

  out.mid = await page.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
    const describe = (e) => {
      if (!e) return null
      const cs = getComputedStyle(e)
      const b = e.getBoundingClientRect()
      return {
        tag: e.tagName,
        cls: e.className?.toString?.() ?? '',
        bg: cs.backgroundColor,
        z: cs.zIndex,
        position: cs.position,
        rect: { top: Math.round(b.top), height: Math.round(b.height) },
      }
    }
    // Walk the stack at the centre point: everything painted there.
    const stack = []
    let node = el
    while (node && stack.length < 12) {
      stack.push(describe(node))
      node = node.parentElement
    }
    const spacer = document.querySelector('.scroll-spacer')
    const ab = document.querySelector('.ab-root')
    return {
      y: Math.round(window.scrollY),
      centreElement: describe(el),
      stack,
      spacerRect: spacer
        ? {
          top: Math.round(spacer.getBoundingClientRect().top),
          bottom: Math.round(spacer.getBoundingClientRect().bottom),
          height: Math.round(spacer.getBoundingClientRect().height),
        }
        : null,
      aboutRect: ab ? { top: Math.round(ab.getBoundingClientRect().top) } : null,
    }
  })

  return out
}
