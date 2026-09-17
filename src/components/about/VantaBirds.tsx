import { useEffect, useRef } from 'react'

/**
 * Vanta BIRDS, mounted into a container of this component's own.
 *
 * Vanta's bundle is a UMD script that reads `window.THREE` and registers itself
 * onto `window.VANTA` when it loads, so it cannot simply be imported as a
 * module. The two globals are therefore set (and the script imported) at the
 * moment this component mounts, which keeps that mutation out of module scope
 * where it would run on every page load whether or not the section is ever
 * reached.
 *
 * The effect is rebuilt whenever the container resizes: Vanta measures its
 * element on init and does not re-measure on its own, so a container that grows
 * after a layout change would leave the birds rendering into a stale viewport.
 */

type Props = {
  /** When false the effect is never created — used to defer the WebGL context. */
  active?: boolean
  className?: string
}

const BIRDS = {
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.0,
  minWidth: 200.0,
  scale: 1.0,
  scaleMobile: 1.0,
  // The brief's two greens: a bright acid accent and a deeper field tone.
  color1: 0x13ff00,
  color2: 0x64c24,
  // A white field behind the birds, matching the About section's paper.
  backgroundColor: 0xffffff,
} as const

export default function VantaBirds({ active = true, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  // The live Vanta instance, torn down on unmount or when `active` goes false.
  const effectRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    if (!active) return
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    let observer: ResizeObserver | null = null

    const start = async () => {
      // three has to be on the window BEFORE the birds bundle executes, or the
      // bundle captures an empty THREE and fails on its first draw.
      const THREE = await import('three')
      ;(window as unknown as { THREE: unknown }).THREE = THREE
      await import('vanta/dist/vanta.birds.min.js')

      if (cancelled) return

      const VANTA = (window as unknown as { VANTA?: Record<string, (o: unknown) => { destroy: () => void }> })
        .VANTA
      if (!VANTA?.BIRDS) return

      effectRef.current = VANTA.BIRDS({ el: host, ...BIRDS })

      // Re-create on size change so the effect always matches its container.
      observer = new ResizeObserver(() => {
        if (cancelled) return
        effectRef.current?.destroy()
        effectRef.current = null
        const again = (window as unknown as { VANTA?: Record<string, (o: unknown) => { destroy: () => void }> })
          .VANTA
        if (again?.BIRDS) effectRef.current = again.BIRDS({ el: host, ...BIRDS })
      })
      observer.observe(host)
    }

    start().catch((err) => {
      // A failed WebGL context must not take the section down with it: the plate
      // simply stays empty rather than throwing into the React tree. The error is
      // still reported, because a silent failure here is indistinguishable from
      // the effect simply not being reached.
      console.warn('[VantaBirds] effect did not start:', err)
    })

    return () => {
      cancelled = true
      observer?.disconnect()
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [active])

  return <div ref={hostRef} className={className} />
}
