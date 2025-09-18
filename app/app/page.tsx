"use client";

import Link from "next/link";
import NextImage from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ProjectExplorer from "../components/ProjectExplorer";
import "../components/ProjectExplorer.css";
import { useAutoCreateUser } from "../hooks/useAutoCreateUser";

import "./app.css";
import React, { Suspense } from "react";



function AppContent() {
  const { user } = useUser();

  useAutoCreateUser();




  return (
    <>
      <div className="app-layout">
        <aside
          className="file-sidebar"
          id="sidebar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Logo at top */}
          <div className="sidebar-header">
            <Link href="/" aria-label="Sreve home">
              <NextImage src="/assets/logo.png" alt="Sreve Logo" className="logo" width={80} height={40} priority />
            </Link>
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
          </div>


          {/* Project explorer in middle - flex grow */}
          <div className="sidebar-content">
            <SignedIn>
              <ProjectExplorer
                onCampaignSelect={(campaignId, projectId) => {
                  console.log('Campaign selected:', campaignId, projectId);
                }}
                onProjectSelect={(projectId) => {
                  console.log('Project selected:', projectId);
                }}
                onCreateProjectClick={() => {
                  console.log('Project creation not available in simplified interface');
                }}
                selectedCampaignId={null}
                selectedProjectId={null}
              />
            </SignedIn>
            <SignedOut>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                color: '#ccc',
                textAlign: 'center'
              }}>
                <p>Sign in to view your projects</p>
              </div>
            </SignedOut>
          </div>

          {/* Auth at bottom */}
          <div className="sidebar-footer">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cta-button sign-in-sidebar">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="user-info">
                <UserButton />
                <span className="username">{user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'User'}</span>
              </div>
            </SignedIn>
          </div>
        </aside>
        <main
          className="main-content"
          style={{
            transition: 'width 0.3s ease'
          }}
        >
          <div className="chat-ui-container">
            <div className="chat-header">
              <h1 className="project-name">New Project</h1>
              <button className="edit-button" aria-label="Edit project">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
            <div className="chat-interface">
              <div className="chat-messages">
                <div className="message assistant-message">
                  <div className="message-content">
                    Hello! I'm your AI assistant. How can I help you create amazing marketing content today?
                  </div>
                </div>
              </div>
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    className="chat-input"
                    placeholder="Type your message here..."
                    rows={1}
                  />
                  <button className="send-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}
