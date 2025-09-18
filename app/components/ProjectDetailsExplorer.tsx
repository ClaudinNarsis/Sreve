import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import './ProjectDetailsExplorer.css';

interface Project {
  projectId: string;
  userId: string;
  brand_name: string;
  offering: string;
  usp: string;
  icp: string;
  brand_voice: string;
  competitors: string;
  additional_information: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

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

interface ProjectDetailsExplorerProps {
  projectId: string | null;
  onDataChange?: () => void;
}

const ProjectDetailsExplorer: React.FC<ProjectDetailsExplorerProps> = ({ projectId, onDataChange }) => {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    const fetchProjectDetailsAndQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load questions first
        const questionsResponse = await fetch('/create-project-questions.json');
        if (!questionsResponse.ok) {
          throw new Error(`HTTP error! status: ${questionsResponse.status}`);
        }
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData.questions);

        // Load project data
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        const projectData = await projectResponse.json();

        if (projectResponse.ok && projectData.project) {
          setProject(projectData.project);
          // Prefill answers from existing project data
          // Initialize answers from project fields for compatibility with existing form logic
          setAnswers({
            1: projectData.project.brand_name || '',
            2: projectData.project.offering || '',
            3: projectData.project.usp || '',
            4: projectData.project.brand_voice || '',
            5: projectData.project.icp || '',
            6: projectData.project.competitors || '',
            7: projectData.project.additional_information || ''
          });
        } else {
          setError(projectData.error || 'Failed to fetch project details');
          toast.error(projectData.error || 'Failed to fetch project details');
        }
      } catch {
        setError('Error fetching project details');
        toast.error('Error fetching project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetailsAndQuestions();
  }, [projectId]);

  const getProjectName = (proj: Project) => {
    return proj.brand_name || `Project ${proj.projectId.slice(0, 8)}`;
  };

  const handleAnswerChange = (value: string | string[]) => {
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

  const handleSave = async () => {
    console.log('💾 Save Project button clicked');
    console.log('💾 Current answers:', answers);
    
    if (!project || !projectId) {
      toast.error('Project data not available');
      return;
    }
    
    // Validate required fields first
    if (!validateRequiredFields()) {
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Saving your project...');

    try {
      console.log('🚀 Updating project via API...');
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers
        }),
      });

      const data = await response.json();
      console.log('📥 API Response:', data);

      toast.dismiss(loadingToast);

      if (response.ok && data.success) {
        console.log('✅ Project updated successfully:', data.project);
        toast.success('🎉 Project saved successfully!', {
          duration: 5000,
        });
        
        // Update local project state
        setProject(data.project);
        
        // Notify parent to refresh sidebar data (project name might have changed)
        onDataChange?.();
        
      } else {
        console.error('❌ Project update failed:', data);
        toast.error(`❌ ${data.error || 'Failed to save project'}`, {
          duration: 4000,
        });
      }

    } catch (error) {
      console.error('❌ Network error during project save:', error);
      toast.dismiss(loadingToast);
      toast.error('❌ Network error. Please check your connection and try again.', {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !projectId) {
      toast.error('Project data not available');
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading('Deleting project and all related data...');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (response.ok && data.success) {
        const summary = data.summary;
        toast.success(`Project deleted successfully! ${summary.campaignsDeleted} campaigns and their chat messages were also deleted.`, {
          duration: 6000,
        });
        
        // Notify parent to refresh sidebar data
        onDataChange?.();
        
        // Navigate back to home/projects page
        router.push('/');
        
      } else {
        toast.error(`Failed to delete project: ${data.error || 'Unknown error'}`, {
          duration: 4000,
        });
      }

    } catch (error) {
      console.error('Error deleting project:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please check your connection and try again.', {
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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

  const currentQuestion = questions.find(q => q.step === currentStep);

  if (!projectId) {
    return (
      <div className="project-details-explorer">
        <div className="empty-state">
          <p>Select a project to view details</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="project-details-explorer">
        <div className="loading-state">
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-details-explorer">
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!project || !currentQuestion) {
    return (
      <div className="project-details-explorer">
        <div className="empty-state">
          <p>Project not found or questions not loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overall">
      <div className="create-project">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h3>Edit Project: {getProjectName(project)}</h3>
            <p style={{ fontSize: '0.9rem', color: '#999', margin: 0 }}>
              Project ID: {project.projectId}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            🗑️ Delete Project
          </button>
        </div>
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
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Project...' : 'Save Project'}
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Delete Project</h3>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete the project &ldquo;<strong>{getProjectName(project)}</strong>&rdquo;?
            </p>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.5', color: '#666' }}>
              This will permanently delete:
              <br />• The project and all its data
              <br />• All campaigns associated with this project
              <br />• All chat messages in those campaigns
            </p>
            <p style={{ marginBottom: '2rem', color: '#dc3545', fontWeight: 'bold' }}>
              This action cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isDeleting ? 0.6 : 1
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsExplorer;
