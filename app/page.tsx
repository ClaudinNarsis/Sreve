"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [sampleResponses, setSampleResponses] = useState<{responses: Array<{prompt: string, answer: string}>}>({responses: []});

  useEffect(() => {
    fetch('/sample-responses.json')
      .then(response => response.json())
      .then(data => setSampleResponses(data))
      .catch(error => console.error('Error loading sample responses:', error));
  }, []);

  const handleGenerateClick = () => {
    const promptInput = document.querySelector<HTMLElement>('.prompt-input');
    const inputText = promptInput?.innerText?.trim() || '';
    
    if (inputText) {
      const matchingResponse = sampleResponses.responses.find(
        response => response.prompt.toLowerCase() === inputText.toLowerCase()
      );
      
      if (matchingResponse) {
        router.push(`/sample?prompt=${encodeURIComponent(matchingResponse.prompt)}&answer=${encodeURIComponent(matchingResponse.answer)}`);
      } else {
        const signInButton = document.querySelector<HTMLButtonElement>('.signup-button');
        signInButton?.click();
      }
    }
  };
  useEffect(() => {
    const mobileBtn = document.querySelector<HTMLButtonElement>('.mobile-menu-button');
    const navLinks = document.querySelector<HTMLDivElement>('.nav-links');
    mobileBtn?.addEventListener('click', () => navLinks?.classList.toggle('active'));

    const track = document.querySelector<HTMLElement>('.carousel-track');
    const initialOffset = 1200;
    if (track) {
      (track as HTMLElement).style.transform = `translateX(-${initialOffset}px)`;
      const onScroll = () => {
        const scrollY = window.scrollY;
        const scrollAmount = scrollY / 5;
        (track as HTMLElement).style.transform = `translateX(-${initialOffset + scrollAmount}px)`;
      };
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, []);

  useEffect(() => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (!howItWorksSection) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          howItWorksSection.classList.remove('section-hidden');
          howItWorksSection.classList.add('is-visible');
        } else {
          howItWorksSection.classList.add('section-hidden');
          howItWorksSection.classList.remove('is-visible');
        }
      });
    });
    observer.observe(howItWorksSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const exampleSection = document.getElementById('demo-video-section');
    if (!exampleSection) return;
    const exampleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          exampleSection.classList.add('in-view');
        } else {
          exampleSection.classList.remove('in-view');
        }
      });
    });
    exampleObserver.observe(exampleSection);
    return () => exampleObserver.disconnect();
  }, []);

  // Initialize external meeting scheduler strictly on the client after mount
  useEffect(() => {
    const containerId = 'meeting-scheduler';
    const initSchedulerIfAvailable = () => {
      if (typeof window !== 'undefined' && (window as any).initScheduler) {
        (window as any).initScheduler('https://meetings.superagi.com/Claudin-Narsis/30min', containerId);
      }
    };

    // Avoid adding duplicate script tags in Fast Refresh
    const existingScript = document.querySelector('script[data-ms-widget="1"]') as HTMLScriptElement | null;
    if (existingScript) {
      initSchedulerIfAvailable();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sales.superagi.com/meetingSchedulerWidget.js';
    script.async = true;
    script.setAttribute('data-ms-widget', '1');
    script.onload = initSchedulerIfAvailable;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const chips = document.querySelectorAll<HTMLButtonElement>('.chip');
    const promptInput = document.querySelector<HTMLElement>('.prompt-input');
    chips.forEach(chip => chip.addEventListener('click', () => { if (promptInput) promptInput.innerText = chip.innerText; }));
  }, []);

  useEffect(() => {
    const heroSection = document.querySelector<HTMLElement>('.hero');
    if (!heroSection) return;
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 20 - 10;
      const y = (e.clientY / window.innerHeight) * 20 - 10;
      heroSection.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
    };
    heroSection.addEventListener('mousemove', onMouseMove);
    return () => heroSection.removeEventListener('mousemove', onMouseMove);
  }, []);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header');
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 0) {
        header.classList.add('sticky');
      } else {
        header.classList.remove('sticky');
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const gtagClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, url: string) => {
    e.preventDefault();
    const button = e.currentTarget as HTMLElement;

    if (url.startsWith('#')) {
      const targetId = url.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }

      if (url === '#hero') {
        const promptBox = document.querySelector<HTMLElement>('.prompt-box');
        if (promptBox) {
          promptBox.classList.add('highlight');
          setTimeout(() => {
            promptBox.classList.remove('highlight');
          }, 1000); // Remove highlight after 2 seconds
        }
      }
    } else {
      if (!button.querySelector('.button-loader')) {
        const loader = document.createElement('span');
        loader.className = 'button-loader';
        button.appendChild(loader);
      }
      setTimeout(() => { window.location.href = url; }, 20);
    }
  };

  return (
    <>
      <header className="header">
        <Link href="/" aria-label="Sreve home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Sreve Logo" className="logo" />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a href="#features">Product</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact-us">Contact Us</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ margin: 0, padding: '0.75rem 1.5rem' }}>Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button go-to-app-button" style={{ margin: 0, padding: '0.75rem 1.5rem' }}>Go to App</button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
        <button className="mobile-menu-button" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </header>

      <section className="hero" id="hero">
        <div className="container">
          <p style={{ marginBottom: 0 }}>A creativity tool for marketers and founders. </p>
          <h1> Boring AI writes meh copy. <strong>Sreve</strong> writes<br />scroll-stoppers.</h1>
          <p> Generate UGC scripts, hooks, ad copy, and fresh ideas — all in your brand’s voice.</p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="signup-button">Sign In</button>
            </SignInButton>
          </SignedOut>
          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="What do you want to create?"></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Create a ad copy for hot-box</button>
                  <button className="chip">Create 5 static ad-copies for a water bottle</button>
                  <button className="chip">Create a UGC script for a Travel Agency</button>
                </div>
              </div>
            </div>
            <button className="generate-button" onClick={handleGenerateClick}>Generate</button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <a href="#demo-video-section" className="theme-link">Trusted by 500+ brands and agencies</a>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="feature">
          <h2>Unhinged (In a Good Way)</h2>
          <p>“No intern would dare write this.”</p>
          <button className="cta-button" onClick={(e) => gtagClick(e as any, '#hero')}>Try Now</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/1-1.png" alt="Feature 1" />
        </div>
        <div className="feature">
          <h2>Thinks Like a Strategist</h2>
          <p>“This feels like something my strategist would say.”</p>
          <button className="cta-button" onClick={(e) => gtagClick(e as any, '#hero')}>Try Now</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/1-2.png" alt="Feature 2" />
        </div>
        <div className="feature">
          <h2>Built for creative teams</h2>
          <p>“Before Sreve, Everything needs rewriting or “seasoning” to work”</p>
          <button className="cta-button" onClick={(e) => gtagClick(e as any, '#hero')}>Try Now</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/1-3.png" alt="Feature 3" />
        </div>
      </section>

      <section id="pricing" className="pricing-section packages features">
        <div className="container">
          <h2>Choose Your Plan</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Lite</h3>
              <p className="price-discounted">Free</p>
              <p className="price-per-month">always</p>
              <ul>
                <li>Generate up to 20 Ideas/month</li>
                <li>1 Brand Guide</li>
              </ul>
              <button className="cta-button secondary-cta" onClick={(e) => gtagClick(e as any, '#hero')}>Try now for free</button>
              <p className="no-credit-card">Start free. No credit card required</p>
            </div>
            <div className="pricing-card popular">
              <h3>Pro (Coming Soon)</h3>
              <p className="price-discounted">$19</p>
              <p className="price-per-month">/month</p>
              <ul>
                <li>Increased limit upto 200 Ideas/month</li>
                <li>5 Brand Guides</li>
              </ul>
              <button className="cta-button secondary-cta" onClick={(e) => gtagClick(e as any, '#hero')}>Try now for free</button>
              <p className="no-credit-card">Start free. No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <h2>Hear it from our Clients</h2>
        <div className="grid">
          <div className="card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/p3.jpeg" alt="Priya" className="testimonial-avatar" />
            <h3>"Honestly, it felt like having a junior creative who gets it. We plugged in our product link, and Sreve gave us 10 ad options that we could instantly launch. It’s now a core part of our workflow."</h3>
            <p>— Priya, Performance Marketer, Beauty Startup</p>
          </div>
          <div className="card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/p1.jpg" alt="Arjun" className="testimonial-avatar" />
            <h3>"I’ve tried countless AI ad tools, but Sreve is the first that actually feels like it understands our products. We launched ads in 15 minutes that outperformed our best manually designed creatives"</h3>
            <p>— Arjun, Growth Lead, DTC Apparel Brand</p>
          </div>
          <div className="card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/p2.jpeg" alt="Lisa" className="testimonial-avatar" />
            <h3>"As an agency owner, kickoff phases used to drain hours. With Sreve, we generate scroll-stopping ad variations in minutes, letting our designers focus on strategy and storytelling."</h3>
            <p>— Lisa, Founder</p>
          </div>
        </div>
        <div className="trust-badge">
          <p className="trust-text">✅ Trusted by 500+ creatives</p>
        </div>
      </section>

      <section className="final-cta-section" id="contact-us">
        <h3>Get creative ideas for your brand — free while we're in beta</h3>
        <div className="final-cta">
          <p className="cta-note">⚡ Limited spots available this month</p>
          <div className="container contact-box">
            <p className="contact-text">Have questions? Book a quick call with our team.</p>
            <div id="meeting-scheduler" style={{ width: '100%', height: 600, marginTop: '2rem' }}>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <ul className="footer-nav">
              <li><a href="#">About</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
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
