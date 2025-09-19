"use client";

import Link from "next/link";
import NextImage from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ProjectExplorer from "../components/ProjectExplorer";
import "../components/ProjectExplorer.css";
import { useAutoCreateUser } from "../hooks/useAutoCreateUser";

import "./app.css";
import React, { Suspense, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function AppContent() {
  const { user } = useUser();

  useAutoCreateUser();

  // State management
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you create amazing marketing content today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Message saving utility
  const saveMessageToDatabase = async (campaignId: string, message: ChatMessage) => {
    console.log('💾 Saving message to database:', { campaignId, message });

    try {
      const response = await fetch('/api/chat/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          message: {
            id: message.id,
            text: message.text,
            sender: message.sender,
            timestamp: message.timestamp.toISOString()
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log('✅ Message saved to database successfully');
        return true;
      } else {
        console.error('❌ Failed to save message:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving message to database:', error);
      return false;
    }
  };

  // Project and campaign creation utilities
  const createProject = async (initialPrompt: string) => {
    console.log('🔄 Creating project for prompt:', initialPrompt);

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_name: 'New Project',
        offering: '',
        usp: '',
        icp: '',
        brand_voice: '',
        competitors: '',
        additional_information: `Created from prompt: ${initialPrompt.substring(0, 200)}...`
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('✅ Project created:', data.project);
      return data.project;
    } else {
      throw new Error(data.error || 'Failed to create project');
    }
  };

  const createCampaign = async (projectId: string, initialPrompt: string) => {
    console.log('🔄 Creating campaign for project:', projectId);

    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        name: 'New Campaign',
        description: `Auto-created campaign from: ${initialPrompt.substring(0, 100)}...`
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('✅ Campaign created:', data.campaign);
      return data.campaign;
    } else {
      throw new Error(data.error || 'Failed to create campaign');
    }
  };

  // Message sending logic with campaign validation
  const handleSendMessage = useCallback(async () => {
    console.log('🚀 handleSendMessage called');

    if (!inputMessage.trim()) {
      console.log('❌ Empty input message');
      return;
    }

    const messageText = inputMessage.trim();

    // Check if campaign is selected
    if (!selectedCampaignId) {
      console.log('📝 No campaign selected, starting project/campaign creation flow');
      setIsCreatingProject(true);

      try {
        toast.loading('Creating your project and campaign...', { id: 'creating' });

        // Create project
        const project = await createProject(messageText);
        setSelectedProjectId(project.projectId);

        // Create campaign
        const campaign = await createCampaign(project.projectId, messageText);
        setSelectedCampaignId(campaign.campaignId);

        // Store initial prompt for the campaign
        sessionStorage.setItem(`initialPrompt_${campaign.campaignId}`, messageText);
        sessionStorage.setItem(`initialPrompt_${campaign.campaignId}_timestamp`, Date.now().toString());

        toast.success('Project and campaign created!', { id: 'creating' });

        // Add user message to chat
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          text: messageText,
          sender: 'user',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        // Save user message to database
        await saveMessageToDatabase(campaign.campaignId, userMessage);

        // Add bot response
        setTimeout(async () => {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: `Great! I've created a new project and campaign for you. Let's start working on your content. What type of marketing content would you like me to help you create?`,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);

          // Save bot message to database
          await saveMessageToDatabase(campaign.campaignId, botMessage);
        }, 1000);

      } catch (error) {
        console.error('❌ Error in project/campaign creation:', error);
        toast.error('Failed to create project and campaign', { id: 'creating' });
      } finally {
        setIsCreatingProject(false);
      }
    } else {
      // Campaign is selected, proceed with robust message sending via chat API
      console.log('💬 Campaign selected, sending message to chat API:', selectedCampaignId);

      // Add user message to chat immediately for better UX
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      try {
        // Call the robust chat API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: selectedCampaignId,
            userMessage: messageText
          })
        });

        const data = await response.json();
        console.log('🔄 Chat API response:', data);

        if (response.ok && data.success) {
          // Add bot response from API
          const botMessage: ChatMessage = {
            id: data.botMessageId || (Date.now() + 1).toString(),
            text: data.botMessage || 'Message processed successfully.',
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);

          // Handle special cases
          if (data.recovery) {
            console.log('🔄 Session recovery offered:', data.recovery);
          }
          if (data.questionsCompleted) {
            console.log('✅ All questions completed!');
          }
          if (data.nextQuestion) {
            console.log('❓ Next question available:', data.nextQuestion);
          }
        } else {
          console.error('❌ Chat API error:', data.error);

          // Add error message to chat
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: data.error?.message || 'Sorry, there was an error processing your message. Please try again.',
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);

          // Show retry guidance if available
          if (data.error?.retryable) {
            const retryAfter = data.error.retryAfter || 30;
            toast.error(`Service temporarily unavailable. Please try again in ${retryAfter} seconds.`);
          }
        }
      } catch (error) {
        console.error('❌ Network error calling chat API:', error);

        // Add network error message to chat
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Network error occurred. Please check your connection and try again.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);

        toast.error('Network error. Please try again.');
      }
    }
  }, [inputMessage, selectedCampaignId]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Load existing chat messages when campaign is selected
  const loadChatMessages = async (campaignId: string) => {
    console.log('📥 Loading chat messages for campaign:', campaignId);

    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/chat?campaignId=${campaignId}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const data = await response.json();
      console.log('📥 Chat API response:', data);

      if (response.ok && data.success) {
        // Convert database messages to ChatMessage format
        const dbMessages = data.messages || [];
        console.log('📋 Raw DB messages:', dbMessages);

        const chatMessages: ChatMessage[] = dbMessages.map((dbMsg: {
          chatMessageId: string;
          message: string;
          sender: string;
          timestamp?: string;
          createdAt: string;
        }) => ({
          id: dbMsg.chatMessageId,
          text: dbMsg.message,
          sender: dbMsg.sender as 'user' | 'bot',
          timestamp: new Date(dbMsg.timestamp || dbMsg.createdAt)
        }));

        // Add welcome message if no messages exist
        if (chatMessages.length === 0) {
          chatMessages.unshift({
            id: '1',
            text: 'Hello! I\'m your AI assistant. How can I help you create amazing marketing content today?',
            sender: 'bot',
            timestamp: new Date()
          });
        }

        setMessages(chatMessages);
        console.log('✅ Loaded', chatMessages.length, 'chat messages');
      } else {
        console.error('❌ Failed to load chat messages:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
    }
  };

  // Load messages when campaign changes
  useEffect(() => {
    console.log('🔄 Campaign selection changed:', selectedCampaignId);

    if (selectedCampaignId) {
      console.log('✅ Loading messages for campaign:', selectedCampaignId);
      loadChatMessages(selectedCampaignId);
    } else {
      console.log('📝 No campaign selected, showing default message');
      // Reset to default welcome message when no campaign selected
      setMessages([{
        id: '1',
        text: 'Hello! I\'m your AI assistant. How can I help you create amazing marketing content today?',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [selectedCampaignId]);

  // Handle pending prompts on app page load
  useEffect(() => {
    if (!user) return;

    const checkPendingPrompt = () => {
      const pendingPrompt = sessionStorage.getItem('pendingPrompt');
      const pendingTimestamp = sessionStorage.getItem('pendingPromptTimestamp');

      console.log('🔍 Checking for pending prompt on app load:', {
        hasPendingPrompt: !!pendingPrompt,
        pendingPrompt,
        timestamp: pendingTimestamp
      });

      if (pendingPrompt && pendingTimestamp) {
        // Check if prompt is still fresh (5 minutes)
        const timestamp = parseInt(pendingTimestamp);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        if (timestamp > fiveMinutesAgo) {
          console.log('✅ Fresh pending prompt found, processing automatically');

          // Set the input message and trigger send
          setInputMessage(pendingPrompt);

          // Clear the pending prompt
          sessionStorage.removeItem('pendingPrompt');
          sessionStorage.removeItem('pendingPromptTimestamp');

          // Trigger the message send flow after a short delay
          setTimeout(() => {
            handleSendMessage();
          }, 500);
        } else {
          console.log('⏰ Pending prompt expired, clearing');
          sessionStorage.removeItem('pendingPrompt');
          sessionStorage.removeItem('pendingPromptTimestamp');
        }
      }
    };

    // Check for pending prompt after component mounts
    const timer = setTimeout(checkPendingPrompt, 1000);
    return () => clearTimeout(timer);
  }, [user, handleSendMessage]);

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
              <button className="new-project-button" onClick={() => {
                console.log('Project creation not available in simplified interface');
              }}>
                + New Project
              </button>
              <ProjectExplorer
                onCampaignSelect={(campaignId, projectId) => {
                  console.log('🎯 [APP] Campaign selected callback triggered:', { campaignId, projectId });
                  console.log('🎯 [APP] Setting selectedCampaignId to:', campaignId);
                  setSelectedCampaignId(campaignId);
                  setSelectedProjectId(projectId);
                }}
                onProjectSelect={(projectId) => {
                  console.log('Project selected:', projectId);
                  setSelectedProjectId(projectId);
                  // Clear campaign selection when switching projects
                  setSelectedCampaignId(null);
                }}
                onCreateProjectClick={() => {
                  console.log('Project creation not available in simplified interface');
                }}
                selectedCampaignId={selectedCampaignId}
                selectedProjectId={selectedProjectId}
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
              <h1 className="project-name">
                {selectedCampaignId ? `Campaign: ${selectedCampaignId.slice(0, 8)}...` : 'New Project'}
              </h1>
              <button className="edit-button" aria-label="Edit project">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
            <div className="chat-interface">
              <div className="chat-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}>
                    <div className="message-content">
                      {message.text}
                    </div>
                  </div>
                ))}
                {isCreatingProject && (
                  <div className="message assistant-message">
                    <div className="message-content">
                      Creating your project and campaign...
                    </div>
                  </div>
                )}
              </div>
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    className="chat-input"
                    placeholder="Type your message here..."
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isCreatingProject}
                  />
                  <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isCreatingProject}
                  >
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
