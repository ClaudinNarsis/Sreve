"use client";

import Link from "next/link";
import NextImage from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import ProjectExplorer from "../components/ProjectExplorer";
import "../components/ProjectExplorer.css";
import { useAutoCreateUser } from "../hooks/useAutoCreateUser";
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import "./app.css";
import React, { useState, useEffect, Suspense } from "react";
import CampaignExplorer from "../components/CampaignExplorer";
import ProjectDetailsExplorer from "../components/ProjectDetailsExplorer";


interface QuestionOption {
  value: string;
  label: string;
}

interface Question {
  step: number;
  sidebarTitle: string;
  question: string;
  placeholder?: string;
  answerType: 'text' | 'textarea' | 'select' | 'multiselect' | 'url' | 'file';
  required: boolean;
  options?: QuestionOption[];
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface QuestionsData {
  questions: Question[];
}

function AppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState<string>('');

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
      setViewMode('campaignExplorer');
      
      // Don't clear URL parameters immediately - let them persist for proper campaign selection
      console.log('🎯 [APP] URL parameters processed, keeping them for campaign selection');
    } else {
      console.log('🎯 [APP] No URL parameters to process');
    }
  }, [searchParams]);

  // Check for pending prompts after auth and auto-process them
  useEffect(() => {
    console.log('🎯 [APP] useEffect for pending prompt check triggered');
    
    const checkPendingPrompt = async () => {
      console.log('🎯 [APP] checkPendingPrompt function called');
      const pendingPrompt = sessionStorage.getItem('pendingPrompt');
      const pendingTimestamp = sessionStorage.getItem('pendingPromptTimestamp');
      
      console.log('🎯 [APP] Checking for pending prompt:', { 
        hasPendingPrompt: !!pendingPrompt,
        pendingPrompt: pendingPrompt,
        timestamp: pendingTimestamp 
      });
      
      if (pendingPrompt && pendingTimestamp) {
        // Check if prompt is still fresh (5 minutes)
        const timestamp = parseInt(pendingTimestamp);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        if (timestamp > fiveMinutesAgo) {
          console.log('🎯 [APP] Found valid pending prompt, auto-creating project and campaign');
          
          // Show loading state
          setIsAutoCreating(true);
          setCreationProgress('Setting up your project...');
          
          try {
            // Create project with placeholder data
            console.log('🎯 [APP] Creating project with placeholder data...');
            
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
            console.log('🎯 [APP] Project creation response:', projectData);

            if (projectResponse.ok && projectData.success) {
              console.log('🎯 [APP] ✅ Project created successfully:', projectData.project);
              setCreationProgress('Creating your campaign...');
              
              // Create campaign with the prompt
              console.log('🎯 [APP] Creating campaign with prompt:', pendingPrompt);
              
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
              console.log('🎯 [APP] Campaign creation response:', campaignData);
              
              if (campaignResponse.ok && campaignData.success) {
                console.log('🎯 [APP] ✅ Campaign created successfully:', campaignData.campaign);
                setCreationProgress('Almost ready...');
                
                // Store initial prompt for the campaign
                sessionStorage.setItem(`initialPrompt_${campaignData.campaign.campaignId}`, pendingPrompt);
                sessionStorage.setItem(`initialPrompt_${campaignData.campaign.campaignId}_timestamp`, Date.now().toString());
                
                // Clear the pending prompt
                sessionStorage.removeItem('pendingPrompt');
                sessionStorage.removeItem('pendingPromptTimestamp');
                
                // Show success message and refresh the page
                setTimeout(() => {
                  setCreationProgress('Success! Opening your campaign...');
                  console.log('🎯 [APP] Refreshing page to open campaign:', campaignData.campaign.campaignId);
                  
                  // Refresh the page with the campaign selected
                  window.location.href = `/app?campaignId=${campaignData.campaign.campaignId}&projectId=${projectData.project.projectId}`;
                }, 1000);
                
              } else {
                console.error('🎯 [APP] ❌ Failed to create campaign:', campaignData);
                setCreationProgress('');
                setIsAutoCreating(false);
                toast.error('Failed to create campaign. Please try again.');
                // Clear pending prompt on campaign creation failure
                sessionStorage.removeItem('pendingPrompt');
                sessionStorage.removeItem('pendingPromptTimestamp');
              }
              
            } else {
              console.error('🎯 [APP] ❌ Failed to create project:', projectData);
              setCreationProgress('');
              setIsAutoCreating(false);
              toast.error('Failed to create project. Please try again.');
              // Clear pending prompt on project creation failure
              sessionStorage.removeItem('pendingPrompt');
              sessionStorage.removeItem('pendingPromptTimestamp');
            }
            
          } catch (error) {
            console.error('🎯 [APP] ❌ Error in auto-creation flow:', error);
            setCreationProgress('');
            setIsAutoCreating(false);
            toast.error('Something went wrong. Please try again.');
            // Clear pending prompt on error
            sessionStorage.removeItem('pendingPrompt');
            sessionStorage.removeItem('pendingPromptTimestamp');
          }
        } else {
          console.log('🎯 [APP] Pending prompt expired, clearing');
          sessionStorage.removeItem('pendingPrompt');
          sessionStorage.removeItem('pendingPromptTimestamp');
        }
      }
    };

    // Small delay to ensure auth state is settled
    const timer = setTimeout(checkPendingPrompt, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  const [viewMode, setViewMode] = useState<'campaignExplorer' | 'createProject' | 'projectDetails'>('campaignExplorer');
  const { isCreating } = useAutoCreateUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/create-project-questions.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: QuestionsData = await response.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const currentQuestion = questions.find(q => q.step === currentStep);

  const handleAnswerChange = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentStep]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateRequiredFields = () => {
    console.log('🔍 Validating all required fields...');
    const missingRequired = [];
    
    for (const question of questions) {
      if (question.required) {
        const answer = answers[question.step];
        const isEmpty = answer === undefined || answer === null || answer === '' || 
                       (Array.isArray(answer) && answer.length === 0);
        
        if (isEmpty) {
          missingRequired.push({
            step: question.step,
            title: question.sidebarTitle,
            question: question.question
          });
          console.log(`❌ Missing required field - Step ${question.step}: ${question.sidebarTitle}`);
        }
      }
    }

    if (missingRequired.length > 0) {
      console.log('❌ Validation failed:', missingRequired);
      
      // Show specific missing fields in toast
      const firstMissing = missingRequired[0];
      toast.error(`Please complete required field: "${firstMissing.title}"`, {
        duration: 4000,
      });
      
      // Navigate to first missing required field
      setCurrentStep(firstMissing.step);
      
      return false;
    }

    console.log('✅ All required fields validated successfully');
    return true;
  };

  const handleSubmit = async () => {
    console.log('📋 Create Project button clicked');
    console.log('📋 Current answers:', answers);
    
    // Validate required fields first
    if (!validateRequiredFields()) {
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Creating your project...');

    try {
      console.log('🚀 Submitting project to API...');
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          questions
        }),
      });

      const data = await response.json();
      console.log('📥 API Response:', data);

      toast.dismiss(loadingToast);

      if (response.ok && data.success) {
        console.log('✅ Project created successfully:', data.project);
        toast.success('🎉 Project created successfully!', {
          duration: 5000,
        });
        
        // Show project details in console and toast
        console.log('📋 Project Details:', {
          projectId: data.project.projectId,
          userId: data.project.userId,
          createdAt: data.project.createdAt
        });

        // Show project ID and redirect to app page
        setTimeout(() => {
          toast.success(`Project ID: ${data.project.projectId}`, {
            duration: 4000,
          });
        }, 1000);

        // Navigate to app page after success
        console.log('🔄 Redirecting to app page...');
        setTimeout(() => {
          router.push('/app');
        }, 2000);

      } else {
        console.error('❌ Project creation failed:', data);
        
        if (data.missingFields && data.missingFields.length > 0) {
          console.log('❌ Missing required fields:', data.missingFields);
          const firstMissing = data.missingFields[0];
          toast.error(`Missing required field: "${firstMissing.title}"`, {
            duration: 4000,
          });
          setCurrentStep(firstMissing.step);
        } else {
          toast.error(`❌ ${data.error || 'Failed to create project'}`, {
            duration: 4000,
          });
        }
      }

    } catch (error) {
      console.error('❌ Network error during project creation:', error);
      toast.dismiss(loadingToast);
      toast.error('❌ Network error. Please check your connection and try again.', {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepState = (question: Question) => {
    const answer = answers[question.step];
    const hasAnswer = answer !== undefined && answer !== null && answer !== '' && 
                     (Array.isArray(answer) ? answer.length > 0 : true);
    
    if (question.step === currentStep) {
      return 'active';
    } else if (hasAnswer) {
      return 'filled';
    } else if (question.required) {
      return 'required-unfilled';
    } else {
      return 'optional-unfilled';
    }
  };

  const renderInput = (question: Question) => {
    const currentAnswer = answers[currentStep] || '';

    switch (question.answerType) {
      case 'text':
      case 'url':
        return (
          <input
            type={question.answerType === 'url' ? 'url' : 'text'}
            placeholder={question.placeholder}
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder}
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            required={question.required}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="checkbox-group">
            {question.options?.map((option) => (
              <label key={option.value} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={currentAnswer?.includes(option.value) || false}
                  onChange={(e) => {
                    const newValue = currentAnswer || [];
                    if (e.target.checked) {
                      handleAnswerChange([...newValue, option.value]);
                    } else {
                      handleAnswerChange(newValue.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="file-input-wrapper">
            <input
              type="file"
              accept={question.acceptedTypes?.join(',')}
              multiple={question.maxFiles ? question.maxFiles > 1 : false}
              onChange={(e) => handleAnswerChange(Array.from(e.target.files || []))}
            />
            {question.acceptedTypes && (
              <p className="file-info">
                Accepted: {question.acceptedTypes.join(', ')} 
                {question.maxSize && ` | Max size: ${question.maxSize}`}
                {question.maxFiles && ` | Max files: ${question.maxFiles}`}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

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
          <NextImage src="/assets/logo.png" alt="Sreve Logo" className="logo" width={80} height={40} priority />
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
            <svg fill="currentColor" height="12px" width="12px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 404.258 404.258" ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <polygon points="289.927,18 265.927,0 114.331,202.129 265.927,404.258 289.927,386.258 151.831,202.129 "></polygon> </g></svg>
          </button>
          <SignedIn>
            <ProjectExplorer 
              onCampaignSelect={(campaignId, projectId) => {
                setSelectedCampaignId(campaignId);
                setSelectedProjectId(projectId);
                setViewMode('campaignExplorer');
              }}
              onProjectSelect={(projectId) => {
                setSelectedProjectId(projectId);
                setSelectedCampaignId(null); // Clear selected campaign when a project is selected
                setViewMode('projectDetails');
              }}
              onCreateProjectClick={() => setViewMode('createProject')}
              selectedProjectId={selectedProjectId}
              selectedCampaignId={selectedCampaignId} 
            />
          </SignedIn>
          <SignedOut>
            <div style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>
              <p>Sign in to view your projects</p>
            </div>
          </SignedOut>
        </aside>
        <main className="main-content">
          {viewMode === 'campaignExplorer' && selectedCampaignId ? (
            <CampaignExplorer campaignId={selectedCampaignId} />
          ) : viewMode === 'createProject' ? (
            <div className="overall">
              <div className="create-project">
                <h3>Create your project</h3>
              </div>
              <div className="question-section">
                <aside className="question-sidebar">
                  <ul>
                    {questions.map((q) => (
                      <li
                        key={q.step}
                        className={getStepState(q)}
                        onClick={() => setCurrentStep(q.step)}
                      >
                        {q.step}. {q.sidebarTitle}
                      </li>
                    ))}
                  </ul>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(currentStep / questions.length) * 100}%` }}
                    />
                  </div>
                  <p className="progress-text">
                    Step {currentStep} of {questions.length}
                  </p>
                </aside>
                <main className="question-main">
                  <h2>{currentQuestion.question}</h2>
                  {renderInput(currentQuestion)}
                  <div className="button-group">
                    {currentStep > 1 && (
                      <button className="prev-button" onClick={handlePrevious}>
                        Previous
                      </button>
                    )}
                    {currentStep < questions.length ? (
                      <button
                        className="next-button"
                        onClick={handleNext}
                        disabled={currentQuestion.required && !answers[currentStep]}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating Project...' : 'Create Project'}
                      </button>
                    )}
                  </div>
                </main>
              </div>
            </div>
          ) : viewMode === 'projectDetails' && selectedProjectId ? (
            <ProjectDetailsExplorer projectId={selectedProjectId} />
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
                  Select a project from the sidebar to get started, or create a new project to begin generating creative content.
                </p>
                <button 
                  className="cta-button"
                  onClick={() => setViewMode('createProject')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem'
                  }}
                >
                  Create New Project
                </button>
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
