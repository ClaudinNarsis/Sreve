"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import "./create-project.css";

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

export default function CreateProject() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = () => {
    console.log('Project data:', answers);
    // TODO: Submit to API
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
      
      <div className="question-section">
        <aside className="question-sidebar">
          <h3>Steps</h3>
          <ul>
            {questions.map((q) => (
              <li
                key={q.step}
                className={getStepState(q)}
                onClick={() => setCurrentStep(q.step)}
              >
                {q.step}. {q.sidebarTitle}
                {q.required && <span className="required-dot">*</span>}
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
          {currentQuestion.required && <span className="required-indicator">*</span>}
          
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
                disabled={currentQuestion.required && !answers[currentStep]}
              >
                Create Project
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}