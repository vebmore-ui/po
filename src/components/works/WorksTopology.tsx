// DORMANT — not imported anywhere. Vanta TOPOLOGY was removed from the Works
// panel for performance (it pulled in p5 and slowed scrolling); the background is
// now a plain #000000 plate. Kept for reference only — re-import it in
// WorksSection.tsx if it is ever wanted back.
import { useEffect, useRef } from 'react'

/**
 * Vanta TOPOLOGY, mounted as the Works panel's background layer.
 *
 * Vanta's topology bundle is a UMD script that expects `p5` to be reachable as a
 * global when it executes and registers itself onto `window.VANTA` as `TOPOLOGY`.
 * Neither global can be imported as a module, so — exactly like the birds effect
 * in `about/VantaBirds.tsx` — both are set at the moment this component actually
 * needs them, which keeps the mutation out of module scope where it would run on
 * every page load whether or not the Works section is ever reached.
 *
 * The effect is expensive and its canvas only matters while the panel is on
 * screen, so the parent drives `active` from scroll position: it is torn down
 * once Contact fully covers Works and rebuilt when Works comes back.
 */

type Props = {
  /** When false the effect is destroyed and never created. */
  active?: boolean
  className?: string
}

const TOPOLOGY = {
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.0,
  minWidth: 200.0,
  scale: 1.0,
  scaleMobile: 1.0,
  // Black field with the brand green as the line colour: the section reads as a
  // black monolith with subtle topology lines rather than a green surface.
  backgroundColor: 0x000,
  color: 0x0f8f4b,
} as const

type VantaEffect = { destroy: () => void }
type VantaFactory = (options: Record<string, unknown>) => VantaEffect
type VantaGlobal = { TOPOLOGY?: VantaFactory }

export default function WorksTopology({ active = true, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  // The live Vanta instance, torn down on unmount or when `active` goes false.
  const effectRef = useRef<VantaEffect | null>(null)

  useEffect(() => {
    if (!active) return
    // Reduced motion: no animated background at all — the panel stays black.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    let observer: ResizeObserver | null = null

    const build = () => {
      const VANTA = (window as unknown as { VANTA?: VantaGlobal }).VANTA
      if (!VANTA?.TOPOLOGY) return
      effectRef.current = VANTA.TOPOLOGY({
        el: host,
        p5: (window as unknown as { p5?: unknown }).p5,
        ...TOPOLOGY,
      })
    }

    const start = async () => {
      // p5 has to be on the window BEFORE the topology bundle executes, or the
      // bundle captures an empty p5 and fails on its first draw.
      const p5 = await import('p5')
      ;(window as unknown as { p5: unknown }).p5 = p5.default ?? p5
      await import('vanta/dist/vanta.topology.min.js')

      if (cancelled) return
      build()

      // Re-create on size change so the effect always matches its container:
      // Vanta measures its element once at init and never re-measures.
      observer = new ResizeObserver(() => {
        if (cancelled) return
        effectRef.current?.destroy()
        effectRef.current = null
        build()
      })
      observer.observe(host)
    }

    start().catch((err) => {
      // A failed WebGL context must not take the section down with it: the panel
      // simply stays black rather than throwing into the React tree.
      console.warn('[WorksTopology] effect did not start:', err)
    })

    return () => {
      cancelled = true
      observer?.disconnect()
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [active])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}
