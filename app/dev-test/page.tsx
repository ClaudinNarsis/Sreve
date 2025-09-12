"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import UserCreationTest from "../components/UserCreationTest";

export default function DevTest() {
  const [isDev, setIsDev] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're in development environment
    const checkEnvironment = async () => {
      try {
        // We can check via an API endpoint or environment variable
        const response = await fetch('/api/dev-check');
        if (response.ok) {
          const data = await response.json();
          setIsDev(data.isDev);
        }
      } catch {
        console.log('Environment check failed, assuming production');
        setIsDev(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnvironment();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#fff',
        backgroundColor: '#111'
      }}>
        Loading...
      </div>
    );
  }

  if (!isDev) {
    return (
      <>
        <header className="header">
          <Link href="/" aria-label="Sreve home">
            <img src="/assets/logo.png" alt="Sreve Logo" className="logo" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cta-button" style={{ margin: 0, padding: '0.75rem 1.5rem' }}>Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 80px)',
          color: '#fff',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚫 Access Denied</h1>
          <p style={{ fontSize: '1.1rem', color: '#ccc', marginBottom: '2rem' }}>
            This page is only available in development environment.
          </p>
          <Link href="/app">
            <button className="cta-button">
              Go to App
            </button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="header">
        <Link href="/" aria-label="Sreve home">
          <img src="/assets/logo.png" alt="Sreve Logo" className="logo" />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ margin: 0, padding: '0.75rem 1.5rem' }}>Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <div style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        color: '#fff'
      }}>
        <div style={{
          backgroundColor: '#222',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            color: '#ff6600'
          }}>
            🛠️ Development Testing Panel
          </h1>
          <p style={{ color: '#ccc', marginBottom: '1rem' }}>
            This page is only accessible in development environment. Use these tools to test various functionality.
          </p>
          <div style={{
            backgroundColor: '#333',
            border: '1px solid #555',
            borderRadius: '4px',
            padding: '1rem',
            fontSize: '0.9rem',
            color: '#aaa'
          }}>
            <strong>Environment:</strong> {process.env.ENVIRONMENT || 'Development'}<br/>
            <strong>URL:</strong> /dev-test<br/>
            <strong>Access:</strong> Development only
          </div>
        </div>

        <SignedIn>
          <UserCreationTest />
        </SignedIn>

        <SignedOut>
          <div style={{
            backgroundColor: '#222',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Please Sign In</h3>
            <p style={{ color: '#ccc', marginBottom: '1rem' }}>
              You need to be signed in to access the development testing tools.
            </p>
            <SignInButton mode="modal">
              <button className="cta-button">Sign In</button>
            </SignInButton>
          </div>
        </SignedOut>

        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#ff6600' }}>
            Navigation
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/app">
              <button style={{
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                App Page
              </button>
            </Link>
            <Link href="/app">
              <button style={{
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Create Project
              </button>
            </Link>
            <Link href="/onboarding">
              <button style={{
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Onboarding
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}