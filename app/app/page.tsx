"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAutoCreateUser } from "../hooks/useAutoCreateUser";
import ProjectExplorer from "../components/ProjectExplorer";
import "../components/ProjectExplorer.css";
import "./app.css";

export default function App() {
  const { isCreating } = useAutoCreateUser();

  return (
    <>
      <header className="header">
        <Link href="/" aria-label="Sreve home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Sreve Logo" className="logo" />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="sidebar-toggle" onClick={() => {
            const sidebar = document.querySelector('.file-sidebar');
            sidebar?.classList.toggle('open');
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ margin: 0, padding: '0.75rem 1.5rem' }}>Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>
      <div className="app-layout">
        <aside className="file-sidebar" id="sidebar">
          <button className="collapse-btn" onClick={() => {
            const sidebar = document.getElementById('sidebar');
            const layout = document.querySelector('.app-layout');
            sidebar?.classList.toggle('collapsed');
            layout?.classList.toggle('sidebar-collapsed');
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
          <SignedIn>
            <ProjectExplorer />
          </SignedIn>
          <SignedOut>
            <div style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>
              <p>Sign in to view your projects</p>
            </div>
          </SignedOut>
        </aside>
        <main className="main-content">
          <section className="beta-full-section">
            <div className="beta-full-container">
              <h1 className="beta-full-title">Beta is Full</h1>
              <p className="beta-full-description primary">
                Thank you for your interest! We've reached our capacity for the beta.
              </p>
              <p className="beta-full-description secondary">
                You can still send your request, and we'll process it and send the
                response to your email.
              </p>
              <div className="beta-full-content">
                <SignedIn>
                  <p className="user-message">
                    We appreciate your understanding.
                  </p>
                  {isCreating && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#2a2a2a', 
                      borderRadius: '6px', 
                      margin: '10px 0',
                      fontSize: '14px',
                      color: '#888'
                    }}>
                      🔄 Setting up your account...
                    </div>
                  )}
                </SignedIn>
                <SignedOut>
                  <div className="signin-section">
                    <p className="signin-prompt">
                      Please sign in to submit your request.
                    </p>
                    <SignInButton mode="modal">
                      <button className="signin-button">
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}