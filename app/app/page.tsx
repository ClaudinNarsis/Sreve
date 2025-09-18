"use client";

import Link from "next/link";
import NextImage from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ProjectExplorer, { ProjectExplorerRef } from "../components/ProjectExplorer";
import "../components/ProjectExplorer.css";
import { useAutoCreateUser } from "../hooks/useAutoCreateUser";
import { useSearchParams } from 'next/navigation';

import "./app.css";
import React, { useState, useEffect, Suspense, useRef } from "react";
import CampaignExplorer from "../components/CampaignExplorer";



function AppContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (selectedProjectId === null) {
      setSelectedCampaignId(null);
    }
  }, [selectedProjectId]);

  // Handle URL parameters for auto-selecting campaign
  useEffect(() => {
    const campaignId = searchParams.get('campaignId');
    const projectId = searchParams.get('projectId');

    console.log('🎯 [APP] URL parameters check:', { campaignId, projectId });

    if (campaignId && projectId) {
      console.log('🎯 [APP] Auto-selecting campaign from URL:', { campaignId, projectId });
      setSelectedCampaignId(campaignId);
      setSelectedProjectId(projectId);

      // Don't clear URL parameters immediately - let them persist for proper campaign selection
      console.log('🎯 [APP] URL parameters processed, keeping them for campaign selection');
    } else {
      console.log('🎯 [APP] No URL parameters to process');
    }
  }, [searchParams]);


  useAutoCreateUser();
  const projectExplorerRef = useRef<ProjectExplorerRef>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);




  return (
    <>
      <div className="app-layout">
        <aside
          className="file-sidebar"
          id="sidebar"
          style={{
            display: isStreaming ? 'none' : 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Logo at top */}
          <div className="sidebar-header">
            <Link href="/" aria-label="Sreve home">
              <NextImage src="/assets/logo.png" alt="Sreve Logo" className="logo" width={80} height={40} priority />
            </Link>
            {!isStreaming && (
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
            )}
          </div>


          {/* Project explorer in middle - flex grow */}
          <div className="sidebar-content">
            <SignedIn>
              <ProjectExplorer
                key={sidebarRefreshKey}
                ref={projectExplorerRef}
                onCampaignSelect={(campaignId, projectId) => {
                  setSelectedCampaignId(campaignId);
                  setSelectedProjectId(projectId);
                }}
                onProjectSelect={(projectId) => {
                  setSelectedProjectId(projectId);
                  setSelectedCampaignId(null); // Clear selected campaign when a project is selected
                }}
                onCreateProjectClick={() => {
                  // For now, just show a message that project creation is not available
                  console.log('Project creation not available in simplified interface');
                }}
                selectedProjectId={selectedProjectId}
                selectedCampaignId={selectedCampaignId}
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
            width: isStreaming ? '100%' : undefined,
            transition: 'width 0.3s ease'
          }}
        >
          {selectedCampaignId ? (
            <CampaignExplorer
              campaignId={selectedCampaignId}
              onStreamingStateChange={setIsStreaming}
              onDataChange={() => {
                // Refresh sidebar when campaign data changes (delete/edit)
                setSidebarRefreshKey(prev => prev + 1);
                setTimeout(() => {
                  projectExplorerRef.current?.refreshData();
                }, 100);
              }}
            />
          ) : (
            // Default empty state when nothing is selected
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#ccc',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{ maxWidth: '400px' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  color: '#fff'
                }}>
                  Welcome to Sreve
                </h2>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '2rem',
                  opacity: '0.8'
                }}>
                  Select a campaign from the sidebar to start chatting and generating content.
                </p>
              </div>
            </div>
          )}
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
