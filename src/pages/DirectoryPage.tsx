import { useEffect } from 'react'
import { Link } from '../router'
import SEO from '../components/SEO'
import { SEO_SERVICES, SEO_TECH_STACK, SEO_STUDIO_COPY } from '../content/seoCopy'
import './standalonePages.css'

export default function DirectoryPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="sp-root">
      <SEO path="/directory" />
      <div className="sp-grid-bg" aria-hidden="true" />

      <div className="sp-inner">
        {/* Header */}
        <header className="sp-head">
          <p className="sp-label">
            <span>INDEX &amp; DIRECTORY</span>
            <span className="sp-quote" aria-hidden="true">
              // 07
            </span>
          </p>

          <div className="sp-title-row">
            <h1 className="sp-title">INDEX &amp; DIRECTORY</h1>
            <div className="sp-head-actions">
              <Link to="/" className="sp-back-btn">
                ← BACK TO HOME
              </Link>
              <Link to="/faq" className="sp-back-btn">
                VIEW FAQ ↗
              </Link>
            </div>
          </div>

          <p className="sp-lede">
            Vebmore is an independent digital agency providing bespoke website design, high-performance web development, and affordable digital solutions for brands across Ahmedabad, Surendranagar, and Bhubaneswar, India.
          </p>
        </header>

        {/* Studio Capabilities */}
        <section className="sp-section" aria-labelledby="sec-capabilities">
          <div className="sp-section-head">
            <h2 id="sec-capabilities" className="sp-section-title">
              // STUDIO CAPABILITIES
            </h2>
            <Link to="/pricing" className="sp-back-btn" style={{ fontSize: '0.65rem', padding: '6px 14px' }}>
              PRICING TIERS ↗
            </Link>
          </div>

          <div className="sp-grid-2">
            {SEO_SERVICES.map((srv, idx) => (
              <article key={srv.id} className="sp-card">
                <span className="sp-card-index">0{idx + 1}</span>
                <span className="sp-card-category">{srv.category}</span>
                <h3 className="sp-card-title">{srv.name}</h3>
                <p className="sp-card-desc">{srv.description}</p>
                <ul className="sp-list" role="list">
                  {srv.highlights.map((h, i) => (
                    <li key={i} className="sp-list-item">
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Tech Stack Panel */}
        <section className="sp-section" aria-labelledby="sec-techstack">
          <div className="sp-section-head">
            <h2 id="sec-techstack" className="sp-section-title">
              // ARCHITECTURE &amp; TECH STACK
            </h2>
          </div>

          <div className="sp-grid-3">
            {SEO_TECH_STACK.map((tech) => (
              <div key={tech.name} className="sp-card">
                <span className="sp-card-index">// STACK</span>
                <h3 className="sp-card-title" style={{ fontSize: '1.6rem' }}>
                  {tech.name}
                </h3>
                <span className="sp-card-category">{tech.role}</span>
                <p className="sp-card-desc">{tech.benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Regional Hubs & Service Areas */}
        <section className="sp-section" aria-labelledby="sec-locations">
          <div className="sp-section-head">
            <h2 id="sec-locations" className="sp-section-title">
              // REGIONAL PRESENCE &amp; SERVICE AREAS
            </h2>
          </div>

          <div className="sp-grid-3">
            <div className="sp-card">
              <span className="sp-card-index">GUJARAT HUB</span>
              <h3 className="sp-card-title" style={{ fontSize: '1.8rem' }}>
                AHMEDABAD
              </h3>
              <p className="sp-card-desc">
                Commercial and creative web development partnerships for emerging brands, design-conscious founders, and modern enterprises in Ahmedabad, Gujarat.
              </p>
            </div>

            <div className="sp-card">
              <span className="sp-card-index">GUJARAT STUDIO</span>
              <h3 className="sp-card-title" style={{ fontSize: '1.8rem' }}>
                SURENDRANAGAR
              </h3>
              <p className="sp-card-desc">
                Regional digital solutions, affordable storefronts, and foundational online presences tailored for growing businesses across Saurashtra and Gujarat.
              </p>
            </div>

            <div className="sp-card">
              <span className="sp-card-index">EAST INDIA HUB</span>
              <h3 className="sp-card-title" style={{ fontSize: '1.8rem' }}>
                BHUBANESWAR
              </h3>
              <p className="sp-card-desc">
                Frontend architecture, scalable web applications, and interactive digital experiences for technology ventures and enterprises in Bhubaneswar, Odisha.
              </p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="sp-footer">
          <p className="sp-footer-text">
            HAVE A PROJECT BRIEF? EXPLORE OUR WORK OR START A CONVERSATION.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/works" className="sp-back-btn">
              VIEW ARCHIVE ↗
            </Link>
            <Link to="/#contact" className="sp-footer-btn">
              START A CONVERSATION →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
