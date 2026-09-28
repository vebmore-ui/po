import { useEffect, useRef, useState } from 'react'
import VantaBirds from './about/VantaBirds'

/**
 * The About section — the page's first WHITE surface.
 *
 * Everything before this is a black canvas, so the section's job is to read as a
 * different material: paper rather than screen. It is therefore deliberately
 * quiet — no gradients, no effects, no fills — and the only saturated colour on
 * the whole page is the two small green quotation marks and the birds.
 *
 * The content arrives element by element rather than all at once. Each block is
 * its own beat so the composition assembles in reading order, which is what the
 * brief asks for; the sequence is driven from here rather than from scroll
 * because the section is already fully on screen by the time it plays.
 */

const WORDS = ['FLY', 'MORE', 'WITH']
const MARK = 'VEBMORE'

export default function AboutSection({ active }: { active: boolean }) {
  // One flag per beat, so each element can be given its own stagger without a
  // library. The order below IS the reveal order.
  const [beat, setBeat] = useState(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (!active) return
    // Beats, in the order the composition is read. `beat` is a high-water mark —
    // every step is at or after the one before it — because each timer writes an
    // absolute value: an out-of-order pair would leave the count sitting at the
    // LOWER number and permanently hide everything above it.
    //   1 label, 2 title words, 3 mark, 4 paragraph, 5 caption, 6 birds.
    const schedule: Array<[number, number]> = [
      [120, 1],
      [320, 2],
      [620, 3],
      [820, 4],
      [1000, 5],
      // The WebGL context is only created once the section is really in play: it
      // is expensive, and creating it for a section nobody has reached would cost
      // every visitor a canvas they never see. Last, so it never rewinds `beat`.
      [1150, 6],
    ]
    schedule.forEach(([ms, n]) =>
      timers.current.push(window.setTimeout(() => setBeat((b) => Math.max(b, n)), ms)),
    )

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [active])

  const shown = (n: number) => beat >= n

  return (
    <section className="ab-root" aria-label="About Vebmore">
      <div className="ab-grid">
        {/* ---------------- LEFT: the editorial column ---------------- */}
        <div className="ab-left">
          <p className={`ab-label ab-rise${shown(1) ? ' is-in' : ''}`}>
            <span>ABOUT</span>
            {/* The quotation marks are the label's only colour: they open the
                statement that the title then makes. */}
            <span className="ab-quotes" aria-hidden="true">
              &ldquo;&rdquo;
            </span>
          </p>

          <h2 className="ab-title">
            {/* Word by word, so the sentence builds rather than appearing. Each
                word sits in its own overflow-hidden wrapper, which is what lets it
                slide up from nothing instead of fading in. */}
            <span className="ab-title-line">
              {WORDS.map((word, i) => (
                <span className="ab-word-mask" key={word}>
                  <span
                    className={`ab-word${shown(2) ? ' is-in' : ''}`}
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </span>
            <span className="ab-title-line">
              <span className="ab-word-mask">
                <span
                  className={`ab-word ab-word-mark${shown(3) ? ' is-in' : ''}`}
                  style={{ transitionDelay: '120ms' }}
                >
                  {MARK}
                </span>
              </span>
            </span>
          </h2>

          <div className={`ab-copy ab-rise${shown(4) ? ' is-in' : ''}`}>
            <p className="ab-lede">A creative digital studio for the modern web.</p>
            <p>
              Vebmore is a focused digital agency building premium websites with quiet
              confidence. We combine design sensibility with clean engineering to create
              digital experiences that feel considered, intentional, and enduring.
            </p>
          </div>
        </div>

        {/* ---------------- RIGHT: the birds plate ---------------- */}
        <figure className={`ab-right ab-rise${shown(5) ? ' is-in' : ''}`}>
          <div className="ab-plate">
            <VantaBirds active={shown(6)} className="ab-birds" />
          </div>
          <figcaption className="ab-caption">
            <span className="ab-caption-index">01</span>
            <span>Motion study &mdash; Cursor closer to birds.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
