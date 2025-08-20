import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './ProjectDetailsExplorer.css';

interface Project {
  projectId: string;
  userId: string;
  answers: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface ProjectDetailsExplorerProps {
  projectId: string | null;
}

const ProjectDetailsExplorer: React.FC<ProjectDetailsExplorerProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();

        if (response.ok && data.project) {
          setProject(data.project);
        } else {
          setError(data.error || 'Failed to fetch project details');
          toast.error(data.error || 'Failed to fetch project details');
        }
      } catch (err) {
        setError('Error fetching project details');
        toast.error('Error fetching project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const getProjectName = (proj: Project) => {
    return proj.answers?.[1] || `Project ${proj.projectId.slice(0, 8)}`;
  };

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

  if (!project) {
    return (
      <div className="project-details-explorer">
        <div className="empty-state">
          <p>Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-details-explorer">
      <div className="explorer-header">
        <h3>Project Details: {getProjectName(project)}</h3>
      </div>
      <div className="project-details">
        <p><strong>Project ID:</strong> {project.projectId}</p>
        <p><strong>User ID:</strong> {project.userId}</p>
        <p><strong>Status:</strong> {project.status}</p>
        <p><strong>Created At:</strong> {new Date(project.createdAt).toISOString()}</p>
        <p><strong>Updated At:</strong> {new Date(project.updatedAt).toISOString()}</p>
        <h4>Answers:</h4>
        <pre>{JSON.stringify(project.answers, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ProjectDetailsExplorer;
