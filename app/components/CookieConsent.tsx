'use client';

import { useState, useEffect } from 'react';
import '../styles/cookie-consent.css';

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

declare global {
  interface Window {
    clarity?: (action: string, ...args: unknown[]) => void;
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already provided consent
    const savedConsent = localStorage.getItem('sreve-cookie-consent');

    if (!savedConsent) {
      // Show banner if no consent has been given
      setShowBanner(true);
    } else {
      // Apply saved consent
      const parsed = JSON.parse(savedConsent);
      setConsent(parsed);
      applyClarityConsent(parsed);
    }
  }, []);

  const applyClarityConsent = (consentState: ConsentState) => {
    if (typeof window !== 'undefined' && window.clarity) {
      // Use Clarity Consent API v2
      // Mapping: analytics consent controls Clarity tracking
      if (consentState.analytics) {
        // Grant consent for Clarity
        window.clarity('consent');
      } else {
        // Revoke consent for Clarity
        window.clarity('consent', false);
      }
    }
  };

  const saveConsent = (consentState: ConsentState) => {
    localStorage.setItem('sreve-cookie-consent', JSON.stringify(consentState));
    applyClarityConsent(consentState);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setConsent(allConsent);
    saveConsent(allConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setConsent(minimalConsent);
    saveConsent(minimalConsent);
  };

  const handleSaveCustom = () => {
    saveConsent(consent);
  };

  const toggleConsent = (category: keyof ConsentState) => {
    if (category === 'necessary') return; // Cannot disable necessary cookies

    setConsent(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        {!showSettings ? (
          <>
            <div className="cookie-consent-content">
              <h3>We Value Your Privacy</h3>
              <p>
                We use cookies to enhance your browsing experience, analyze site traffic,
                and personalize content. By clicking &quot;Accept All&quot;, you consent to our use
                of cookies for analytics and marketing purposes.
              </p>
              <p className="privacy-link">
                Read our{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>{' '}
                to learn more about how we protect your data.
              </p>
            </div>

            <div className="cookie-consent-actions">
              <button
                className="cookie-btn cookie-btn-secondary"
                onClick={handleRejectAll}
              >
                Reject All
              </button>
              <button
                className="cookie-btn cookie-btn-tertiary"
                onClick={() => setShowSettings(true)}
              >
                Customize
              </button>
              <button
                className="cookie-btn cookie-btn-primary"
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-consent-content">
              <h3>Cookie Preferences</h3>
              <p className="cookie-settings-intro">
                Manage your cookie preferences below. You can enable or disable different
                types of cookies according to your preferences.
              </p>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={consent.necessary}
                      disabled
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h4>Necessary Cookies</h4>
                    <p>
                      Required for the website to function properly. These cookies ensure
                      basic functionalities and security features. Cannot be disabled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={() => toggleConsent('analytics')}
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h4>Analytics Cookies</h4>
                    <p>
                      Help us understand how visitors interact with our website by
                      collecting and reporting information anonymously. We use Microsoft
                      Clarity to analyze user behavior and improve our service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={() => toggleConsent('marketing')}
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h4>Marketing Cookies</h4>
                    <p>
                      Used to track visitors across websites to display relevant and
                      engaging advertisements. Helps us measure the effectiveness of
                      our marketing campaigns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cookie-consent-actions">
              <button
                className="cookie-btn cookie-btn-secondary"
                onClick={() => setShowSettings(false)}
              >
                Back
              </button>
              <button
                className="cookie-btn cookie-btn-primary"
                onClick={handleSaveCustom}
              >
                Save Preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
