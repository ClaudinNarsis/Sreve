"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import UserCreationTest from "../components/UserCreationTest";
import { useAutoCreateUser } from "../hooks/useAutoCreateUser";
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
          <div className="sidebar-header">
            <h3>Explorer</h3>
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
          </div>
          <div className="file-tree">
            <div className="folder-item" onClick={(e) => {
              e.currentTarget.classList.toggle('expanded');
            }}>
              <div className="folder-header">
                <svg className="folder-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,6 9,6 15,12 9,18"></polyline>
                </svg>
                <svg className="folder-icon-closed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="folder-name">src</span>
              </div>
              <div className="folder-content">
                <div className="file-item">
                  <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                  </svg>
                  <span className="file-name">index.tsx</span>
                </div>
                <div className="file-item">
                  <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                  </svg>
                  <span className="file-name">app.css</span>
                </div>
              </div>
            </div>
            <div className="folder-item" onClick={(e) => {
              e.currentTarget.classList.toggle('expanded');
            }}>
              <div className="folder-header">
                <svg className="folder-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,6 9,6 15,12 9,18"></polyline>
                </svg>
                <svg className="folder-icon-closed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="folder-name">components</span>
              </div>
              <div className="folder-content">
                <div className="file-item">
                  <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                  </svg>
                  <span className="file-name">Header.tsx</span>
                </div>
                <div className="file-item">
                  <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                  </svg>
                  <span className="file-name">Sidebar.tsx</span>
                </div>
              </div>
            </div>
            <div className="file-item">
              <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
              </svg>
              <span className="file-name">package.json</span>
            </div>
            <div className="file-item">
              <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
              </svg>
              <span className="file-name">README.md</span>
            </div>
          </div>
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
                  <UserCreationTest />
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