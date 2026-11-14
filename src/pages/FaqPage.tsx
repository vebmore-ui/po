import { useEffect } from 'react'
import { Link } from '../router'
import SEO from '../components/SEO'
import { SEO_FAQS } from '../content/seoCopy'
import { GMAIL_ADDRESS, PHONES, INSTAGRAM_URL, LINKEDIN_URL } from '../components/contact/contactData'
import './standalonePages.css'

export default function FaqPage() {
  const phone = PHONES[0]?.display ?? '+91 9427550414'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="sp-root">
      <SEO path="/faq" />
      <div className="sp-grid-bg" aria-hidden="true" />

      <div className="sp-inner">
        {/* Header */}
        <header className="sp-head">
          <p className="sp-label">
            <span>QUESTIONS &amp; ANSWERS</span>
            <span className="sp-quote" aria-hidden="true">
              // 08
            </span>
          </p>

          <div className="sp-title-row">
            <h1 className="sp-title">FREQUENTLY ASKED QUESTIONS</h1>
            <div className="sp-head-actions">
              <Link to="/" className="sp-back-btn">
                ← BACK TO HOME
              </Link>
              <Link to="/directory" className="sp-back-btn">
                STUDIO DIRECTORY ↗
              </Link>
            </div>
          </div>

          <p className="sp-lede">
            Transparent insights into Vebmore’s website design and web development capabilities, tiered investment packages (₹5,999–₹24,499), delivery turnaround, and regional service hubs across Ahmedabad, Surendranagar, and Bhubaneswar, India.
          </p>
        </header>

        {/* FAQ List */}
        <section className="sp-section" aria-labelledby="sec-faq">
          <div className="sp-section-head">
            <h2 id="sec-faq" className="sp-section-title">
              // ANSWERS &amp; DETAILS
            </h2>
          </div>

          <div className="sp-faq-list">
            {SEO_FAQS.map((faq) => (
              <article key={faq.id} className="sp-faq-card">
                <span className="sp-card-index">{faq.category}</span>
                <h3 className="sp-faq-q">{faq.question}</h3>
                <p className="sp-faq-a">{faq.answer}</p>
              </article>
            ))}

            {/* Direct Contact Channels Card */}
            <article className="sp-faq-card">
              <span className="sp-card-index">DIRECT CHANNELS</span>
              <h3 className="sp-faq-q">Where can I reach the studio directly?</h3>
              <p className="sp-faq-a">
                You can reach us directly via email at{' '}
                <a href={`mailto:${GMAIL_ADDRESS}`} style={{ color: '#13ff00', textDecoration: 'underline' }}>
                  {GMAIL_ADDRESS}
                </a>
                , call or WhatsApp our team at{' '}
                <a href={`tel:${phone.replace(/\s+/g, '')}`} style={{ color: '#13ff00', textDecoration: 'underline' }}>
                  {phone}
                </a>
                , or connect via our official channels on{' '}
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#13ff00', textDecoration: 'underline' }}>
                  Instagram
                </a>{' '}
                and{' '}
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#13ff00', textDecoration: 'underline' }}>
                  LinkedIn
                </a>
                .
              </p>
            </article>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="sp-footer">
          <p className="sp-footer-text">
            HAVE A QUESTION NOT LISTED HERE? CONTACT OUR STUDIO DIRECTLY.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/pricing" className="sp-back-btn">
              VIEW PRICING ↗
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
