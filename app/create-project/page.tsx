"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import NextImage from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

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

function CreateProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for prompt in URL params (fallback) or sessionStorage (primary)
  const urlPrompt = searchParams.get('prompt');
  const [promptText, setPromptText] = useState<string | null>(null);
  
  useEffect(() => {
    // Check sessionStorage first, then URL params as fallback
    const storedPrompt = sessionStorage.getItem('pendingPrompt');
    const storedTimestamp = sessionStorage.getItem('pendingPromptTimestamp');
    
    if (storedPrompt && storedTimestamp) {
      // Check if stored prompt is not too old (5 minutes max)
      const timestamp = parseInt(storedTimestamp);
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      if (timestamp > fiveMinutesAgo) {
        console.log('🎯 [CREATE-PROJECT] Found valid prompt in sessionStorage:', storedPrompt);
        setPromptText(storedPrompt);
      } else {
        console.log('🎯 [CREATE-PROJECT] Stored prompt expired, clearing');
        sessionStorage.removeItem('pendingPrompt');
        sessionStorage.removeItem('pendingPromptTimestamp');
      }
    } else if (urlPrompt) {
      console.log('🎯 [CREATE-PROJECT] Using prompt from URL params:', urlPrompt);
      setPromptText(urlPrompt);
    } else {
      console.log('🎯 [CREATE-PROJECT] No prompt found in storage or URL');
    }
  }, [urlPrompt]);
  
  console.log('🎯 [CREATE-PROJECT] Component initialized with prompt:', promptText);
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
    console.log('🎯 [CREATE-PROJECT] Create Project button clicked');
    console.log('🎯 [CREATE-PROJECT] Current answers:', answers);
    console.log('🎯 [CREATE-PROJECT] Prompt text from URL:', promptText);
    
    // Validate required fields first
    if (!validateRequiredFields()) {
      console.log('🎯 [CREATE-PROJECT] Validation failed, returning');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Creating your project...');

    try {
      console.log('🎯 [CREATE-PROJECT] Submitting project to API...');
      
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

        // Create campaign and send initial message if prompt exists
        if (promptText) {
          try {
            console.log('🎯 [CREATE-PROJECT] Creating campaign with initial message:', promptText);
            
            // Create campaign
            console.log('🎯 [CREATE-PROJECT] Calling /api/campaigns...');
            const campaignResponse = await fetch('/api/campaigns', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: data.project.projectId,
                name: `Campaign from prompt`,
                description: `Auto-created campaign from: ${promptText.substring(0, 100)}...`
              }),
            });

            console.log('🎯 [CREATE-PROJECT] Campaign API response status:', campaignResponse.status);
            const campaignData = await campaignResponse.json();
            console.log('🎯 [CREATE-PROJECT] Campaign API response data:', campaignData);
            
            if (campaignResponse.ok && campaignData.success) {
              console.log('🎯 [CREATE-PROJECT] ✅ Campaign created successfully:', campaignData.campaign);
              
              // Store initial prompt in sessionStorage for the campaign
              console.log('🎯 [CREATE-PROJECT] Storing initial prompt in sessionStorage...');
              sessionStorage.setItem(`initialPrompt_${campaignData.campaign.campaignId}`, promptText);
              sessionStorage.setItem(`initialPrompt_${campaignData.campaign.campaignId}_timestamp`, Date.now().toString());
              
              // Clear the pending prompt since we've successfully processed it
              console.log('🎯 [CREATE-PROJECT] Clearing pendingPrompt from sessionStorage');
              sessionStorage.removeItem('pendingPrompt');
              sessionStorage.removeItem('pendingPromptTimestamp');
              
              toast.success('🎉 Campaign created! Redirecting to your campaign...', {
                duration: 3000,
              });
              
              // Navigate to app page with the campaign selected
              const redirectUrl = `/app?campaignId=${campaignData.campaign.campaignId}&projectId=${data.project.projectId}`;
              console.log('🎯 [CREATE-PROJECT] Redirecting to:', redirectUrl);
              setTimeout(() => {
                router.push(redirectUrl);
              }, 1500);
            } else {
              console.error('🎯 [CREATE-PROJECT] ❌ Failed to create campaign:', campaignData);
              
              // Clear sessionStorage since campaign creation failed
              console.log('🎯 [CREATE-PROJECT] Clearing sessionStorage due to campaign creation failure');
              sessionStorage.removeItem('pendingPrompt');
              sessionStorage.removeItem('pendingPromptTimestamp');
              
              // Still navigate to app page
              setTimeout(() => {
                router.push('/app');
              }, 2000);
            }
          } catch (error) {
            console.error('🎯 [CREATE-PROJECT] ❌ Error in campaign creation flow:', error);
            
            // Clear sessionStorage since an error occurred
            console.log('🎯 [CREATE-PROJECT] Clearing sessionStorage due to error in campaign creation flow');
            sessionStorage.removeItem('pendingPrompt');
            sessionStorage.removeItem('pendingPromptTimestamp');
            
            // Still navigate to app page
            setTimeout(() => {
              router.push('/app');
            }, 2000);
          }
        } else {
          console.log('🎯 [CREATE-PROJECT] No prompt text, navigating normally');
          // No prompt text, navigate normally
          setTimeout(() => {
            router.push('/app');
          }, 2000);
        }

      } else {
        console.error('🎯 [CREATE-PROJECT] ❌ Project creation failed:', data);
        
        // Clear sessionStorage since project creation failed
        if (promptText) {
          console.log('🎯 [CREATE-PROJECT] Clearing sessionStorage due to project creation failure');
          sessionStorage.removeItem('pendingPrompt');
          sessionStorage.removeItem('pendingPromptTimestamp');
        }
        
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
      console.error('🎯 [CREATE-PROJECT] ❌ Network error during project creation:', error);
      
      // Clear sessionStorage since a network error occurred
      if (promptText) {
        console.log('🎯 [CREATE-PROJECT] Clearing sessionStorage due to network error');
        sessionStorage.removeItem('pendingPrompt');
        sessionStorage.removeItem('pendingPromptTimestamp');
      }
      
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

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  return (
    <>
      <header className="header">
        <Link href="/" aria-label="Sreve home">
          <NextImage 
            src="/assets/logo.png" 
            alt="Sreve Logo" 
            className="logo" 
            width={120} 
            height={40} 
            priority 
          />
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
    </>
  );
}

export default function CreateProject() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateProjectContent />
    </Suspense>
  );
}