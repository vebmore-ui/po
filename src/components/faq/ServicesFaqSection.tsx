import { Link } from '../../router'
import { GMAIL_ADDRESS, PHONES, INSTAGRAM_URL, LINKEDIN_URL } from '../contact/contactData'
import './faq.css'

export default function ServicesFaqSection() {
  const phone = PHONES[0]?.display ?? '+91 9427550414'

  return (
    <section className="sf-root" aria-label="Services and Frequently Asked Questions">
      <div className="sf-inner">
        <header className="sf-head">
          <p className="sf-label">
            <span>INDEX &amp; DIRECTORY</span>
            <span className="sf-label-green" aria-hidden="true">
              // 07
            </span>
          </p>
          <h2 className="sf-title">
            Website Design, Web Development &amp; Digital Solutions
          </h2>
          <p className="sf-lede">
            Vebmore is an independent digital studio operating across Ahmedabad, Surendranagar, and
            Bhubaneswar, India. We engineer bespoke websites, storefronts, and interactive digital
            platforms that unite aesthetic discipline with resilient engineering.
          </p>
        </header>

        <div className="sf-grid">
          {/* ── Left Column: Core Services ── */}
          <div className="sf-services-col">
            <h3 className="sf-col-title">// STUDIO CAPABILITIES</h3>
            <div className="sf-services-list">
              <article className="sf-service-item">
                <h4 className="sf-service-name">Bespoke Website Design</h4>
                <p className="sf-service-desc">
                  Creative direction, interface architecture, typography curation, and responsive
                  grid layouts designed to elevate brand authority and user engagement.
                </p>
              </article>

              <article className="sf-service-item">
                <h4 className="sf-service-name">High-Performance Web Development</h4>
                <p className="sf-service-desc">
                  Modern frontend engineering with React, TypeScript, Vite, and Cloudflare Workers
                  delivering instant page hydration, Core Web Vitals optimization, and clean semantic markup.
                </p>
              </article>

              <article className="sf-service-item">
                <h4 className="sf-service-name">Affordable Digital Solutions</h4>
                <p className="sf-service-desc">
                  Transparent tiered pricing starting at ₹5,999 for foundational landing pages up to
                  ₹24,499 for scalable CMS-powered architectures, engineered for businesses and startups.
                </p>
              </article>

              <article className="sf-service-item">
                <h4 className="sf-service-name">Interactive Motion &amp; 3D</h4>
                <p className="sf-service-desc">
                  Subtle GSAP timelines, WebGL canvas experiences, and reactive cursor choreography
                  crafted with restraint and strict accessibility fallbacks.
                </p>
              </article>
            </div>
          </div>

          {/* ── Right Column: Frequently Asked Questions ── */}
          <div className="sf-faq-col">
            <h3 className="sf-col-title">// FREQUENTLY ASKED QUESTIONS</h3>
            <div className="sf-faq-list">
              <div className="sf-faq-item">
                <h4 className="sf-faq-q">Which cities does Vebmore serve?</h4>
                <p className="sf-faq-a">
                  Our core service hubs are located in <strong>Ahmedabad (Gujarat)</strong>,{' '}
                  <strong>Surendranagar (Gujarat)</strong>, and <strong>Bhubaneswar (Odisha)</strong>, India.
                  We collaborate remotely with clients across India and globally.
                </p>
              </div>

              <div className="sf-faq-item">
                <h4 className="sf-faq-q">What is the starting price for a website?</h4>
                <p className="sf-faq-a">
                  Our transparent packages begin at <strong>₹5,999</strong> for single-page landing
                  presences, <strong>₹11,999</strong> for multi-page studio websites with custom motion,
                  and <strong>₹24,499</strong> for comprehensive web architectures with content management.
                </p>
              </div>

              <div className="sf-faq-item">
                <h4 className="sf-faq-q">Can I view recent client projects?</h4>
                <p className="sf-faq-a">
                  Yes, explore our portfolio archive at{' '}
                  <Link to="/works" className="sf-link">
                    Selected Works Archive ↗
                  </Link>{' '}
                  to inspect live builds, interactive storefronts, and architectural case studies.
                </p>
              </div>

              <div className="sf-faq-item">
                <h4 className="sf-faq-q">How can I initiate a project?</h4>
                <p className="sf-faq-a">
                  You can reach our studio directly via email at{' '}
                  <a href={`mailto:${GMAIL_ADDRESS}`} className="sf-link">
                    {GMAIL_ADDRESS}
                  </a>
                  , via phone or WhatsApp at{' '}
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="sf-link">
                    {phone}
                  </a>
                  , or connect with us on{' '}
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="sf-link">
                    Instagram
                  </a>{' '}
                  and{' '}
                  <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="sf-link">
                    LinkedIn
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
