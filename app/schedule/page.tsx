"use client";
import Link from 'next/link';
import React, { useCallback, useState } from 'react';

export default function SchedulePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !email.includes('@') || !name) {
      setError('Please enter a valid name and email address.');
      setLoading(false);
      return;
    }

    try {
      // attempt conversion event; ignore failure in dev
      // @ts-ignore
      if (typeof gtag === 'function') {
        // @ts-ignore
        gtag('event', 'conversion', {
          'send_to': 'AW-17102136063/19DjCLzorssaEP_F99o_',
          'value': 1.0,
          'currency': 'INR',
        });
      }

      const encodedEmail = encodeURIComponent(email);
      const encodedName = encodeURIComponent(name);
      const calendlyUrl = `https://calendly.com/claudinnarsis/sreve-onboarding?hide_gdpr_banner=1&email=${encodedEmail}&name=${encodedName}`;

      const calendlyDiv = document.getElementById('calendly-inline-widget');
      if (calendlyDiv) {
        calendlyDiv.setAttribute('data-url', calendlyUrl);
      }

      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        setShowCalendly(true);
        setLoading(false);
        // hide footer as in original page
        const footer = document.querySelector('footer');
        if (footer) (footer as HTMLElement).style.display = 'none';
      };
      document.body.appendChild(script);
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    } finally {
      // noop post load handled above
    }
  }, [email, name]);

  return (
    <>
      <header className="header">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Sreve Logo" className="logo" />
        </Link>
      </header>

      <div className="container email-form-container" style={{ display: showCalendly ? 'none' : 'block' }}>
        <h2>Book a Free Demo Call Now!</h2>
        <form id="email-form" onSubmit={handleSubmit}>
          <label htmlFor="name-input">Your Name</label>
          <input id="name-input" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />

          <label htmlFor="email-input">Your Email</label>
          <input id="email-input" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />

          <button type="submit" className="cta-button" id="submit-button">
            Choose a time {loading && <span className="button-loader" style={{ marginLeft: '1rem' }} />}
          </button>
          {error && <div id="email-error" className="error-message">{error}</div>}
          {loading && <div id="email-loading" className="loading-spinner">Loading…</div>}
        </form>
      </div>

      <div id="calendly-container" className="calendly-wrapper" style={{ display: showCalendly ? 'block' : 'none' }}>
        <div id="calendly-inline-widget" className="calendly-inline-widget" style={{ height: 1200 }} />
      </div>

      <footer className="footer">
        <div className="footer-content" style={{ textAlign: 'center', gridTemplateColumns: '1fr' }}>
          <div className="footer-section">
            <ul style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <li><a href="#">About</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="https://api.whatsapp.com/send/?phone=9487731230&type=phone_number&app_absent=0">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Sreve. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
