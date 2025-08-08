"use client";
import Link from 'next/link';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function HomePage() {
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
    if (!button.querySelector('.button-loader')) {
      const loader = document.createElement('span');
      loader.className = 'button-loader';
      button.appendChild(loader);
    }
    setTimeout(() => { window.location.href = url; }, 2000);
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

      <section className="hero">
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
                  <button className="chip">Create an ad script for a cookie brand</button>
                  <button className="chip">Generate a UGC script for a new skincare line</button>
                  <button className="chip">Write a hook for a fitness app</button>
                </div>
              </div>
            </div>
            <button className="generate-button">Generate</button>
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
          <button className="cta-button" onClick={(e) => gtagClick(e as any, '/schedule')}>Learn More</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/1-1.png" alt="Feature 1" />
        </div>
        <div className="feature">
          <h2>Thinks Like a Strategist</h2>
          <p>“This feels like something my strategist would say.”</p>
          <button className="cta-button" onClick={(e) => gtagClick(e as any, '/schedule')}>Learn More</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/1-2.png" alt="Feature 2" />
        </div>
        <div className="feature">
          <h2>Built for creative teams</h2>
          <p>“Before Sreve, Everything needs rewriting or “seasoning” to work”</p>
          <button className="cta-button" onClick={(e) => gtagClick(e as any, '/schedule')}>Learn More</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/1-3.png" alt="Feature 3" />
        </div>
      </section>

      <section id="pricing" className="packages features">
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
              <button className="cta-button secondary-cta" onClick={(e) => gtagClick(e as any, '/schedule')}>Try now for free</button>
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
              <button className="cta-button secondary-cta" onClick={(e) => gtagClick(e as any, '/schedule')}>Try now for free</button>
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
            <h2>"Honestly, it felt like having a junior creative who gets it. We plugged in our product link, and Sreve gave us 10 ad options that we could instantly launch. It’s now a core part of our workflow."</h2>
            <p>— Priya, Performance Marketer, Beauty Startup</p>
          </div>
          <div className="card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/p1.jpg" alt="Arjun" className="testimonial-avatar" />
            <h2>"I’ve tried countless AI ad tools, but Sreve is the first that actually feels like it understands our products. We launched ads in 15 minutes that outperformed our best manually designed creatives"</h2>
            <p>— Arjun, Growth Lead, DTC Apparel Brand</p>
          </div>
          <div className="card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/p2.jpeg" alt="Lisa" className="testimonial-avatar" />
            <h2>"As an agency owner, kickoff phases used to drain hours. With Sreve, we generate scroll-stopping ad variations in minutes, letting our designers focus on strategy and storytelling."</h2>
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
