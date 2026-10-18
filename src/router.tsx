/* oxlint-disable react/only-export-components */
/**
 * TINY ROUTER
 *
 * The site only needs three things: "what path am I on", "go to this path" and
 * "a link that does not reload the document". That is a handful of lines, so it
 * lives here rather than in a dependency.
 *
 *   usePath()      — subscribes to popstate, returns the current pathname
 *   navigate(path) — history.pushState + a synthetic navigation event
 *   <Link>         — an <a> that intercepts plain left-clicks only
 *
 * Modifier clicks (cmd / ctrl / shift / alt), middle clicks and `target="_blank"`
 * are left to the browser, so "open in a new tab" keeps working everywhere.
 */

import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from 'react'

/** Fired after `navigate()` so subscribers update without a full reload. */
const NAV_EVENT = 'veb:navigate'

export function navigate(path: string): void {
  if (typeof window === 'undefined') return
  if (window.location.pathname + window.location.search === path) {
    // Same URL: still notify, so hash-only moves re-run their scroll logic.
    window.dispatchEvent(new Event(NAV_EVENT))
    return
  }
  window.history.pushState(null, '', path)
  window.dispatchEvent(new Event(NAV_EVENT))
}

/** The current pathname. Re-renders only when it actually changes. */
export function usePath(): string {
  const [path, setPath] = useState<string>(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  )

  useEffect(() => {
    const sync = () => setPath(window.location.pathname)
    window.addEventListener('popstate', sync)
    window.addEventListener(NAV_EVENT, sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener(NAV_EVENT, sync)
    }
  }, [])

  return path
}

/** True for a click the router should handle itself. */
function isPlainLeftClick(e: MouseEvent<HTMLAnchorElement>): boolean {
  if (e.defaultPrevented) return false
  if (e.button !== 0) return false
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false
  const target = e.currentTarget.getAttribute('target')
  if (target && target !== '_self') return false
  return true
}

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  children: ReactNode
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (!isPlainLeftClick(e)) return
    e.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
