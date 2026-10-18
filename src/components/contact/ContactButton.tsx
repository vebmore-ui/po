import { useEffect, useRef } from 'react'
import {
  siGmail,
  siInstagram,
  siWhatsapp,
} from 'simple-icons'

/**
 * A single contact action.
 *
 * Icons come from `simple-icons` where the set still ships them. LinkedIn and
 * Microsoft Outlook are NOT exported by the installed simple-icons build (v16
 * removed several brand marks), so those two use small inline SVG glyphs drawn
 * here instead — nothing is ever loaded remotely.
 *
 * The button is a rounded rectangle on the black Contact surface: a white
 * outline and white text by default, inverting to a white fill with black text
 * and icon on hover. It also has a popping icon and a subtle magnetic pull
 * toward the cursor on fine pointers (transform only, so no layout shift).
 */

export type ContactIcon = 'linkedin' | 'instagram' | 'gmail' | 'outlook' | 'whatsapp'

interface Props {
  href: string
  label: string
  icon: ContactIcon
  /** Optional subject/greeting already baked into `href` by the caller. */
  ariaLabel?: string
}

/** Inline fallback glyphs for the two marks simple-icons no longer exports. */
function FallbackGlyph({ icon }: { icon: ContactIcon }) {
  if (icon === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.4 8.75 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.21V21H9z" />
      </svg>
    )
  }
  // outlook
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M2 5.5 12 3l10 2.5v13L12 21 2 18.5zM12 5.6 4 7.6v8.8l8 2 8-2V7.6z" opacity="0.55" />
      <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z" />
    </svg>
  )
}

/** The simple-icons path, where available. */
function SimpleIconGlyph({ icon }: { icon: ContactIcon }) {
  const si =
    icon === 'gmail' ? siGmail : icon === 'instagram' ? siInstagram : siWhatsapp
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d={si.path} />
    </svg>
  )
}

export default function ContactButton({ href, label, icon, ariaLabel }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)

  // Magnetic pull: max ~6px, fine pointers only, transform only.
  useEffect(() => {
    const mqFine = window.matchMedia('(pointer: fine)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mqFine.matches || mqMotion.matches) return
    const el = ref.current
    if (!el) return

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      const max = 6
      el.style.transform = `translate(${dx * max}px, ${dy * max}px)`
    }
    const onLeave = () => {
      el.style.transform = 'translate(0, 0)'
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const usesFallback = icon === 'linkedin' || icon === 'outlook'

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ct-btn"
      aria-label={ariaLabel ?? label}
    >
      <span className="ct-btn-icon" aria-hidden="true">
        {usesFallback ? (
          <FallbackGlyph icon={icon} />
        ) : (
          <SimpleIconGlyph icon={icon} />
        )}
      </span>
      <span className="ct-btn-label">{label}</span>
      <span className="ct-btn-arrow" aria-hidden="true">
        &#x2197;
      </span>
    </a>
  )
}
