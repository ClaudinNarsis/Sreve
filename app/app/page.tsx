"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import ProjectExplorer from "../components/ProjectExplorer";
import "../components/ProjectExplorer.css";
import { useAutoCreateUser } from "../hooks/useAutoCreateUser";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import "./app.css";
import { useState, useEffect } from "react";




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

export default function App() {
  
  const { isCreating } = useAutoCreateUser();
  const router = useRouter();
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
        </main>
      </div>
    </>
  );
}
