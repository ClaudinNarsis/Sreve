"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import "./sample.css";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function SampleContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get('prompt') || '';
  const answer = searchParams.get('answer') || '';

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

              <div className="formatted-answer"><ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown></div>
            </div>
          </div>

          <div className="cta-section">
            <p>Like what you see? Sign up to create unlimited content for your brand!</p>
            <Link href="/">
              <button className="cta-button">Get Started</button>
            </Link>
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