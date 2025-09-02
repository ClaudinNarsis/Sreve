"use client";
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const LazyTestimonials = dynamic(() => import('./components/LazyTestimonials'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', backgroundColor: '#f8f8f8' }} />
});
import React, { useEffect, useState, useMemo } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [sampleResponses, setSampleResponses] = useState<{responses: Array<{prompt: string, answer: string}>}>({responses: []});

  const loadSampleResponses = useMemo(() => {
    let controller: AbortController | null = null;
    return () => {
      if (controller) controller.abort();
      controller = new AbortController();
      fetch('/sample-responses.json', { signal: controller.signal })
        .then(response => response.json())
        .then(data => setSampleResponses(data))
        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Error loading sample responses:', error);
          }
        });
    };
  }, []);

  useEffect(() => {
    loadSampleResponses();
  }, [loadSampleResponses]);

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
  const handleMobileMenu = useMemo(() => {
    return () => {
      const mobileBtn = document.querySelector<HTMLButtonElement>('.mobile-menu-button');
      const navLinks = document.querySelector<HTMLDivElement>('.nav-links');
      mobileBtn?.addEventListener('click', () => navLinks?.classList.toggle('active'));
    };
  }, []);

  useEffect(() => {
    handleMobileMenu();

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

  const setupIntersectionObserver = useMemo(() => {
    return (elementId: string, visibleClass: string, hiddenClass?: string) => {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (hiddenClass) element.classList.remove(hiddenClass);
              element.classList.add(visibleClass);
            } else {
              if (hiddenClass) element.classList.add(hiddenClass);
              element.classList.remove(visibleClass);
            }
          });
        },
        { rootMargin: '50px' }
      );
      
      observer.observe(element);
      return () => observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanupHowItWorks = setupIntersectionObserver('how-it-works', 'is-visible', 'section-hidden');
    return cleanupHowItWorks;
  }, [setupIntersectionObserver]);

  useEffect(() => {
    const cleanupDemo = setupIntersectionObserver('demo-video-section', 'in-view');
    return cleanupDemo;
  }, [setupIntersectionObserver]);


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
          <Image src="/assets/logo.png" alt="Sreve Logo" className="logo" width={73} height={37} priority />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a href="#features">Product</a>
          <Link href="/tools">Tools</Link>
          <a href="#pricing">Pricing</a>
          <Link href="/blog">Blog</Link>
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
            <UserButton />
          </SignedIn>
        </div>
        <button className="mobile-menu-button" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </header>

      <section className="hero" id="hero">
        <div className="container">
          <p style={{ marginBottom: 0 }}>AI Blog Generator & Viral Post Creator for marketers and founders. </p>
          <h1>Boring AI writes meh copy. <span style={{fontWeight: 'bold', color: '#ff6600'}}>Sreve</span> writes scroll-stoppers.</h1>
          <p> Generate blog posts, viral social content, UGC scripts, hooks, ad copy, and fresh ideas — all in your brand's voice.</p>
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
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              <Link href="/blog" style={{ color: '#ff6600', textDecoration: 'underline' }}>
                Read our latest insights on AI copywriting and marketing automation →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container">
          <h2 style={{textAlign: 'center', marginBottom: '3rem'}}>Why Agencies Choose Sreve Over Generic AI</h2>
          <div className="features-grid">
            <article className="feature">
              <h3>Unhinged (In a Good Way)</h3>
              <p>"No intern would dare write this."</p>
              <button className="cta-button" onClick={(e) => gtagClick(e as any, '#hero')}>Try Now</button>
              <Image src="/assets/1-1.png" alt="Unhinged AI copywriting example showing creative ad copy" width={400} height={300} loading="lazy" sizes="(max-width: 768px) 100vw, 400px" priority={false} placeholder="blur" blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" />
            </article>
            <article className="feature">
              <h3>Thinks Like a Strategist</h3>
              <p>"This feels like something my strategist would say."</p>
              <button className="cta-button" onClick={(e) => gtagClick(e as any, '#hero')}>Try Now</button>
              <Image src="/assets/1-2.png" alt="Strategic AI copywriting example showing thoughtful ad messaging" width={400} height={300} loading="lazy" sizes="(max-width: 768px) 100vw, 400px" priority={false} placeholder="blur" blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" />
            </article>
            <article className="feature">
              <h3>Built for Creative Teams</h3>
              <p>"Before Sreve, Everything needs rewriting or "seasoning" to work"</p>
              <button className="cta-button" onClick={(e) => gtagClick(e as any, '#hero')}>Try Now</button>
              <Image src="/assets/1-3.png" alt="Creative team collaboration with AI-generated marketing content" width={400} height={300} loading="lazy" sizes="(max-width: 768px) 100vw, 400px" priority={false} placeholder="blur" blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQABAAABAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAEAQAE/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" />
            </article>
          </div>
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

      <LazyTestimonials />

      <section className="final-cta-section" id="contact-us">
        <h3>Get creative ideas for your brand — free while we're in beta</h3>
        <div className="final-cta">
          <p className="cta-note">⚡ Limited spots available this month</p>
          <div className="container contact-box">
            <p className="contact-text">Have questions? Book a quick call with our team.</p>
            <button className="cta-button" onClick={(e) => gtagClick(e as any, 'https://calendly.com/claudinnarsis/sreve-onboarding')}>Contact Us</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <ul className="footer-nav">
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><a href="https://api.whatsapp.com/send/?phone=9487731230&type=phone_number&app_absent=0" rel="noopener noreferrer" target="_blank">Contact</a></li>
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
