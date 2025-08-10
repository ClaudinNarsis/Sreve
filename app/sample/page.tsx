"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import "./sample.css";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SignInButton } from '@clerk/nextjs';

function SampleContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get('prompt') || '';
  const answer = searchParams.get('answer') || '';
  const [loading, setLoading] = useState(true);
  const [displayedAnswer, setDisplayedAnswer] = useState('');

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    if (!loading) {
      const words = answer.split(' ');
      let currentWordIndex = 0;

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          setDisplayedAnswer((prev) => prev + ' ' + words[currentWordIndex]);
          currentWordIndex++;
        } else {
          clearInterval(interval);
        }
      }, 100); // Adjust typing speed here

      return () => clearInterval(interval);
    }
  }, [loading, answer]);

  return (
    <div className="sample-page">
      <header className="header">
        <Link href="/" aria-label="Sreve home">
          <img src="/assets/logo.png" alt="Sreve Logo" className="logo" />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/">Home</Link>
        </nav>
      </header>

      <main className="sample-content">
        <div className="container">
          <div className="sample-header">
            
          </div>

          <div className="answer-container">
            
            <div className="answer-content">
              {loading ? (
                <div className="loading-container">Thinking ...</div>
              ) : (
                <div className="formatted-answer">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedAnswer}</ReactMarkdown>
                </div>
              )}
            </div>
            <div className="cta-section">
              <p>Customise this for your brand? or want to chat with this answer?</p>
              <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                <button className="cta-button">Get Started</button>
              </SignInButton>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}

export default function SamplePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SampleContent />
    </Suspense>
  );
}