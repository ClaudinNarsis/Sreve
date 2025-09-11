"use client";
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const LazyTestimonials = dynamic(() => import('./components/LazyTestimonials'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', backgroundColor: '#f8f8f8' }} />
});
import React, { useEffect, useState, useMemo } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  console.log('🎯 [LANDING] HomePage component loaded');
  const [sampleResponses, setSampleResponses] = useState<{responses: Array<{prompt: string, answer: string}>}>({responses: []});
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState<string>('');

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

  // Clear any stale sessionStorage data on component mount (helps with production caching issues)
  useEffect(() => {
    // Clear any old create-project related data
    const keysToCheck = ['pendingPrompt', 'pendingPromptTimestamp'];
    keysToCheck.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value) {
        console.log(`🧹 [LANDING] Found stale sessionStorage key: ${key}, checking if valid...`);
        
        // If it's a timestamp, check if it's expired (older than 5 minutes)
        if (key.includes('Timestamp')) {
          const timestamp = parseInt(value);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          if (timestamp < fiveMinutesAgo) {
            console.log(`🧹 [LANDING] Clearing expired ${key}`);
            sessionStorage.removeItem(key);
            // Also clear the corresponding prompt
            sessionStorage.removeItem(key.replace('Timestamp', ''));
          }
        }
      }
    });
  }, []);

  // Check for pending prompts after auth redirect to landing page
  useEffect(() => {
    console.log('🎯 [LANDING] Checking for pending prompts after potential auth redirect');
    
    // Only proceed if authentication is loaded and user is signed in
    if (!isLoaded) {
      console.log('🎯 [LANDING] Auth not loaded yet, skipping prompt check');
      return;
    }
    
    if (!isSignedIn) {
      console.log('🎯 [LANDING] User not signed in, clearing any pending prompts and skipping redirect');
      // Clear any stale prompts for unauthenticated users
      sessionStorage.removeItem('pendingPrompt');
      sessionStorage.removeItem('pendingPromptTimestamp');
      return;
    }
    
    const checkPendingPromptOnLanding = async () => {
      const pendingPrompt = sessionStorage.getItem('pendingPrompt');
      const pendingTimestamp = sessionStorage.getItem('pendingPromptTimestamp');
      
      console.log('🎯 [LANDING] Pending prompt check:', { 
        hasPendingPrompt: !!pendingPrompt,
        pendingPrompt: pendingPrompt,
        timestamp: pendingTimestamp 
      });
      
      if (pendingPrompt && pendingTimestamp) {
        // Check if prompt is still fresh (5 minutes)
        const timestamp = parseInt(pendingTimestamp);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        if (timestamp > fiveMinutesAgo) {
          console.log('🎯 [LANDING] Found valid pending prompt after auth, auto-creating project');
          
          // Show loading state
          setIsAutoCreating(true);
          setCreationProgress('Setting up your project...');
          
          try {
            // Create project with placeholder data
            console.log('🎯 [LANDING] Creating project with placeholder data...');
            
            const projectResponse = await fetch('/api/projects', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                answers: {
                  1: "New Brand", // Brand Name - only required field
                  2: "", // Website - empty
                  3: "", // Description - empty
                  4: "", // Brand Voice - empty
                  5: [], // Brand Assets - empty
                  6: "" // Additional Info - empty
                },
                questions: [] // We'll load questions in the API if needed
              }),
            });

            const projectData = await projectResponse.json();
            console.log('🎯 [LANDING] Project creation response:', projectData);

            if (projectResponse.ok && projectData.success) {
              console.log('🎯 [LANDING] ✅ Project created successfully:', projectData.project);
              setCreationProgress('Creating your campaign...');
              
              // Create campaign with the prompt
              console.log('🎯 [LANDING] Creating campaign with prompt:', pendingPrompt);
              
              const campaignResponse = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  projectId: projectData.project.projectId,
                  name: `Campaign from prompt`,
                  description: `Auto-created campaign from: ${pendingPrompt.substring(0, 100)}...`
                }),
              });

              const campaignData = await campaignResponse.json();
              console.log('🎯 [LANDING] Campaign creation response:', campaignData);
              
              if (campaignResponse.ok && campaignData.success) {
                console.log('🎯 [LANDING] ✅ Campaign created successfully:', campaignData.campaign);
                setCreationProgress('Almost ready...');
                
                // Store initial prompt for the campaign
                sessionStorage.setItem(`initialPrompt_${campaignData.campaign.campaignId}`, pendingPrompt);
                sessionStorage.setItem(`initialPrompt_${campaignData.campaign.campaignId}_timestamp`, Date.now().toString());
                
                // Clear the pending prompt
                sessionStorage.removeItem('pendingPrompt');
                sessionStorage.removeItem('pendingPromptTimestamp');
                
                // Navigate to app with campaign selected
                setTimeout(() => {
                  setCreationProgress('Success! Opening your campaign...');
                  const redirectUrl = `/app?campaignId=${campaignData.campaign.campaignId}&projectId=${projectData.project.projectId}`;
                  console.log('🎯 [LANDING] Redirecting to:', redirectUrl);
                  window.location.href = redirectUrl;
                }, 1000);
                
              } else {
                console.error('🎯 [LANDING] ❌ Failed to create campaign:', campaignData);
                setCreationProgress('');
                setIsAutoCreating(false);
                // Clear pending prompt and redirect to app
                sessionStorage.removeItem('pendingPrompt');
                sessionStorage.removeItem('pendingPromptTimestamp');
                setTimeout(() => {
                  router.push('/app');
                }, 1000);
              }
              
            } else {
              console.error('🎯 [LANDING] ❌ Failed to create project:', projectData);
              setCreationProgress('');
              setIsAutoCreating(false);
              // Clear pending prompt on failure
              sessionStorage.removeItem('pendingPrompt');
              sessionStorage.removeItem('pendingPromptTimestamp');
            }
            
          } catch (error) {
            console.error('🎯 [LANDING] ❌ Error in auto-creation flow:', error);
            setCreationProgress('');
            setIsAutoCreating(false);
            // Clear pending prompt on error
            sessionStorage.removeItem('pendingPrompt');
            sessionStorage.removeItem('pendingPromptTimestamp');
          }
        } else {
          console.log('🎯 [LANDING] Pending prompt expired, clearing');
          sessionStorage.removeItem('pendingPrompt');
          sessionStorage.removeItem('pendingPromptTimestamp');
        }
      }
    };

    // Delay to ensure auth state is settled
    const timer = setTimeout(checkPendingPromptOnLanding, 2000);
    return () => clearTimeout(timer);
  }, [router, isLoaded, isSignedIn]);

  const handleGenerateClick = async () => {
    console.log('🎯 [LANDING] Generate button clicked');
    const promptInput = document.querySelector<HTMLElement>('.prompt-input');
    const inputText = promptInput?.innerText?.trim() || '';
    console.log('🎯 [LANDING] Input text:', inputText);
    
    if (inputText) {
      const matchingResponse = sampleResponses.responses.find(
        response => response.prompt.toLowerCase() === inputText.toLowerCase()
      );
      console.log('🎯 [LANDING] Matching sample response:', matchingResponse ? 'Found' : 'Not found');
      
      if (matchingResponse) {
        console.log('🎯 [LANDING] Redirecting to sample page');
        router.push(`/sample?prompt=${encodeURIComponent(matchingResponse.prompt)}&answer=${encodeURIComponent(matchingResponse.answer)}`);
      } else {
        // Check if auth is loaded and user is signed in
        if (isLoaded && isSignedIn) {
          console.log('🎯 [LANDING] User is signed in, creating project and campaign directly');
          
          // Show loading state
          setIsAutoCreating(true);
          setCreationProgress('Setting up your project...');
          
          try {
            // Create project with placeholder data
            console.log('🎯 [LANDING] Creating project with placeholder data...');
            
            const projectResponse = await fetch('/api/projects', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                answers: {
                  1: "New Brand", // Brand Name - only required field
                  2: "", // Website - empty
                  3: "", // Description - empty
                  4: "", // Brand Voice - empty
                  5: [], // Brand Assets - empty
                  6: "" // Additional Info - empty
                },
                questions: [] // We'll load questions in the API if needed
              }),
            });

            const projectData = await projectResponse.json();
            console.log('🎯 [LANDING] Project creation response:', projectData);

            if (projectResponse.ok && projectData.success) {
              console.log('🎯 [LANDING] ✅ Project created successfully:', projectData.project);
              setCreationProgress('Creating your campaign...');
              
              // Create campaign with the prompt
              console.log('🎯 [LANDING] Creating campaign with prompt:', inputText);
              
              const campaignResponse = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  projectId: projectData.project.projectId,
                  name: `Campaign from prompt`,
                  description: `Auto-created campaign from: ${inputText.substring(0, 100)}...`
                }),
              });

              const campaignData = await campaignResponse.json();
              console.log('🎯 [LANDING] Campaign creation response:', campaignData);
              
              if (campaignResponse.ok && campaignData.success) {
                console.log('🎯 [LANDING] ✅ Campaign created successfully:', campaignData.campaign);
                setCreationProgress('Almost ready...');
                
                // Store initial prompt for the campaign
                sessionStorage.setItem(`initialPrompt_${campaignData.campaign.campaignId}`, inputText);
                sessionStorage.setItem(`initialPrompt_${campaignData.campaign.campaignId}_timestamp`, Date.now().toString());
                
                // Navigate to app with campaign selected
                setTimeout(() => {
                  setCreationProgress('Success! Opening your campaign...');
                  const redirectUrl = `/app?campaignId=${campaignData.campaign.campaignId}&projectId=${projectData.project.projectId}`;
                  console.log('🎯 [LANDING] Redirecting to:', redirectUrl);
                  window.location.href = redirectUrl;
                }, 1000);
                
              } else {
                console.error('🎯 [LANDING] ❌ Failed to create campaign:', campaignData);
                setCreationProgress('');
                setIsAutoCreating(false);
                // Redirect to app even if campaign creation fails
                setTimeout(() => {
                  router.push('/app');
                }, 1000);
              }
              
            } else {
              console.error('🎯 [LANDING] ❌ Failed to create project:', projectData);
              setCreationProgress('');
              setIsAutoCreating(false);
            }
            
          } catch (error) {
            console.error('🎯 [LANDING] ❌ Error in creation flow:', error);
            setCreationProgress('');
            setIsAutoCreating(false);
          }
        } else if (isLoaded && !isSignedIn) {
          console.log('🎯 [LANDING] User not signed in, storing prompt for post-auth processing');
          // Store prompt in sessionStorage to survive auth redirects
          sessionStorage.setItem('pendingPrompt', inputText);
          sessionStorage.setItem('pendingPromptTimestamp', Date.now().toString());
          
          console.log('🎯 [LANDING] Triggering sign-in flow');
          // Trigger sign-in - user will be redirected through auth flow and return to app
          const signInButton = document.querySelector<HTMLButtonElement>('.signup-button');
          signInButton?.click();
        } else {
          console.log('🎯 [LANDING] Auth not loaded yet, please wait');
          // Auth not loaded yet - could show a loading indicator or just ignore the click
          return;
        }
      }
    } else {
      console.log('🎯 [LANDING] No input text provided');
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

  // Show loading screen when auto-creating project/campaign
  if (isAutoCreating) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        backgroundColor: '#1a1a1a',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid #333', 
            borderTop: '4px solid #ff6600', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 2rem auto'
          }}></div>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
            Getting your campaign ready...
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            color: '#ccc', 
            marginBottom: '1rem',
            opacity: '0.8'
          }}>
            {creationProgress}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#999' }}>
            This will just take a moment
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
